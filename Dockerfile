FROM node:14.15.3

RUN mkdir -p /home/nodemy-app

WORKDIR /home/nodemy-app

COPY . /home/nodemy-app

EXPOSE 8080

CMD [ "npm", "start" ]
