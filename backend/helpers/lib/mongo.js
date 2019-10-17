// Module that handles database connections and functions

// ALL RESPONSE PROMISE OBJECTS HAVE THE FOLLOWING STRUCTURE
// PROMISE<OBJECT> = {status: "", data: ""};
// status is a string of two possibilities: success or fail
// data is a JSON


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
        /* The following criteria is used to create new records:
         * before adding a record, a check is made against the user name 
         * to see if it is already present in the database
         * ideally, a check should be made against a combination of the user name 
         * and the address given many users can have the same name
         * however, for simplicity of the task, such criteria is used
         */

        let checkRecord = await db.collection("records").findOne({ name: name });

        if (checkRecord == null) {
            let create = await db.collection("records")
                .insertOne({
                    name: name, street: street, city: city, state: state, country: country });

            if (create.result["ok"] >= 1) {
                _RES.status = "success";
                _RES.data = create["ops"][0]; // newly generated id for inserted record
            }
            else {
                _RES.status = "fail";
                _RES.data = "Address record creation failed.";
            }
        }
        else {
            _RES.status = "fail";
            _RES.data = "Address record already exists.";
        }

    } catch (error) {
        console.log(error);
    } finally {
        client.close();
        return _RES;
    }
}



module.exports = {
    createAddressRecord
}