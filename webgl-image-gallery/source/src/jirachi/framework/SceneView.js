import {createFBO} from '../core/fbo'
import DrawQuad from '../drawquad'

/**
 * A basic View object - essentially a FBO backed scene.
 */
class SceneView {
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

	/**
	 * Alias for the above to make things less confusing
	 * @returns {*}
	 */
	getTexture(){
		return this.fbo.getTexture();
	}
}

export default SceneView;