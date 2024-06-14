import express from "express";
import multer from "multer";
import mongoose from "mongoose";

import { registerValidation, loginValidation, postCreateValidation } from "./validations.js";
import {handleValidationErrors, checkAuth} from "./utils/index.js"
import { UserController, PostController } from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://amerkh:root1@cluster0.cpq2mxw.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("BD error", err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads")
  },

  filename: (_, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({storage})

app.use(express.json()); //позволяет читать json который приходит в req
app.use("/uploads", express.static("uploads"))


app.post("/auth/login", loginValidation, handleValidationErrors, UserController.login);
app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe)

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server OK");
});
