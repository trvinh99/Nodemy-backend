FROM node:14.15.3

RUN mkdir -p /home/nodemy-app
RUN mkdir -p /home/nodemy-db
RUN mkdir -p /home/videos

WORKDIR /home/nodemy-app

COPY . /home/nodemy-app

EXPOSE 8080

CMD [ "npm", "start" ]
