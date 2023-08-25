const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const exp = require("constants");
const mongoose = require("mongoose");


const app = express();

app.set("view engine", "ejs");
var email = "";

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/BlogDB");

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
});

const Note = mongoose.model('Note', noteSchema);

const dataSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    notes: [noteSchema],
});

const Data = mongoose.model('Data', dataSchema);


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
})

app.post("/", function (req, res) {
    var mail = String(req.body.email);
    var pass = String(req.body.password);

    Data.find()
        .then(function (lls) {
            var bc = "";
            lls.forEach((ll) => {
                if (ll.email === mail) {
                    bc = bc + String(ll.password);
                    email = mail;
                }
            });

            if (bc === pass) {
                res.redirect("/home");

            }
            else {
                res.send("sorry!!! unsuccessful");
            }
        })
        .catch((err) => {
            console.log(err);
            res.send("Error occurred while processing login");
        });
});

app.get("/home", function (req, res) {

    Data.findOne({ email: email })
    .then(function (user) {
        if (user) {
            res.render("home", { posts: [user] }); 
        } else {
            res.render("home", { posts: [] });
        }
    })
    .catch(function (err) {
        console.log(err);
        res.render("home", { posts: [] });
    });
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
})

app.post("/signup", function (req, res) {
    var fName = req.body.firstName;
    email = req.body.email;
    var lName = req.body.lastName;
    var eemail = req.body.email;
    var pass = req.body.password;

    const data = new Data({
        firstName: fName,
        lastName: lName,
        email: eemail,
        password: pass
    });

    data.save();

    res.redirect("/home");
})

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/contact", function (req, res) {
    res.render("contact");
});


app.get("/compose", function (req, res) {
    res.render("compose");
});


app.post("/compose", function (req, res) {
    var ttitle = req.body.title;
    var ppost = req.body.post;

    var note = new Note({
        title: ttitle,
        content: ppost
    });

    note.save()
    .then(savedNote => {
        return Data.findOneAndUpdate(
            { email: email },
            { $push: { notes: note} }, 
            { new: true }
        );
    })
    .then(updatedUser => {
        console.log("Note added successfully!");
        res.redirect("/home");
    })
    .catch(error => {
        console.error(error);
        res.send("unsuccessful");
    });
})


app.listen(3000, function () {
    console.log("server active at port 3000");
})