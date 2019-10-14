
// TODO in both classes: Code in calculatePoints and update is repeating. The best case here would be an update function 
// that takes in another function as parameter which determines how to calculate each new point position in the cloud

class AnimatedCircle {
    constructor(webgl, controll) {
        this.webgl = webgl
        this.controll = controll 
        this.points = null
    }

    // puts each data point evenly on a circle
    calculatePoints(bufferLen) {

        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        let radius = this.controll.circleRadius
        var positions = Array()
        var colors = Array()
        for (var i = 0; i < bufferLen; i++) {
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            positions.push(new THREE.Vector3(x, y, 0))
            colors.push(new THREE.Color('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')'))
            angle += deltaAngle
        } 
       
        this.points = new Particle(this.webgl)
        this.points.generatePointCloud(positions, colors)
    }

    // three.js want us to dispose scene objects manually.
    removePoints() {
        if (this.points !== null) {
            this.points.deletePointCloud()
            this.points = null
        }
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


        // iterate over each point and translate it along the circles radius:
        let bufferLen = dataArray.length
        let deltaAngle = 2 * Math.PI / bufferLen 
        var angle = 0.0
        var baseRadius = this.controll.circleRadius

        for (var i = 0; i < bufferLen; i++) {
            let radius = baseRadius + dataArray[i] / 128.0

            // TODO: No Trigonomoetry here! Translate points!
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
           
            this.points.cloud.geometry.vertices[i].x = x
            this.points.cloud.geometry.vertices[i].y = y

            // add some randomization to the colors:
            // TODO: This has to look better ! (ie., too much white)
            let r = Math.min(255, Math.max(0, this.controll.R + Math.ceil((Math.random() - 0.5) * 20.0)))
            let g = Math.min(Math.max(0, this.controll.G + Math.ceil((Math.random() - 0.5) * 20.0)))
            let b = Math.min(Math.max(0, this.controll.B + Math.ceil((Math.random() - 0.5) * 20.0)))

            this.points.cloud.geometry.colors[i] = new THREE.Color('rgb('+r+','+g+','+b+')')
            angle += deltaAngle
        } 
        this.points.cloud.rotateOnAxis(new THREE.Vector3(0,0,1), 0.01)
        this.points.cloud.geometry.verticesNeedUpdate = true
        this.points.cloud.geometry.colorsNeedUpdate=true
    } 
}


class AnimantedSpiral {

    constructor(webgl, controll, radiusMin, radiusMax, numCircles) {
        this.webgl = webgl
        this.radiusMin = radiusMin // TODO: Not needed, we have them in controll
        this.radiusMax = radiusMax
        this.numCircles = numCircles
        this.controll = controll 
        this.points = null 
    }

    /* put each data point evenly on a spiral. */
    calculatePoints(bufferLen) {

        let deltaAngle = 2 * Math.PI / bufferLen * this.numCircles
        var angle = 0.0
        let deltaRadius = (this.radiusMax - this.radiusMin) / bufferLen
        var radius = this.radiusMin

        var positions = Array()
        var colors = Array()
        for (var i = 0; i < bufferLen; i++) {
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
            positions.push(new THREE.Vector3(x, y, 0))
            colors.push(new THREE.Color('rgb('+this.controll.R+','+this.controll.G+','+this.controll.B+')'))
            angle += deltaAngle
            radius += deltaRadius
        } 
       
        this.points = new Particle(this.webgl)
        this.points.generatePointCloud(positions, colors)
    }

    // three.js want us to dispose scene objects manually.
    removePoints() {
        if (this.points !== null) {
            this.points.deletePointCloud()
            this.points = null
        }
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
        let deltaAngle = 2 * Math.PI / bufferLen * this.controll.spiralNumCircles
        var angle = 0.0
        let deltaRadius = (this.controll.spiralMaxRadius - this.controll.spiralMinRadius) / bufferLen
        var baseRadius = this.controll.spiralMinRadius


        for (var i = 0; i < bufferLen; i++) {
            // TODO
            let v = dataArray[i]        // 0 to 255
            let addedRadius = -1.0 + (v / 125) * this.controll.spiralPointDamping / 5.0
            let radius = baseRadius + addedRadius
            // console.log(radius)
            // TODO: No Trigonomoetry here! Translate points!
            let x = radius * Math.cos(angle)
            let y = radius * Math.sin(angle)
        
            this.points.cloud.geometry.vertices[i].x = x
            this.points.cloud.geometry.vertices[i].y = y

            // add some randomization to the colors:
            // TODO: This has to look better ! (ie., too much white)
            let r = Math.min(255, Math.max(0, this.controll.R + Math.ceil((Math.random() - 0.5) * 50.0)))
            let g = Math.min(Math.max(0, this.controll.G + Math.ceil((Math.random() - 0.5) * 50.0)))
            let b = Math.min(Math.max(0, this.controll.B + Math.ceil((Math.random() - 0.5) * 50.0)))
   
            this.points.cloud.geometry.colors[i] = new THREE.Color('rgb('+r+','+g+','+b+')')
            angle += deltaAngle
            baseRadius += deltaRadius
        } 
        this.points.cloud.geometry.verticesNeedUpdate = true
        this.points.cloud.geometry.colorsNeedUpdate = true
        if (this.controll.spiralRotationSpeed > 0) {
            // TODO: Add FPS into speed
            let speed = this.controll.spiralRotationSpeed / 500
            this.points.cloud.rotateOnAxis(new THREE.Vector3(0,0,1), speed)
        }
    } 

}