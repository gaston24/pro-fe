# Usar la imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto en el que corre Vite (por defecto 5173)
EXPOSE 5173

# Comando por defecto para correr Vite en modo desarrollo
CMD ["yarn", "dev", "--host"]
