import type { Finca } from "../../types/domain"

export const contarEstados = (fincas: Finca[]): Record<string, number> => {
  const conteo: Record<string, number> = {}

  const recorrer = (elemento: any) => {
    if ("fruto_id" in elemento) {
      const estado = elemento.estado_cacao?.nombre || "Desconocido"
      conteo[estado] = (conteo[estado] || 0) + 1
    } else if ("fruto" in elemento) {
      elemento.fruto.forEach(recorrer)
    } else if ("arbol" in elemento) {
      elemento.arbol.forEach(recorrer)
    } else if ("cultivo" in elemento) {
      elemento.cultivo.forEach(recorrer)
    } else if ("lote" in elemento) {
      elemento.lote.forEach(recorrer)
    }
  }

  fincas.forEach(recorrer)
  return conteo
}

export const contarEstructura = (fincas: Finca[]) => {
  let fincasCount = fincas.length
  let lotes = 0,
    cultivos = 0,
    arboles = 0,
    frutos = 0

  fincas.forEach((f) => {
    lotes += f.lote.length
    f.lote.forEach((l) => {
      cultivos += l.cultivo.length
      l.cultivo.forEach((c) => {
        arboles += c.arbol.length
        c.arbol.forEach((a) => {
          frutos += a.fruto.length
        })
      })
    })
  })

  return { fincas: fincasCount, lotes, cultivos, arboles, frutos }
}
