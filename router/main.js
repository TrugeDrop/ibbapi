const router = require("express").Router();

router.get("/", (req, res) => {
   res.render("index", { title: "IBB API" }); 
});

module.exports = router;