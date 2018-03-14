import sys
import os
import json

from test import main as tester

from settings import Settings
from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import multiprocessing as mp
import threading as th
import time

class Req(SimpleHTTPRequestHandler):
    def do_POST(self):
        # In this simple program
        # All post requests shall be considered ajax for executing functions
        global test_proc
        global test_data
        global test_pipe
        global test_lock

        content_len = int(self.headers['Content-Length']) # Gets the size of the posted data
        content = self.rfile.read(content_len)                # Gets the posted data itself
        
        if self.path.endswith("getinfo"):
            test_lock.acquire()
            obj = test_data
            obj["running"] = True if test_proc != None and test_proc.is_alive() else False
            output = json.dumps(test_data)
            test_lock.release()
        elif self.path.endswith("setinfo"):
            try:
                in_dict = json.loads(content.decode())
            except:
                output = json.dumps({"success":False})
            else:
                test_lock.acquire()
                test_data.update(in_dict)
                if test_pipe:
                    test_pipe.send(test_data)
                test_lock.release()
                output = json.dumps({"success":True})
        elif self.path.endswith("start"):
            test_lock.acquire()
            if test_pipe:
                test_pipe.close()
            test_pipe, child_pipe = mp.Pipe()
            test_proc = mp.Process(target=tester.schedule, args=(tester.Test, child_pipe, test_data, 20))
            test_proc.start()
            test_lock.release()
            output = json.dumps({"success":True})
        elif self.path.endswith("stop"):
            test_lock.acquire()
            if test_pipe:
                test_pipe.send({"command":"stop"})
            test_lock.release()
            output = json.dumps({"success":True})
        elif self.path.endswith("pause"):
            test_lock.acquire()
            if test_pipe:
                test_pipe.send({"command":"pause"})
            test_lock.release()
            output = json.dumps({"success":True})
        elif self.path.endswith("unpause"):
            test_lock.acquire()
            if test_pipe:
                test_pipe.send({"command":"unpause"})
            test_lock.release()
            output = json.dumps({"success":True})
        elif self.path.endswith("debug"):
            tester.debug(content.decode())
            output = json.dumps({"success":True})
        else:
            output = "INVALID PATH"
        
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(output, "utf-8"))
        return

def update_test_data(pipe):
    global test_data
    global test_lock
    try:
        obj = pipe.recv()
        test_lock.acquire()
        test_data.update(obj)
        test_lock.release()
    except EOFError:
        return
        

if __name__ == '__main__':
    # This case will be executed if this file is executed
    # but will not execute if this file is imported by another script
    global test_proc
    global test_data
    global test_pipe
    global test_lock
    
    config = Settings("config.json", keepopen=False, autoupdate=True)
    config.default("author", "Joel Copi")
    config.default("test_name", "Endurance")

    print(config.get("test_name") + " Test loaded")
    test_proc = None
    test_data = {}
    test_pipe = None
    test_lock = th.Lock()

    httpd = HTTPServer(('', 80), Req)
    server_proc = th.Thread(target=httpd.serve_forever)
    server_proc.start()
    print("autoup script started")
    try:
        while True:
            if test_pipe:
                update_test_data(test_pipe)
            time.sleep(0.02)
    except KeyboardInterrupt:
        server_proc.terminate()
        test_proc.terminate()

    server_proc.join()

    
