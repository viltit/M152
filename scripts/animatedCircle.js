
class AnimatedCircle {
    constructor(webgl, controll, radius) {
        this.webgl = webgl
        this.controll = controll 
        this.radius = radius
        this.points = null
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
            positions.push(new THREE.Vector3(x, y, 0))
            angle += deltaAngle
        } 

        // TODO: This seems bad for performance (two big array, of which one will not be needed)
        let color = new THREE.Color(this.controll.R / 255, this.controll.G / 255, this.controll.B / 255)
       
        this.points = new Particle(this.webgl, positions, color)
        this.points.generatePointCloud()

       /* this.webgl.drawSprites(color, 0.2, positions).forEach( sprite => {
            this.points.push(sprite)
        }) */
    }

    // three.js want us to dispose scene objects manually. We will get a memory leak if we do not do this properly!
    removePoints() {
        this.points.deletePointCloud()
    }

    // update all points: Move them along the circles radius according to the frequency data delivered in dataArray
    update(dataArray) {

        // check if we already have generated the points we want to move:
        if (this.points === null) {
            this.calculatePoints(dataArray.length)
        }
/*
        // did we change the analysers sample count ?
        if (this.points.length !== dataArray.length) {
            this.removePoints()
            this.calculatePoints(dataArray.length)
        } */

        let bufferLen = dataArray.length

        // iterate over each point and translate it along the circles radius:
        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        var baseRadius = this.radius

        for (var i = 0; i < bufferLen; i++) {
            let radius = baseRadius + dataArray[i] / 128.0
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            console.log()
            this.points.cloud.geometry.vertices[i].x = x
            this.points.cloud.geometry.vertices[i].y = y
            this.points.cloud.geometry.colors[i] = new THREE.Color('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')')
            angle += deltaAngle
        } 
        this.points.cloud.geometry.verticesNeedUpdate = true
        this.points.cloud.geometry.colorsNeedUpdate=true
    } 
}


class AnimantedSpiral {

    constructor(webgl, controll, radiusMin, radiusMax, numCircles) {
        this.webgl = webgl
        this.controll = controll 
    }

}