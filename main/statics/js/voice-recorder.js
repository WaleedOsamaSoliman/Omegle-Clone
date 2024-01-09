

async function stream_permissions({type = "audio"}) { 
    if (type === "audio") { 
        access = await navigator.permissions.query({name : "microphone"})
      
            if (access.state !== "granted") { 
                console.log("Mic not allowed !")
                return false
            } 
            return true
    }

   
   
}

function getStream({type = "audio"} ) { 
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { 
        
            if (type === "audio") { 
            
                ls = navigator.mediaDevices.getUserMedia({audio : true}) 
                
            }else  if (type === "video") { 
                ls = navigator.mediaDevices.getUserMedia({audio : true , video : {width : {min : 200 , max :300  }, height : {min:200 , max : 300} , facingMode : "user",  frameRate : {min : 15 , max : 45}}}) 

            }else { 
                return false 
            }
            ls.catch(e=>{ 
                alert("Please allow access on your media !")
                return false
            })
            return ls 
        
    


    }else { 
        console.log("get user media not supported in your browser !")
        return false 
    }
}


class Recording { 
    constructor() { 
        this.type = "audio"
        this.chunks = []
        this.recorder = new MediaRecorder(new MediaStream())
        this.recording_state = false
        this.audiotag = null
        this.span = null
      


        this.reader = null 



    }

    reset() { 
        this.chunks = [] 
        this.recorder = new MediaRecorder(new MediaStream())
        this.recording_state = false
        this.audiotag = null
        this.span = null



      
        
        
        
        console.log("Reset recorder Succesfully ")


    }

    start() { 

        if (this.recording_state === true) { 
            console.log("We already recording now ....")
            return false 
        }
        stream_permissions({type : this.type}).then(e=>{

         
            if (e !== true) { 
                getStream({type : this.type})
                return false 
            }


            getStream({type:this.type})
            .then(e=> { 
                $("div#voice-recording").addClass("recording")
                this.recording_state = true
                this.recorder = new MediaRecorder(e)
                this.recorder.ondataavailable = e => {
                    this.chunks.push(e.data)
                }
                this.recorder.onstop = e => {
                    console.log("Recording Stopped ... ")
                    // $("div.recorders").append(this.audiotag)
                    this.span = document.createElement("span")
                    $(this.span).addClass("me")
                    this.audiotag = document.createElement("audio")
                   $(this.span).append(this.audiotag)

                 
                    let blobType = this.chunks[0].type
                    this.chunks = new Blob(this.chunks , {type : blobType})

                    console.log("this.chunks : " , this.chunks)

                    console.log("this.chunks : " , typeof(this.chunks))

                    // send the record ...
                    let fh = new FileHandler()
                    fh.send(this.chunks)



                    this.audiotag.src = URL.createObjectURL(this.chunks)
                    this.audiotag.controls = true
                    $("div#message-box").append(this.span)

                    this.reader = new FileReader()
                    this.reader.readAsBinaryString(this.chunks)
                    console.log(this.reader.result)

                    this.reset()
                }
                this.recorder.start()
            })
          

        })

    
    }
    stop() { 
        this.recorder.state === "recording" ? (this.recorder.stop() , $("div#voice-recording").removeClass("recording")) : false
    }
  
}
const  recording = new Recording()


$("body").on("click" , "#voice-recording" , e => {
    if (PeerConnection === null) { 
        return false;
    }
    if (PeerConnection.pc.connectionState !== "connected") { 
        return false ;
    }

    if(recording.recording_state !== true) { 
        recording.start()
    }else { 
        recording.stop()
    }
    
})