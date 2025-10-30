# ==============================================
# Etapa 1: Build del frontend
# ==============================================
FROM node:20-slim AS build

WORKDIR /app

# Copiar archivos de dependencias y .env
COPY package*.json ./
COPY .env .env

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar TypeScript y construir el frontend
RUN npx tsc -b && npx vite build

# ==============================================
# Etapa 2: Servir con Nginx
# ==============================================
FROM nginx:alpine

# Actualizar y limpiar
RUN apk --no-cache upgrade

# Copiar los archivos compilados del frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (si existe)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto HTTP
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
