# py_test
A lab test program using raspberry pi and automationhat. 
The py_test framework is intended to be a webserver UI and scheduler for any arbitrary test using the raspberry pi automation hat.

## Architecture
The py_test framework uses two python "threads", a primary thread blocked by an `http.server server_forever` and a secondary thread running the test scheduler. The web server implements the standard `SimpleHTTPRequestHandler` with `do_Post` overridden to perform commands related to test scheduling. The scheduler and default webserver expect all code related to the desired test to be located in a `test/` folder. Two python files should be present with strict filenames; an empty `__init__.py` and a `main.py` containing the `Test` class to be run. The primary interface for controlling the test should be located in an `index.html` file as this will be the file server at the `IP_ADDRESS/test/` url.

## Test Class
The test to be run shall be provided in a `Test` class accesible by importing the `main.py` file located in the `test` directory. The `Test` class needs to implement the following public methods to be successfully run.

Name        | Input Types | Function                              
----------- | ----------- | --------------------------------------
initialize  | None        | This method is called immediately before a test is started, it should reset all internal variables such that the class is ready to execute a test
execute     | float       | This method is called repeatedly while a test is running. The calls to this method should be ~20ms apart, but a time since last call (in seconds) is passed to the method as the first argument at each call. 
**All actions necessary for the execution of a test should be performed by this function**
is_finished | None        | This method is called repeatedly to determine if the loop running execute should continue. This function should return a boolean representing whether or not the test has completed, `True` indicating completion and `False` indicating not complete.
end         | None        | This method is called immediately after the test has completed. No calls to execute or is_finished will happen after this call until another test is started. Internal state variables should be set such that the class is in an amiable idle state.
set_data    | dict        | This method is called when the web server recieves a call to set test data. This is the function that should be used to populate necessary test parameters. A dict is passed in with the data intended to be set.
push_data   | None        | This method is called when the web server recieves a request for data. This is the only vehicle for relaying status information to the web UI so all relevant information should be reported.
do_stop     | None        | This method is called when the web server recieves a request to stop the current test. All outputs and internal variables should be set accordingly and `is_finished` should return `True` on the next call.

#### Debug function
Along with a `Test` class `test/main.py` should include a function named `debug` which accepts a string as input. This function should be used to manipulate outputs external to the testing paradigm, for the purpose of calibration, etc. For example if a test turns a relay on and off, the debug function might receive a string of `"relayon"` or `"relayoff"` and then perform the cooresponding actions.

## Web API
All `GET` requests will attempt to serve files from the filesystem, this is the only function a `GET` request will attempt to perform. `POST` requests shall exclusively perform functions related to schduling tests, specifically, the following `POST` urls:

URL       | Uses Post Data | Post Data Format | Function
--------- | -------------- | ---------------- | ---------------------
getinfo   | No             | -                | returns the JSON encoded result of the `push_data` method of the `Test` class 
setinfo   | Yes            | JSON             | calls with `set_data` method of the `Test` class with the decoded JSON object
start     | No             | -                | starts a test
stop      | No             | -                | calls the `do_stop` function of the `Test` class
debug     | Yes            | plain string     | calls the debug function from `test/main.py` with post data string
version   | No             | -                | returns JSON encoded git version info, specifically, `version` as the current commit tag, `commit` the most recent commit hash, `repo` the url of the remote repo, and `rev_date` the date and time of the most recent commit
shutdown  | No             | -                | calls `sync` and `shutdown -h now` to shutdown the Pi in an amiable way before powering down
