import express from "express";
import path from "path";

const app = express();

//using the middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { name: "sagar" });
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("Thanks for sending the data");
});

app.listen(5000, () => {
  console.log("server is listning on port 5000");
});
