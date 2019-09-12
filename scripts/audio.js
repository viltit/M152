
class Audio {
    constructor() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();    
    }

    static hasBrowserSupport() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            var testContext = new AudioContext();
            return true
        }
        catch (e) {
            console.log(e)
            return false
        }
    }

}