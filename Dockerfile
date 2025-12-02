FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_TILDRAW_LICENSE_KEY
ARG VITE_PORT_URL
ARG VITE_FRONTEND_URL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_TILDRAW_LICENSE_KEY=${VITE_TILDRAW_LICENSE_KEY}
ENV VITE_PORT_URL=${VITE_PORT_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}

RUN npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
