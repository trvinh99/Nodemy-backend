const express = require('express');

const cors = require('./middlewares/cors.middleware');

const app = express();

app.use(express.json());
app.use(cors);

app.get('/', (_, res) => {
  res.send({
    message: 'Hello, World!!!',
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
