const mongoose = require("mongoose");

const DB = () => {
  mongoose
    .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Databazaga ulandik :)");
    })
    .catch((err) => {
      console.log("Databazada xatolik :(", err);
    });
};

module.exports = { DB };
