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

    console.log("App initialized")
});

