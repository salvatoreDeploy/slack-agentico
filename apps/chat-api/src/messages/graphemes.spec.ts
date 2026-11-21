import { countGraphemes } from './graphemes.js';

describe('countGraphemes', () => {
  it.each([
    ['', 0],
    ['a', 1],
    ['ação', 4],
    ['👩🏽‍💻', 1],
    ['🇧🇷', 1],
    ['é', 1],
    ['oi 👋🏾!', 5],
  ])('conta %j como %i caracteres', (text, expected) => {
    expect(countGraphemes(text)).toBe(expected);
  });

  it('conta 4.000 emojis compostos como 4.000 caracteres', () => {
    expect(countGraphemes('👩🏽‍💻'.repeat(4000))).toBe(4000);
  });
});
