"use client";

import { CSSProperties, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Renderer } from "@openuidev/react-lang";
import { EnviarContext, biblioteca } from "@/lib/openui-library";
import Intro from "./Intro";
import Logo from "./Logo";
import Termos from "./Termos";

type Message = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Tive uma nota pior do que esperava",
  "Discuti com um amigo",
  "Sinto que nada me corre bem",
  "Estou nervoso com o futuro",
];

// Easter egg da moeda: "+ Positivo" passa a "+ Sorrisos", "+ Calma"...
const MAIS = ["Sorrisos", "Calma", "Coragem", "Abraços", "Amigos", "Gargalhadas", "Sol", "Tu"];
const CHUVA = 10;

// O modelo às vezes embrulha a resposta num bloco de código.
function semBlocoDeCodigo(texto: string) {
  return texto
    .replace(/^\s*```[a-z-]*\r?\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

function Pensar() {
  return (
    <div className="a-pensar">
      <Logo size={26} flipping />
      <span>A procurar o outro lado</span>
    </div>
  );
}

function RespostaBot({ texto, streaming }: { texto: string; streaming: boolean }) {
  const limpo = semBlocoDeCodigo(texto);

  // Ainda não chegou o suficiente para saber o que mostrar.
  if (streaming && limpo.length < 8) return <Pensar />;

  // Se o modelo responder em texto simples, mostra-o num balão normal.
  if (!/^root\s*=/.test(limpo)) {
    return <p className="balao balao-bot">{limpo}</p>;
  }

  return <Renderer response={limpo} library={biblioteca} isStreaming={streaming} />;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intro, setIntro] = useState(true);
  const [toques, setToques] = useState(0);
  const [palavra, setPalavra] = useState("Positivo");
  const voltar = useRef<ReturnType<typeof setTimeout>>(undefined);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "A resposta não chegou. Tenta outra vez.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
      if (!reply.trim()) throw new Error("A resposta veio vazia. Tenta outra vez.");
    } catch (e) {
      setMessages(history);
      setError(e instanceof Error ? e.message : "A resposta não chegou. Tenta outra vez.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function maisUm() {
    setPalavra(MAIS[toques % MAIS.length]);
    setToques(toques + 1);
    clearTimeout(voltar.current);
    voltar.current = setTimeout(() => setPalavra("Positivo"), 2000);
  }

  const vazio = messages.length === 0;

  return (
    <>
    {/* Os termos só aparecem depois de a entrada sair do ecrã. */}
    {intro ? <Intro onFim={() => setIntro(false)} /> : <Termos />}
    <div className="pagina" inert={intro}>
      <header className="topo">
        {/* Easter egg: cada toque na moeda solta uma chuva de + e troca a palavra. */}
        <button type="button" className="marca-moeda" aria-label="Mais positivo" onClick={maisUm}>
          <span key={toques} className={toques ? "moeda-gira" : undefined}>
            <Logo size={34} />
          </span>
          {toques > 0 && (
            <span key={`chuva-${toques}`} className="chuva" aria-hidden="true">
              {Array.from({ length: CHUVA }, (_, i) => {
                const angulo = (i / CHUVA) * 2 * Math.PI + toques;
                const dist = 3 + (i % 3);
                return (
                  <i
                    key={i}
                    style={
                      {
                        "--x": `${(Math.cos(angulo) * dist).toFixed(2)}rem`,
                        "--y": `${(Math.sin(angulo) * dist).toFixed(2)}rem`,
                      } as CSSProperties
                    }
                  >
                    +
                  </i>
                );
              })}
            </span>
          )}
        </button>
        <span className="marca" aria-live="polite">
          {palavra}
        </span>
        {!vazio && (
          <button
            type="button"
            className="recomecar"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            disabled={loading}
          >
            Nova conversa
          </button>
        )}
      </header>

      <main className="conversa">
        {vazio ? (
          <section className="entrada">
            <h1>Conta-me o que te anda a pesar. Vamos procurar o outro lado.</h1>
            <p>
              Escreve uma situação do teu dia, grande ou pequena. Eu ajudo-te a olhar para ela de
              outra perspetiva.
            </p>
            <ul className="sugestoes">
              {SUGESTOES.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <ol className="mensagens" aria-live="polite">
            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <li key={i} className="balao balao-eu">
                    {m.content}
                  </li>
                );
              }
              const ultima = i === messages.length - 1;
              return (
                <li key={i} className="linha-bot">
                  <EnviarContext.Provider value={ultima && !loading ? send : null}>
                    <RespostaBot texto={m.content} streaming={ultima && loading} />
                  </EnviarContext.Provider>
                </li>
              );
            })}
          </ol>
        )}
        {error && (
          <p className="erro" role="alert">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </main>

      <div className="rodape">
        <form className="caixa" onSubmit={onSubmit}>
          <label htmlFor="mensagem" className="so-leitores">
            A tua mensagem
          </label>
          <textarea
            id="mensagem"
            ref={inputRef}
            rows={1}
            maxLength={2000}
            enterKeyHint="send"
            placeholder="O que aconteceu hoje?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Enviar
          </button>
        </form>
      </div>

      <footer className="fundo">
        <div className="fundo-dentro">
          <p>
            O Lado Positivo é uma inteligência artificial e não substitui o apoio de um
            profissional. Se estiveres em perigo, liga 112. Todas as conversas são privadas e não
            são gravadas.
          </p>
          <a href="https://www.instagram.com/in.sintonia_/" target="_blank" rel="noopener noreferrer">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span className="so-leitores">Instagram: </span>
            in.sintonia_
          </a>
        </div>
      </footer>
    </div>
    </>
  );
}
