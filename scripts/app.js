/**
 * App.js
 * Entry point of the websites javascript. Initializes an App instance and runs it when the document is ready
 */

var app;

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
    render()

    $.notify("App finished loading. Drag and drop an audio source into the window.", "success")
});

function render() {
    console.log("Render")
    requestAnimationFrame(render)
    app.audio.render()
    app.webGL.renderer.render(app.webGL.scene, app.webGL.camera)
}

class App {

    constructor() {

        // setup gui controlls
        var GuiControlls = function() {
            this.R = 150
            this.G = 0
            this.B = 150
            this.fftExponent = 11
            this.drawType = "waves"
            this.drawWaves = true
            this.drawBars = false 
            this.drawCircle = false
        }
        var controll = new GuiControlls()

        this.webGL = new WebGL()
        this.audio = new Audio(this.webGL, controll)

        this.gui = new dat.GUI({ autoplace: false })
        this.gui.domElement.id = 'gui'   // allow to adapt our own positioning

        // color controls
        var colorFolder = this.gui.addFolder('Colors')
        colorFolder.add(controll, 'R', 0, 255).name('Red').step(1)
        colorFolder.add(controll, 'G', 0, 255).name('Green').step(1)
        colorFolder.add(controll, 'B', 0, 255).name('Blue').step(1)
        colorFolder.open()
        
        var drawFolder = this.gui.addFolder('Draw types')
        drawFolder.add(controll, 'drawWaves').name('Audio wave')
        drawFolder.add(controll, 'drawBars').name('Frequency bar')
        drawFolder.add(controll, 'drawCircle').name('Animated Circle')
        drawFolder.open()

        this.gui.add(controll, 'drawType', { Waves: 'waves', Bars: 'bars', Circle: 'circle' })
        
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
