const url = "ws://" + window.location.host + "/websocket"
const blocked_tags = ["israel" , "children" , "lesb" , "gay" , "lesbian"]
const csrf_token = $("input[name = 'csrfmiddlewaretoken']").attr("value")
const timeout = 5
const RTCtimeOut = 10
const typingPattern = /[A-z 0-9]/
const RTCconf = {}
var remoteStream = new MediaStream()
const localVideo = e => { return $("body").find("div#cam-me > video")[0]}
const remoteVideo = e => { return $("body").find("div#cam-stranger > video")[0]}
let AddTrack = false
RTCconf.iceServers = [ {
    urls: 'stun:stun1.l.google.com:19302'
  },
  {
    urls: 'stun:stun3.l.google.com:19302'
  },
  {
    urls: 'stun:stun4.l.google.com:19302'
  }] 
var RTCIce = []
var RemotingState = false
var socket = new WebSocket(url)
// let pc , dc , RTCoffer , RTCanswer  , RTCcandidate ;
let PeerConnection 
let skipState = 1
let chatType ;
var  peertype
let RTCState ;
let typingState = false
let localStream;
var UID 
var offerState = false;
let tags = [];

var cTags 

function Accessmedia() { 
    let userMedia = navigator.mediaDevices
    
    if(userMedia === null || userMedia === undefined) {
            alert("Can't use media devices on http < use https >")
         return console.log("Can't Access to your Camera and Microphone in insecure mode ! < use https >")

    }
    // facemoding : user ---> for selfi camera
    // faceingmode : environment --> for rear camera

    // if there are alot of use parameter :devideId



    userMedia.getUserMedia({video :{width : {min : 350 , max : 550} , height : {min : 200 , max : 500} ,  frameRate : {min:15 , max : 30}, facingMode : "user"} , audio : true})
    // userMedia.getUserMedia({video :true , audio : true})

    .then((stream) => {
        startChat({type : "video"}), chatType = "video"
        
        localStream = stream
        // const  localVideo = $("div#cam-me > video")[0]
        localVideo().srcObject = stream
        localVideo().onloadedmetadata = () => {
            localVideo().play();
          };

        // localStream.getTracks().forEach(  track => { 
        //     console.log("Adding this track .... ", track)
        //     PeerConnection.pc.addTrack(track)

        // }) 

        
       

    })
    .catch(err => { 
        console.log("Error in Access media : "  , err)
    })

}

function  clearIntervalBySeconds( { intervalID = 0, seconds = 5 }) { 
  
   return setTimeout(e=>{
        clearInterval(intervalID)
   } , (seconds * 1000))
}

function typing() { 
    typingState = true
   
    if($("div#message-box > span#typing").length === 0) { 
        let typingSpan = "<span id = 'typing'>Stranger is typing now ...</span>"
        $("div#message-box").append($(typingSpan))
        $("#message-box").scrollTop($("#message-box")[0].scrollHeight)
        
        setTimeout(e => { 
            console.log(typingState)
            typingState === false ? $("span#typing").remove() : false 
        } , 1000)
        

    }else { 
      
  
    }
    typingState = false
}



function skip() { 
    let skipbtn = $("button#skip")
    if (skipbtn.length != 0) { 
        
        if (skipState === 1) { 
            skipState = 2
            $(skipbtn).text("Really !")
        }else if (skipState === 2) { 
            skipState = 3
            $(skipbtn).text("NEW !")
            
            socket.send(JSON.stringify({"type" : "skip"}))
           
            resetPeerConnection({type : "me.disconnected"})
        } else if (skipState === 3)  {
            skipState = 1 
           

            // resetPeerConnection({type : "stranger.disconnected"})
            
            startChat({type : chatType})
        }else { 
            1+1
        }

    }
}


function resetPeerConnection({type = "stranger.disconnected" })  {
    $("div#cam-stranger").addClass("reconnecting-cam")
    PeerConnection = null
    RTCIce = []
    disconnected({type: type})
    console.log("RTC Connection is Closed !")
    skipState = 3;
    peertype = null

}
   


function disconnected({type = "timeout"}) {

    let chatheader = $("#chat-header");
    let chatbody = $("#message-box");
    let  messageinput = $("#message-input") 
    if (type != "timeout") {
        $(chatbody).find("span.chat-end").remove()
        $(chatbody).find("button").remove()
        $(chatbody).append("<span class= 'chat-end'>Chat Ended ...</span>")
        $(chatbody).append("<button  id = 'new-chat'>START NEW CHAT</button>") 
        $(chatbody).append("<button  id = 'change-tags'>CHANGE TAGS</button>") 
        $("button#skip").text("NEW !")
        $("input#message").attr("disabled" , true)
        $("button#send").attr("disabled" , true)
        try  { 
            $("#message-box").scrollTop($("#message-box")[0].scrollHeight)

        }catch(err) { 
            console.log(err)
        }
        switch(type){
            case "stranger.disconnected" : 
                $(chatheader).html("<span>Stranger has disconnected !</span>")
                break
            case "stranger.skip" : 
                $(chatheader).html("<span>Stranger has Skipped You !</span>")
                break
            case "me.disconnected" : 
                $(chatheader).html("<span>You Canceled The Conversation !</span>")
                break
            case "sudden.disconnected" : 
                $(chatheader).html("<span>The Conversation is Suddenly closed !</span>")
                break
            case "stranger.rtcfailed" : 
                $(chatheader).html("<span>Connection with stranger take along time !</span>")
                break
        }
    }
   
    else{ 
        $(chatheader).html(`
            <span>We couldn't find anyone same with your  interests ! </span>
            <div class = 'buttons'>
                <button id = 'try-again'>Try Again</button>
                <button id = 'random-chat'>Random Chat</button>
                <button id = 'change-tags'>Change Tags</button>
            </div>
        `)
        $(chatbody).html("")
        $(messageinput).remove()
    }
    
}

function sendMessage() { 
   let val =  $("input#message").val()
   if (val.trim() != "") { 
    try { 
        PeerConnection.dc.send(JSON.stringify({"type":'message' , "content" : val}))
        $("input#message").val("")
        let message = document.createElement("span")    
        message.textContent = val
        message.classList.add("me")
        $("#message-box").append(message)
        $("#message-box").scrollTop($("#message-box")[0].scrollHeight)

    }catch(err)  {
        console.log(err)
    }
   }
  

}


class createConnection  {
    
    constructor() {
        this.pc = new RTCPeerConnection(RTCconf)
        this.dc = null
    }

    start() {

            if (peertype === "sender") { 
                this.dc = this.pc.createDataChannel("channel")
                this.dc.onopen = e =>{
                    console.log("Connected ! RTC") 
                    build_chat({type : chatType , Ctags : cTags }) 
                  
                    loader.stop() 

                    
                }
                this.dc.onmessage = async(e)=> this.RTCMessageChannel(e.data)
                this.dc.onerror = e => {
                    this.dc.close()  
                    this.pc.close()
                    resetPeerConnection({type:"sudden.disconnected"})
                }
                this.dc.onclosing = e => {
                    this.dc.close()  
                    this.pc.close()
                    resetPeerConnection({type:"sudden.disconnected"})

                }
            }else { 
                 this.pc.ondatachannel = e => {
                    this.dc = e.channel
                    this.dc.onopen = e =>{
                        console.log("Connected ! RTC") 
                        build_chat({type : chatType , Ctags : cTags })   
                        loader.stop() 
                    }
                    this.dc.onmessage = async(e)=> this.RTCMessageChannel(e.data)
                    this.dc.onerror = e => {
                        this.dc.close()  
                        this.pc.close()
                        resetPeerConnection({type:"sudden.disconnected"})
                    }
                    this.dc.onclosing = e => {
                        this.dc.close()  
                        this.pc.close()
                        resetPeerConnection({type:"sudden.disconnected"})
    
                    }
                }
                
            }

            
        // if(chatType === "video") { 
            if (AddTrack === false)  {
                localStream.getTracks().forEach(  track => { 
                    console.log("Adding this track .... ", track)
                    PeerConnection.pc.addTrack(track)
        
                }) 
                AddTrack = true
            }
            
            this.pc.ontrack = (e)=> {

                if(e.streams && e.streams[0]) { 
                 remoteVideo().srcObject = e.streams[0]
                }else { 
                    remoteStream.addTrack(e.track)
                    remoteVideo().srcObject = remoteStream

                  
                }

                remoteVideo().onloadedmetadata = (e) => {
                    remoteVideo().play();
                  };

            
            }
           
        // }
    
      
        this.pc.onnegotiationneeded = async (e) => {
           try  { 
            offerState = true
            // console.log(this.pc)
            await this.pc.setLocalDescription()

            socket.send(JSON.stringify({"type" : "peer.description" , "description" : this.pc.localDescription} ))
            
    
           }catch(err) { 
            console.log("Negotiation error :  " , err)
           }finally { 
            offerState = false
           }
    
        }
        this.pc.onicecandidate =  (e)=> { 
            // console.log("NEW ICE CANDIDATE : " , e)

            if (e.candidate != null) { 
                socket.send(JSON.stringify({"type" : "peer.candidate" , "candidate" : e.candidate}))
                // console.log("→ new candidate : " , e)
    
            }
          
            
    
        }
    }
   


    RTCMessageChannel(e) { 
        // console.log("Ring Ring ... New message")
        data = JSON.parse(e) 
        console.log(data.type)
        switch (data.type) { 
            case "message" : 
                $("span#typing").remove()
                
                let message = document.createElement("span")
            
                message.textContent = data.content
                message.classList.add("stranger")
            
                $("#message-box").append(message)
            
                $("#message-box").scrollTop($("#message-box")[0].scrollHeight)
                break;
            case "typing" : 
                typing()
                break
        
    }
}


}



function socketFunc() { 
    socket.onopen = e => { 
        // console.log("Websocket Opened !")
    }
    socket.onclose = e => { 
        console.log("Websocket Closed !")
        socket.close()
        // refresh the page to create new socket !
        
    }
    socket.onmessage = async (e) => {
        data = JSON.parse(e.data)
        type =  data.type
        // console.log("New message from server : " , e)
        switch(type){ 
            case "stranger.skip" : 
                if (PeerConnection != null) { 
                    resetPeerConnection({type:"stranger.skip"})
                }
                // resetPeerConnection({type:"stranger.skip"})
                break
            case "stranger.disconnected" : 
                if (PeerConnection != null) { 
                    resetPeerConnection({type:"stranger.disconnected"})

                }
                // resetPeerConnection({type:"stranger.disconnected"})
                break
            case "get.uid" :
                try { 
                    UID = data.uid 
                    // console.log("MY UID IS : " , UID)
                }catch(err) { 
                    console.log(err)
                }
                break
            case "peer.type" : 
                peertype = data.peertype
                
                PeerConnection = new createConnection()
                PeerConnection.start()
                // alert(peertype)
                break
            case "peer.candidate" : 
                RTCIce.push(data.candidate)
                let j = setInterval(  ()=>{
                    // console.log("J interval")
                    if ((PeerConnection != null || PeerConnection != undefined) && PeerConnection.pc.remoteDescription !== null ) {
                        
                        
                        clearInterval(j)

                        // console.log("we receive new ice candidate ")

                    
                        try { 
                            // Promise.all([
                              
                            //     PeerConnection.pc.addIceCandidate(data.candidate) ,
                            
                            //     console.log("ice candidates are added ......."),
                            //     RTCIce = []
                            // ])

                            for (let x of RTCIce) { 
                                PeerConnection.pc.addIceCandidate(x)
                                console.log("New ice candidate added Successfully ...")
                                RTCIce = []
                            }
                            
                        
        
                        }catch (err) { 
                            console.log("addIceCandidate error : " , err)
                        }
                            
                        
                        
                      
                     
                    }else { 
                        console.log("Waitting for creating the peerConnection and then we will add the ice candidate !")
                    }
                } , 100)
               clearIntervalBySeconds({intervalID : j  })
                
            

                break
            case "peer.description": 
            
                    try { 
                        let description = data.description
                       
                    
                        let j = setInterval ( async (e) => { 
                            // console.log("J interval")

                           
                            if ((peertype != null && peertype != undefined) && (PeerConnection != undefined || PeerConnection != null)) { 
                                clearInterval(j)

                            
                                let offerCollision = (description.type === "offer" && (offerState === true || PeerConnection.pc.signalingState !== "stable") )
                                let ignoringOffer = offerCollision && peertype === "sender"
                            
    
                                if (ignoringOffer) { 
                                    // console.log("Sender pc " , PeerConnection.pc)
                                    return console.log("We sender and got offer , so ignoring this offer ...")

                                }
                           
                                    // console.log("signalingstate before remoting : " , PeerConnection.pc.signalingState)
                                    // console.log("connection state before remoting : " , PeerConnection.pc.connectionState)

                                    // console.log("desc : " , description)
                                    await PeerConnection.pc.setRemoteDescription(description)
                            
                                    

                                    

                                  
                               

                                    if (description.type === "offer") { 
                                            await PeerConnection.pc.setLocalDescription().then(e =>{
                                
                                            socket.send(JSON.stringify({"type" : "peer.description" ,  "description" : PeerConnection.pc.localDescription}))
                                            
                                        })
                                    }
                                
                                  
                                  

                              
                                        
                                
                               
                                
    
                            }else { 
                                console.log("Waitting to get peer type")
                            }
                        } , 100)
                        clearIntervalBySeconds({intervalID : j  })

                    }catch(err) { 
                        console.log( err )
                    }
                   
              

               break
             
            
       
        }
        
       
    }

    socket.onerror = e => { 
        console.log(`Error in websocket : ${e}`)
    }
}

function build_chat({type =  "text" , Ctags } ) {
    if(type === "video") { 
        $("div#cam-stranger").removeClass("reconnecting-cam")
    }
   
    let chat_structure = `
        <div class = 'text-chat' id = 'chat-box' tabindex = "0">
            <div class = 'header' id = 'chat-header'>
                <span>You now are chatting with Completely Random  Stranger  ... </span>
                <span>Both of u have the following interests "<strong>${Ctags}</strong>" . </span>
            </div>
            <div id = 'message-box'>
                <span class = 'me'>Say hello !</span>
               
            </div>
            <div class = 'message-input' id = 'message-input'>
                    <button tabindex = "0" id = 'skip'>SKIP</button>
                    <input type = 'text' placeholder = 'Write your message here ... ' / id = 'message'>
                    <button tabindex = "0" id = 'send'>SEND</button>
            </div>
        </div>
    `

    let mainContainer = $("div#txt-container")
    if (mainContainer.length === 0 ) { 
        $("#the-container").html("").append("<div class = 'main-container' id = 'txt-container'></div>")
    }
    $("div#txt-container").html(chat_structure)

   $("div#chat-box").focus()
  
}

function waitting({type = "text"}) { 
    let txtContainer = $("div#txt-container")

    if(txtContainer.length === 0) { 
        $("div#the-container").html("")
        if (type === "video") { 
            $("div#the-container").append(`<div id = 'cams'><div class = 'cam' id ='cam-stranger'><video></video></div><div class = 'cam' id = 'cam-me'><div class = 'controllers'><i class="fa-solid fa-microphone"></i></div><video></video></div></div>`)
        }
        $("div#the-container").append("<div  class = 'main-container'id = 'txt-container'></div>")
    }
        $("div#txt-container").html(`   <div class = 'text-chat' id = 'chat-box'>
                                            <div class = 'header' id = 'chat-header'>
                                                <span>Searching for someone has the same interests ... </span>
                                            </div>
                                        </div>`)

 
        if(type === "video") { 
            $("div#cam-stranger").addClass("reconnecting-cam")
        }
    loader.start()
   
}


class loader_ { 
     constructor() { 
        loader_.loaderDiv = $("body").find("div.loader")
     }
     
    start() { 
         loader_.loaderDiv.length === 0 ? $("body").append("<div class= 'loader'></div>")   : false
    }
    stop() { 
        $("div.loader").remove()
    }
}
const loader = new loader_()



socketFunc()


function addTag()  {
    let tag = $("input#add_tag").val().trim(" ").replaceAll("#" , "").toLowerCase();
    if(tag.length >= 3  && tag.length < 20 && !blocked_tags.includes(tag) && !tags.includes(tag) )
        {
            tags.push(tag);
            $("input#add_tag").val("");
            let element = $(`<div class="tag"></div>`);
            $(element).text(tag);
            element.insertBefore("input#add_tag");
        }
}

function removeTag(e) { 
    let index = tags.indexOf(e.target.textContent)
    tags.splice(index , 1)
    e.target.remove()
}

function checkbox() { 
    let checkbox = document.getElementById("terms-check-box")
    if(!checkbox.checked) { 
        $("div.terms").addClass("warnning").on('animationend' ,e=>{
            window.navigator.vibrate(300)
          $(e.currentTarget).removeClass("warnning")
        })   
    }else { 
        return true
    }
}

function checkTags() { 
    if (tags.length === 0 ) { 
        $("div#tags").addClass("warnning").on('animationend' ,e=>{
            window.navigator.vibrate(300)
            $(e.currentTarget).removeClass("warnning")
          }) 
          return false
    }else { 
        return true
    }
}


function checking() { 
    return checkTags() && checkbox() ? true : false
}




function startChat({type = "text"}) { 
    $("div#cam-stranger").addClass("reconnecting-cam")
  
    skipState !== 1 ? skipState = 1 : false  
    socket === null ? (socket = new WebSocket(url) , console.log("Creating new socket Connection") ) :false
    let ct = "start-"  + type + "-chat"
    waitting({type: type})
    $.ajax({
        
        method : "POST",
        url : "requests",
        mode : "same-origin",
        data : { 'csrfmiddlewaretoken' : csrf_token , 'tags' : JSON.stringify(tags)  , 'type'  : ct , 'uid' : UID} , 
        success : e=>{ 
            // loader.stop()
            if (e.state) { 
                
                Promise.all([
                    console.log(e),
                    e.cTags = (e.cTags).join(","),
                    cTags = e.cTags,
                    socket.send(JSON.stringify({"type":"peer.type" , "uid" : e.targetuid}))
                ])
               


          
            }else { 
               
                disconnected({type:"timeout"})
                loader.stop()
                console.log(e)
            }
           
        },error : e => { 
            console.log("Error " , e)
        }
    })
}



$("body").on("keypress"  ,"input#add_tag", e => {
   e.key === "Enter" ? addTag() : false
})  

$("body").on("click" , "div#tags > div.tag" , e => { 
    removeTag(e)
})   

$("button#text-chat").on("click" , e => { 
   checking()?(  startChat({type : "text"}) , chatType = "text"):false
})

$("button#video-chat").on("click" , e => { 
    checking()?(Accessmedia()  ):false
 })
 
$("body").on("click" , "button#send" , e => { 
    sendMessage()
})

$("body").on("click" , "button#skip" , e => { 
    skip()
    // resetPeerConnection({type:"me.disconnected"})
})
$("body").on("click" , "button#try-again" , e => { 
    skipState = 1 

    PeerConnection = null
    startChat({type : chatType})
})
$("body").on("keypress" , "input#message" , e => { 
    if (e.key === "Enter") { 
        sendMessage()
    }else { 
        if(typingPattern.test(e.key)) { 
            if (PeerConnection.pc.connectionState === "connected") { 
                PeerConnection.dc.send(JSON.stringify({"type" : "typing"}))
            }
        }
    }
})

$("body").on("click" , "button#new-chat" , e => { 
    startChat({type : chatType})
})

$("body").on( "keyup" ,"div#chat-box"  , e=> { 
    e.key === "Escape" ? $("button#skip").click() : false
})