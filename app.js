import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
  password: String,
});

const User = mongoose.model("User", UserSchema);

//using the middlewares

app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, "iamasecret");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.render("login");
  }
};

// Routes below
//root url
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/get", async (req, res) => {
  const users = await User.find();
  console.log(users);
  res.json(users);
});

app.get("/login", (req, res) => {
  res.render("login");
});
// Login URL
app.post("/login", async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.render("login", { email, message: "incorrect password" });

  const token = jwt.sign({ _id: user._id }, "iamasecret");
  console.log(token);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.redirect("/");

  // const user = await User.create({
  //   name,
  //   email,
  // });
});

//Logout
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.send("cookie deleted");
});

//Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (user) {
    return res.redirect("/login");
  }
  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "iamasecret");
  console.log(token);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  return res.redirect("/");
});

// Server listening function
app.listen(5000, () => {
  console.log("server is listning on port 5000");
});
