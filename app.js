var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const hbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const db = require("./configuration/dataBaseConnection");
const Session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(Session);

db.connect((err) => {
  if (err) {
    console.log("Data Base Connection Error" + err);
  } else {
    console.log(`Data Base Connected on
    Server Started on : http://localhost:3000/`);
  }
});

const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/shopingCart",
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

var userRouter = require("./routes/users");
var adminRouter = require("./routes/admin");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defualtLayout: "layout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
  })
);

// session
app.use(
  Session({
    secret: "123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: store,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// file Upload
app.use(fileUpload());

app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
