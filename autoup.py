import sys
import os
import json
import subprocess
import threading

from test import main as testing
from scheduler import Scheduler

from settings import Settings
from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import time

import automationhat

class Req(SimpleHTTPRequestHandler):
    def do_POST(self):
        # In this simple program
        # All post requests shall be considered ajax for executing functions

        content_len = int(self.headers['Content-Length']) # Gets the size of the posted data
        content = self.rfile.read(content_len)                # Gets the posted data itself
        output = json.dumps({"success":False, "error":"Unrecognized command"});
        gen_success = json.dumps({"success":True, "error":None})

        # By default output is a failure response, so on failure
        # no change to output is necessary
        if self.path.endswith("getinfo"):
            data = schd.get_data()
            data["running"] = schd.is_running()
            data["success"] = True
            data["error"] = None
            output = json.dumps(data)
        elif self.path.endswith("setinfo"):
            try:
                data = json.loads(content.decode())
                schd.set_data(data)
                output = gen_success;
            except Exception as e:
                print(e)
        elif self.path.endswith("start"):
            try:
                schd.start_test()
                output = gen_success
            except Exception as e:
                print(e)
        elif self.path.endswith("stop"):
            try:
                schd.stop_test()
                output = gen_success
            except Exception as e:
                print(e)
        elif self.path.endswith("pause"):
            try:
                schd.pause_test()
                output = gen_success
            except Exception as e:
                print(e)
        elif self.path.endswith("unpause"):
            try:
                schd.unpause_test()
                output = gen_success
            except Exception as e:
                print(e)
        elif self.path.endswith("debug"):
            try:
                testing.debug(content.decode())
                output = gen_success
            except Exception as e:
                print(e)
        elif self.path.endswith("version"):
            try:
                version = subprocess.check_output("git describe --tags", shell=True)
                commit  = subprocess.check_output("git rev-parse HEAD", shell=True)
                origin  = subprocess.check_output("git remote get-url origin", shell=True)
                revdate = subprocess.check_output("git log -1 --format=%cd", shell=True)
                output  = json.dumps({"success":True, "error":None, "version":version.decode(), "commit": commit.decode(), "repo": origin.decode(), "rev_date":revdate.decode()})
            except Exception as e:
                print(e)
                output = json.dumps({"success":False, "error":str(e)});
        elif self.path.endswith("test_name"):
            output = json.dumps({"success":True, "error":None, "name":config.get("test_name")})
        elif self.path.endswith("shutdown"):
            try:
                sync_stat = subprocess.check_output("sync", shell=True)
                subprocess.call("sudo nohup shutdown -h now", shell=True)
            except Exception as e:
                print(e)
                output = json.dumps({"success":False, "error":str(e)});
        elif self.path.endswith("fread"):
            output = gen_success
        elif self.path.endswith("fwrite"):
            output = gen_success 

        
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(output, "utf-8"))
        return 

def input_handles():
    in_one_last = automationhat.input.one.read()
    while True:
        in_one_current = automationhat.input.one.read()
        if in_one_last == 0 and in_one_current == 1:
            testing.debug("toggle")
        in_one_last = in_one_current;
        time.sleep(0.01)

if __name__ == '__main__':
    # This case will be executed if this file is executed
    # but will not execute if this file is imported by another script
    
    config = Settings("config.json", keepopen=False, autoupdate=True)
    config.default("author", "Joel Copi")
    config.default("test_name", "Dummy Test")

    # This script will spawn multiple threads for the efficient execution of the testing.
    # The web server shall be spawned in it's own seperate thread and the test schedulaer shall spawn
    # in a seperate thread as well

    print(config.get("test_name") + " Test loaded")

    schd = Scheduler()
    schd.start()
    schd.set_test(testing.Test)

    in_handler = threading.Thread(target=input_handles)
    in_handler.start()

    httpd = HTTPServer(('', 80), Req)
    httpd.serve_forever()
    in_handler.join()


    
