import json
import os

class Settings:
    def __init__(self, fname, **kwargs):
        self.fname = fname
        
        self.keepopen = (kwargs["keepopen"] if "keepopen" in kwargs else True)
        self.autoupdate = (kwargs["autoupdate"] if "autoupdate" in kwargs else True)
        
        self.isopen = False
        self.ischanged = False

        if self.keepopen:
            self.fd = os.open(self.fname, "w+")
            self.isopen = True
            try:
                self.values = json.loads(fd.read())
            except:
                self.values = {}
        else:
            with open(self.fname, "w+") as fd:
                self.isopen = True
                try:
                    self.values = json.loads(fd.read())
                except:
                    self.values = {}
            self.isopen = False
        
        if type(self.values) != dict():
            self.value = {}
        
    def get(self, key):
        return (self.values[key] if key in self.values else None)

    def set(self, key, value):
        self.values[key] = value
        self.ischanged = True
        if self.autoupdate:
            self.update()

    def update(self):
        if self.ischanged:
            if self.keepopen:
                if not self.isopen:
                    self.fd = os.open(self.fname, "w+")
                    self.isopen = True
                self.fd.write(json.dumps(self.values, indent=4))
            else:
                with open(self.fname, "w+") as fd:
                    fd.write(json.dumps(self.values, indent=4))

    def default(self, key, value):
        if not key in self.values:
            self.set(key, value)
        return self.get(key)

    def close(self):
        if self.isopen:
            self.fd.close()

    
            
