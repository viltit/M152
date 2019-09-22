/**
 * App.js
 * Entry point of the websites javascript. Initializes an App instance and runs it when the document is ready
 */

var app;

$(document).ready(function () {

    $(window).resize( () => {
        app.webGL.resize()
    })

    // check if webgl and audio ai are supported by the browser
    if (!WebGL.hasBrowserSupport()) {
        alert("WebGL is not supported by your browser.")
        return
    }
    
    if (!Audio.hasBrowserSupport()) {
        alert("Audio API is not supported by your browser.")
        return
    } 

    // initiate app
    app = new App()
    console.log("Check for WebGL and Audio API OK. App initialized")
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
        this.webGL = new WebGL()
        this.audio = new Audio(this.webGL)

        // setup gui
        var GuiControlls = function() {
            this.R = 0.7;
            this.G = 0;
            this.B = 0.7;
        }
        var controll = new GuiControlls({ autoplace: false })
        this.gui = new dat.GUI()
        this.gui.domElement.id = 'gui'   // allow to adapt our own positioning

        // color controls
        var colorFolder = this.gui.addFolder('Colors');
        colorFolder.add(controll, 'R', 0, 1).name('Red').step(0.01);
        colorFolder.add(controll, 'G', 0, 1).name('Green').step(0.01);
        colorFolder.add(controll, 'B', 0, 1).name('Blue').step(0.01);
        colorFolder.open();

        // test
        this.webGL.drawLine("red", { x: -5, y: -5 }, { x: 5, y: 5 })
        this.webGL.drawRectangle("green", { x: -2, y: -2}, { x: 2, y: 2})
        this.webGL.drawCircle("blue", 0.2, { x: 2, y: 2 })
    }
}
