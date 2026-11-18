"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENTIMENTO } from "@/lib/consentimento";

const CHAVE = `lado-positivo:${CONSENTIMENTO}`;

function lerAceite() {
  try {
    return localStorage.getItem(CHAVE) === "aceite";
  } catch {
    return false; // sem acesso ao localStorage (modo privado): pede sempre
  }
}

// `rever` sobe cada vez que a roldana é carregada e volta a abrir o formulário.
export default function Termos({ rever, onMudar }: { rever: number; onMudar: (aceite: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [termos, setTermos] = useState(false);
  const [saude, setSaude] = useState(false);
  const [jaAceite, setJaAceite] = useState(false);

  useEffect(() => {
    const aceite = lerAceite();
    setTermos(aceite);
    setSaude(aceite);
    setJaAceite(aceite);
    onMudar(aceite);
    if (!aceite || rever) ref.current?.showModal();
    // onMudar fica de fora: só interessa reagir à roldana.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rever]);

  const ok = termos && saude;

  function guardar() {
    try {
      if (ok) localStorage.setItem(CHAVE, "aceite");
      else localStorage.removeItem(CHAVE);
    } catch {
      // não foi possível guardar: volta a pedir na próxima visita
    }
    onMudar(ok);
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      className="termos"
      aria-labelledby="termos-titulo"
      // Só fecha pelo botão: a tecla Esc não conta.
      onCancel={(e) => e.preventDefault()}
    >
      <h2 id="termos-titulo">Antes de começares</h2>
      <p>Para usares o Lado Positivo, precisas de aceitar estes termos. Toca em cada ponto para o leres.</p>
      <div className="gavetas">
        <details>
          <summary>É uma inteligência artificial</summary>
          <p>Quem responde é um modelo de linguagem, não uma pessoa. Pode enganar-se, inventar coisas ou dar respostas que não servem para a tua situação.</p>
        </details>
        <details>
          <summary>Não substitui um profissional</summary>
          <p>O Lado Positivo não é médico nem psicólogo e não faz diagnósticos. Se precisares, procura ajuda profissional. O que fizeres com base nas respostas é da tua responsabilidade.</p>
        </details>
        <details>
          <summary>Não serve para emergências</summary>
          <p>Se tu ou outra pessoa estiverem em perigo, liga 112. Para apoio psicológico, liga para o SNS 24: 808 24 24 24.</p>
        </details>
        <details>
          <summary>Os teus dados</summary>
          <p>Não pedimos nome nem conta. As mensagens são enviadas à DeepSeek, na China, para gerar a resposta, e ficam registadas 90 dias (Langfuse, na UE) por segurança. A conversa fica guardada neste navegador até carregares em novo chat. Não partilhes dados que te identifiquem. Tudo em detalhe na <a href="/privacidade" target="_blank">política de privacidade</a>.</p>
        </details>
      </div>
      <label className="consentimento">
        <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} />
        <span>
          Tenho 13 anos ou mais (ou autorização dos meus pais), li e aceito estes termos e a{" "}
          <a href="/privacidade" target="_blank">política de privacidade</a>.
        </span>
      </label>
      <label className="consentimento">
        <input type="checkbox" checked={saude} onChange={(e) => setSaude(e.target.checked)} />
        <span>
          Dou o meu consentimento explícito para que as minhas mensagens, que podem incluir
          informação sobre a minha saúde e o meu estado emocional, sejam tratadas para gerar
          respostas e enviadas à DeepSeek, na China, sabendo que a China não garante uma proteção
          de dados equivalente à da UE. Posso retirar este consentimento a qualquer momento.
        </span>
      </label>
      <p className="nota">
        Podes retirar estas autorizações a qualquer momento na roldana de definições, no fundo da
        página. Sem elas, não podes usar o chat.
      </p>
      {/* Na primeira vez só se avança aceitando; depois, desmarcar e guardar retira o consentimento. */}
      <button type="button" onClick={guardar} disabled={!ok && !jaAceite}>
        {ok ? (jaAceite ? "Guardar" : "Aceito e quero começar") : "Retirar autorizações"}
      </button>
    </dialog>
  );
}
