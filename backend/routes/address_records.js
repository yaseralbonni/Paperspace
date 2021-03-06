// Handles all routes for -->  /address_records/*

"use strict";

const express = require('express');
const router = express.Router();
const helpers = require("../helpers");
const axios = require("axios");
const countryCode = require("country-list");


///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS AND HELPERS

/**
 * validate if a given state belongs to a given country
 * @param {string} state - state name
 * @param {string} country - country name
 * @return Promise<boolean>
 */
const isStateValid = async (state, country) => {

    let ISOCode = countryCode.getCode(country);

    if (ISOCode == undefined) {
        console.log("Error - country doesn't have a code");
        return false;
    }
    let stateValidationServiceURL = " http://www.groupkt.com/state/search/";
    stateValidationServiceURL += ISOCode + "?text=" + state;

    let response = await axios.get(stateValidationServiceURL);
    let results = response["data"]["RestResponse"]["result"];

    return results[0] != undefined;
}



///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// REQUESTS HANDLERS

router.get("/create", (req, res, next) => {

    let { name, street, city, state, country } = req.query;

    //// data processing - done separately from database module
    // convert name to lower case for consistency and better comparison
    name = name.toLowerCase();

    // check validity of state 
    let stateValidity = isStateValid(state, country);
    stateValidity.then(valid => {
        if (valid) {
            let create = helpers.mongo.createAddressRecord(name, street, city, state, country);
            create.then(results => {
                if (results["status"] == "success") {
                    res.send({ status: "success", data: results["data"]["_id"] });
                }
                else { // means results["status"] == "fail"
                    res.send(results); // error/fail message sent from database server
                }
            });
        }
        else {
            res.send({ status: "fail", data: "State invalid." });
        }
    });
});



router.get("/delete", (req, res, next) => {

    let { name } = req.query;
    name = name.toLowerCase();

    let deleteRecord = helpers.mongo.deleteAddressRecord(name);
    deleteRecord.then(results => {
        res.send(results);
    });
});



router.get("/update", (req, res, next) => {

    let { name, street, city, state, country } = req.query;
    name = name.toLowerCase();

    // check validity of state only if field is not empty
    if (state == "") {
        let updateRecord = helpers.mongo.updateAddressRecord(name, street, city, state, country);
        updateRecord.then(results => {
            res.send(results)
        });
    }
    else {

        let stateValidity = isStateValid(state, country);
        stateValidity.then(valid => {
            if (valid) {
                let updateRecord = helpers.mongo.updateAddressRecord(name, street, city, state, country);
                updateRecord.then(results => {
                    res.send(results)
                });
            }
            else {
                res.send({ status: "fail", data: "State invalid." });
            }
        });
    }
});



router.get("/find", (req, res, next) => {

    let { state, country } = req.query;

    let findRecords = helpers.mongo.getAddressRecords(state, country);
    findRecords.then(results => {
        res.send(results);
    });
});



// export object module
module.exports = router;