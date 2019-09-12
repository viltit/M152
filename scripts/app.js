class App {

    constructor() {
        this.webGL = new WebGL()
        this.audio = new Audio()

        // test
        this.webGL.drawLine("red", { x: -10, y: -10 }, { x: 10, y: 10 })

        this.webGL.render()
    }
}