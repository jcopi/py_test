import sys
import os
import json

from test.main import Test

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
            pass
        elif self.path == "setinfo":
            pass
        elif self.path == "start":
            pass
        elif self.path == "stop":
            pass
        elif self.path == "pause":
            pass
        elif self.path == "unpause":
            pass
        

        self.send_headers("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(bytes(json.dumps({"success":True}), "utf-8"))
        return

if __name__ == '__main__':
    # This case will be executed if this file is executed
    # but will not execute if this file is imported by another script
    config = Settings("config.json", keepopen=False, autoupdate=True)
    config.default("author", "Joel Copi")
    config.default("test_name", "Endurance")

    print(config.get("test_name") + "Test loaded")

    httpd = HTTPServer(('', 80), Req)
    server_proc = mp.Process(target=httpd.serve_forever)
    server_proc.start()

    print("autoup script started")

    server_proc.join()

    
