
class Audio {
    constructor(webgl, controll) {
        this.context = null 
        this.htmlAudio = null  
        this.source = null 
        this.analyser = null
        this.webgl = webgl
        this.controll = controll
        this.sceneObjects = Array()
        this.allowedFileTypes = [ "audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4", "audio/ogg" ]

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
            
            // check if we can access the events data transfer
            if (!event.dataTransfer) {
                $.notify("It seems your browser does not support drag and drop operations!", "error")
                return
            }

            // we just take the first file if several were dropped 
            // Check for the file type. We only consider the first file if there were several
            if (event.dataTransfer.types.count === 0) { return }
            if (event.dataTransfer.items[0].kind !== "file") { return }

            // Check for file type
            // TODO: This just checks the file extension! A "real" file check would look at the data and inside the file and 
            // see if the header is correct
            let fileType = event.dataTransfer.items[0].type 
            if (!this.allowedFileTypes.includes(fileType)) {
                $.notify("File type " + fileType + " is not a valid audio file!")
                return
            }

            console.log(event.dataTransfer.types.length)
            for (var i = 0; i < event.dataTransfer.types.length; i++) {
                console.log("... items[" + i + "].kind = " + event.dataTransfer.items[i].kind + " ; type = " + event.dataTransfer.items[i].type)
                console.log(event.dataTransfer.files[i].name)
            }

            this.loadAudio(event.dataTransfer.files[0])
        })
    }

    loadAudio(data) {

        // Check if we already play audio and stop it:
        if (this.htmlAudio !== null) {
            $.notify("Removing old audio source", "info")
            this.htmlAudio.remove()     
            this.source.disconnect()
        }

        // create html audio element and play soundfile
        this.htmlAudio = document.createElement('audio')
        this.htmlAudio.src = URL.createObjectURL(data) // sets the audio source to the dropped file
        this.htmlAudio.autoplay = true
        this.htmlAudio.crossOrigin = "anonymous"
        
        // sadly, we can not print the duration of the audio source because it is streaming
        $.notify("Loaded audio source " + data.name + " | File size: " + data.size + "bytes" + " | Duration: " + this.htmlAudio.duration, "success")
        
        // create audio api context
        if (this.context === null) {
            this.context = new (window.AudioContext || window.webkitAudioContext)(); 
        }

        // create audio source for AudioAPI (return an AudioNode)
        this.source = this.context.createMediaElementSource(this.htmlAudio)
        // create analyser node:
        this.analyser = this.context.createAnalyser()
        // connect the audio source to the audio destination:
        this.source.connect(this.context.destination)
        // connect the analyer between the audio source and its destination
        this.source.connect(this.analyser)
    
        // the analyser by default takes 2048 data points in each update. We can change this value with "analyser.fftSize = "
        // this value must be a power of 2
        this.analyser.fftSize = Math.pow(2, this.controll.fftExponent)
    }

    resetAnalyser(fftExponent) {
        
        if (this.context === null) {
            return
        }
        this.source.disconnect(this.analyser)
        this.analyser = this.context.createAnalyser()
        this.source.connect(this.analyser)
        this.analyser.fftSize = Math.pow(2, fftExponent)
    }

    // TODO: Get rid of repeated code
    // TODO: Use constants 
    // TODO: Rename
    analyseFrequencyData() {
        let spacing = 0.005
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteFrequencyData(dataArray)
        // assume that three.js window coordinates are going from [ -8, -5 ] to [ 8, 5 ]
        // TODO: Check if that if that holds
        let barWidth = 16 / bufferLen - spacing
        var x = -8.0
        var geometry = Array()
        for (var i = 0; i < bufferLen; i++) {

            // dataArray goes from 0 to 255 -> map to [ 0:10 ]
            // data[0]: begins at 0Hz
            // data[max]: ends at context.sampleRate Hz
            let v = dataArray[i] / 255.0 * 10.0
            
            // do not draw 0 values
            if (v != 0) {
                var bottomLeft = new THREE.Vector3(x, -5.0, 0)
                var topRight = new THREE.Vector3(x + barWidth, -5.0 + v, 0)
                geometry.push({ bottomLeft: bottomLeft, topRight: topRight })
            }
            x += barWidth + spacing
        }

        const objs =  this.webgl.drawBars(
            'rgb('+this.controll.R +','+this.controll.G+','+this.controll.B+')',
            geometry)

        // TODO: 'Flat map' the objs array into the scene objects    
        objs.forEach((obj) => {
            this.sceneObjects.push(obj)
        })
    }

    // TODO: Rename
    analyseAudio() {
        // console.log("analyseAudio")
        
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteTimeDomainData(dataArray)

        // assume that three.js window coordinates are going from [ -8, -5 ] to [ 8, 5 ]
        // TODO: Check if that if that holds
        let sliceWidth = 16.0 / bufferLen 
        var x = -8.0 
        
        // var geometry = new Float32Array(2 * bufferLen);
        // TODO: Appending to the array may be bad for performance. Try to use pre-allocated array
        var geometry = Array()

        for(var i = 0; i < bufferLen; i++) {
   
            var v = dataArray[i] / 128.0  // v(max) is 2
            var y = -5.0 + (v * 10.0 / 2.0)

            geometry.push(new THREE.Vector3(x, y, 0.0))
            /*
            if(i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
            */
    
            x += sliceWidth
          }

        // TODO: We need to destroy the geometry too !!
        var obj = this.webgl.drawLineStrip('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')', geometry)
        this.sceneObjects.push(obj)  
    }

    drawAnimatedCircleFromWave() {
        
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteTimeDomainData(dataArray)

        // we want to arrange our Points on a circle:
        // TODO: ONLY CALCULATE THIS ONCE AND THEN CHANGE POSITION -> this is a waist of performance here !
        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        var baseRadius = 3.0
        var positions = Array()
        for (var i = 0; i < bufferLen; i++) {
            let radius = baseRadius + dataArray[i] / 128.0
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            positions.push(new THREE.Vector2(x, y))
            angle += deltaAngle
        } 
        
        let color = new THREE.Color(this.controll.r, this.controll.g, this.controll.b)
        this.webgl.drawSprites(0xff0000, 0.2, positions).forEach( sprite => {
            this.sceneObjects.push(sprite)
        })
        
    }

    render() {
        // delete all previously rendered objects from the scene
        this.sceneObjects.forEach(obj => {
            this.webgl.scene.remove(obj)
            obj.geometry.dispose()
            obj.material.dispose()
            this.webgl.scene.dispose(obj)
        })
        this.sceneObjects.length = 0

        // check if the analyser is up
        if (this.analyser === null) {
            return
        }

        // render depending on what user did choose
        if (this.controll.drawWaves) {
            this.analyseAudio()
        }
        if (this.controll.drawBars) {
            this.analyseFrequencyData()
        }
        if (this.controll.drawCircle) {
            this.drawAnimatedCircleFromWave()
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