"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Logo from "./Logo";

type Message = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Tive uma nota pior do que esperava",
  "Discuti com um amigo",
  "Sinto que nada me corre bem",
  "Estou nervoso com o futuro",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const vazio = messages.length === 0;

  return (
    <div className="pagina">
      <header className="topo">
        <Logo size={34} />
        <span className="marca">Lado Positivo</span>
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
            {messages.map((m, i) =>
              m.role === "assistant" && m.content === "" ? (
                <li key={i} className="a-pensar">
                  <Logo size={26} flipping />
                  <span>A procurar o outro lado</span>
                </li>
              ) : (
                <li key={i} className={m.role === "user" ? "balao balao-eu" : "balao balao-bot"}>
                  {m.content}
                </li>
              ),
            )}
          </ol>
        )}
        {error && (
          <p className="erro" role="alert">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </main>

      <footer className="rodape">
        <form className="caixa" onSubmit={onSubmit}>
          <label htmlFor="mensagem" className="so-leitores">
            A tua mensagem
          </label>
          <textarea
            id="mensagem"
            ref={inputRef}
            rows={1}
            maxLength={2000}
            placeholder="O que aconteceu hoje?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Enviar
          </button>
        </form>
        <p className="aviso">
          O Lado Positivo é uma inteligência artificial e não substitui o apoio de um profissional.
          Se estiveres em perigo, liga 112.
        </p>
      </footer>
    </div>
  );
}
