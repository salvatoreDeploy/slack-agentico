import { describe, expect, it } from "vitest";
import { dayLabel, formatLongDate } from "./message-time";

// O fuso do processo de teste não importa: as datas são montadas no horário local, como o
// navegador as veria.
describe("dayLabel", () => {
  const now = new Date(2026, 10, 20, 10, 0);

  it.each([
    [new Date(2026, 10, 20, 0, 1), "Hoje"],
    [new Date(2026, 10, 19, 23, 59), "Ontem"],
    [new Date(2026, 10, 18, 12, 0), "18 de novembro"],
    [new Date(2025, 10, 20, 12, 0), "20 de novembro de 2025"],
  ])("rotula %s como %j", (date, expected) => {
    expect(dayLabel(date, now)).toBe(expected);
  });

  it("reconhece ontem na virada do mês", () => {
    expect(dayLabel(new Date(2026, 10, 30, 22, 0), new Date(2026, 11, 1, 8, 0))).toBe("Ontem");
  });
});

describe("formatLongDate", () => {
  const now = new Date(2026, 10, 20, 10, 0);

  it.each([
    [new Date(2026, 10, 20, 0, 1), "20 de novembro"],
    [new Date(2026, 0, 3, 12, 0), "3 de janeiro"],
    [new Date(2025, 11, 31, 23, 0), "31 de dezembro de 2025"],
  ])("escreve %s como %j", (date, expected) => {
    expect(formatLongDate(date, now)).toBe(expected);
  });
});
