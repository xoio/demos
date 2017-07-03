
import Mesh from '../jirachi/framework/Mesh'
import {createFBO,createFBOAttachmentFormat} from '../jirachi/core/fbo'
import {createTexture2d} from '../jirachi/core/texture'
import createPlane from './createPlane'

//shaders
import imagev from '../shaders/image.vert'
import imagef from '../shaders/image.glsl'


class ParticleSystem{
    constructor(gl,{
        imgWidth=705,
        imgHeight = 850,
        images=[],
        radius=100
    }={}){

        this.threshold = 0.3;


        this.props = {
            mix:1
        }

        // images
        this.images = images;

        // reference to context
        this.gl = gl;

        // width height for everything.
        this.width = imgWidth;
        this.height = imgHeight;

        this.numImages = images.length - 1;

        // index to keep track of so we know which images to queue up
        this.index = 0;

        // current texture to show
        this.currentTexture = this.images[this.index].texture;

        // reference to the next
        this.nextTexture = this.images[this.index].texture;

        // flag for whether or not we need to animate the transition
        this.animateTransition = false;

        // flag to indicate if we're animating or not.
        this.isAnimating = false;

        // load mix texture
        let img = new Image();
        img.src = "/img/transition.png";
        img.onload = () => {
            this.mixTexture = createTexture2d(gl,{
                data:img
            });
            this.mixTextureLoaded = true;
        };

        // radius for animation
        this.radius = radius;

        // build buffers for animation
        this._buildBuffers();

        // build mesh and buffer positions
        this._buildPositions();

        this.isAnimating = false;

    }

    /**
     * Controls tweening of one image to another.
     */
    tweenProps(){
        let self = this;
        TweenMax.to(this.props,1.0,{
            mix:0,
            onComplete(){

                self.animateTransition = false;
                self.currentTexture = self.nextTexture;
                self.props.mix = 1;
                self.isAnimating = false;
            }
        })
    }

    /**
     * Navigates to the next image
     */
    next(){
        if(!this.isAnimating){
            this.nextTexture = this.images[this.getNextImage()].texture;
            this._animateNext()
            this.isAnimating = true;
        }

        this.tweenProps();
    }

    /**
     * Navigates to the previous image
     */
    previous(){
        if(!this.isAnimating){
            this.nextTexture = this.images[this.getPreviousImage()].texture;
            this._animatePrevious()
            this.isAnimating = true;
        }
        this.tweenProps();
    }

    /**
     * Increments index counter.
     */
    _animateNext(){
        this.animateTransition = true;
        if(this.index + 1 < this.numImages){
            this.index++;
        }
    }

    /**
     * Decrements index counter.
     * @private
     */
    _animatePrevious(){
        this.animateTransition = true;

        if(this.index > 0){
            this.index -= 1;
        }
    }


    /**
     * Return the next image index based on the current index.
     * If we're at the end - return 0 so binding code still works
     * @returns {number}
     */
    getNextImage(){
       if(this.index < this.numImages){
           return this.index + 1;
       }else{
           return 0
       }
    }

    /**
     * Return the previous image index based on the current index.
     * If we're at the start - return 0 so binding code still works
     * @returns {number}
     */
    getPreviousImage(){
        if(this.index !== 0){
            return this.index;
        }else{
            return 0;
        }
    }



    draw(camera){
        let gl = this.gl;
        this.time += 0.01;


        if(this.mixTextureLoaded){


            this.currentTexture.bind();

            this.nextTexture.bind(1);
            this.mixTexture.bind(2);

            this.mesh.draw(camera,(shader)=>{

                shader.setBooleanUniform('animateTransition',this.animateTransition);
                shader.uniform("threshold",this.threshold);

                shader.setTextureUniform('currentImage',0);
                shader.setTextureUniform('nextImage',1);
                shader.setTextureUniform("mixTexture",2);

                shader.uniform('mixRatio',this.props.mix);

            });

            gl.clearTextures();
        }

    }

    /**
     * Build mesh data
     * @private
     */
    _buildPositions(){
        let gl = this.gl;
        // gonna use scaled width/height to help reduce vertex count.
        let width = this.width * 0.5;
        let height = this.height * 0.5;

        // ====== BUILD REVEAL POSITION / UVS etc ======== //
        let positions = []
        let currentPositionBuffer = [];
        let uvs = []
        let normals = []
        let cells = []
        let sx = width;
        let sy = height;
        let resolution = 1;
        let nx = width / resolution;
        let ny = height / resolution;
        for (var iy = 0; iy <= ny; iy++) {
            for (var ix = 0; ix <= nx; ix++) {
                var u = ix / nx
                var v = iy / ny

                // flip uvs so texture looks right
                u = 1.0 - u;
                v = 1.0 - v;

                var x = (ix * resolution) - (sx / 2);
                var y = (iy * resolution * -1) + (sy / 2);
                positions.push([x, y, 0])
                currentPositionBuffer.push([0,0,0])
                uvs.push([u, v])
                normals.push([0, 0, 1])
                if (iy < ny && ix < nx) {
                    cells.push([iy * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix + 1, iy * (nx + 1) + ix + 1])
                    cells.push([(iy + 1) * (nx + 1) + ix + 1, iy * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix])
                }
            }
        }

        // =========== BUILD CIRCULAR POSITIONS ========== //
        let deg2Rad = Math.PI / 180;
        let circlePositions = [];
        for(let i = 0; i < 360; ++i){
            let degInRad = i * deg2Rad;
            let x = Math.cos(degInRad) * this.radius;
            let y = Math.sin(degInRad) * this.radius;
            circlePositions.push(x,y,0);
        }

        // assign a random

        // ============= BUILD MESH =================== //
        // build renderable mesh
        let plane = createPlane(1,1);
        //   ${createTextureVariables(imagenames,"vUv")}
        let mesh = new Mesh(gl,{
            vertex:imagev,
            fragment:imagef,
            uniforms:[
                'time',
                'currentImage',
                'previousImage',
                'nextImage',
                'mixRatio',
                'threshold',
                'mixTexture',
                'endOfList',
                'beginningOfList',
                'animateTransition'
            ]
        });


        // add attributes for forming main mesh
        mesh.addAttribute('position',plane.positions);

        // add instanced attributes.
        mesh.addInstancedAttribute('ppos',positions);
        mesh.addInstancedAttribute('uv',uvs,2);

        // add indices
        mesh.addIndices(plane.cells);

        // set number of instances to draw
        // should match the number of instance positions.
        mesh.numInstances = positions.length;

        this.mesh = mesh;

    }

    /**
     * Builds buffers to bounce data between.
     * Default to fbos to maintain webgl 1 compatibility.
     * @private
     */
    _buildBuffers(){
        let gl = this.gl;


        // build texture to ping-pong
        // 0 - position
        // 1 - velocity
        // 2 - acceleration
        // 3 - scale

        let set1 = [];
        let set2 = [];
        for(let i = 0; i < 4; ++i){
            set1.push(createTexture2d(gl,{
                width:this.width,
                height:this.height,
                floatingPoint:true
            }))
            set2.push(createTexture2d(gl,{
                width:this.width,
                height:this.height,
                floatingPoint:true
            }))
        }

        this.target = createFBO(gl,{
            format:createFBOAttachmentFormat(gl,{
                textures:set1
            })
        });

        this.current = createFBO(gl,{
            format:createFBOAttachmentFormat(gl,{
                textures:set2
            })
        });

    }
}

export default ParticleSystem;
