FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --production || npm install

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
