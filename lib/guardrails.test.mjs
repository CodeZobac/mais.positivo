import assert from "node:assert/strict";
import test from "node:test";
import { alertaVermelho } from "./guardrails.ts";

test("alerta vermelho dispara", () => {
  for (const frase of [
    "Quero morrer",
    "às vezes penso em suicídio",
    "apetece-me matar-me",
    "vou-me matar",
    "Não quero mais viver",
    "quero acabar com tudo",
    "ando a cortar-me",
    "tenho vontade de me magoar",
    "pensei em automutilação",
    "estavam todos melhor sem mim",
    "vou matar o meu irmão",
    "apetece-me matá-lo",
    "quero fazer mal a ela",
    "I want to kill myself",
  ]) {
    assert.equal(alertaVermelho(frase), true, frase);
  }
});

test("alerta vermelho não dispara em conversa normal", () => {
  for (const frase of [
    "Tive uma nota pior do que esperava",
    "A minha mãe vai matar-me quando vir a nota",
    "quero matar saudades da minha avó",
    "vou morrer de vergonha amanhã",
    "Sou burro e não sirvo para nada",
    "magoei-me a jogar futebol",
    "Discuti com um amigo e fiquei magoado",
    "Estou nervoso com o futuro",
  ]) {
    assert.equal(alertaVermelho(frase), false, frase);
  }
});
