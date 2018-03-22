import automationhat
import time

class Test(object):
    def __init__(self):
        self.on_time = 5
        self.off_time = 5
        self.total_cycles = 10
        self.cycle_count = 0
        self.current_time = 0
        self.state = False
        self.paused = False
        self.relay_number = 0

    def initialize(self):
        self.cycle_count = 0
        self.current_time = 0

    def execute(self, delta_t):
        self.current_time += delta_t
        if self.state:
            # The test is in the 'ON' state
            if self.current_time >= self.on_time:
                automationhat.relay[self.relay_number].off()
                self.state = not self.state
                self.current_time = 0
        else:
            # The test is in the 'OFF' state
            if self.current_time >= self.off_time and not self.paused:
                automationhat.relay[self.relay_number].on()
                self.state = not self.state
                self.current_time = 0
                self.cycle_count += 1

    def is_finished(self):
        return self.cycle_count > self.total_cycles
    
    def end(self):
        self.cycle_count = 0
        automationhat.relay[self.relay_number].off()

    def set_data(self, data):
        if "on_time" in data:
            self.on_time = data["on_time"]
        if "off_time" in data:
            self.off_time = data["off_time"]
        if "total_cycles" in data:
            self.total_cycles = data["total_cycles"]
        if "cycle_count" in data:
            self.cycle_count = data["cycle_count"]
        # if "relay_number" in data:
        #    self.relay_number = data["relay_number"]

    def push_data(self):
        return {
            "on_time":self.on_time,
            "off_time":self.off_time,
            "total_cycles":self.total_cycles,
            "cycle_count":self.cycle_count,
            "state":self.state,
            "current_time":self.current_time#,
            #"relay_number":self.relay_number
        }
    
    def do_pause(self):
        self.paused = True
        
    def do_unpause(self):
        self.paused = True
    
    def do_stop(self):
        self.cycle_count = self.total_cycles + 1
        
def debug(name):
    if name == "relayon":
        automationhat.relay[0].on()
    else:
        automationhat.relay[0].off()
        

def schedule(test, pipe, data, update_period):
    test_inst = test()
    last_t = time.time()

    test_inst.initialize()
    test_inst.set_data(data)

    i = 0
    while not test_inst.is_finished():
        test_inst.execute(time.time() - last_t)
        last_t = time.time()
        
        if pipe.poll():
            test_inst.set_data(pipe.recv())
        time.sleep(0.02)

        if i >= update_period:
            pipe.send(test_inst.push_data())
            i = 0
        else:
            i += 1

    test_inst.end()

if __name__ == '__main__':
    test_inst = Test()
    test_inst.initialize()

    last_t = time.time()
    while not test_inst.is_finished():
        test_inst.execute(time.time() - last_t)
        last_t = time.time()
        time.sleep(0.02)
    test_inst.end()
    
