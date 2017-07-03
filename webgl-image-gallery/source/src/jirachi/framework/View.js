import {createFBO} from '../core/fbo'
import DrawQuad from '../drawquad'

/**
 * A basic View object - essentially a FBO backed scene.
 */
class View {
    constructor(gl,{
        width=window.innerWidth,
        height=window.innerHeight,
        vertex=null,
        fragment=null,
        uniforms=[]
    }={}){
        this.gl = gl;
        this.input = null;
        this.isInComposer = false;
        this.resolution = [width,height];
        this.fbo = createFBO(gl,{
            width:width,
            height:height
        });
        this.drawQuad = new DrawQuad(gl,{
            vertex:vertex,
            fragment:fragment,
            uniforms:uniforms
        });
    }

    bindView(viewportX=0,viewportY=0){
        this.fbo.bind();
		this.gl.viewport(viewportX,viewportY,this.resolution[0],this.resolution[1])
    }

    unbindView(){
        this.fbo.unbind();
    }

    setResizeListener({
						  width=window.innerWidth,
						  height=window.innerHeight
					  }={}){


        this.resizeListenerOn = true;
        window.addEventListener('resize',() => {
            this.fbo.resize(width,height);
            this.resolution[0] = window.innerWidth;
            this.resolution[1] = window.innerHeight

            this.gl.viewport(0,0,this.resolution[0],this.resolution[1])
        })
    }

    draw(){
        this.drawQuad.drawTexture(this.fbo.getTexture());
    }
    // ============== COMPOSER RELATED FUNCTIONS =============== //
    setInput(input){
        this.isInComposer = true;
        this.input = input;
    }

	/**
     * Alternate draw func when running in Composer
	 */
	runPass(){
		let gl = this.gl;
		if(this.isInComposer){

			this.fbo.bind();
			this.gl.clearScreen();
			gl.enableAdditiveBlending();
			this.input.bind();
            this.drawQuad.drawTexture(this.input,(shader) => {
            	shader.uniform('inputTexture',0);
                shader.uniform('resolution',this.resolution);

            });
            this.input.unbind();
			this.fbo.unbind();
			gl.disableBlending();
        }
    }

	/**
     * Draws the composed layer
	 */
	drawComposedLayer(){
	    if(this.isInComposer){
			this.drawQuad.drawTexture(this.fbo.getTexture());
        }
    }

	/**
	 * Returns the FBO's texture. You usually only have to use it when doing post processing.
	 * @returns {*}
	 */
	getComposedLayer(){
		return this.fbo.getTexture();
	}

	/**
	 * Alias for the above to make things less confusing
	 * @returns {*}
	 */
	getTexture(){
		return this.fbo.getTexture();
	}
}

export default View;