// Handles all routes for -->  /recommendations/*

"use strict";

const express = require('express');
const router = express.Router();


router.get("/add", (req, res, next) =>{
    res.send({data: "hello world"});
});

module.exports = router;