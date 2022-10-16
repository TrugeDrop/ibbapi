const express = require('express');
const app = express();
const layouts = require("express-ejs-layouts");

app.use(express.static("./public"));
app.use(layouts);
app.set("layout", "inc/layout")
app.set("view engine", "ejs");

app.use(require("./router/main"));
app.use("/api", require("./router/filo"));
app.use("/api", require("./router/hat-takip"));

app.listen(3000, () => console.log("Hazır!"));