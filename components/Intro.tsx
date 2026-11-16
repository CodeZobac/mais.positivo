"use client";

import { useState } from "react";

// Tem de cobrir a animação toda de .intro-aberta em globals.css (atraso + desvanecer).
const DURACAO_MS = 2300;

export default function Intro({ onFim }: { onFim: () => void }) {
  const [aberta, setAberta] = useState(false);

  function abrir() {
    setAberta(true);
    setTimeout(onFim, DURACAO_MS);
  }

  return (
    <div className={aberta ? "intro intro-aberta" : "intro"}>
      <button
        type="button"
        className="intro-botao"
        aria-label="Abrir o Lado Positivo"
        autoFocus
        disabled={aberta}
        onClick={abrir}
      >
        <span className="intro-mais" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <path d="M12 4v16M4 12h16" />
          </svg>
        </span>
        <span className="intro-palavra" aria-hidden="true">
          Positivo
        </span>
      </button>
    </div>
  );
}
