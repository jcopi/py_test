import time
import threading

class Scheduler(object):
    def __init__(self):
        self.child_thread = None
        self.started = True
        self.test = None

        # Events will be used for synchronization
        self.test_added = threading.Event()
        self.test_started = threading.Event()
        self.test_completed = threading.Event()
        # Some events will be used as thread-safe flags
        self.data_changed = threading.Event()
        self.test_stopped = threading.Event()
        self.test_paused = threading.Event()
        self.test_unpaused = threading.Event()

        # Some flags are useful for returning state information to 
        # parent processes
        self.flag_lock = threading.Lock()
        self.flag_running = False

        # An internal dict will store the data associated with the test
        self.test_data = {}
        self.data_lock = threading.Lock()

    def start(self):
        self.child_thread = threading.Thread(target=self._run)

    def set_test(self, test_class):
        self.test = test_class
        self.test_inst = test_class()
        self.test_data = test_inst.push_data()
        self.test_added.set()

    def set_data(self, data):
        self.data_lock.acquire()
        self.test_data = data
        self.data_lock.release()
        self.data_changed.set()

    def get_data(self, data):
        # This is only reading data so it should be thread safe
        # It cannot alter the data present for the test
        return self.test_inst.push_data()

    def start_test(self):
        self.test_started.set()

    def stop_test(self):
        self.test_stopped.set()
    
    def pause_test(self):
        self.test_paused.set()

    def unpause_test(self):
        self.test_unpaused.set()

    def is_running(self):
        self.flag_lock.acquire()
        result = self.flag_running
        self.flag_lock.release()

        return result

    def _run(self):
        self.test_added.wait()
        self.test_added.clear()

        while True:
            self.test_started.wait()
            self.test_started.clear()
            self.flag_lock.acquire()
            self.flag_running = True
            self.flag_lock.release()

            last_t = time.time()
            while not self.test_inst.is_finished():
                self.test_inst.execute(time.time() - last_t)
                last_t = time.time()

                if self.data_changed.is_set():
                    self.data_lock.acquire()
                    test_inst.set_data(self.test_data)
                    self.data_lock.release()
                    self.data_changed.clear()
                if self.test_stopped.is_set():
                    self.test_inst.do_stop()
                    self.test_stopped.clear()
                if self.test_paused.is_set():
                    self.test_inst.do_pause()
                    self.test_paused.clear()
                if self.test_unpaused.is_set():
                    self.test_inst.do_unpause()
                    self.test_unpaused.clear()
                
                time.sleep(max(0, 0.02 - (time.time() - last_t)))
            self.test_inst.end()
            self.flag_lock.acquire()
            self.flag_running = False
            self.flag_lock.release()
            self.test_completed.set()

    