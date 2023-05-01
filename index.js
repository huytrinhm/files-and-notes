const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);

const admin = require('firebase-admin');
const firebaseAccount = JSON.parse(process.env.FIREBASE_CREDS);
admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount),
    storageBucket: "files-and-notes.appspot.com"
});

const notes = require("./api/notes");
const files = require("./api/files");

app.use(express.static("public"));

app.use("/api/notes", notes);
app.use("/api/files", files);

app.use((req, res) => {
    res.status(404);
    res.sendFile("public/404.html", {root: __dirname});
});

httpServer.listen(process.env.PORT || 3000);
console.log(`Listening on port ${process.env.PORT ? process.env.PORT : 3000}`);
