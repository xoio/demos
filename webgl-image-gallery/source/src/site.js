import {createRenderer} from './jirachi/core/gl'
import {createPerspectiveCamera,fullscreenAspectRatio,setZoom,updateAspectRatio} from './jirachi/framework/camera'
import {createTexture2d} from './jirachi/core/texture'
import ParticleSystem from './objects/ParticleSystem'
import {blobToTexture} from './utils/textures'
import Clock from './jirachi/clock'

class SceneApp {
	constructor(assets){


		// build webgl renderer
		let gl = createRenderer()
			.setFullscreen()
			.attachToScreen()

		// build camera
		let camera = createPerspectiveCamera();
		camera = setZoom(camera,-40);


		// control resizing
		window.addEventListener('resize',() => {
			camera = updateAspectRatio(camera,fullscreenAspectRatio());
		});


		// save references
		this.gl = gl;
		this.camera = camera;
		this.assets = assets;


		// turn thumbs into textures
		this._buildThumbnails().then(pkg => {
            /**
             * Small helper function to fetch all related images by
             * project name
             * @param name {String} the name of the project to look at the projectName prop for.
             * @returns {Array} an array of all of the matching items
             */
            pkg.getByProject = function(name){

                let projectItems = [];

                this.forEach(itm => {
                    if(itm.item.projectName === name){
                        projectItems.push(itm);
                    }
                });

                return projectItems;
            };


            this.assets = pkg;

            // build scene
            this._buildScene();

            // start animation
            this.animate();
        })



	}

    /**
	 * Builds the scene to display.
     * @private
     */
	_buildScene(){

		let particles = new ParticleSystem(this.gl,{
			images:this.assets
		})


        this.particles = particles;
        if(this._isMobile()){
            this.interact = new Hammer.Manager(window);
            this.interact.add(new Hammer.Pan({
                direction:Hammer.DIRECTION_ALL,
                threshold:300
            }));
            this.interact.on('pan',(e) => {
            	this.handlePan(e);
			});
        }else{
            window.addEventListener('keydown',(e) => {


                switch (e.keyCode){
                    case 38:
                    	particles.next();
                        break;

                    case 40:
                    	particles.previous();
                        break;
                }

            })
        }
	}

    /**
	 * Rough check to see if we're on a mobile device
     * @returns {boolean}
     * @private
     */
	_isMobile(){
        let string = "Android|webOS|iPhone|iPad|iPod|BlackBerry";

        if(navigator.userAgent.search(string) !== -1){
            return true;
        }else{
            return false
        }
	}

    /**
	 * Handles pan events
     * @param e
     */
	handlePan(e){

		switch (e.additionalEvent){
			case "panup":

				this.particles.next();
				break;

			case "pandown":

				this.particles.previous();
				break;
		}
	}

    /**
	 * Turns all marked images into textures
     * @returns {Promise.<*>}
     * @private
     */
	_buildThumbnails(){

		let promises = [];
		this.assets.forEach(itm => {
			promises.push(
				blobToTexture(this.gl,itm)
			)

		});

		return Promise.all(promises)
	}



	/**
	 * Animates the scene.
	 */
	animate(){
		let gl = this.gl;
		let camera = this.camera;
		let particles = this.particles;



		render();
		function render(dt){
			requestAnimationFrame(render);
			gl.clearScreen();

			particles.draw(camera);


		}
	}
}

export default SceneApp;

