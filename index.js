const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);

const admin = require('firebase-admin');
const firebaseAccount = require("./firebaseAccount.json");
admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount)
});

const notes = require("./api/notes");

app.use(express.static("public"));

app.use("/api/notes", notes);

app.use((req, res) => {
    res.status(404);
    res.sendFile("public/404.html", {root: __dirname});
});

httpServer.listen(process.env.PORT || 3000);
console.log(`Listening on port ${process.env.PORT ? process.env.PORT : 3000}`);
