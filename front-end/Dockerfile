# build env
FROM node:20-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --no-optional
COPY . .
RUN npm run build

# production environment optimized
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]