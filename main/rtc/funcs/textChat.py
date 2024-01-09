import json
import time
from main.websocket import redisRoot , textUsers  , videoUsers, redisearch
from .setup import redis_invalid_characters , key_Expiry

class TextChat (): 
    def __init__ (self) : 
        self.tags = None
        self.uid = None
        self.type = None
        self.target = None
        self.ltags = None
        

# self.tags ==> original tags list
#joined_tags ==> original tags but as a joined string
#fjouined_tags ==> filtered tags as a joined string 
#fl_tags ==> filtered tags as a list
    def search(self)  :
      
            
        self.tags = json.loads(self.tags)
        for x , y in enumerate(self.tags) : 
            self.tags[x] = y.replace("," ,"")
            
        self.tags = ",".join(self.tags)
        for  x in redis_invalid_characters :
            if x in self.tags : 
                self.tags = (self.tags).replace(x , "")
                
        if len(self.tags) == 0 : 
            self.tags = "null"
            
        self.ltags = self.tags.split(",") 
            
        if self.type == "text" :  
            
            redisRoot.hmset(f"text:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : 0  , "checked" : 0})
            redisRoot.expire(f"text:users:{self.uid}" , key_Expiry)
            
            
            x = 1
            
            while  x <= key_Expiry  : 
                res = textUsers.search(redisearch.Query(f"@target:{self.uid} -@uid:{self.uid}").paging(0 , 1))
    
                if res.total != 0 : 
                    self.target = res.docs[0].uid
                    redisRoot.execute_command(f"del text:users:{self.target}")
                    common_tags = list(set(self.tags.split(",")).intersection(set((res.docs[0].tags).split(","))))
                    return {"state" : True , "cTags" : common_tags , "targetuid" : self.target }
                else : 
                    redisRoot.hmset(f"text:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : 0  , "checked" : 0})
                    # redisRoot.execute_command(f"hset text:users:{self.uid} target 0 checked 0 ")
                    for i in self.ltags : 
                        
                        r = textUsers.search(redisearch.Query(f"@target:0@tags:{{{i}}}@checked:0-@uid:{self.uid}").paging(0 , 1))
                        if r.total != 0 : 
                            self.target = r.docs[0].uid
                        
                            # redisRoot.execute_command(f"HINCRBY text:users:{self.target} checked 1")
                            redisRoot.hmset(f"text:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : self.target  , "checked" : 1})
                            # redisRoot.execute_command(f"hset text:users:{self.uid} target {self.target} checked 1")
                        
                            delres = redisRoot.execute_command(f"del text:users:{self.target}")
                            if delres == 1 : 
                                common_tags = list(set(self.tags.split(",")).intersection(set((r.docs[0].tags).split(","))))
                                return {"state" : True , "cTags" : common_tags , "targetuid" : self.target }
                        
                x +=1 
                time.sleep(1)
                    
                
            redisRoot.execute_command(f"del text:users:{self.uid}")
            return {"state" : False , "reason" : "timeout"}
        
        elif self.type == "video" : 
            
            redisRoot.hmset(f"video:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : 0  , "checked" : 0})
            redisRoot.expire(f"video:users:{self.uid}" , key_Expiry)
            
            
            x = 1
            
            while  x <= key_Expiry  : 
                res = videoUsers.search(redisearch.Query(f"@target:{self.uid} -@uid:{self.uid}").paging(0 , 1))
    
                if res.total != 0 : 
                    self.target = res.docs[0].uid
                    redisRoot.execute_command(f"del video:users:{self.target}")
                    common_tags = list(set(self.tags.split(",")).intersection(set((res.docs[0].tags).split(","))))
                    return {"state" : True , "cTags" : common_tags , "targetuid" : self.target }
                else : 
                    redisRoot.hmset(f"video:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : 0  , "checked" : 0})
                    for i in self.ltags : 
                        
                        r = videoUsers.search(redisearch.Query(f"@target:0@tags:{{{i}}}@checked:0-@uid:{self.uid}").paging(0 , 1))
                        if r.total != 0 : 
                            self.target = r.docs[0].uid
                        
                            redisRoot.hmset(f"video:users:{self.uid}" ,{'uid' : self.uid , 'tags' : self.tags , "target" : self.target  , "checked" : 1})
                        
                            delres = redisRoot.execute_command(f"del video:users:{self.target}")
                            if delres == 1 : 
                                common_tags = list(set(self.tags.split(",")).intersection(set((r.docs[0].tags).split(","))))
                                return {"state" : True , "cTags" : common_tags , "targetuid" : self.target }
                        
                x +=1 
                time.sleep(1)
                    
                
            redisRoot.execute_command(f"del video:users:{self.uid}")
            return {"state" : False , "reason" : "timeout"}