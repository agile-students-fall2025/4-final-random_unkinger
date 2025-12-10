FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./

# install app dependencies
RUN npm install --no-optional

# copy app source
COPY . .

EXPOSE 5050
CMD ["npm", "start"]