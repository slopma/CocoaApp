# Etapa 1: build con Node
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

RUN apk --no-cache upgrade

# Copiar el build de Vite a nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar config de nginx si la tienes (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
