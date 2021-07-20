require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");
// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true
});
const connection = mongoose.connection;
connection
  .once("open", () => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.log("Connection failed...");
  });

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// let mongoStore = new MongoStore({
//   mongooseConnection: connection,
//   collection: "sessions"
// });

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_CONNECTION_URL
    }),
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

//Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global middleware
app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});
//Assets
app.use(express.static("public"));

app.use(expressLayout);
app.set("views", path.join(__dirname, "./resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

//Emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  //Join the room
  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
