export interface EstadoCacao {
  nombre: string
}

export interface Fruto {
  fruto_id: string
  especie?: string
  created_at?: string
  estado_cacao?: EstadoCacao
}

export interface Arbol {
  arbol_id: string
  nombre: string
  especie?: string
  fruto: Fruto[]
}

export interface Cultivo {
  cultivo_id: string
  nombre: string
  arbol: Arbol[]
}

export interface Lote {
  lote_id: string
  nombre: string
  cultivo: Cultivo[]
}

export interface Finca {
  finca_id: string
  nombre: string
  created_at: string
  lote: Lote[]
}
