FROM node:14.15.3

RUN mkdir -p /home/nodemy-app

WORKDIR /home/nodemy-app

COPY . /home/nodemy-app

COPY ../../etc/letsencrypt/live/nodemy-apis.online/privkey.pem /home/nodemy-app/src/privkey.pem
COPY ../../etc/letsencrypt/live/nodemy-apis.online/cert.pem /home/nodemy-app/src/cert.pem
COPY ../../etc/letsencrypt/live/nodemy-apis.online/chain.pem /home/nodemy-app/src/chain.pem

EXPOSE 8080

CMD [ "npm", "start" ]
