# Cocoa App

Web application for detecting and monitoring ripening and disease in cocoa crops.

The system allows cocoa farmers, researchers, and managers to record data in the field, view it on an interactive map, and receive alerts about the fruit's status.

---

## Project Description
The application offers:
- **Field data recording**: Fruit status (unripe, ripe, diseased), geographic location, photos, and comments.
- **Interactive map**: Visualization of plots and analysis on a georeferenced map (GeoJSON).
- **Alerts**: Automatic generation of alerts based on data analysis.
- **Historical records**: View the evolution of plots over time.
- **Push notifications**: Real-time alerts about critical results.
- **External integration**: Consumption of weather APIs (OpenWeather) and reception of data from sensors via NodeRED.

---

## Architecture
The system follows a **Client-Server** model:

- **Frontend (Mobile App):** React Native + Expo Router
- **Backend (REST API):** FastAPI (Python)
- **Database:** PostgreSQL (persistence), Firebase (push notifications)
- **External Services:** NodeRED, Sensors, OpenWeather API (weather)

---

## License

This project is for academic and research use. If you wish to contribute to the project, please fork the repository, make your changes, and submit a pull request.
All contributions are welcome!

---

## Authors:

Contact us for more information:
- [Luis Alejandro Castrillón](https://github.com/lacastrilp)
- [Sara López Marín](https://github.com/slopma)
- [Nicolás Ospina](https://github.com/niosto)
- [Samuel Enrique Rivero](https://github.com/SamuelRivero50)
