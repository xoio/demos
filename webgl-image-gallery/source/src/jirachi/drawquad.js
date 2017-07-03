import Mesh from './framework/Mesh'
import {loadContextConditionalShader} from './core/shader'
import vert from './shaders/quad/quad.vert'
import frag from './shaders/quad/quad.frag'
import vert1 from './shaders/quad/es1/quad.vert'
import frag1 from './shaders/quad/es1/quad.frag'


class DrawQuad extends Mesh{
	constructor(gl,{
		vertex=null,
		fragment=null,
		uniforms=[
			"inputTexture"
		]
	}={}){
		super(gl,{
			vertex:loadContextConditionalShader(gl,{
				webgl1:vertex !== null ? vertex : vert1,
				webgl2:vertex !== null ? vertex : vert
			}),
			//fragment:fragment !== null ? fragment : frag,
			fragment:loadContextConditionalShader(gl,{
				webgl1:fragment !== null ? fragment : frag1,
				webgl2:fragment !== null ? fragment : frag
			}),
			uniforms:uniforms
		});
		this.addAttribute('position',[-1, -1, -1, 4, 4, -1],2);
		this.addIndices([2,1,0]);

	}

	draw(cb=null){
		this.shader.bind();

		if(cb !== null){
			cb(this.shader);
		}
		this.vao.bind();
		this.gl.drawArrays(this.mode,0,this.numVertices);
		this.vao.unbind();
	}

	drawTexture(texture=null,cb=null){

		 this.shader.bind();

   	     if(cb !== null){
			 cb(this.shader);
       	 }
		 texture.bind();
		 this.shader.setTextureUniform('inputTexture',0);
		 this.vao.bind();
		 this.gl.drawArrays(this.mode,0,this.numVertices);
		 this.vao.unbind();
		 texture.unbind();

	}
}

export default DrawQuad;