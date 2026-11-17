"use client";

import { useEffect, useRef } from "react";

// Muda a versão quando o texto mudar, para voltar a pedir a aceitação.
const CHAVE = "lado-positivo:termos-v3";

export default function Termos() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let aceite = false;
    try {
      aceite = localStorage.getItem(CHAVE) === "aceite";
    } catch {
      // sem acesso ao localStorage (modo privado): pede sempre
    }
    if (!aceite) ref.current?.showModal();
  }, []);

  function aceitar() {
    try {
      localStorage.setItem(CHAVE, "aceite");
    } catch {
      // não foi possível guardar: volta a pedir na próxima visita
    }
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      className="termos"
      aria-labelledby="termos-titulo"
      // Só fecha ao aceitar: a tecla Esc não conta.
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
          <summary>Não é aconselhamento profissional</summary>
          <p>O Lado Positivo não é médico nem psicólogo, não faz diagnósticos e não substitui um profissional. Se precisares, procura aconselhamento médico ou psicológico.</p>
        </details>
        <details>
          <summary>A responsabilidade é tua</summary>
          <p>Tudo o que fizeres ou decidires com base no que a aplicação te disser é da tua inteira responsabilidade.</p>
        </details>
        <details>
          <summary>Não serve para emergências</summary>
          <p>Se tu ou outra pessoa estiverem em perigo, liga 112. Para apoio psicológico, liga para o SNS 24: 808 24 24 24.</p>
        </details>
        <details>
          <summary>Privacidade</summary>
          <p>Não pedimos dados pessoais. O que escreves é enviado a um serviço externo de inteligência artificial (DeepSeek) para gerar a resposta, por isso não partilhes nomes, moradas ou outros dados que te identifiquem.</p>
        </details>
        <details>
          <summary>Registo das conversas</summary>
          <p>Para controlar custos e melhorar a segurança, as mensagens e as respostas ficam guardadas num serviço de monitorização (Langfuse), ligadas a um código aleatório deste navegador e não ao teu nome. Quando uma mensagem faz disparar um alerta de segurança, essa mensagem fica assinalada para ser revista.</p>
        </details>
        <details>
          <summary>Conversa guardada neste dispositivo</summary>
          <p>A conversa fica guardada no navegador deste dispositivo até carregares em novo chat, para não a perderes se fechares a página. Não passa para outros dispositivos. Quem usar este navegador pode vê-la, por isso, num dispositivo partilhado, carrega em novo chat quando acabares.</p>
        </details>
      </div>
      <button type="button" onClick={aceitar}>
        Li e aceito
      </button>
    </dialog>
  );
}
