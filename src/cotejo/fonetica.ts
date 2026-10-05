/**
 * Cómo suena una palabra: la clave rioplatense propia del backend (`spanish_phonetic.py`),
 * el Spanish Metaphone modificado de abydos y el Metaphone inglés de jellyfish.
 */
import { sinAcentos } from "./texto";

export function claveCastellana(palabra: string): string {
  let s = sinAcentos(palabra.toLowerCase().replace(/ñ/g, "ny")).replace(/[^a-z]/g, "");
  if (!s) return "";
  s = s.replace(/ch/g, "X").replace(/sh/g, "X").replace(/ll/g, "y");
  s = s.replace(/h/g, "");
  s = s.replace(/qu/g, "k");
  s = s.replace(/gu(?=[ei])/g, "g");
  s = s.replace(/c(?=[ei])/g, "s");
  s = s.replace(/z/g, "s");
  s = s.replace(/c/g, "k");
  s = s.replace(/g(?=[ei])/g, "j");
  s = s.replace(/v/g, "b");
  s = s.replace(/w/g, "u");
  s = s.replace(/x/g, "ks");
  for (const letra of "bdfgjklmnpstuy") {
    const doble = letra + letra;
    while (s.includes(doble)) s = s.split(doble).join(letra);
  }
  return s;
}

const VOCALES = new Set(["A", "E", "I", "O", "U"]);
const SIMPLES = new Set(["D", "F", "J", "K", "M", "N", "P", "T", "V", "L", "Y"]);

export function metaphoneCastellano(palabra: string, largo = 10): string {
  let w = palabra.toUpperCase().normalize("NFC");
  w = w.split("MB").join("NB").split("MP").join("NP").split("BS").join("S");
  if (w.startsWith("PS")) w = w.slice(1);
  const reemplazos: Array<[string, string]> = [
    ["Á", "A"], ["CH", "X"], ["Ç", "S"], ["É", "E"], ["Í", "I"], ["Ó", "O"], ["Ú", "U"],
    ["Ñ", "NY"], ["GÜ", "W"], ["Ü", "U"], ["B", "V"], ["LL", "Y"],
  ];
  for (const [de, a] of reemplazos) w = w.split(de).join(a);

  const vocal = (i: number) => i < w.length && VOCALES.has(w[i]);
  const sig = (i: number) => w.charAt(i + 1);
  let clave = "";
  let i = 0;
  while (clave.length < largo && i < w.length) {
    const c = w[i];
    if (vocal(i) && i === 0) {
      clave += c;
      i += 1;
    } else if (SIMPLES.has(c)) {
      clave += c;
      i += sig(i) === c ? 2 : 1;
    } else if (c === "C") {
      if (sig(i) === "C") {
        clave += "X";
        i += 2;
      } else if (sig(i) === "E" || sig(i) === "I") {
        clave += "Z";
        i += 2;
      } else {
        clave += "K";
        i += 1;
      }
    } else if (c === "G") {
      if (sig(i) === "E" || sig(i) === "I") {
        clave += "J";
        i += 2;
      } else {
        clave += "G";
        i += 1;
      }
    } else if (c === "H") {
      if (vocal(i + 1)) {
        clave += w[i + 1];
        i += 2;
      } else {
        clave += "H";
        i += 1;
      }
    } else if (c === "Q") {
      i += sig(i) === "U" ? 2 : 1;
      clave += "K";
    } else if (c === "W") {
      clave += "U";
      i += 1;
    } else if (c === "R") {
      clave += "R";
      i += 1;
    } else if (c === "S") {
      clave += !vocal(i + 1) && i === 0 ? "ES" : "S";
      i += 1;
    } else if (c === "Z") {
      clave += "Z";
      i += 1;
    } else if (c === "X") {
      clave += w.length > 1 && i === 0 && !vocal(i + 1) ? "EX" : "X";
      i += 1;
    } else {
      i += 1;
    }
  }
  return clave.split("S").join("Z");
}

const en = (c: string, letras: string) => c.length === 1 && letras.includes(c);

export function metaphoneIngles(palabra: string): string {
  let s = palabra.toLowerCase().normalize("NFKD");
  if (/^(kn|gn|pn|wr|ae)/.test(s)) s = s.slice(1);
  const r: string[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const sig = s.charAt(i + 1);
    const sig2 = s.charAt(i + 2);
    if (c === sig && c !== "c") {
      i += 1;
      continue;
    }
    if ("aeiou".includes(c)) {
      if (i === 0 || s[i - 1] === " ") r.push(c);
    } else if (c === "b") {
      if (!(i > 0 && s[i - 1] === "m") || sig) r.push("b");
    } else if (c === "c") {
      if ((sig === "i" && sig2 === "a") || sig === "h") {
        r.push("x");
        i += 1;
      } else if (en(sig, "iey")) {
        r.push("s");
        i += 1;
      } else {
        r.push("k");
      }
    } else if (c === "d") {
      if (sig === "g" && en(sig2, "iey")) {
        r.push("j");
        i += 2;
      } else {
        r.push("t");
      }
    } else if ("fjlmnr".includes(c)) {
      r.push(c);
    } else if (c === "g") {
      if (en(sig, "iey")) r.push("j");
      else if (sig === "h" && sig2 && !en(sig2, "aeiou")) i += 1;
      else if (sig === "n" && !sig2) i += 1;
      else r.push("k");
    } else if (c === "h") {
      if (i === 0 || en(sig, "aeiou") || !"aeiou".includes(s[i - 1])) r.push("h");
    } else if (c === "k") {
      if (i === 0 || s[i - 1] !== "c") r.push("k");
    } else if (c === "p") {
      if (sig === "h") {
        r.push("f");
        i += 1;
      } else {
        r.push("p");
      }
    } else if (c === "q") {
      r.push("k");
    } else if (c === "s") {
      if (sig === "h") {
        r.push("x");
        i += 1;
      } else if (sig === "i" && en(sig2, "oa")) {
        r.push("x");
        i += 2;
      } else {
        r.push("s");
      }
    } else if (c === "t") {
      if (sig === "i" && en(sig2, "oa")) r.push("x");
      else if (sig === "h") {
        r.push("0");
        i += 1;
      } else if (sig !== "c" || sig2 !== "h") r.push("t");
    } else if (c === "v") {
      r.push("f");
    } else if (c === "w") {
      if (i === 0 && sig === "h") {
        i += 1;
        r.push("w");
      } else if (en(sig, "aeiou")) {
        r.push("w");
      }
    } else if (c === "x") {
      if (i === 0) r.push(sig === "h" || (sig === "i" && en(sig2, "oa")) ? "x" : "s");
      else r.push("k", "s");
    } else if (c === "y") {
      if (en(sig, "aeiou")) r.push("y");
    } else if (c === "z") {
      r.push("s");
    }
    i += 1;
  }
  return r.join("").toUpperCase();
}
