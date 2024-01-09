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
const micrphoneSVG  =`<svg  id = 'mic-icon' xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" ><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>`
const micrphoneMuteSVG = `<svg id = 'mute-mic-icon' xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>`
const volumeSVG = `<svg id = 'volume-icon' xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`
const volumeMuteSVG = `<svg id = 'mute-volume-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/></svg>`



RTCconf.iceServers = [ {
    urls: 'stun:stun1.l.google.com:19302'
  },
  {
    urls: 'stun:stun3.l.google.com:19302'
  },
  {
    urls: 'stun:stun4.l.google.com:19302'
  }] 




// let strangersCount = 0
// let StartPointTime =  Date.now()
// let endPointTime =  null
// let StrangerWait = false





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
var UID ;
var target; 
var offerState = false;
let tags = [];


var cTags 


// function manyConnections(){ 
//     strangersCount += 1
  
//     if (strangersCount > 5 ) { 
//         if (!StrangerWait) { 
//             endPointTime = Date.now() + 20
//             StrangerWait = true
//         }else { 
//             if( (Date.now() - endPointTime )  < 20 ) { 
                
//                 console.log("Still Blocking ....")
//                 return false 
//             }else { 
//                 console.log("Unblocking Successfully .....")
//                 strangersCount = 0
//                 StartPointTime = Date.now()
//                 StrangerWait = true
//                 return true
            
               
//             }
//         }
       
//     }else { 
//         return true
//     }
// }



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
        localVideo().srcObject = stream
        localVideo().onloadedmetadata = () => {
            $("div#cam-me > video").prop("muted" , true) //mute my mic
            localVideo().play();
          };

   
       

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
    console.log(remoteStream)
    target = null
    PeerConnection != null ? PeerConnection.pc.close() : false
    PeerConnection = null
    RTCIce = []
    disconnected({type: type})
    console.log("RTC Connection is Closed !")
    skipState = 3;
    peertype = null
    chatType === "video"  ? (remoteStream = new MediaStream() , remoteVideo().srcObject = null , $("div#cam-stranger").removeClass("reconnecting-cam")):false

}
   


function disconnected({type = "timeout"}) {
    chatType ==="video" ? $("div#cam-stranger").removeClass("reconnecting-cam"):false

    let chatheader = $("#chat-header");
    let chatbody = $("#message-box");
    let  messageinput = $("#message-input") 
    if (type != "timeout" && type != "many.connections") {
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
        let header
        if (type === "timeout") { 
            header = `<span>We couldn't find anyone same with your  interests ! </span>`

        }else if (type === "many.connections") {
            header = `<span>Too many Connections , please wait a few of seconds ...</span>`

        }
        $(chatheader).html(`
            ${header}
            <div class = 'buttons'>
                <button id = 'try-again'>Try Again</button>
                <button id = 'random-chat'>Random Chat</button>
                <button id = 'change-tags'>Change Tags</button>
            </div>
        `)
        $(chatbody).html("")
        $(messageinput).remove()
    }
    
    loader.stop()
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
        resetPeerConnection({type:"sudden.disconnected"})
        console.log(err)
    }
   }
  

}


class createConnection  {
    
    constructor() {
        this.pc = new RTCPeerConnection(RTCconf)
        this.dc = null
        this.ftc = null
    }

    start() {

            if (peertype === "sender") { 
                this.dc = this.pc.createDataChannel("channel")
                this.ftc = this.pc.createDataChannel("file_transfer_channel")

                this.dc.onopen = e =>{
                    console.log("File Transfer Channel is Opened !") 
                    
                }



                this.dc.onopen = e =>{
                    console.log("Connected ! RTC") 
                    
                    build_chat({type : chatType , Ctags : cTags }) 
                  
                    loader.stop() 

                    
                }
                this.dc.onmessage = async(e)=> this.RTCMessageChannel(e.data)
                // this.dc.onerror = e => {
                //     console.log("On error dc" , e)
                //     this.dc.close()  
                //     this.pc.close()
                //     resetPeerConnection({type:"sudden.disconnected"})
                // }
                // this.dc.onclosing = e => {
                //     this.dc.close()  
                //     this.pc.close()
                //     resetPeerConnection({type:"sudden.disconnected"})

                // }
            }else { 

               
                 this.pc.ondatachannel = e => {
                    console.log(e.channel)
                    if (e.channel.label === "file_transfer_channel") { 
                        this.ftc = e.channel
                        this.ftc.binaryType = "arraybuffer"
                        this.ftc.onopen = e => console.log("File Transfer Channel is opened !")
                        this.ftc.onmessage = e => {
                            console.log("new ftc Message " , e.data)
                            if (e.data === "start") { 
                                console.log("Starting Downloading File ....")
                                this.ftc.fileReceived = []
                                
                            }else if (e.data === "end") { 
                                console.log("File Completely Downloaded ... ")

                                this.ftc.fileReceived = new Blob(this.ftc.fileReceived  , "audio/webm")
                                console.log("The Downloaded blob is : " , URL.createObjectURL(this.ftc.fileReceived))
                            } else { 
                                if(this.ftc.fileReceived === null ||  this.ftc.fileReceived === undefined) { 
                                    this.ftc.fileReceived = []
                                }
                                this.ftc.fileReceived.push(e.data)

                            }
                        }


                    }else { 
                        this.dc = e.channel
                        this.dc.onopen = e =>{
                            console.log("Connected ! RTC") 
                            build_chat({type : chatType , Ctags : cTags })   
                            loader.stop() 
                        }
                        this.dc.onmessage = async(e)=> this.RTCMessageChannel(e.data)
   
                    }

            
                   
                
                   
                    // this.dc.onerror = e => {
                    //     console.log("On error dc" , e)

                    //     this.dc.close()  
                    //     this.pc.close()
                    //     resetPeerConnection({type:"sudden.disconnected"})
                    // }
                    // this.dc.onclosing = e => {
                    //     this.dc.close()  
                    //     this.pc.close()
                    //     resetPeerConnection({type:"sudden.disconnected"})
    
                    // }
                }
                
            }

            
                if (chatType === "video")  {
                    localStream.getTracks().forEach(  track => { 
                        console.log("Adding this track .... ", track)
                        PeerConnection.pc.addTrack(track)
            
                    }) 
                 
                }
          
               
            
            
            this.pc.ontrack = (e)=> {                
                remoteStream.addTrack(e.track)
                remoteVideo().srcObject = remoteStream

                
                

                remoteVideo().onloadedmetadata = (e) => {
                    remoteVideo().play();
                  };

            
            }
           
        // }
    
       
        this.pc.onnegotiationneeded = async (e) => {
            console.log("Starting Negotations ...")
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
        data = JSON.parse(e) 

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
            // case "record" : 
            //     let record = data.content 
            //     console.log(record)
            //     console.log(JSON.parse(record))
            //     break
        
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
            case "many.connections" :
                resetPeerConnection({type:"many.connections"})
                break
            case "stranger.skip" : 
                if (PeerConnection != null) { 
                    resetPeerConnection({type:"stranger.skip"})
                }
                // resetPeerConnection({type:"stranger.skip"})
                break
            case "stranger.disconnected" : 
              
                if (PeerConnection != null && target === data.uid ) { 
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
                                            // let c = JSON.parse(JSON.stringify(PeerConnection.pc.localDescription).replaceAll("262144" , "262144000"))
                                            // console.log(c)
                                            // socket.send(JSON.stringify({"type" : "peer.description" ,  "description" :c}))

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
    if (cTags === "null") { 

    }
   
    let chat_structure = `
        <div class = 'text-chat' id = 'chat-box' tabindex = "0">
            <div class = 'header' id = 'chat-header'>
                <span>You now are chatting with Completely Random  Stranger  ... </span>
                ${cTags === "null" ? "<span><strong style= 'color : red;text-transform:capitalize;'>no interests among us !  . </strong></span>":  "<span>Both of u have the following interests '<strong>"  + cTags + "</strong>' . </span>"}
            </div>
            <div id = 'message-box'>
                <span class = 'me'>Say hello !</span>
               
            </div>
            <div   class = 'message-input' id = 'message-input'>
                    <button tabindex = "0" id = 'skip'>SKIP</button>
                    <input dir = 'auto' type = 'text' placeholder = 'Write your message here ... ' / id = 'message'>
                    <div class = 'record-btn' id = 'voice-recording'>${micrphoneSVG}</div>
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
            $("div#the-container").attr("type" , "video-box").append(`<div id = 'cams'><div class = 'cam' id ='cam-stranger'><div class = 'controllers'>${volumeSVG} </div><video></video></div><div class = 'cam' id = 'cam-me'><div class = 'controllers'>${micrphoneSVG} </div><video></video></div></div>`)
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
            document.getElementById("terms-check-box").scrollIntoView()
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




function startChat({type = "text" , random  = false }) { 
  
  

    $("div#cam-stranger").addClass("reconnecting-cam")
    
    skipState !== 1 ? skipState = 1 : false  
    socket === null ? (socket = new WebSocket(url) , console.log("Creating new socket Connection") ) :false
    let ct = "start-"  + type + "-chat"
    waitting({type: type})
    $.ajax({
        
        method : "POST",
        url : "requests",
        mode : "same-origin",
        data : { 'csrfmiddlewaretoken' : csrf_token , 'tags' : random != true ? JSON.stringify(tags)  : JSON.stringify([])   , 'type'  : ct , 'uid' : UID} , 
        success : e=>{ 
            // loader.stop()
            if (e.state) { 
                
                Promise.all([
                    console.log(e),
                    e.cTags = (e.cTags).join(","),
                    cTags = e.cTags,
                    target = e.targetuid,
                    socket.send(JSON.stringify({"type":"peer.type" , "uid" : e.targetuid}))
                ])
               


          
            }else { 
               
                disconnected({type:"timeout"})
                // loader.stop()
                console.log(e)
            }
           
        },error : e => { 
            disconnected({type:"sudden.disconnected"})
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

$("body").on("click" , "div#cam-me > div.controllers > svg#mic-icon" , e => {
    $(e.currentTarget).replaceWith(`${micrphoneMuteSVG}`)
    localStream.getAudioTracks().forEach(track => { 
        track.enabled = false
    })
})
$("body").on("click" , "div#cam-me > div.controllers >svg#mute-mic-icon" , e => {
    $(e.currentTarget).replaceWith(`${micrphoneSVG}`)
    localStream.getAudioTracks().forEach(track => { 
        track.enabled = true
    })
})
$("body").on("click" , "div#cam-stranger > div.controllers >svg#volume-icon" , e => {
    $("div#cam-stranger > video").prop("muted" , true)
    $(e.currentTarget).replaceWith(`${volumeMuteSVG}`)
    
})
$("body").on("click" , "div#cam-stranger > div.controllers >svg#mute-volume-icon" , e => {
    $("div#cam-stranger > video").prop("muted" , false)
    $(e.currentTarget).replaceWith(`${volumeSVG}`)
    
})
$("body").on("click" , "div.overlay , div.overlay button#save-btn , div.overlay span#close-btn" , e=>{ 
    
    $("div.overlay").fadeOut("fast" , e=> { 
       $("div.overlay").remove()
    })
})
$("body") .on("click" , "div.overlay  > div.change-tags-section" , e => { 
    e.stopPropagation()
}) 

$("body").on("click" , "button#change-tags" , e=> { 
    if($("body > .overlay").length > 0 ) { 
       return ;
    }
    let t = "" ;
    tags.forEach(e=>{
        t += `<div class = 'tag'>${e}</div>`
    })
    let overlay = `
        <div class = 'overlay'>
                <div class = 'change-tags-section'>
                    <div class = 'title'>Add & Remove your Interests using the box below :<span id = 'close-btn' class = 'close'>x</span></div>
                        <div class = 'skeleton'><div id = 'tags'>
                            ${t}
                            <input dir = 'auto' placeholder = 'Add new interests ...' id = 'add_tag'/>
                        </div>
                    </div>
                    <div class = 'buttons'> <button id = 'save-btn'>Save</button></div>
                </div>
        </div>
    `
    $("body").remove(".overlay").append(overlay)
})

$("body").on("click" , "button#random-chat" , e=> { 
    $(e.currentTarget).attr("disabled" , "true")
    startChat({type:chatType , random : true})
    console.log("Starting Random Chat")
})

