const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const httpServer = require("http").createServer(app);

const admin = require("firebase-admin");
const firebaseAccount = JSON.parse(process.env.FIREBASE_CREDS);
admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
  storageBucket: "files-and-notes.appspot.com",
});

const notes = require("./api/notes");
const files = require("./api/files");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/login", (_req, res) => {
  res.sendFile("routes/login.html", { root: __dirname });
});

app.use(function (req, res, next) {
  if (req.cookies["accesskey"] === process.env.ACCESS_KEY) next();
  else res.redirect("/login");
});

app.post("/login", (_req, res) => {
  res.redirect("/");
});

app.get("/", (_req, res) => {
  res.sendFile("routes/index.html", { root: __dirname });
});

app.use("/api/notes", notes);
app.use("/api/files", files);

app.use((err, _req, res, _next) => {
  res.status(500);
  res.json({ error: err.message });
});

app.use((_req, res) => {
  res.status(404);
  res.sendFile("public/404.html", { root: __dirname });
});

httpServer.listen(process.env.PORT || 3000);
console.log(`Listening on port ${process.env.PORT ? process.env.PORT : 3000}`);
