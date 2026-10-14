/**
 * Las medidas de rapidfuzz y jellyfish que usa el backend, escritas igual que sus versiones
 * de referencia en Python (`rapidfuzz/fuzz_py.py`, `jellyfish/_jellyfish.py`). Todas devuelven
 * de 0 a 100 salvo Jaro–Winkler, que va de 0 a 1.
 */

function subsecuenciaComun(a: string, b: string): number {
  if (!a.length || !b.length) return 0;
  let previa = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const fila = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      fila[j] = a[i - 1] === b[j - 1] ? previa[j - 1] + 1 : Math.max(previa[j], fila[j - 1]);
    }
    previa = fila;
  }
  return previa[b.length];
}

function similitudIndel(a: string, b: string): number {
  const total = a.length + b.length;
  if (!total) return 1;
  return (2 * subsecuenciaComun(a, b)) / total;
}

export function ratio(a: string, b: string): number {
  return similitudIndel(a, b) * 100;
}

function parcial(corta: string, larga: string): number {
  const letras = new Set(corta);
  const l1 = corta.length;
  const l2 = larga.length;
  let mejor = 0;
  const probar = (trozo: string) => {
    const r = similitudIndel(corta, trozo);
    if (r > mejor) mejor = r;
    return mejor === 1;
  };
  for (let i = 1; i < l1; i++) {
    if (letras.has(larga[i - 1]) && probar(larga.slice(0, i))) return 100;
  }
  for (let i = 0; i < l2 - l1; i++) {
    if (letras.has(larga[i + l1 - 1]) && probar(larga.slice(i, i + l1))) return 100;
  }
  for (let i = Math.max(0, l2 - l1); i < l2; i++) {
    if (letras.has(larga[i]) && probar(larga.slice(i))) return 100;
  }
  return mejor * 100;
}

export function partialRatio(a: string, b: string): number {
  if (!a && !b) return 100;
  const [corta, larga] = a.length <= b.length ? [a, b] : [b, a];
  let res = parcial(corta, larga);
  if (res !== 100 && a.length === b.length) res = Math.max(res, parcial(larga, corta));
  return res;
}

const palabras = (s: string) => s.split(/\s+/).filter(Boolean);
const unir = (xs: Iterable<string>) => [...xs].sort().join(" ");

export function tokenSortRatio(a: string, b: string): number {
  return ratio(unir(palabras(a)), unir(palabras(b)));
}

export function tokenSetRatio(a: string, b: string): number {
  const ta = new Set(palabras(a));
  const tb = new Set(palabras(b));
  if (!ta.size || !tb.size) return 0;
  const comunes = [...ta].filter((t) => tb.has(t));
  const soloA = [...ta].filter((t) => !tb.has(t));
  const soloB = [...tb].filter((t) => !ta.has(t));
  if (comunes.length && (!soloA.length || !soloB.length)) return 100;

  const ab = unir(soloA);
  const ba = unir(soloB);
  const largoComun = unir(comunes).length;
  const hay = largoComun ? 1 : 0;
  const largoComunAb = largoComun + hay + ab.length;
  const largoComunBa = largoComun + hay + ba.length;
  const norma = (dist: number, suma: number) => (suma ? 100 - (100 * dist) / suma : 100);

  const distancia = ab.length + ba.length - 2 * subsecuenciaComun(ab, ba);
  const resultado = norma(distancia, largoComunAb + largoComunBa);
  if (!largoComun) return resultado;
  return Math.max(
    resultado,
    norma(hay + ab.length, largoComun + largoComunAb),
    norma(hay + ba.length, largoComun + largoComunBa),
  );
}

function tokenRatio(a: string, b: string): number {
  return Math.max(tokenSetRatio(a, b), tokenSortRatio(a, b));
}

function partialTokenRatio(a: string, b: string): number {
  const partesA = palabras(a);
  const partesB = palabras(b);
  const ta = new Set(partesA);
  const tb = new Set(partesB);
  if ([...ta].some((t) => tb.has(t))) return 100;
  const soloA = [...ta].filter((t) => !tb.has(t));
  const soloB = [...tb].filter((t) => !ta.has(t));
  const resultado = partialRatio(unir(partesA), unir(partesB));
  if (partesA.length === soloA.length && partesB.length === soloB.length) return resultado;
  return Math.max(resultado, partialRatio(unir(soloA), unir(soloB)));
}

export function wRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  const ESCALA = 0.95;
  const proporcion = a.length > b.length ? a.length / b.length : b.length / a.length;
  let fin = ratio(a, b);
  if (proporcion < 1.5) return Math.max(fin, tokenRatio(a, b) * ESCALA);
  const PARCIAL = proporcion <= 8 ? 0.9 : 0.6;
  fin = Math.max(fin, partialRatio(a, b) * PARCIAL);
  return Math.max(fin, partialTokenRatio(a, b) * ESCALA * PARCIAL);
}

export function jaroWinkler(s1: string, s2: string): number {
  const l1 = s1.length;
  const l2 = s2.length;
  if (!l1 || !l2) return 0;
  const minimo = Math.min(l1, l2);
  const rango = Math.max(0, Math.floor(Math.max(l1, l2) / 2) - 1);
  const marcas1 = new Array<boolean>(l1).fill(false);
  const marcas2 = new Array<boolean>(l2).fill(false);
  let comunes = 0;
  for (let i = 0; i < l1; i++) {
    const desde = Math.max(0, i - rango);
    const hasta = Math.min(i + rango, l2 - 1);
    for (let j = desde; j <= hasta; j++) {
      if (!marcas2[j] && s2[j] === s1[i]) {
        marcas1[i] = marcas2[j] = true;
        comunes++;
        break;
      }
    }
  }
  if (!comunes) return 0;
  let k = 0;
  let trasposiciones = 0;
  for (let i = 0; i < l1; i++) {
    if (!marcas1[i]) continue;
    let j = k;
    for (; j < l2; j++) {
      if (marcas2[j]) {
        k = j + 1;
        break;
      }
    }
    if (s1[i] !== s2[j]) trasposiciones++;
  }
  trasposiciones = Math.floor(trasposiciones / 2);
  let peso = (comunes / l1 + comunes / l2 + (comunes - trasposiciones) / comunes) / 3;
  if (peso > 0.7) {
    const tope = Math.min(minimo, 4);
    let i = 0;
    while (i < tope && s1[i] === s2[i]) i++;
    if (i) peso += i * 0.1 * (1 - peso);
  }
  return peso;
}
