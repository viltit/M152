
class AnimatedCircle {
    constructor(webgl, controll, radius) {
        this.webgl = webgl
        this.controll = controll 
        this.radius = radius
        this.points = Array()
    }

    // puts each data point evenly on a circle
    calculatePoints(bufferLen) {
        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        let radius = this.radius
        var positions = Array()
        for (var i = 0; i < bufferLen; i++) {
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            positions.push(new THREE.Vector2(x, y))
            angle += deltaAngle
        } 

        // TODO: This seems bad for performance (two big array, of which one will not be needed)
        let color = new THREE.Color(this.controll.R / 255, this.controll.G / 255, this.controll.B / 255)
        this.webgl.drawSprites(color, 0.2, positions).forEach( sprite => {
            this.points.push(sprite)
        })
    }

    // three.js want us to dispose scene objects manually. We will get a memory leak if we do not do this properly!
    removePoints() {
        this.points.forEach( point => {
            this.webgl.scene.remove(point)
            point.geometry.dispose()
            point.material.dispose()
            this.webgl.scene.dispose(obj)
        })
    }

    // update all points: Move them along the circles radius according to the frequency data delivered in dataArray
    update(dataArray) {

        // check if we already have generated the points we want to move:
        if (this.points.length !== dataArray.length) {
            this.removePoints()
            this.calculatePoints(dataArray.length)
        }

        let bufferLen = dataArray.length

        // iterate over each point and translate it along the circles radius:
        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        var baseRadius = this.radius
        var positions = Array()

        for (var i = 0; i < bufferLen; i++) {
            let radius = baseRadius + dataArray[i] / 128.0
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            this.points[i].position.x = x
            this.points[i].position.y = y
            angle += deltaAngle
        }
    }
}