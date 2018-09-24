import express, { json } from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import * as WebSocket from "ws";
import discourseRouter from "./auth/discourse";
const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import NetworkUser from "./models/NetworkUser";
import DBUtils from "./util/dbhelper";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get("/ips", function (req: any, res: any, next: any) {
  const query = NetworkUser.find({}).distinct("IP");
  query.exec(function (err, value) {
    if (err) return next(err);
    res.send(value);
  });
});

app.use("/auth", discourseRouter);
app.get("/success", homeController.success);

const dbUtility = new DBUtils();
// initialize a simple http server
const server = require("http").createServer(this.app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket, req: any) => {
  // connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    console.log(`Received -> ${message}`);

    if (message.includes("connectionid")) {
      dbUtility.saveConnectionLog(message);

      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });
});

// start our server
server.listen(process.env.PORT || 44444, () => {
  console.log(`Server started on port 44444 :)`);
});

// // initialize a simple http server
// const server = require("http").createServer(this.app);

// // initialize the WebSocket server instance
// const wss = new WebSocket.Server({ server });

// wss.on("connection", (ws: WebSocket) => {
//   // send immediatly a feedback to the incoming connection
//   ws.send("user connected");

//   // connection is up, let's add a simple simple event
//   ws.on("message", (message: string) => {
//     console.log(`Received -> ${message}`);
//     new DBUtils().saveConnectionLog(message);
//   });
// });

// // start our server
// server.listen(process.env.PORT || 44444, () => {
//   console.log(`Server started on port 44444 :)`);
// });

export default app;