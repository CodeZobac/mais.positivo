import { propagateAttributes, startObservation } from "@langfuse/tracing";
import { type Alerta, separarAlerta } from "@/lib/alerta";
import { RESPOSTA_VERMELHA, alertaVermelho } from "@/lib/guardrails";
import { langfuse } from "@/lib/langfuse";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.trim() === "") return null;
    messages.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  if (messages[messages.length - 1].role !== "user") return null;
  return messages;
}

// IDs anónimos gerados no browser; só servem para agrupar no Langfuse.
function parseId(body: unknown, campo: string): string {
  const v = (body as Record<string, unknown>)?.[campo];
  return typeof v === "string" && /^[\w-]{1,64}$/.test(v) ? v : "anon";
}

function erro(mensagem: string, status: number) {
  return Response.json({ error: mensagem }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return erro("Falta a variável DEEPSEEK_API_KEY no servidor.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erro("Pedido inválido.", 400);
  }

  const messages = parseMessages(body);
  if (!messages) return erro("Pedido inválido.", 400);

  const pergunta = messages[messages.length - 1].content;
  const userId = parseId(body, "userId");
  const sessionId = parseId(body, "sessionId");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-flash";

  // Camadas 1 e 2: a sessão e o fluxo que decide o caminho.
  const sessao = propagateAttributes({ userId, sessionId, metadata: { canal: "web" } }, () =>
    startObservation("interaction.session", { input: pergunta }),
  );
  const fluxo = sessao.startObservation("orchestration.flow", {}, { asType: "chain" });

  // Fecha tudo e envia para o Langfuse; chamado uma vez, no fim de cada caminho.
  const terminar = (caminho: string, resposta: string, alerta: Alerta, fonte?: string) => {
    if (alerta !== "nenhum") {
      // shortcut: tags só se definem pelo contexto, por isso vão num evento à parte que marca o trace.
      propagateAttributes({ tags: [`alerta:${alerta}`] }, () =>
        sessao.startObservation(`alerta.${alerta}`, { input: pergunta, metadata: { fonte } }, { asType: "event" }),
      );
    }
    fluxo.update({ metadata: { caminho } }).end();
    sessao.update({ output: resposta, metadata: { alerta, fonte } }).end();
    return langfuse?.forceFlush().catch((e) => console.error("Langfuse", e));
  };

  // Camada 3: a única operação determinística, o kill switch.
  const vermelho = alertaVermelho(pergunta);
  fluxo
    .startObservation("guardrails.regex", { input: pergunta, output: { vermelho } }, { asType: "guardrail" })
    .end();

  // Kill switch: a mensagem não chega ao modelo e a resposta é sempre a mesma.
  if (vermelho) {
    await terminar("kill_switch", RESPOSTA_VERMELHA, "vermelho", "regex");
    return new Response(RESPOSTA_VERMELHA, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // Camada 4: a chamada ao modelo. O system prompt fica de fora para não pesar em cada trace.
  const geracao = fluxo.startObservation(
    "model.inference",
    { model, input: messages, modelParameters: { thinking: "disabled" } },
    { asType: "generation" },
  );

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        // Necessário para o último bloco trazer os tokens gastos (custo no Langfuse).
        stream_options: { include_usage: true },
        // O modo de raciocínio vem ligado por omissão e atrasa muito a primeira
        // palavra. Para uma conversa deste género não é preciso.
        thinking: { type: "disabled" },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: request.signal,
    });
  } catch (e) {
    geracao.update({ level: "ERROR", statusMessage: String(e) }).end();
    await terminar("erro", "", "nenhum");
    return erro("Não foi possível ligar ao DeepSeek.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    const detalhe = await upstream.text().catch(() => "");
    console.error("DeepSeek", upstream.status, detalhe);
    geracao.update({ level: "ERROR", statusMessage: `${upstream.status} ${detalhe}`.slice(0, 500) }).end();
    await terminar("erro", "", "nenhum");
    return erro("O DeepSeek não respondeu. Tenta outra vez daqui a pouco.", 502);
  }

  // Converte o fluxo SSE do DeepSeek num fluxo de texto simples.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    // O ciclo vive todo em start(): um pull() que termina sem enviar nada
    // (por exemplo, num bloco só com raciocínio) não volta a ser chamado e a
    // resposta ficava parada para sempre.
    async start(controller) {
      let buffer = "";
      let resposta = "";
      // Guarda o início até se saber se vem a linha "ALERTA: ...", que não se mostra.
      let alerta: Alerta | null = null;
      let inicio = "";
      let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined;

      const enviar = (text: string) => {
        if (!text) return;
        resposta += text;
        controller.enqueue(encoder.encode(text));
      };

      const tratar = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) return;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const json = JSON.parse(data);
          if (json?.usage) usage = json.usage;
          const text = json?.choices?.[0]?.delta?.content;
          if (typeof text !== "string" || !text) return;
          if (alerta) return enviar(text);
          inicio += text;
          const r = separarAlerta(inicio);
          if (r) {
            alerta = r.alerta;
            enviar(r.resto);
          }
        } catch {
          // comentário de keep-alive ou linha que não é JSON: ignora
        }
      };

      let falhou: unknown;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(tratar);
        }
        tratar(buffer);
        if (!alerta) enviar(inicio); // resposta curta que nunca chegou a decidir
        controller.close();
      } catch (e) {
        falhou = e;
        controller.error(e);
      } finally {
        geracao
          .update({
            output: resposta,
            usageDetails: usage && { input: usage.prompt_tokens ?? 0, output: usage.completion_tokens ?? 0 },
            ...(falhou ? { level: "ERROR" as const, statusMessage: String(falhou) } : {}),
          })
          .end();
        await terminar(falhou ? "erro" : "modelo", resposta, alerta ?? "nenhum", "modelo");
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
