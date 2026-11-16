import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 30;
const MAX_CHARS = 2000;

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
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const text = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (typeof text === "string" && text) {
            controller.enqueue(encoder.encode(text));
          }
        } catch {
          // linha incompleta ou comentário de keep-alive: ignora
        }
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
