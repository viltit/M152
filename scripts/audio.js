
class Audio {
    constructor(webgl, messageBox) {
        this.context = null 
        this.htmlAudio = null  
        this.source = null 
        this.analyser = null
        this.webgl = webgl
        this.messageBox = messageBox

        // drag and drop. Dropping will not work when dragover is not defined!    
        window.addEventListener('dragover', (event) => {
            console.log("Dragging")
            event.stopPropagation();
            event.preventDefault();
        })

        window.addEventListener('drop', (event) => {
            console.log("Dropping")
            event.preventDefault();  
            event.stopPropagation();

            // we just take the first file if several were dropped 
            // Check for the file type. We only consider the first file if there were several
            if (event.dataTransfer.types.count === 0) { return }
            if (event.dataTransfer.items[0].kind !== "file") { return }

            // TODO: Check for file type

            console.log(event.dataTransfer.types.length)
            for (var i = 0; i < event.dataTransfer.types.length; i++) {
                console.log("... items[" + i + "].kind = " + event.dataTransfer.items[i].kind + " ; type = " + event.dataTransfer.items[i].type)
            }

            this.loadAudio(event.dataTransfer.files[0] )
        })
    }

    loadAudio(data) {

        // Check if we already play audio and stop it:
        if (this.htmlAudio !== null) {
            // TODO: This is not enough. Old odio keeps playing
            this.messageBox.add("Removing old audio source")
            this.htmlAudio.remove()     
            this.source.disconnect()
            // TODO: Stop drawing !
        }

        // create html audio element and play soundfile
        this.htmlAudio = document.createElement('audio')
        this.htmlAudio.src = URL.createObjectURL(data) // sets the audio source to the dropped file
        this.htmlAudio.autoplay = true
        this.htmlAudio.crossOrigin = "anonymous"
        
        this.messageBox.add("Added new audio-source")

        // create audio api context
        if (this.context === null) {
            this.context = new (window.AudioContext || window.webkitAudioContext)(); 
        }

        // create audio source for AudioAPI
        this.source = this.context.createMediaElementSource(this.htmlAudio)
        // create analyser node:
        this.analyser = this.context.createAnalyser()
        // connect the audio source ti the audio destination:
        this.source.connect(this.context.destination)
        // connect the analyer to the audio source:
        this.source.connect(this.analyser)
    }

    // FIRST TEST: Can we plot the frequency ??
    analyseAudio() {
        console.log("analyseAudio")
        
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteTimeDomainData(dataArray)

        // assume that three.js window coordinates are going from [ -8, -5 ] to [ 8, 5 ]
        // TODO: Check if that if that holds
        let sliceWidth = 16.0 / bufferLen 
        var x = -8.0 

        for(var i = 0; i < bufferLen; i++) {
   
            var v = dataArray[i] / 128.0  // v(max) is 2
            var y = -5.0 + (v * 10.0 / 2.0)
            

            this.webgl.drawCircle("red", sliceWidth, { x: x, y: y })
            /*
            if(i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
            */
    
            x += sliceWidth
          }

    }

    render() {
        // TODO: Render different stuff depending on what user did choose
        if (this.analyser !== null) {
            this.analyseAudio()
        }
    }

    static hasBrowserSupport() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            var testContext = new AudioContext();
            testContext.close()
            return true
        }
        catch (e) {
            console.log(e)
            return false
        }
    }

}