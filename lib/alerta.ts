// O modelo começa cada resposta com "ALERTA: nenhum|amarelo|vermelho" (ver system-prompt).
// Essa linha serve só para observabilidade e nunca chega ao utilizador.
export type Alerta = "nenhum" | "amarelo" | "vermelho";

// Recebe o início da resposta acumulado. Devolve null enquanto não dá para decidir.
export function separarAlerta(texto: string): { alerta: Alerta; resto: string } | null {
  const inicio = texto.trimStart();
  if (!inicio.toUpperCase().startsWith("ALERTA".slice(0, inicio.length).toUpperCase())) {
    return { alerta: "nenhum", resto: texto }; // o modelo esqueceu-se da linha
  }
  const fim = inicio.indexOf("\n");
  if (fim === -1) return inicio.length > 40 ? { alerta: "nenhum", resto: texto } : null;
  const m = /^ALERTA:\s*(nenhum|amarelo|vermelho)\s*$/i.exec(inicio.slice(0, fim).trim());
  if (!m) return { alerta: "nenhum", resto: texto };
  return { alerta: m[1].toLowerCase() as Alerta, resto: inicio.slice(fim + 1) };
}
