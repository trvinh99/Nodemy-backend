const mongoose = require('mongoose');

let url = '';
if (process.env.PHASE === 'DEVELOPMENT') {
  url = `mongodb://127.0.0.1/nodemy-development`;
}
else {
  const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
  } = process.env;
  
  url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
}

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('Succeed to connect to database');
})
.catch((error) => {
  console.log(error);
});
