const express = require("express");
require("./src/db/mongoose.db");
require('./src/db/clearTotalRegisteredLastWeek.db');

const cors = require("./src/middlewares/cors.middleware");

const app = express();

app.use(express.json());
app.use(cors);

app.get("/", (_, res) => {
  res.send({
    message: 'Welcome to Nodemy APIs service',
  });
});

const userRoute = require("./src/routes/user.route");
const categoryRoute = require("./src/routes/category.route");
const courseRoute = require('./src/routes/course.route');
const lectureRoute = require('./src/routes/lecture.route');
const sectionRoute = require('./src/routes/section.route');
const ratingRoute = require('./src/routes/rating.route');

app.use(userRoute);
app.use(categoryRoute);
app.use(courseRoute);
app.use(lectureRoute);
app.use(sectionRoute);
app.use(ratingRoute);

app.get('*', (_, res) => {
  res.status(404).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
