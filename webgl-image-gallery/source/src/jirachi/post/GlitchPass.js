import FxPass from './FxPass'
import fxaa from '../shaders/glitch.glsl'
import {randFloat,randInt} from '../math/core'
import {createTexture2d} from '../core/texture'

/**
 This is a direct port from Three.js 's GlitchPass
 */
class GlitchPass extends FxPass {
    constructor(gl){
        super(gl,fxaa,{
            uniformMap:[
                'seed',
                'amount',
                'angle',
                'seed_x',
                'seed_y',
                'distortion_x',
                'distortion_y',
                'col_s',
                'tDisp',
                'byp'
            ]
        });
        this.uniforms = {
            seed:0.02,
            amount:0,
            angle:0,
            seed_x:0,
            seed_y:0,
            distortion_x:0,
            distortion_y:0,
            col_s:0,
            byp:1.0
        }
        this.tDisp = this.generateHeightMap(64);
        this.curF = 0;
        this.generateTrigger();
    }
    generateTrigger(){
        this.randX = randInt( 120, 240 );

    }

    generateHeightMap(dt_size){


        var data_arr = new Float32Array( dt_size * dt_size * 4 );
        var length = dt_size * dt_size;

        for ( var i = 0; i < length; i ++ ) {

            var val = randFloat( 0, 1 );
            data_arr[ i * 3 + 0 ] = val;
            data_arr[ i * 3 + 1 ] = val;
            data_arr[ i * 3 + 2 ] = val;
            data_arr[ i * 3 + 3 ] = 1.0;
        }

        return createTexture2d(this.gl,{
            data:data_arr,
            width:64,
            height:64,
            textureOptions: {
                type: FLOAT
            }
        });

    }

    runPass(){
        let uniforms = this.uniforms;

        this.fbo.bind();
        this.gl.clearScreen();


        if(Math.random() * 20 > 10.0){
            uniforms['byp'] = 0.0;
            uniforms["seed"] = Math.random();
        }

        if ( this.curF % this.randX == 0 ) {
            uniforms[ 'amount' ] = Math.random() / 2;
            uniforms[ 'angle' ] = randFloat( - Math.PI, Math.PI );
            uniforms[ 'seed_x' ] = randFloat( - 1, 1 );
            uniforms[ 'seed_y' ] = randFloat( - 1, 1 );
            uniforms[ 'distortion_x' ] = randFloat( 0, 1 );
            uniforms[ 'distortion_y' ] = randFloat( 0, 1 );
            //uniforms["seed"] = 0.0;
            this.curF = 0;
            this.generateTrigger();

        }else if(this.curF % this.randX < this.randX / 5){
            uniforms[ 'amount' ] = Math.random() / 40;
            uniforms[ 'angle' ] = randFloat( - Math.PI, Math.PI );
            uniforms[ 'distortion_x' ] = randFloat( 0, 1 );
            uniforms[ 'distortion_y' ] = randFloat( 0, 1 );
            uniforms[ 'seed_x' ] = randFloat( - 0.3, 0.3 );
            uniforms[ 'seed_y' ] = randFloat( - 0.3, 0.3 );
            //uniforms["seed"] = Math.random();
        }else{
            uniforms['byp'] = 1.0
        }


        // scene input binds to 0
        this.input.bind();

        // displacement texture binds to 1
        this.tDisp.bind(1);
        this.drawQuad.drawWithCallback(shader => {
            shader.setTextureUniform('tex0',0);
            shader.setTextureUniform('tDisp',1);
            for(var i in uniforms){
                shader.uniform(i,uniforms[i]);
            }

        })
        uniforms['byp'] = 1.0;
        uniforms["seed"] = 0.0;
        this.fbo.unbind();

        this.curF++;
    }
}

export default GlitchPass;