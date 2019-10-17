// Module that handles database connections and functions

// ALL RESPONSE PROMISE OBJECTS HAVE THE FOLLOWING STRUCTURE
// PROMISE<OBJECT> = {status: "", data: ""};
// status is a string of two possibilities: success or fail
// data is a JSON object

/** 
 * The following criteria is used to create new records:
 * before adding a record, a check is made against the user name 
 * to see if it is already present in the database
 * ideally, a check should be made against a combination of the user name 
 * and the address given many users can have the same name
 * however, for simplicity of the task, such criteria is used
 * 
 * The following criteria is used to delete a record:
 * before deleting a record, a check is made against the user name
 * since for now we are not allowing duplicates of names, then it is
 * guaranteed to either have only one address per that user or none
 * if user is found, its address record is removed
 * if no such user exists, then no deletion happens
 * 
 * The following criteria is used to update a record:
 * before updating a record, a check is made against the user name
 * if user is not found, then no update happens
 * if user is found, only the street, city, state, and country
 * fields can be updated
 */


"use strict";


const configs = {
    DBSource:
    {
        localhost: "mongodb://localhost:27017",
        cloud: ""
    },
    DBSchema: "address_records_db"
}


const MongoClient = require("mongodb").MongoClient;
const dbSource = configs.DBSource.localhost;
const addressRecordsDB = configs.DBSchema;



/**
 * function checks if address is present in database 
 * check is made against the user name per the criteria assumed
 * @param {string} name - user name
 * @return Promise<boolean>
 */
const doesRecordExist = async (name) => {

    let client = await MongoClient.connect(dbSource, { useNewUrlParser: true });
    let db = client.db(addressRecordsDB);

    try {
        let checkRecord = await db.collection("records").findOne({ name: name });

        return checkRecord != null;

    } catch (error) {
        console.log(error);
    } finally {
        client.close();
    }
}



/**
 * create address record
 * @param {string} name - individual name
 * @param {string} steet - street name
 * @param {string} city - city name
 * @param {string} state - state name
 * @param {string} country - country name
 * @return Promise<Object>
 */
const createAddressRecord = async (name, street, city, state, country) => {

    let _RES = { status: "", data: "" };

    let client = await MongoClient.connect(dbSource, { useNewUrlParser: true });
    let db = client.db(addressRecordsDB);

    try {
        let recordExists = await doesRecordExist(name);

        if (recordExists) {
            _RES.status = "fail";
            _RES.data = "Address record already exists.";
        }
        else {
            let create = await db.collection("records")
                .insertOne({
                    name: name, street: street, city: city, state: state, country: country
                });

            if (create.result["ok"] >= 1) {
                _RES.status = "success";
                _RES.data = create["ops"][0]; // newly generated id for inserted record
            }
            else {
                _RES.status = "fail";
                _RES.data = "Address record creation failed.";
            }
        }

    } catch (error) {
        console.log(error);
    } finally {
        client.close();
        return _RES;
    }
}



/**
 * delete address record of given user
 * @param {string} user - user name
 * @return Promise<Object>
 */
const deleteAddressRecord = async (name) => {

    let _RES = { status: "", data: "" };

    let client = await MongoClient.connect(dbSource, { useNewUrlParser: true });
    let db = client.db(addressRecordsDB);

    try {
        let recordExists = await doesRecordExist(name);
        if (recordExists) {
            let deleteRecord = await db.collection("records").deleteOne({ name: name });

            console.log(deleteRecord["result"]); // {n: 1, ok: 1} could be used if criteria changes

            _RES.status = "success";
            _RES.data = "Address record successfully deleted.";
        }
        else {
            _RES.status = "fail";
            _RES.data = "Address record does not exist.";
        }
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
        return _RES;
    }
}



/**
 * update an existing record
 * @param {string} name - individual name
 * @param {string} steet - street name
 * @param {string} city - city name
 * @param {string} state - state name
 * @param {string} country - country name
 * @return Promise<Object> 
 */
const updateAddressRecord = async (name, street, city, state, country) => {

    let _RES = { status: "", data: "" };

    let client = await MongoClient.connect(dbSource, { useNewUrlParser: true });
    let db = client.db(addressRecordsDB);

    try {
        let recordExists = await doesRecordExist(name);
        if (recordExists) {

            let updated = {};

            if (street != "")
                updated["street"] = street;
            if (city != "")
                updated["city"] = city;
            if (state != "")
                updated["state"] = state;
            if (country != "")
                updated["country"] = country;

            let updateRecord = await db.collection("records")
                .updateOne({ name: name }, { $set: updated });

            console.log(updateRecord["result"]); // {n: 1, nModified: 1, ok: 1} useful information

            _RES.status = "success";
            _RES.data = "Address record successfully updated.";
        }
        else {
            _RES.status = "fail";
            _RES.data = "Address record does not exist.";
        }
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
        return _RES;
    }
}



/**
 * retrieve list of records based on multiple conditions: state and country
 * @param {string} state - state name
 * @param {string} country - country name
 * @return Promise<Object>
 */
const getAddressRecords = async (state, country) => {

    let _RES = { status: "", data: "" };

    let client = await MongoClient.connect(dbSource, { useNewUrlParser: true });
    let db = client.db(addressRecordsDB);

    try {
        let searchQuery = { state: state, country: country };

        let records = await db.collection("records").find(searchQuery).toArray();

        if (records.length != 0) {
            _RES.status = "success";
            _RES.data = records;
        }
        else {
            _RES.status = "success";
            _RES.data = "No address records found.";
        }
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
        return _RES;
    }
}



module.exports = {
    createAddressRecord,
    deleteAddressRecord,
    updateAddressRecord,
    getAddressRecords
}