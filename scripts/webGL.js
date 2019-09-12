

class WebGL {
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        this.camera.position.x = 15
        this.camera.position.y = 15
        this.camera.position.z = 13
        this.camera.lookAt(this.scene.position)
        this.renderer = new THREE.WebGLRenderer()
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

    render() {
        requestAnimationFrame(this.render)
        this.renderer.render(this.scene, this.camera)
    }

    resize() {
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
}