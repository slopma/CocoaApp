import React, { useEffect, useState } from "react"
import type { Finca } from "../types/domain"
import GraficoConTabla from "../components/stats/GraficoConTabla"

interface StatsScreenProps {
  geodata: any
}

interface StatsResponse {
  resumen_general: {
    conteo: Record<string, number>
    estructura: {
      fincas: number
      lotes: number
      cultivos: number
      arboles: number
      frutos: number
    }
  }
  por_finca: Array<{
    finca_id: string
    nombre: string
    conteo: Record<string, number>
    estructura: any
  }>
  fincas: Finca[]
}

const StatsScreen: React.FC<StatsScreenProps> = ({ geodata }) => {
  void geodata
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [fincasList, setFincasList] = useState<Array<{ finca_id: string; nombre: string }>>([])
  const [lotesList, setLotesList] = useState<Array<{ lote_id: string; nombre: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedFinca, setSelectedFinca] = useState<string>("")
  const [selectedLote, setSelectedLote] = useState<string>("")

  useEffect(() => {
    const fetchFincas = async () => {
      const res = await fetch("http://localhost:8000/stats/fincas")
      const data = await res.json()
      setFincasList(data)
    }
    fetchFincas()
  }, [])

  useEffect(() => {
    if (selectedFinca) {
      const fetchLotes = async () => {
        const res = await fetch(`http://localhost:8000/stats/lotes?finca_id=${selectedFinca}`)
        const data = await res.json()
        setLotesList(data)
      }
      fetchLotes()
    } else {
      setLotesList([])
      setSelectedLote("")
    }
  }, [selectedFinca])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        let url = "http://localhost:8000/stats"
        const params = new URLSearchParams()
        if (selectedFinca) params.append("finca_id", selectedFinca)
        if (selectedLote) params.append("lote_id", selectedLote)
        if (params.toString()) url += `?${params.toString()}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const data = await res.json()
        setStatsData(data)
      } catch (error) {
        console.error("❌ Error cargando estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedFinca, selectedLote])

  const conteoGeneral = statsData?.resumen_general.conteo || {}
  const estructuraGeneral = statsData?.resumen_general.estructura || {
    fincas: 0,
    lotes: 0,
    cultivos: 0,
    arboles: 0,
    frutos: 0,
  }

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        backgroundColor: "var(--bg-secondary)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header + Filtros */}
      <div style={{ flex: "0 0 auto" }}>
        <h2 style={{ marginBottom: "20px", color: "var(--text-primary)", fontSize: "24px", fontWeight: "bold" }}>📊 Estadísticas</h2>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <select
            value={selectedFinca}
            onChange={(e) => {
              setSelectedFinca(e.target.value)
              setSelectedLote("")
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              border: "2px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "14px",
              minWidth: "150px"
            }}
          >
            <option value="">Todas las fincas</option>
            {fincasList.map((f) => (
              <option key={f.finca_id} value={f.finca_id}>
                {f.nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedLote}
            onChange={(e) => setSelectedLote(e.target.value)}
            disabled={!selectedFinca}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              border: "2px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "14px",
              minWidth: "150px",
              opacity: !selectedFinca ? 0.5 : 1
            }}
          >
            <option value="">Todos los lotes</option>
            {lotesList.map((l) => (
                <option key={l.lote_id} value={l.lote_id}>
                  {l.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: "10px" }}>
        {loading && <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>Cargando...</p>}

        {!loading && statsData && (
          <>
            {/* General */}
            <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "16px", marginBottom: "20px", border: "2px solid var(--border-color)", boxShadow: "var(--shadow)" }}>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>📊 Resumen General</h3>
              <GraficoConTabla conteo={conteoGeneral} />
              <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>
                Fincas: {estructuraGeneral.fincas} | Lotes: {estructuraGeneral.lotes} | Cultivos:{" "}
                {estructuraGeneral.cultivos} | Árboles: {estructuraGeneral.arboles} | Frutos: {estructuraGeneral.frutos}
              </p>
            </div>

            {/* Por finca */}
            {statsData.por_finca.map((finca) => (
              <div key={finca.finca_id} style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "16px", marginBottom: "20px", border: "2px solid var(--border-color)", boxShadow: "var(--shadow)" }}>
                <h3 style={{ color: "var(--text-primary)", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>🏡 {finca.nombre}</h3>
                <GraficoConTabla conteo={finca.conteo} />
                <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>
                  Lotes: {finca.estructura.lotes} | Cultivos: {finca.estructura.cultivos} | Árboles:{" "}
                  {finca.estructura.arboles} | Frutos: {finca.estructura.frutos}
                  </p>
                </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default StatsScreen
