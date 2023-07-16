import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app = express();

try {
  mongoose
    .connect("mongodb://127.0.0.1:27017", {
      dbName: "backend",
    })
    .then(() => console.log("Connected!"));
} catch (e) {
  console.log(e);
}

// Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", UserSchema);

//using the middlewares

app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    next();
  } else {
    res.render("login");
  }
};

// Routes below
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

app.get("/get", async (req, res) => {
  const users = await User.find();
  console.log(users);
  res.json(users);
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;
  console.log(name, email);
  const user = await User.create({
    name,
    email,
  });

  res.cookie("token", user._id, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.send("cookie deleted");
});

// Server listening function
app.listen(5000, () => {
  console.log("server is listning on port 5000");
});
