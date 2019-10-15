"use strict";


const express = require("express");
const bodyParser = require("body-parser");
const app = express();


// set access headers -- CORS could be used instead
app.use(function (req, res, next) {
    // websites allowed to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // methods allowed
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    next();
});

// JSON as API between frontend and backend
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// send fail on invalid urls or ones that do not exist
const invalidURL = { status: "Fail", data: "Accessing an invalid/non-exisitng route." };

app.use("/", (req, res, next) => {
    res.send(invalidURL);
});
app.use((req, res, next) => {
    res.send(invalidURL);
});


module.exports = app;