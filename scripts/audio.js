// Import was leading to weird errors, leave for now
// import AnimatedCircle from './animatedCircle.js'

/*
    Wrapper around the Audio-API
    Provides all drawing functions the user can choose in the gui
*/
class Audio {
    constructor(webgl, controll) {
        this.context = null 
        this.htmlAudio = null  
        this.source = null 
        this.analyser = null
        // TODO: Only initialize when needed 
        this.animatedCircle = new AnimatedCircle(webgl, controll, 3.0)
        // TODO: Only initialize when needed 
        this.animatedSpiral = new AnimantedSpiral(webgl, controll, 1.0, 3.0, 3)
        // TODO: Again ... 
        this.wavePoints = null;
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

            // console.log(event.dataTransfer.types.length)
            for (var i = 0; i < event.dataTransfer.types.length; i++) {
                console.log("... items[" + i + "].kind = " + event.dataTransfer.items[i].kind + " ; type = " + event.dataTransfer.items[i].type)
                console.log(event.dataTransfer.files[i].name)
            }

            this.loadAudio(event.dataTransfer.files[0])
        })
    }

    /* 
    Load audio after drag and drop and create an Audio-Analyser on top of the Audio-Data
    */
    loadAudio(data) {

        // Check if we already play audio and stop it:
        if (this.htmlAudio !== null) {
            $.notify("Removing old audio source", "info")
            this.htmlAudio.remove()     
            this.source.disconnect()
        }

        // create html audio element and play soundfile
        var docBody = document.getElementById('body')
        this.htmlAudio = document. createElement('audio')
        docBody.appendChild(this.htmlAudio)
        this.htmlAudio.id = 'audio'
        this.htmlAudio.src = URL.createObjectURL(data) // sets the audio source to the dropped file
        this.htmlAudio.autoplay = true
        this.htmlAudio.crossOrigin = "anonymous"
        this.htmlAudio.controls = true 
        
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
        // TODO: What timestep does correspond to one analyser frame???
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

    getWaveformData() {
        if (this.analyser === null) {
            console.log("Error: Called <getWaveformData> with no Analyser!")
            return
        }
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteTimeDomainData(dataArray)
        return  dataArray
    }

    getFrequencyData() {
        console.log(this.htmlAudio.duration)
        if (this.analyser === null) {
            console.log("Error: Called <getFrequencyData> with no Analyser!")
            return
        }
        let bufferLen = this.analyser.frequencyBinCount
        var dataArray = new Uint8Array(bufferLen)
        this.analyser.getByteFrequencyData(dataArray)
        return dataArray
    }

    // TODO: Rename
    analyseFrequencyData() {
    
        let dataArray = this.getFrequencyData()
        let bufferLen = dataArray.length
        let spacing = 0.005
        // assume that three.js window coordinates are going from [ -8, -5 ] to [ 8, 5 ]
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

    drawWaveform() {

        let dataArray = this.getWaveformData()
        let bufferLen = dataArray.length

        // assume that three.js window coordinates are going from [ -8, -5 ] to [ 8, 5 ]
        let sliceWidth = 16.0 / bufferLen 
        var x = -8.0 
        
        // var geometry = new Float32Array(2 * bufferLen);
        // TODO: Appending to the array may be bad for performance. How to pre-allocate arrays in js ?
        var geometry = Array()
        var colors = Array()

        for(var i = 0; i < bufferLen; i++) {

            var v = dataArray[i] / 128.0  // v(max) is 2
            var y = -5.0 + (v * 10.0 / 2.0)

            geometry.push(new THREE.Vector3(x, y, 0.0))
            colors.push(new THREE.Color('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')'))
            x += sliceWidth
          }

        if (this.controll.waveLine) {
            var obj = this.webgl.drawLineStrip('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')', geometry)
            this.sceneObjects.push(obj)  
        }
        if (this.controll.wavePoints) {
            if (this.wavePoints == null) {
                this.wavePoints = new Particle(this.webgl)
                this.wavePoints.generatePointCloud(geometry, colors)
            }
            else {
                this.wavePoints.update(geometry, colors)
            }
        }
    }

    resetWaveform() {
        if (this.wavePoints !== null) {
            this.wavePoints.deletePointCloud()
            this.wavePoints = null
        }
    }

    drawAnimatedCircleFromWave() {
        let dataArray = this.getWaveformData()
        let bufferLen = dataArray.length
        this.animatedCircle.update(dataArray)
    }

    resetCircle() {
        this.animatedCircle.removePoints()
    }

    drawAnimatedSpiralFromWave() {
        let dataArray = this.getWaveformData()
        let bufferLen = dataArray.length
        this.animatedSpiral.update(dataArray)
    }

    resetSpiral() {
        this.animatedSpiral.removePoints()
    }

    render() {
        // delete all previously rendered lines from the scene. 
        // TODO: Solve this more effeciently. Just adapt the positions of the line string, like you do for the circle
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
            this.drawWaveform()
        }
        if (this.controll.drawBars) {
            this.analyseFrequencyData()
        }
        if (this.controll.drawCircle) {
            this.drawAnimatedCircleFromWave()
        }
        if (this.controll.drawSpiral) {
            this.drawAnimatedSpiralFromWave()
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