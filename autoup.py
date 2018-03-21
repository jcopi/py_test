import sys
import os
import json

from test import main as tester

from settings import Settings
from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import multiprocessing as mp

class Req(SimpleHTTPRequestHandler):
    def do_POST(self):
        # In this simple program
        # All post requests shall be considered ajax for executing functions
        content_len = int(self.headers['Content-Length']) # Gets the size of the posted data
        content = self.rfile.read(content)                # Gets the posted data itself
        
        if self.path == "getinfo":
            obj = test_data
            obj["running"] = True if test_proc != None else False
            output = json.dumps(test_data)
        elif self.path == "setinfo":
            try:
                in_dict = json.loads(content)
            except:
                output = json.dumps({"success":False})
            else:
                test_data.update(in_dict)
                if test_pipe:
                    test_pipe.send(test_data)
                output = json.dumps({"success":True})
        elif self.path == "start":
            test_pipe, client_pipe = Pipe()
            test_proc = mp.Process(target=tester.schedule, args=(tester.Test, child_pipe, test_data, ))
        elif self.path == "stop":
            pass
        elif self.path == "pause":
            pass
        elif self.path == "unpause":
            pass
        elif self.path == "debug":
            tester.debug(content)
            output()
        

        self.send_headers("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(bytes(output, "utf-8"))
        return

if __name__ == '__main__':
    # This case will be executed if this file is executed
    # but will not execute if this file is imported by another script
    config = Settings("config.json", keepopen=False, autoupdate=True)
    config.default("author", "Joel Copi")
    config.default("test_name", "Endurance")

    # This script will spawn multiple threads and processes for the efficient execution of the testing.
    # The web server shall be spawned in it's own seperate thread and the test schedulaer shall spawn
    # in a seperate thread as well

    print(config.get("test_name") + " Test loaded")
    test_proc = None
    test_data = {}

    httpd = HTTPServer(('', 80), Req)
    server_proc = mp.Thread(target=httpd.serve_forever)
    server_proc.start()

    print("autoup script started")

    server_proc.join()

    
