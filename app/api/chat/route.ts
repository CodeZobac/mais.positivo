import { RESPOSTA_VERMELHA, alertaVermelho } from "@/lib/guardrails";
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

  // Kill switch: a mensagem não chega ao modelo e a resposta é sempre a mesma.
  if (alertaVermelho(messages[messages.length - 1].content)) {
    return new Response(RESPOSTA_VERMELHA, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
        stream: true,
        // O modo de raciocínio vem ligado por omissão e atrasa muito a primeira
        // palavra. Para uma conversa deste género não é preciso.
        thinking: { type: "disabled" },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: request.signal,
    });
  } catch {
    return erro("Não foi possível ligar ao DeepSeek.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    console.error("DeepSeek", upstream.status, await upstream.text().catch(() => ""));
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

      const tratar = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) return;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const text = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (typeof text === "string" && text) {
            controller.enqueue(encoder.encode(text));
          }
        } catch {
          // comentário de keep-alive ou linha que não é JSON: ignora
        }
      };

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
        controller.close();
      } catch (e) {
        controller.error(e);
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
