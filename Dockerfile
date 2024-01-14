FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

ENV NODE_ENV=production

CMD ["node", "index.js"]