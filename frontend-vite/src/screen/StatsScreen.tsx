import React, { useEffect, useState } from "react"
import { supabase } from "../utils/SupabaseClient"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

// ----------------- Tipos -----------------
interface EstadoCacao {
  nombre: string
}


interface Fruto {
  fruto_id: string
  especie: string
  created_at: string
  estado_cacao?: EstadoCacao
}

interface Arbol {
  arbol_id: string
  nombre: string
  especie?: string
  fruto: Fruto[]
}

interface Cultivo {
  cultivo_id: string
  nombre: string
  arbol: Arbol[]
}

interface Lote {
  lote_id: string
  nombre: string
  cultivo: Cultivo[]
}

interface Finca {
  finca_id: string
  nombre: string
  created_at: string
  lote: Lote[]
}

interface StatsScreenProps {
  geodata: any; // puedes tiparlo mejor luego
}


// ----------------- Helpers -----------------
const contarEstados = (fincas: any[]): Record<string, number> => {
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

const contarEstructura = (fincas: Finca[]) => {
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

// ----------------- Colores -----------------
const COLORS: Record<string, string> = {
  Enfermo: "#e74c3c",
  Maduro: "#27ae60",
  Inmaduro: "#3498db",
  Transición: "#f1c40f",
  Desconocido: "#7f8c8d",
}

// ----------------- Gráfico + Tabla -----------------
const GraficoConTabla: React.FC<{ conteo: Record<string, number> }> = ({ conteo }) => {
  const data = Object.entries(conteo).map(([estado, valor]) => ({
    name: estado,
    value: valor,
  }))




  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <div style={{ width: 250, height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table style={{ borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "6px" }}>Estado</th>
            <th style={{ border: "1px solid #ccc", padding: "6px" }}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td style={{ border: "1px solid #ccc", padding: "6px" }}>{row.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px" }}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ----------------- Componente -----------------
const StatsScreen: React.FC<StatsScreenProps> = ({ geodata }) => {
  void geodata; // evita warning TS6133

  const [fincas, setFincas] = useState<Finca[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFinca, setSelectedFinca] = useState<string>("")
  const [selectedLote, setSelectedLote] = useState<string>("")

  useEffect(() => {
    const fetchFincas = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("finca")
        .select(`
          finca_id,
          nombre,
          created_at,
          lote (
            lote_id,
            nombre,
            cultivo (
              cultivo_id,
              nombre,
              arbol (
                arbol_id,
                nombre,
                especie,
                fruto (
                  fruto_id,
                  especie,
                  created_at,
                  estado_cacao (
                    nombre
                  )
                )
              )
            )
          )
        `)

      if (error) console.error("❌ Error cargando fincas:", error)
      else setFincas(data || [])
      setLoading(false)
    }

    fetchFincas()
  }, [])

  // Aplicar filtros
  const filteredFincas = fincas
    .filter((f) => (selectedFinca ? f.finca_id === selectedFinca : true))
    .map((f) => ({
      ...f,
      lote: f.lote.filter((l) => (selectedLote ? l.lote_id === selectedLote : true)),
    }))

  // Recuentos
  const conteoGeneral = contarEstados(filteredFincas)
  const estructuraGeneral = contarEstructura(filteredFincas)

return (
  <div
    style={{
      padding: "20px",
      paddingBottom: "90px",
      backgroundColor: "#f5f5f5",
      height: "100vh",          // pantalla completa
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* 🔹 Header y filtros fijos */}
    <div style={{ flex: "0 0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>🌍 Mis Zonas</h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <select
          value={selectedFinca}
          onChange={(e) => {
            setSelectedFinca(e.target.value)
            setSelectedLote("")
          }}
        >
          <option value="">Todas las fincas</option>
          {fincas.map((f) => (
            <option key={f.finca_id} value={f.finca_id}>
              {f.nombre}
            </option>
          ))}
        </select>

        <select
          value={selectedLote}
          onChange={(e) => setSelectedLote(e.target.value)}
          disabled={!selectedFinca}
        >
          <option value="">Todos los lotes</option>
          {fincas
            .find((f) => f.finca_id === selectedFinca)
            ?.lote.map((l) => (
              <option key={l.lote_id} value={l.lote_id}>
                {l.nombre}
              </option>
            ))}
        </select>
      </div>
    </div>

    {/* 🔹 Contenedor con scroll solo para las fincas */}
    <div
      style={{
        flex: "1 1 auto",       // ocupa el resto del espacio
        overflowY: "auto",      // scroll solo aquí
        paddingRight: "10px",   // espacio para scrollbar
      }}
    >
      {loading && <p>Cargando...</p>}

      {!loading && (
        <>
          {/* General */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h3>📊 Resumen General</h3>
            <GraficoConTabla conteo={conteoGeneral} />
            <p>
              Fincas: {estructuraGeneral.fincas} | Lotes: {estructuraGeneral.lotes} | Cultivos:{" "}
              {estructuraGeneral.cultivos} | Árboles: {estructuraGeneral.arboles} | Frutos:{" "}
              {estructuraGeneral.frutos}
            </p>
          </div>

          {/* Por finca */}
          {filteredFincas.map((finca) => {
            const conteoFinca = contarEstados([finca])
            const estructuraFinca = contarEstructura([finca])
            return (
              <div
                key={finca.finca_id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <h3>🏡 {finca.nombre}</h3>
                <GraficoConTabla conteo={conteoFinca} />
                <p>
                  Lotes: {estructuraFinca.lotes} | Cultivos: {estructuraFinca.cultivos} | Árboles:{" "}
                  {estructuraFinca.arboles} | Frutos: {estructuraFinca.frutos}
                </p>
              </div>
            )
          })}
        </>
      )}
    </div>
  </div>
)

}

export default StatsScreen
