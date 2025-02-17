# Usar la imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo los archivos esenciales
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Exponer el puerto en el que corre Vite (por defecto 5173)
EXPOSE 5173
