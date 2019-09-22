

class WebGL {
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        this.camera.position.x = 0
        this.camera.position.y = 0
        this.camera.position.z = 13
        this.camera.lookAt(this.scene.position)
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setClearColor(0x000000, 1.0)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
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
        console.log("Resizing three.js")
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

    drawCircle(color, radius, position) {
        var material = new THREE.MeshBasicMaterial({ color: color })
        var geometry = new THREE.CircleGeometry( radius, 16 )
        var circle = new THREE.Mesh(geometry, material)
        
        circle.position.set(position.x, position.y, 0)
        
        this.scene.add(circle) 
        return circle
    }

    drawLineStrip(color, vectors) {
        console.log(vectors)
        var material = new THREE.LineBasicMaterial({
            color: color
        });

        var geometry = new THREE.Geometry();
        geometry.vertices = vectors
        var line = new THREE.Line(geometry, material)
        this.scene.add(line)
        return line
    }
}