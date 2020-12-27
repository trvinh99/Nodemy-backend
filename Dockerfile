FROM node:14.15.3

WORKDIR /src

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]