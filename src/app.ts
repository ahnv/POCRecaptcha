import express from "express";
import bodyParser from "body-parser";
import logger from "./util/logger";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import bluebird from "bluebird";
import lusca from "lusca";
import { MONGODB_URI } from "./util/secrets";

dotenv.config({ path: ".env" });

import * as homeController from "./controllers/home";

const app = express();

const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
});

app.set("port", process.env.PORT || 3000);
app.use(lusca.xframe("SAMEORIGIN"));
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", homeController.index);
app.post("/register", homeController.register);

export default app;