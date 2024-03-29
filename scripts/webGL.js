

class WebGL {
    constructor() {
        this.scene = new THREE.Scene()  
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        this.camera.position.x = 0
        this.camera.position.y = 0
        this.camera.position.z = 13
        this.circleTexture = null
        this.camera.lookAt(this.scene.position)
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setClearColor(0x000000, 1.0)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // TEST: Lights
        const color = 0xff0000;
        const intensity = 0.4;
        const light1 = new THREE.AmbientLight(color, intensity);
        this.scene.add(light1);
        document.body.appendChild(this.renderer.domElement)
    }

    static hasBrowserSupport() {
        var testCanvas = document.createElement("canvas")

        // try to create a gl context - if we fail, we have no support
        try {
            let gl = testCanvas.getContext("webgl")
        }
        catch (e) {
            // try exerimental if we fail
            try {
                let gl = testCanvas.getContext("experimental-webgl")
            }
            catch (e) {
                return false;
            }
        }
        return true;
    }

    resize() {
        if (this.camera === null || this.scene === null) {
            return
        }

        // I was not able to do everything nice for smartphone in portrait orientation -> ask the user to use landscape
        if (window.innerWidth < window.innerHeight) {
            $.notify("This app will look better if you rotate your device to landscape orientation.", "warning")
        }

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    drawLine(color, start, end) {

        var material = new THREE.LineBasicMaterial({
            color: color
        });   
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3( start.x, start.y, 0 ),
            new THREE.Vector3( end.x, end.y, 0 ),
        );
        
        var line = new THREE.Line( geometry, material );
        this.scene.add(line);

        return line;
    }

    drawRectangle(color, bottomLeft, topRight) {
        var material = new THREE.MeshBasicMaterial({
            color: color
        })
        let width = topRight.x - bottomLeft.x
        let height = topRight.y - bottomLeft.y
        var geometry = new THREE.PlaneGeometry( width, height, 1)
        var rectangle = new THREE.Mesh(geometry, material)
        rectangle.position.set(bottomLeft.x + width / 2.0, bottomLeft.y + height / 2.0, 0)
        this.scene.add(rectangle)
        return rectangle
    }

    // vectors is an array with { x: bottomLeft, y: top right } value-pairs
    // TODO: Remove repeating code
    drawBars(color, vectors) {

       // console.log(vectors.length)
        var geometryArray = Array()
        for (var i = 0; i < vectors.length; i++) {
            var material = new THREE.MeshBasicMaterial({
                color: color
            })
            
            let bottomLeft = vectors[i].bottomLeft 
            let topRight = vectors[i].topRight 
            let width = topRight.x - bottomLeft.x 
            let height = topRight.y - bottomLeft.y 
            var geometry = new THREE.PlaneGeometry(width, height, 1)
            var rectangle = new THREE.Mesh(geometry, material)
            rectangle.position.set(bottomLeft.x + width / 2.0, bottomLeft.y + height / 2.0, 0)
            geometryArray.push(rectangle)
            this.scene.add(rectangle)
        }
        return geometryArray
    }

    drawCircle(color, radius, position) {
        var material = new THREE.MeshBasicMaterial({ color: color })
        var geometry = new THREE.CircleGeometry( radius, 16 )
        var circle = new THREE.Mesh(geometry, material)
        
        circle.position.set(position.x, position.y, 0)
        
        this.scene.add(circle) 
        return circle
    }

    drawLineStrip(color, vectors) {
        // console.log(vectors)
        var material = new THREE.LineBasicMaterial({
            color: color
        });

        var geometry = new THREE.Geometry();
        geometry.vertices = vectors
        var line = new THREE.Line(geometry, material)
        this.scene.add(line)
        return line
    }

    drawSprites(color, scale, positions) {
        if (this.spriteMap == null) {
            this.spriteMap = new THREE.TextureLoader().load("textures/circle.png")
        }

        // TODO: Sprite material does not support light -> switch
        var material = new THREE.SpriteMaterial( { map: this.spriteMap, color: color, opacity: 0.5, transparent: true, alphaTest: 0.5 } )
        return positions.map( position => {
            let sprite = new THREE.Sprite(material)
            this.scene.add(sprite)
            sprite.position.x = position.x
            sprite.position.y = position.y
            sprite.scale.x = scale 
            sprite.scale.y = scale
            return sprite
        })
    }


}

/* wrapper around three.js point cloud class */
class Particle {
    constructor(webgl) {
        this.webgl = webgl
        this.cloud = null
    }

    // generates the necessary three.js objects and adds them to the scene. Very similar to the update function, but the update 
    // does not generate any new three.js objects
    generatePointCloud(positions, colors) {

        let spriteMap = new THREE.TextureLoader().load("textures/circle.png")
        var material = new THREE.PointsMaterial({ map: spriteMap, size: 0.6, vertexColors: THREE.VertexColors, opacity: 0.5 })
        
        material.transparent = true 
        material.blending = THREE.AdditiveBlending

        var geometry = new THREE.Geometry();
        geometry.vertices = positions
        geometry.colors = colors

        var cloud = new THREE.Points(geometry, material);
        cloud.sizeAttenuation = true;
        cloud.sortPoints = true;

        this.webgl.scene.add(cloud)
        this.cloud = cloud
    }

    update(positions, colors) {
        this.cloud.geometry.vertices = positions
        this.cloud.geometry.verticesNeedUpdate = true
        this.cloud.geometry.colorsNeedUpdate = true
    }

    deletePointCloud() {
        this.webgl.scene.remove(this.cloud)
        this.cloud.material.dispose()
        this.cloud.geometry.dispose()
    }
}

