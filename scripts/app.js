class App {

    constructor() {
        this.webGL = new WebGL()
        this.audio = new Audio()

        // test
        this.webGL.drawLine("red", { x: -10, y: -10 }, { x: 10, y: 10 })
        this.webGL.drawRectangle("green", { x: -2, y: -2}, { x: 2, y: 2})
        this.webGL.drawCircle("blue", 0.2, { x: 2, y: 2 })

        this.webGL.render()
    }
}