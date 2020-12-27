const mongoose = require('mongoose');

let url = '';

if (process.env.PHASE === 'PRODUCTION') {
  const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
  } = process.env;
  
  url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
}
else {
  url = 'mongodb://127.0.0.1:27017/nodemy-development'
}

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
};

mongoose.connect(url, options)
.then(() => {
  console.log('MongoDB is connected');
})
.catch((err) => {
  console.log(err);
});