import { describe, expect, it } from "vitest";
import { linkify } from "./linkify";

describe("linkify", () => {
  it("separa os endereços http e https do texto", () => {
    expect(linkify("veja https://exemplo.com/a?b=1 e http://x.org.")).toEqual([
      { kind: "text", value: "veja " },
      { kind: "link", value: "https://exemplo.com/a?b=1" },
      { kind: "text", value: " e " },
      { kind: "link", value: "http://x.org" },
      { kind: "text", value: "." },
    ]);
  });

  it("não transforma um endereço sem esquema nem outros esquemas", () => {
    expect(linkify("exemplo.com e javascript:alert(1) e ftp://x")).toEqual([
      { kind: "text", value: "exemplo.com e javascript:alert(1) e ftp://x" },
    ]);
  });

  it("mantém as quebras de linha no texto", () => {
    expect(linkify("a\nhttps://b.com\nc")).toEqual([
      { kind: "text", value: "a\n" },
      { kind: "link", value: "https://b.com" },
      { kind: "text", value: "\nc" },
    ]);
  });

  it("mantém o parêntese que fecha um parêntese do próprio endereço", () => {
    expect(linkify("(veja https://pt.wikipedia.org/wiki/Java_(linguagem))")).toEqual([
      { kind: "text", value: "(veja " },
      { kind: "link", value: "https://pt.wikipedia.org/wiki/Java_(linguagem)" },
      { kind: "text", value: ")" },
    ]);
  });

  it("devolve uma lista vazia para o texto vazio", () => {
    expect(linkify("")).toEqual([]);
  });
});
