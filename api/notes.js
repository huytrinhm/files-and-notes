const express = require("express");
const admin = require("firebase-admin");
const db = admin.firestore();
const router = express.Router();

router.use(express.text());

const notesCollection = db.collection("notes");

router.get("/get-all", (req, res) => {
    notesCollection.get().then((notes) => {
        var notesArray = [];
        
        notes.forEach((note) => {
            var noteObj = note.data();
            notesArray.push({ id: note.id, value: noteObj.value, timestamp: noteObj.timestamp });
        });

        res.json(notesArray);
    }).catch((err) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.get("/get/:id", (req, res) => {
    notesCollection.doc(req.params.id).get().then((note) => {
        if (note.exists) {
            res.json(note.data());
        } else {
            res.status(404);
            res.json({ error: 404 });
        }
    }).catch((err) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.post("/set/:id", (req, res) => {
    var newValue = req.body;
    if (newValue == null || newValue == undefined) {
        res.status(400);
        res.json({ error: 400 });
        return;
    }
    
    notesCollection.doc(req.params.id).set({
        value: newValue,
        timestamp: Date.now()
    }).then((result) => {
        res.json({ status: 200 });
    }).catch((err) => {
        res.status(500);
        res.json({ error: 500 });
    });
});

router.delete("/delete/:id", (req, res) => {
    notesCollection.doc(req.params.id).delete().then((result) => {
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
