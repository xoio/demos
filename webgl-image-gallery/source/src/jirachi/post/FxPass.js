import {createFBO} from '../core/fbo'
import {createQuad} from '../quad'

// Note - this is for a single pass. Some effects may need to chain together multiple
// instances in order to look correct.

class FxPass{
    constructor(gl,fragment,{uniformMap=[],width=window.innerWidth,height=window.innerHeight,inputTexture=null}={}){
        this.gl = gl;
        this.input = inputTexture;
        this.fbo = createFBO(gl,{
            width:width,
            height:height
        })

        let defaults = [
            'resolution',
            'time'
        ]

        let mapping = [...defaults,...uniformMap]

        this.drawQuad = createQuad(gl,{
            withTexture:true,
            fragmentShader:fragment,
            uniforms:mapping
        });

        this.resolution = [width,height];

    }
    updateResolution(width,height){
        this.resolution = [width,height];
    }
    setInput(inputTexture){
        this.input = inputTexture;
    }

    runPass(){

        this.fbo.bind();
        this.gl.clearScreen();
        if(this.input !== null){
            this.input.bind();
        }
        this.drawQuad.drawWithCallback(shader => {
            shader.uniform('resolution',this.resolution);

            if(this.input !== null){
                shader.setTextureUniform('tex0',0);
            }
        })
        this.fbo.unbind();
    }

    getOutput(){
        return this.fbo;
    }


}

export default FxPass;