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
});

function render() {
    console.log("Render")
    requestAnimationFrame(render)
    app.audio.render()
    app.webGL.renderer.render(app.webGL.scene, app.webGL.camera)
}

class App {

    constructor() {
        this.messageBox = new MessageBox(4)
        this.webGL = new WebGL(this.messageBox)
        this.audio = new Audio(this.webGL, this.messageBox)

        // test
        this.webGL.drawLine("red", { x: -5, y: -5 }, { x: 5, y: 5 })
        this.webGL.drawRectangle("green", { x: -2, y: -2}, { x: 2, y: 2})
        this.webGL.drawCircle("blue", 0.2, { x: 2, y: 2 })
    }
}
