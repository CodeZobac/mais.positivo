import { LangfuseSpanProcessor } from "@langfuse/otel";
import { setLangfuseTracerProvider } from "@langfuse/tracing";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

// Sem chaves, não regista nada: o tracer do Langfuse fica no-op e a app funciona igual.
// Lê LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY e LANGFUSE_BASE_URL do ambiente.
export const langfuse =
  process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY
    ? new LangfuseSpanProcessor({ exportMode: "immediate" })
    : null;

if (langfuse) {
  setLangfuseTracerProvider(new NodeTracerProvider({ spanProcessors: [langfuse] }));
}
