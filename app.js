const express = require("express");

const contactRouter = require("./route/contact");

const app = express();

console.log(process.env.NODE_ENV);

app.use(express.json());

app.use((req, res, next) => {
  req.body.createdAt = new Date();
  req.body.updatedAt = new Date();
  next();
});

// 3) ROUTES
app.use("/", contactRouter);

module.exports = app;
