"""
Author: Yaser Albonni
Python version: 3.7.*

A suite of unit tests for Paperspace Nodejs backend server
"""


# Libraries
import unittest
import requests
import json
import time



# Globals & Constants

SERVER_URL_AND_RECORDS_PATH = "http://localhost:8000/address_records/"
FAIL_RESULT = {"status": "fail", "data": "Error in http request."}
SAMPLE_DATA = [
    ["Mattie Poquette", "73 State Road 434 E",
        "Phoenix", "AZ", "United States of America"],
    ["Meaghan Garufi", "69734 E Carrillo St",
        "McMinnville", "TN", "United States of America"],
    ["Gladys Rim", "322 New Horizon Blvd",
        "Milwaukee", "WI", "United States of America"],
    ["Francine, Vocelka", "366 South Dr", "Las Cruces",
        "NM", "United States of America"],
    ["Ernie Stenseth", "45 E Liberty St", "Ridgefield Park",
        "NJ", "United States of America"],
    ["Albina Glick", "4 Ralph Ct", "Dunellen", "NJ", "United States of America"],
    ["Alishia Sergi", "2742 Distribution Way",
        "New York", "NY", "United States of America"],
    ["Derick Dhamer", "87163 N Main Ave", "New York",
        "NY", "United States of America"],
    ["Jerry Dallen", "393 Lafayette Ave", "Richmond",
        "VA", "United States of America"],
    ["Leota Ragel", "99 5th Ave", "Trion", "GA", "United States of America"],
    ["Jutta Amyot", "49 N Mays St", "Broussard", "LA", "United States of America"],
    ["Aja Gehrett", "993 Washington Ave", "Nutley",
        "NJ", "United States of America"],
    ["Kirk Herritt", "88 15th Ave Ne", "Vestal",
        "NY", "United States of America"],
    ["Leonora Mauson", "3381 E 40th Ave", "Passaic",
        "NJ", "United States of America"]
]
INVALID_STATES_SAMPLES = [
    ["Josphine Villanueva", "63 Smith Ln", "Moss", "QC", "United States of America"],
    ["Daniel Perruzza", "11360 S Halsted St",
        "Santa Ana", "BC", "United States of America"],
    ["Cassi Wildfong", "26849 Jefferson Hwy",
        "Rolling Meadows", "NB", "United States of America"]
]



# Functions & Helpers
def get_request(url):
    """
    function makes http get request
    :param url: url string
    :return get request JSON result object
    """
    try:
        page = requests.get(url)
        if not str(page.status_code).startswith("2"):
            print(
                "Error in GET request - status code: {0}".format(page.status_code))
            return FAIL_RESULT

        return json.loads(page.content)

    except Exception as e:
        print("Error at GET request at {0} - {1}".format(url, str(e)))
        return FAIL_RESULT



# Unit test module
class PaperspaceServerTest(unittest.TestCase):

    def test_1_record_creation(self):

        unique_ids_set = set()

        for record in SAMPLE_DATA:
            query = "create?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                record[0], record[1], record[2], record[3], record[4]))
            unique_ids_set.add(req_result["data"])

        # print("Unique ids: {0}".format(unique_ids_set))
        self.assertEqual(len(SAMPLE_DATA), len(unique_ids_set))



    def test_2_duplicate_record_creation(self):

        failed_insertion_count = 0

        for record in SAMPLE_DATA[4:8]:
            query = "create?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                record[0], record[1], record[2], record[3], record[4]))

            if req_result["status"] == "fail":
                failed_insertion_count += 1

        self.assertEqual(len(SAMPLE_DATA[4:8]), failed_insertion_count)



    def test_3_state_validity(self):

        invalid_state_count = 0

        for record in INVALID_STATES_SAMPLES:
            query = "create?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                record[0], record[1], record[2], record[3], record[4]))

            if req_result["data"] == "State invalid.":
                invalid_state_count += 1

        self.assertEqual(len(INVALID_STATES_SAMPLES), invalid_state_count)



    def test_4_get_list_of_records_by_state_and_country(self):

        records_in_new_york = 3

        query = "find?state={0}&country={1}"
        req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format("NY", "United States of America"))

        self.assertEqual(len(req_result["data"]), records_in_new_york)



    def test_5_update_record(self):
        
        successful_updates_counter = 0

        for record in SAMPLE_DATA[2:5]:
            query = "update?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                record[0], "new street", "new city", "", ""))

            if req_result["status"] == "success":
                successful_updates_counter += 1

        self.assertEqual(len(SAMPLE_DATA[2:5]), successful_updates_counter)



    def test_6_update_record_not_exist(self):

        failed_updates_counter = 0

        for record in SAMPLE_DATA[2:5]:
            query = "update?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                "some name", "new street", "new city", "", record[4]))

            if req_result["status"] == "fail":
                failed_updates_counter += 1

        self.assertEqual(len(SAMPLE_DATA[2:5]), failed_updates_counter)



    def test_7_update_record_state_invalid(self):

        failed_updates_counter = 0

        for record in SAMPLE_DATA[2:5]:
            query = "update?name={0}&street={1}&city={2}&state={3}&country={4}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(
                record[0], "new street", "new city", "INVSALID STATE", ""))

            if req_result["status"] == "fail":
                failed_updates_counter += 1

        self.assertEqual(len(SAMPLE_DATA[2:5]), failed_updates_counter)



    def test_8_delete_record(self):
        
        successful_delete_counter = 0

        for record in SAMPLE_DATA:
            query = "delete?name={0}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(record[0]))

            if req_result["status"] == "success":
                successful_delete_counter += 1

        self.assertEqual(len(SAMPLE_DATA), successful_delete_counter)



    def test_9_delete_record_not_exist(self):

        failed_delete_counter = 0

        for record in SAMPLE_DATA[2:5]:
            query = "delete?name={0}"
            req_result = get_request(SERVER_URL_AND_RECORDS_PATH + query.format(record[0]))

            if req_result["status"] == "fail":
                failed_delete_counter += 1

        self.assertEqual(len(SAMPLE_DATA[2:5]), failed_delete_counter)



if __name__ == "__main__":
    # wait for few seconds before running tests: wait for server to start
    print("Initializing necessary components for testing ...")
    time.sleep(6)

    unittest.main()
