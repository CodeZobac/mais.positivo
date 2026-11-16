"use client";

import { useEffect, useRef } from "react";

// Muda a versão quando o texto mudar, para voltar a pedir a aceitação.
const CHAVE = "lado-positivo:termos-v1";

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
      <p>Para usares o Lado Positivo, precisas de ler e aceitar estes termos.</p>
      <ul>
        <li>
          <strong>É uma inteligência artificial.</strong> Quem responde é um modelo de linguagem,
          não uma pessoa. Pode enganar-se, inventar coisas ou dar respostas que não servem para a
          tua situação.
        </li>
        <li>
          <strong>Não é aconselhamento profissional.</strong> O Lado Positivo não é médico nem
          psicólogo, não faz diagnósticos e não substitui um profissional. Se precisares, procura
          aconselhamento médico ou psicológico.
        </li>
        <li>
          <strong>A responsabilidade é tua.</strong> Tudo o que fizeres ou decidires com base no
          que a aplicação te disser é da tua inteira responsabilidade.
        </li>
        <li>
          <strong>Não serve para emergências.</strong> Se tu ou outra pessoa estiverem em perigo,
          liga 112. Para apoio psicológico, liga para o SNS 24: 808 24 24 24.
        </li>
        <li>
          <strong>Privacidade.</strong> Não guardamos as tuas conversas nem pedimos dados
          pessoais. O que escreves é enviado a um serviço externo de inteligência artificial
          (DeepSeek) apenas para gerar a resposta, por isso não partilhes nomes, moradas ou outros
          dados que te identifiquem.
        </li>
      </ul>
      <button type="button" onClick={aceitar}>
        Li e aceito
      </button>
    </dialog>
  );
}
