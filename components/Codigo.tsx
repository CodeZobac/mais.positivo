"use client";

import { useEffect, useState } from "react";

// Mostra o código aleatório deste navegador, para o utilizador o indicar num pedido de acesso ou apagamento.
export default function Codigo() {
  const [codigo, setCodigo] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCodigo(localStorage.getItem("lado-positivo-uid"));
    } catch {
      // sem acesso ao localStorage: não há código
    }
  }, []);

  return codigo ? <code>{codigo}</code> : <em>ainda não tens código (não enviaste nenhuma mensagem neste navegador)</em>;
}
