import bloom from '../shaders/bloom.glsl'
import {createFBO} from '../jirachi/core/fbo'
import {createQuad} from '../jirachi/quad'
/**
 * Example of how you could do a bloom pass
 */
class BloomPass{
    constructor(gl,{width=window.innerWidth,height=window.innerHeight,inputTexture}={}){
        this.gl = gl;
        this.input = inputTexture;
        this.fbo = createFBO(gl,{
            width:width,
            height:height
        })
        this.drawQuad = createQuad(gl,{
            withTexture:true,
            fragmentShader:bloom,
            uniformMap:[
                'sample_offset',
                'tex0'
            ]
        });

    }

    runPass(){
        this.fbo.bind();
        this.gl.clearScreen();
        this.input.bind();
        this.drawQuad.drawWithCallback(shader => {
            shader.setTextureUniform('tex0',0);
            shader.uniform('sample_offset',(1.0 / window.innerWidth),0.0)
        })
        this.fbo.unbind();
    }

    getOutput(){
        return this.fbo;
    }


}

export default BloomPass;