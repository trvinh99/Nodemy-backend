const express = require("express");
require("./db/mongoose.db");

const cors = require("./middlewares/cors.middleware");

const app = express();

app.use(express.json());
app.use(cors);

app.get("/", (_, res) => {
  res.send({
    message: 'Welcome to Nodemy APIs service',
  });
});

const userRoute = require("./routes/user.route");
const categoryRoute = require("./routes/category.route");

app.use(userRoute);
app.use(categoryRoute);

app.get("*", (_, res) => {
  res.status(404).send();
});

app.get('*', (_, res) => {
  res.status(404).send();
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
