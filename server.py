import tornado.websocket
import tornado.web
import tornado.ioloop
import threading


class PyTestControlHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        global controllers
        global cont_lock

        cont_lock.acquire()
        controller.append(self)
        cont_lock.release()
        
        for controller in controllers:
            controller.write_message(json.dumps({"connected_clients":len(controller)}))

        print("Web Control Opened", self)
    
    def on_message(self, message):
        try:
            obj = json.loads(message)
        except ValueError as err:
            self.write_message(json.dumps({"error":"invalid command message", "success":False, "json_msg":err}))
        else:
            # If the message contains a response ID use that, else use None/null
            if "response_id" in obj:
                r_id = obj["response_id"]
            else:
                r_id = None
            # Check that the command has all the necessary fields
            if (not ("command" in obj)) or (not ("value" in obj)):
                self.write_message(json.dumps({"error":"missing required command components", "success":False, "response_id":r_id}))
            else:
                pass
                
    def on_close(self):
        global controllers
        global cont_lock

        cont_lock.acquire()
        try:
            controller.remove(self)
        except ValueError:
            print("Websocket just closed not included in controller list")
        cont_lock.release()

        print("Web Control Closed", self)

class PyTestStatusHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("Web Status Opened", self)

    def on_message(self, message):
        self.write_message(u"Message Received")

    def on_close(self):
        global controller
        print("Web Status Closed", self)

class PyTestIndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

if __name__ == "__main__":
    global controllers
    global cont_lock
    controller = []
    cont_lock = threading.Lock()

    app = tornado.web.Application([
        (r'/', PyTestIndexHandler),
        #(r'/version', PyTestVersionHandler)
        (r'/ws/status', PyTestStatusHandler),
        (r'/ws/control', PyTestControlHandler),
        (r'/static/(.*)', tornado.web.StaticFileHandler, {"path":"./"})
    ])

    app.listen(80)
    tornado.ioloop.IOLoop.instance().start()
