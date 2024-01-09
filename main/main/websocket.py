from channels.generic.websocket import   AsyncWebsocketConsumer , WebsocketConsumer
from channels.exceptions import StopConsumer
from asgiref.sync import async_to_sync
import json
import redis as rds
from rtc.funcs.setup import redis_host , redis_port , key_Expiry
import redisearch
import time
import colorama

try : 
    redisRoot = rds.Redis(host = redis_host , port = redis_port , db = 0 ) # for executing any root command in redis
    redisRoot.execute_command("flushdb async") #remove content from db0
    textUsers = redisearch.Client("text-users")
    videoUsers = redisearch.Client("video-users")



    try : 
        redisRoot.execute_command("ft.create text-users prefix 1 text:users on hash  schema uid text tags tag target text  checked text ") #create search index for text chat users
        redisRoot.execute_command("ft.create video-users prefix 1 video:users on hash  schema uid text tags tag target text  checked text ") #create search index for text chat users

    except : 
        pass
except Exception as ex : 
    print("[!] "+ str(ex))
    print("[!] Redis Server is not connected !")
    exit()



# ################################################# sync ↓ ##############################################

# class Socket(WebsocketConsumer) : 
    
        
#      def connect(self) : 
#         self.x = 0
#         self.accept()
#         print("Connected !")
#         return async_to_sync(self.channel_layer.send)(self.channel_name ,  { "type" : "get.uid", "uid" : self.channel_name})
       
#      def disconnect(self , close_code) :
#         if hasattr(self ,"target") :     
#             return async_to_sync(self.channel_layer.send)(self.target , {"type" : "stranger.disconnected" })
        
#         print("Stranger Disconnected !")
#         self.close()
#         raise StopConsumer()
        
#         # raise StopConsumer()

#      def receive(self , text_data) : 
#         self.x += 1
        
        
#         print(f"[{self.x}] Message  received  , channel_name is : {self.channel_name}" , end = "\r" )
       
#         try : 
#             data = json.loads(text_data)
#             # print(data)

#         except Exception as ex :
#             data = {}
#             return print("we received Invalid data from the client ")

#         typeof = data.get('type') 
    
       
#         if typeof == None : 
#             return print("unknown message type !")
           
 

#         if typeof == "peer.type" :      
#             self.target = data.get("uid")
#             r = redisRoot.execute_command(f"Exists RTC:{self.target}")
#             if r == 1 :
#                 peertype = "receiver"
#                 redisRoot.execute_command(f"del RTC:{self.target}")

#             else : 
#                 peertype = "sender"
#                 redisRoot.execute_command(f"set RTC:{self.channel_name} 0 EX {key_Expiry}")
#             async_to_sync(self.channel_layer.send)(self.channel_name , {"type" : "peer.type" , "peertype" : peertype})  

#             return True
      
#         if hasattr(self , 'target') == False : 
#             return print(f"the User : {self.channel_name} has no target yet !")
        
      
#         elif typeof == "skip" : 
#             return async_to_sync(self.channel_layer.send)(self.target , {"type" : "stranger.skip"})
           
#         elif typeof == "peer.description" : 
#             description = data.get("description")
#             if description : 
#                 return async_to_sync(self.channel_layer.send)(self.target , {"type" : "peer.description" , "description" : description})
#             return     
            
#         elif typeof == "peer.candidate" : 
#             candidate = data.get("candidate")
#             if candidate : 
#                 return async_to_sync(self.channel_layer.send)(self.target , {"type" : "peer.candidate" , "candidate" : candidate})
#             return   
#         else : 
            
#             return print(f"this message is comming from {self.channel_name} and will send to {self.target} ")
         
                
  
#      def get_uid(self , text_data) : 
#         return self.send(json.dumps({"type" : "get.uid" , "uid" : self.channel_name}))

#      def peer_type(self , text_data) : 
#         return self.send(json.dumps({"type" : "peer.type" , "peertype" : text_data['peertype']}))

   

#      def stranger_disconnected(self , text_data) :
#         return self.send(json.dumps({"type" : "stranger.disconnected" }))
  
#      def stranger_skip(self , text_data) :
#         return self.send(json.dumps({"type" : "stranger.skip"}))
        
#      def peer_description(self , text_data) : 
#         return self.send(json.dumps({"type" : "peer.description" , "description" : text_data['description'] }))

        
#      def peer_candidate(self , text_data) : 
#         return self.send(json.dumps({"type" : "peer.candidate" , "candidate" : text_data['candidate'] }))

############################################################## Async ↓ ##################################################

class Socket(AsyncWebsocketConsumer) : 
    
    async def connect(self) : 
        await self.accept()
        
        return await self.channel_layer.send(self.channel_name ,  { "type" : "get.uid", "uid" : self.channel_name})
       
    async def disconnect(self , close_code) :
        try : 
            if hasattr(self ,"target") :     
                await self.channel_layer.send(self.target , {"type" : "stranger.disconnected" , "uid" : self.channel_name  })
        
            print("Stranger Disconnected !")
            return await self.close()
            
            # raise  StopConsumer()
        except Exception as ex : 
            print(f"---> Exception during disconnecting : ### {ex} ###")
            raise  StopConsumer()


    async def receive(self , text_data) : 
       
        try : 
            data = json.loads(text_data)
            # print(data)

        except Exception as ex :
            data = {}
            return print("we received Invalid data from the client ")

        typeof = data.get('type') 
    
       
        if typeof == None : 
            return print("unknown message type !")
           

        
           
        
       
            
      

        if typeof == "peer.type" :    
        
            
            self.target = data.get("uid")
            r = redisRoot.execute_command(f"Exists RTC:{self.target}")
            if r == 1 :
                peertype = "receiver"
                redisRoot.execute_command(f"del RTC:{self.target}")

            else : 
                peertype = "sender"
                redisRoot.execute_command(f"set RTC:{self.channel_name} 0 EX {key_Expiry}")
            await self.channel_layer.send(self.channel_name , {"type" : "peer.type" , "peertype" : peertype })  

            return True
      
        if hasattr(self , 'target') == False : 
            return print(f"the User : {self.channel_name} has no target yet !")
        
      
        elif typeof == "skip" : 
            return await self.channel_layer.send(self.target , {"type" : "stranger.skip"})
           
        elif typeof == "peer.description" : 
            description = data.get("description")
            if description : 
                return await self.channel_layer.send(self.target , {"type" : "peer.description" , "description" : description})
            return     
            
        elif typeof == "peer.candidate" : 
            candidate = data.get("candidate")
            if candidate : 
                return await self.channel_layer.send(self.target , {"type" : "peer.candidate" , "candidate" : candidate})
            return   
        else : 
            
            return print(f"this message is comming from {self.channel_name} and will send to {self.target} ")
         
                
  
    async def get_uid(self , text_data) : 
        return await self.send(json.dumps({"type" : "get.uid" , "uid" : self.channel_name}))

    async def peer_type(self , text_data) : 
        return await self.send(json.dumps({"type" : "peer.type" , "peertype" : text_data['peertype']}))

   

    async def stranger_disconnected(self , text_data) :
        return await self.send(json.dumps({"type" : "stranger.disconnected"   , "uid" : text_data['uid']}))
  
    async def stranger_skip(self , text_data) :
        return await self.send(json.dumps({"type" : "stranger.skip"}))
        
    async def peer_description(self , text_data) : 
        return await self.send(json.dumps({"type" : "peer.description" , "description" : text_data['description'] }))

        
    async def peer_candidate(self , text_data) : 
        return await self.send(json.dumps({"type" : "peer.candidate" , "candidate" : text_data['candidate'] }))

 