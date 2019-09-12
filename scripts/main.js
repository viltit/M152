var app;

$(document).ready(function () {

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
        var dropped = event.dataTransfer.files[0]
        // loadAudio()
    })

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

