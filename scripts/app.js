/**
 * App.js
 * Entry point of the websites javascript. Initializes an App instance and runs it when the document is ready
 */

var app;

// Execute when site is ready
$(document).ready(function () {

    // register resize event and orientation event
    $(window).resize( () => {
        app.webGL.resize()
    })
    
    // check if webgl and audio ai are supported by the browser
    if (!WebGL.hasBrowserSupport()) {
        $.notify("WebGl is not supported by your browser.", "warning")
        return
    }
    
    if (!Audio.hasBrowserSupport()) {
        $.notify("Audio API is not supported by your browser.", "warning")
        return
    } 

    // initiate app
    app = new App()

    // start rendering loop
    render()

    $.notify("App finished loading. Drag and drop an audio source into the window.", "success")

    // console log to output the html for validation:
    // console.log($("html").html())
});

// rendering loop
function render() {
    // console.log("Render")
    requestAnimationFrame(render)

    // do not update audio rendering when audio is paused -> the user can study the last generated image
    let audio = document.getElementById('audio')
    if (audio !== null && !audio.paused) {
        app.audio.render()
    }
    app.webGL.renderer.render(app.webGL.scene, app.webGL.camera)

    // console log to output the html for validation. This will slow down the App very quickly!
    // console.log($("html").html())
}

// Class App - holds instances of our Three.js-Wrapper and our Audio-API-Wrapper. Also sets up the UI
class App {

    constructor() {

        // setup gui controlls
        var GuiControlls = function() {
            this.R = 150
            this.G = 114
            this.B = 150
            this.fftExponent = 11
            this.drawType = "waves"
            this.drawWaves = true
            this.drawBars = false 
            this.drawCircle = false
            this.drawSpiral = false
            this.waveLine = true            // draw types for waveform
            this.wavePoints = false
            this.spiralMinRadius = 1
            this.spiralMaxRadius = 3
            this.spiralNumCircles = 3
            this.spiralRotationSpeed = 5
            this.spiralPointDamping = 5     // how far the points are jumping depending on the waveform-input
            this.circleRadius = 3
        }
        var controll = new GuiControlls()

        this.webGL = new WebGL()
        this.audio = new Audio(this.webGL, controll)

        this.gui = new dat.GUI({ autoplace: false })
        this.gui.domElement.id = 'gui'   // allow to adapt our own positioning

        // color controlls
        var colorFolder = this.gui.addFolder('Colors')
        colorFolder.add(controll, 'R', 0, 255).name('Red').step(1)
        colorFolder.add(controll, 'G', 0, 255).name('Green').step(1)
        colorFolder.add(controll, 'B', 0, 255).name('Blue').step(1)
        colorFolder.open()
        
        // form controlls
        var drawFolder = this.gui.addFolder('Draw types')
        drawFolder.add(controll, 'drawWaves').name('Audio wave').listen().onChange( () => {
            this.audio.resetWaveform()
        })
        drawFolder.add(controll, 'drawBars').name('Frequency bar').listen().onChange( () => {
            // sprialFolder.close()
        })
        drawFolder.add(controll, 'drawCircle').name('Animated Circle').listen().onChange( () => {
            this.audio.resetCircle()
            circleFolder.open()
        })
        drawFolder.add(controll, 'drawSpiral').name('Animated Spiral').listen().onChange( () => {
            this.audio.resetSpiral()
            sprialFolder.open()
        })
        drawFolder.open()

        // waveform controls
        var waveFolder = this.gui.addFolder('Waveform settings')
        waveFolder.add(controll, 'waveLine').name('Line')
        waveFolder.add(controll, 'wavePoints').name('Point Cloud').listen().onChange( () => {
            this.audio.resetWaveform()
        })
        waveFolder.open()

        // circle controls
        var circleFolder = this.gui.addFolder('Circle settings')
        circleFolder.add(controll, 'circleRadius', 1, 6).name("radius").step(0.2)

        // spiral controlls
        var sprialFolder = this.gui.addFolder('Spiral settings')
        sprialFolder.add(controll, 'spiralMinRadius', 0.1, 3).name('inner radius').step(0.1)
        sprialFolder.add(controll, 'spiralMaxRadius', 1, 6).name('outer radius').step(0.1)
        sprialFolder.add(controll, 'spiralNumCircles', 1, 10).name('circles').step(1)
        sprialFolder.add(controll, "spiralRotationSpeed", 0, 10).name('rotation speed').step(1)
        sprialFolder.add(controll, "spiralPointDamping", 0, 10).name('points jumping distance').step(1)

        // TODO: Open and close sub-menus for circle and spiral: Adjust point size, blending, ...

        /* It seems we can not change the fft once the analyser it set up
        this.gui.add(controll, 'fftExponent', 1, 14)
            .name('FFT Exponent')
            .step(1)
            .listen().onChange(function() {
                resetAnalyser(controll.fftExponent)  // ERROR: resetAnalyser undefined ...
        })
        */

        // test
        let positions = [
            new THREE.Vector2(1,1),
            new THREE.Vector2(1.3,1.3),
            new THREE.Vector2(1.6,1.6)
        ]
        
       // this.webGL.drawSprites(0xff0000ff, 2, positions)

        this.webGL.drawLine("green", { x: -5, y: -5 }, { x: 5, y: -5 })

        // TEST: Lights -> do not work with three.PointMaterial :(
        var light = new THREE.PointLight( 0xff0000, 1, 100 );
        light.position.set( 0, 0, 3 );
        this.webGL.scene.add( light );
        // this.webGL.drawRectangle("green", { x: -2, y: -2}, { x: 2, y: 2})
        // this.webGL.drawCircle("blue", 0.2, { x: 2, y: 2 })
    }

    resetAnalyser(fftExponent) {
        this.audio.resetAnalyser(controll.fftExponent)
    }
}
