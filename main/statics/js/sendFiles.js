class FileHandler { 
    constructor() { 
        this.uploadingState = false
        this.offset = 0 
        this.chunks = null 
        this.maxSize = null 
        this.chunkSize = 16789
        this.file = null
        this.filename = null
        this.fileSize = null
        this.fileType = "record" 
        this.fileReader = new FileReader()
            this.fileReader.onerror = e =>  console.log("File reading Proccess not Complete  : " , e)
            this.fileReader.onabort = e => console.log("File reading Proccess aborted : "  , e)
    }


    send(file) { 
        try { 
            if (typeof(file) !== "object"){
                return console.log("File u need to send not blob Object ")
            }
    
            if (this.fileType === "record") { 
                this.filename = `record`
            }
            
            this.file = new File([file] , this.filename , {"type" : file.type })
            this.fileSize = file.size


           



            this.fileReader = new FileReader()
            this.fileReader.onload = e => {
                PeerConnection.ftc.send("start")
                console.log( "ONFILE LOAD : ",  e)
                console.log("Starting ....")
                while (this.offset < this.fileSize ) { 
                    this.slice()

                    let bytes = this.fileReader.result
                    console.log(bytes)
                    PeerConnection.ftc.send(bytes)
                    this.offset += bytes.byteLength
                    console.log("offset : " , this.offset )
                    console.log("bytes : " , bytes)
                    
                }
                // console.log("End sending ...")

            }
            this.fileReader.readAsArrayBuffer(this.file)


            // send the file info through webrtc 




        }catch(err)  {
            console.log("Error During Sending the file  : " , err)
        }
      

    }



    receive() { 
            if (!this.uploadingState ) { 
                return console.log("Nothing to receive ....")
            }
            console.log("We reciveing File now !!")
    }


    slice() {
        console.log("slicing from offset : " , this.offset)
        
        let  j = setInterval(e=>{ 
                if (this.fileReader.readyState === 2 ) { 
                    clearInterval(j)
                    return this.fileReader.readAsArrayBuffer((this.file).slice(this.offset , this.chunkSize))
                }else { 
                    console.log("Queueing ,,,,")
                }
        } , 100)
      
   
    }
}