import { describe, expect, it } from "vitest";
import { normalizeChannelName } from "./channel-name";

// A tabela de "Nome do Canal" da spec da F02, a mesma do teste da API
// (`apps/chat-api/src/conversations/channel-name.spec.ts`): a prévia tem de mostrar o nome que a
// API grava.
describe("normalizeChannelName", () => {
  it.each([
    ["Vendas", "vendas"],
    ["Café & Vendas 2026!", "cafe-vendas-2026"],
    ["  time   produto  ", "time-produto"],
    ["ação_comercial", "acao-comercial"],
    ["--a--b--", "a-b"],
    ["São Paulo/RJ", "sao-paulo-rj"],
    ["Ünïcödé", "unicode"],
    ["🎉 festa", "festa"],
    ["straße", "stra-e"],
    ["!!!", ""],
    ["GERAL", "geral"],
  ])("normaliza %j como %j", (input, expected) => {
    expect(normalizeChannelName(input)).toBe(expected);
  });
});
