import { codigoCivil, Artigo } from '../data';

/** Localização completa de um artigo na hierarquia do Código Civil. */
export interface ArtigoLocation {
  artigo: Artigo;
  numero: string;
  livro: string;
  titulo: string;
  capitulo: string;
  secao?: string;
  subsecao?: string;
}

/** Extrai o número do artigo a partir do seu nome (ex.: "Art.º 1577º - ..." -> "1577"). */
function extractNumero(nome: string): string | null {
  const m = nome.match(/art\.?\s*º?\s*(\d+)/i);
  return m ? m[1] : null;
}

// Índice número -> localização, construído uma única vez.
const index = new Map<string, ArtigoLocation>();

function register(
  artigos: Artigo[] | undefined,
  base: { livro: string; titulo: string; capitulo: string },
  secao?: string,
  subsecao?: string,
) {
  if (!artigos) return;
  for (const artigo of artigos) {
    const numero = extractNumero(artigo.nome);
    if (numero && !index.has(numero)) {
      index.set(numero, { artigo, numero, ...base, secao, subsecao });
    }
  }
}

for (const livro of codigoCivil) {
  for (const titulo of livro.titulos) {
    for (const capitulo of titulo.capitulos) {
      const base = { livro: livro.nome, titulo: titulo.nome, capitulo: capitulo.nome };
      register(capitulo.artigos, base);
      for (const secao of capitulo.secoes ?? []) {
        register(secao.artigos, base, secao.nome);
        for (const subsecao of secao.subsecoes ?? []) {
          register(subsecao.artigos, base, secao.nome, subsecao.nome);
        }
      }
    }
  }
}

/** Devolve a localização de um artigo pelo seu número, ou `undefined` se não existir. */
export function findArtigoByNumero(numero: string | number): ArtigoLocation | undefined {
  return index.get(String(numero));
}
