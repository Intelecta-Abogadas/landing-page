/**
 * What the app's public search answers (marcas-app-ui, `server/publico/`). The two repos change
 * together: a field added there is added here.
 */

export type Coincidencia = "igual" | "suena_igual" | "muy_parecida" | "palabra" | "parecida";

export type Registro = {
  acta: string;
  clase: number | null;
  /** EN_TRAMITE or CONCEDIDA, or null when the INPI wrote a status the app does not know yet. */
  estado: string | null;
  estadoInpi: string | null;
  tipo: string;
  titulares: string[];
  presentada: string | null;
  resolucion: string | null;
  logo: string | null;
};

export type Resultado = {
  denominacion: string;
  coincidencia: Coincidencia;
  puntaje: number;
  registros: Registro[];
};

export type Busqueda = { denominacion: string; grafias: string[]; resultados: Resultado[]; total: number };

export type EstadoDelCupo = {
  conDatos: boolean;
  nombre: string | null;
  cupo: number;
  usadas: number;
  restantes: number;
  vence: string | null;
  vuelveEn: string | null;
  vencido: boolean;
};

export type Pais = { codigo: string; nombre: string; prefijo: string };

export type Productos = { clase: number | null; soloEstos: boolean; terminos: string[] };

export type Ficha = {
  acta: string;
  encontrada: boolean;
  nombre: string | null;
  productos: Productos[];
  titulares: string[];
  descripcionDelLogo: string | null;
  colores: string[];
  oposicionDesde: string | null;
  oposicionHasta: string | null;
  logo: string | null;
};

export type Bloqueo = "sin_datos" | "ip" | "incognito" | "cupo_diario" | "vencido";

export type Falla = { codigo: string; mensaje: string; motivo?: Bloqueo; vuelveEn?: string };
