import assert from "node:assert/strict";
import test from "node:test";
import { separarAlerta } from "./alerta.ts";

test("separa a linha de alerta", () => {
  assert.deepEqual(separarAlerta("ALERTA: amarelo\nroot = X"), { alerta: "amarelo", resto: "root = X" });
  assert.deepEqual(separarAlerta("  alerta: VERMELHO\n"), { alerta: "vermelho", resto: "" });
});

test("espera enquanto a linha não acabou", () => {
  assert.equal(separarAlerta("ALE"), null);
  assert.equal(separarAlerta("ALERTA: nen"), null);
});

test("sem linha de alerta, passa tudo", () => {
  assert.deepEqual(separarAlerta("root = Resposta([])"), { alerta: "nenhum", resto: "root = Resposta([])" });
  assert.deepEqual(separarAlerta("ALERTA: talvez\nola"), { alerta: "nenhum", resto: "ALERTA: talvez\nola" });
});
