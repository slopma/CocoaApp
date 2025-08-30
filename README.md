# Cocoa App

Aplicación web para la detección y monitoreo de la maduración y enfermedades en cultivos de cacao.  
El sistema permite a cacaocultores, investigadores y administradores registrar datos en campo, verlos en un mapa interactivo y recibir alertas sobre el estado del fruto.

---

## Descripción del Proyecto
La aplicación ofrece:
- **Registro de datos en campo**: Estado del fruto (inmaduro, maduro, enfermo), ubicación geográfica, fotos y comentarios.  
- **Mapa interactivo**: Visualización de lotes y análisis sobre un mapa georreferenciado (GeoJSON).  
- **Alertas**: Generación automática de alertas basadas en análisis de datos.  
- **Histórico de registros**: Consulta de la evolución de los lotes en el tiempo.  
- **Notificaciones push**: Avisos en tiempo real sobre resultados críticos.  
- **Integración externa**: Consumo de API de clima (OpenWeather) y recepción de datos desde sensores vía NodeRED.  

---

## Arquitectura
El sistema sigue un modelo **Cliente-Servidor**:

- **Frontend (App móvil):** React Native + Expo Router  
- **Backend (API REST):** FastAPI (Python)  
- **Base de datos:** PostgreSQL (persistencia), Firebase (notificaciones push)  
- **Servicios externos:** NodeRED, Sensores, OpenWeather API (clima)  

---

## Licencia

Este proyecto es de uso académico y de investigación. Si deseas contribuir al proyecto, por favor crea un fork del repositorio, realiza tus cambios y envía un pull request. 
¡Todas las contribuciones son bienvenidas!

---

## Autores:

Contáctanos para más información: 
- [Luis Alejandro Castrillón](https://github.com/lacastrilp)
- [Sara López Marín](https://github.com/slopma)
- [Nicolás Ospina](https://github.com/niosto)
- [Samuel Enrique Rivero](https://github.com/SamuelRivero50)
