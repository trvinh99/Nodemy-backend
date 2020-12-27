FROM node:14.15.3

WORKDIR /nodemy-app

COPY . .

RUN npm install