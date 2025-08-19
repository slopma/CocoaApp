# Etapa 1: Build del React app
FROM node:20 AS build

WORKDIR /app

# Copiar solo package.json y package-lock.json primero para instalar dependencias
COPY package*.json ./

RUN npm install

# Copiar todo el proyecto al contenedor
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build generado en la etapa anterior a Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de Nginx si quieres (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto para correr Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
