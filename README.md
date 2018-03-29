# py_test
A lab test program using raspberry pi and automationhat. 
The py_test framework is intended to be a webserver UI and scheduler for any arbitrary test using the raspberry pi automation hat.

# Architecture
The py_test framework uses two python "threads", a primary thread blocked by an `http.server server_forever` and a secondary thread running the test scheduler. The web server implements the standard `SimpleHTTPRequestHandler` with `do_Post` overridden to perform commands related to test scheduling. The scheduler and default webserver expect all code related to the desired test to be located in a `test/` folder. Two python files should be present with strict filenames; an empty `__init__.py` and a `main.py` containing the `Test` class to be run. The primary interface for controlling the test should be located in an `index.html` file as this will be the file server at the IPADDRESS/test/ url.   