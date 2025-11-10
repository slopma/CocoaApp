import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { COLORS } from "./constants"
import React, { useMemo } from "react" // ✅ usar useMemo


interface GraficoConTablaProps {
  conteo: Record<string, number>
}

const GraficoConTabla: React.FC<GraficoConTablaProps> = ({ conteo }) => {
  const data = useMemo(() => {
    if (!conteo || Object.keys(conteo).length === 0) {
      console.warn("⚠️ Conteo vacío o indefinido:", conteo);
      return [];
    }

    const parsed = Object.entries(conteo)
      .filter(([_, valor]) => typeof valor === "number" && valor > 0)
      .map(([estado, valor]) => ({
        name: estado,
        value: valor,
      }));

    console.debug("📊 Datos procesados para gráfico:", parsed);
    return parsed;
  }, [conteo]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
        <p>📉 No hay datos disponibles para mostrar el gráfico</p>
      </div>
    );
  }



  return (
    <div 
      style={{ 
        display: "flex", 
        gap: "32px", 
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap"
      }}
    >
      {/* Gráfico de pastel */}
      <div 
        style={{ 
          minWidth: "280px",
          width: "280px", 
          height: "280px",
          flex: "0 0 auto"
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              outerRadius={100} 
              dataKey="value"
              label
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "2px solid var(--border-color)",
                borderRadius: "12px",
                padding: "8px 12px",
                boxShadow: "var(--shadow)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de datos */}
      <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
        <table 
          style={{ 
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            fontSize: "15px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid var(--border-color)"
          }}
        >
          <thead>
            <tr>
              <th 
                style={{ 
                  padding: "14px 16px",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontWeight: "700",
                  textAlign: "left",
                  borderBottom: "2px solid var(--border-color)",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase"
                }}
              >
                Estado
              </th>
              <th 
                style={{ 
                  padding: "14px 16px",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontWeight: "700",
                  textAlign: "right",
                  borderBottom: "2px solid var(--border-color)",
                  fontSize: "14px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase"
                }}
              >
                Cantidad
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.name}
                style={{
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <td 
                  style={{ 
                    padding: "12px 16px",
                    color: "var(--text-primary)",
                    fontWeight: "500",
                    borderBottom: index < data.length - 1 ? "1px solid var(--border-color)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <div 
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: COLORS[row.name] || "#ccc",
                      flexShrink: 0
                    }}
                  />
                  {row.name}
                </td>
                <td 
                  style={{ 
                    padding: "12px 16px",
                    color: "var(--text-primary)",
                    fontWeight: "700",
                    textAlign: "right",
                    fontSize: "16px",
                    borderBottom: index < data.length - 1 ? "1px solid var(--border-color)" : "none"
                  }}
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GraficoConTabla
