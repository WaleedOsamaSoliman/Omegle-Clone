import random
from .textChat import TextChat 
import threading
import time
import json
import uuid
from main.websocket import redisRoot 
import colorama

import random 
class overloadChatting :
    
    def __init__(self) : 
        self.usersNomber = 100
        self.uid = None
        self.tagslist = ['test' , 'bts' , 'tiktok' , 'hola']
     
        t = random.choice(self.tagslist)
        self.tags = json.dumps([f"{t}"])
        
        
    
    def UID(self) : 
        return (uuid.uuid4().hex)[:6]
    
    
    
    
    def overload(self)  : 
        tc = TextChat()
        tc.uid = self.UID()
        
        tc.tags = self.tags
        print(f"Searching about : {self.tags}")
        r = tc.search()
        return r
            
    
    
    def start(self) :
        redisRoot.execute_command("INCR viewers")
        r =  self.overload()
        if r['state'] == False : 
            redisRoot.execute_command("INCR hstatics:errors")
            print(colorama.Fore.RED + "[+] ERROR !!!" + colorama.Fore.RESET)
        else : 
            print("Done")
            
      

            redisRoot.execute_command(f"hset statics:info:{r['myuid']} uid {r['myuid']} target {r['targetuid']}")
            
    
    def statics(self) : 
        pass