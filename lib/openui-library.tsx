"use client";

// Os componentes que o modelo pode usar nas respostas (OpenUI Lang).
// A descrição de cada um para o modelo está em lib/system-prompt.ts:
// se mudares os argumentos aqui, atualiza-os lá também.

import { createContext, useContext } from "react";
import { createLibrary, defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";

// Permite que as sugestões enviem uma mensagem. Fica a null nas respostas
// antigas, para que só as sugestões da última resposta estejam ativas.
export const EnviarContext = createContext<((texto: string) => void) | null>(null);

const Texto = defineComponent({
  name: "Texto",
  description: "Um parágrafo de conversa.",
  props: z.object({
    texto: z.string().describe("O texto do parágrafo"),
  }),
  component: ({ props }) => <p className="balao balao-bot">{props.texto}</p>,
});

const OutroLado = defineComponent({
  name: "OutroLado",
  description: "Destaca uma perspetiva diferente sobre a situação.",
  props: z.object({
    titulo: z.string().describe("Título curto da perspetiva"),
    texto: z.string().describe("A perspetiva, em uma ou duas frases"),
  }),
  component: ({ props }) => (
    <section className="outro-lado">
      <h3>{props.titulo}</h3>
      <p>{props.texto}</p>
    </section>
  ),
});

const Exercicio = defineComponent({
  name: "Exercicio",
  description: "Um exercício prático com passos curtos.",
  props: z.object({
    titulo: z.string().describe("Nome do exercício"),
    passos: z.array(z.string()).describe("Dois a quatro passos curtos"),
  }),
  component: ({ props }) => (
    <section className="exercicio">
      <h3>{props.titulo}</h3>
      <ol>
        {(props.passos ?? []).map((passo, i) => (
          <li key={i}>{passo}</li>
        ))}
      </ol>
    </section>
  ),
});

const CARAS = {
  festa: "🥳",
  oculos: "😎",
  suor: "😅",
  pensativo: "🤔",
  forte: "💪",
  riso: "😹",
  foguete: "🚀",
} as const;

const Meme = defineComponent({
  name: "Meme",
  description: "Um meme com uma frase em cima e o remate em baixo.",
  props: z.object({
    topo: z.string().describe("Frase de cima"),
    fundo: z.string().describe("Remate, em baixo"),
    cara: z
      .enum(["festa", "oculos", "suor", "pensativo", "forte", "riso", "foguete"])
      .describe("A expressão do meme"),
  }),
  component: ({ props }) => (
    <figure className="meme">
      <p className="meme-frase">{props.topo}</p>
      <span className="meme-cara" aria-hidden="true">
        {CARAS[props.cara] ?? CARAS.oculos}
      </span>
      <p className="meme-frase">{props.fundo}</p>
    </figure>
  ),
});

function ListaSugestoes({ opcoes }: { opcoes: string[] }) {
  const enviar = useContext(EnviarContext);
  if (!enviar || opcoes.length === 0) return null;
  return (
    <ul className="respostas-rapidas">
      {opcoes.map((opcao) => (
        <li key={opcao}>
          <button type="button" onClick={() => enviar(opcao)}>
            {opcao}
          </button>
        </li>
      ))}
    </ul>
  );
}

const Sugestoes = defineComponent({
  name: "Sugestoes",
  description: "Respostas curtas que a pessoa pode escolher para continuar.",
  props: z.object({
    opcoes: z.array(z.string()).describe("Duas ou três respostas curtas"),
  }),
  component: ({ props }) => <ListaSugestoes opcoes={props.opcoes ?? []} />,
});

const Resposta = defineComponent({
  name: "Resposta",
  description: "A raiz de cada resposta: uma lista de blocos, de cima para baixo.",
  props: z.object({
    blocos: z.array(
      z.union([Texto.ref, OutroLado.ref, Exercicio.ref, Meme.ref, Sugestoes.ref]),
    ),
  }),
  component: ({ props, renderNode }) => (
    <div className="resposta">{renderNode(props.blocos)}</div>
  ),
});

export const biblioteca = createLibrary({
  root: "Resposta",
  components: [Resposta, Texto, OutroLado, Exercicio, Meme, Sugestoes],
});
