FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./

# install app dependencies
RUN npm install

# copy app source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]