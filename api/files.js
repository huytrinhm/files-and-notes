const express = require("express");
const admin = require("firebase-admin");
const storage = admin.storage();
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/', limits: { fieldSize: 2 * 1024 * 1024 } });
const fs = require("fs");

const filesBucket = storage.bucket();

router.get("/get-all", (req, res) => {
    filesBucket.getFiles({ prefix: "files/" }).then(([files]) => {
        var filesArray = [];

        files.filter(f => !f.name.endsWith("/")).forEach((file) => {
            filesArray.push({ name: file.metadata.name.replace(/^files\//g, ""), size: file.metadata.size, timestamp: file.metadata.updated });
        });

        res.json(filesArray);
    }).catch((err) => {
        console.error(err);
        res.status(500);
        res.json({ error: 500 });
    });
});

router.get("/get/:id", async (req, res) => {
    var file = filesBucket.file("files/" + req.params.id);
    if(!(await file.exists())[0]) {
        res.status(404);
        res.json({ error: 404 });
        return;
    }

    file.getSignedUrl({ action: "read", expires: Date.now() + 1000 * 60 * 30 }).then((result) => {
        res.json({ name: file.metadata.name.replace(/^files\//g, ""), size: file.metadata.size, timestamp: file.metadata.updated, url: result[0] });
    }).catch ((err) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.post("/set/:id", upload.single("file"), (req, res) => {
    var name = "files/" + req.params.id;
    var tokens = req.file.originalname.split(".");
    if (tokens.length != 1)
        name += "." + tokens[tokens.length - 1];
    filesBucket.upload(req.file.path, { destination: name }).then((result) => {
        fs.unlink(req.file.path, (err) => {
            if (err)
                throw err;
        });
        res.json({ status: 200 });
    }).catch((error) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.delete("/delete/:id", (req, res) => {
    var file = filesBucket.file("files/" + req.params.id);
    file.delete({ ignoreNotFound: true }).then((result) => {
        res.json({ status: 200 });
    }).catch((err) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.use((req, res) => {
    res.status(404);
    res.json({ error: 404 });
});

module.exports = router;
