import time

class Test(object):
    def __init__(self):
        pass
    
    def initialize(self):
        pass

    def execute(self, delta_t):
        # delta_t represents the amount of time having passed since the last call
        pass

    def is_finished(self):
        return False
    
    def end(self):
        pass

    def command(self, name):
        pass

    def accept_data(self, jobj):
        pass

def schedule(test, pipe):
    test_inst = test()
    last_t = time.time()

    test_inst.initialize()

    while not test_inst.is_finished():
        test_inst.execute(time.time() - last_time)
        last_t = time.time()
        if pipe.poll():
            test_inst.accept_data(pipe.recv())
        time.sleep(0.02)

    test_inst.end()
        


