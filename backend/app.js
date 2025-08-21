var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var questionRouter = require("./routes/questionRoute");
var fs = require("fs"); // Add this import

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/userRoutes");
var adminRouter = require("./routes/adminRoutes");
var contactRouter = require("./routes/contactRoute");
var quizResultsRouter = require("./routes/quizResultsRoute");

var app = express();
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads", "profile-pictures");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created:", uploadsDir);
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Add static file serving for uploaded images - ADD THIS LINE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", indexRouter);
app.use("/api/questions", questionRouter);
app.use("/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);
app.use("/api/quiz", quizResultsRouter);
app.use("/api/quiz", quizResultsRouter);

// getting-started.js
const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Nissan",
    })
    .then((data) => {
      console.log("Database connected successfully", data.connection.name);
    });
}

module.exports = app;
