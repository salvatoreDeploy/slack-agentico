import { normalizeChannelDescription, normalizeChannelName } from './channel-name.js';

describe('normalizeChannelName', () => {
  // A tabela de "Nome do Canal", na spec da F02; a web passa pela mesma.
  it.each([
    ['Vendas', 'vendas'],
    ['Café & Vendas 2026!', 'cafe-vendas-2026'],
    ['  time   produto  ', 'time-produto'],
    ['ação_comercial', 'acao-comercial'],
    ['--a--b--', 'a-b'],
    ['São Paulo/RJ', 'sao-paulo-rj'],
    ['Ünïcödé', 'unicode'],
    ['🎉 festa', 'festa'],
    ['straße', 'stra-e'],
    ['!!!', ''],
    ['GERAL', 'geral'],
  ])('normaliza %j como %j', (input, expected) => {
    expect(normalizeChannelName(input)).toBe(expected);
  });
});

describe('normalizeChannelDescription', () => {
  it.each([
    ['  Metas\ndo time  ', 'Metas do time'],
    ['linha 1\r\nlinha 2', 'linha 1 linha 2'],
    ['   ', null],
    ['', null],
  ])('trata %j como %j', (input, expected) => {
    expect(normalizeChannelDescription(input)).toBe(expected);
  });
});
