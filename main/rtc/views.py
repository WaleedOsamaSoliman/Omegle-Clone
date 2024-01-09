import http
import re
from django.shortcuts import render , HttpResponse , redirect 
from .funcs.setup import app_name 
import json
from .funcs.textChat import TextChat
from django.http import JsonResponse
from .funcs.overload_test import overloadChatting
# Create your views here.



def index(request)  : 
    
   
    return render(request , "index.html" ,{"app_name" : app_name})


def rules(request) : 
    return render(request , "rules.html" , {"app_name" :app_name})

def requests(request) : 

    if request.method == "POST" : 
        data= request.POST.dict()
        _type = data.get("type")
        if _type == "start-text-chat" : 
                print("Starting text chat ....")
                tc = TextChat()
                tc.type = "text"
        elif _type == "start-video-chat"  : 
                print("Stating video chat .... ")
                tc = TextChat()
                tc.type = "video"
        else : 
            return JsonResponse({ "state" : False , 'reason' :"unknwon chat type "})
        try : 
            tc.tags = data.get("tags")
            tc.uid = data.get("uid")
            res = tc.search()
            return JsonResponse(res)
        except Exception as ex : 
            
            return JsonResponse({"Exception-Error" : ex})

         
        

        # return HttpResponse(status = 200)
    else : 
          return redirect('index')
      

def virtualTest(request) :

    overload = overloadChatting()
    overload.start()
    
 
    return HttpResponse({"state" : "Finish"})
    