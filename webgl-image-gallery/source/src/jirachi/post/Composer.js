import FxPass from './FxPass'

class Composer {
    constructor(gl,input,...passes){
        this.gl = gl;
        this.passes = passes;
        this.input = input !== undefined ? input : (function(){
            console.warn("Composer instance does not have an input texture");
        })();
        this._sortPasses();
    }

    /**
     * Adds a pass to the composer.
     * TODO add in functionality to specify insertion order.
     * @param pass the FxPass object to add.
     * @param index
     */
    addPass(pass,index=null){
        this._sortPasses();
    }

    /**
     * Assigns input textures to all of the passes
     * @private
     */
    _sortPasses(){
        let passes = this.passes;
        let input = this.input;
        let index = 0;
        let finalSetup = [];
        passes.forEach((obj) => {
            if(index === 0){
                obj.input = input;
                finalSetup.push(obj);
            }else {
                obj.input = passes[index - 1].fbo.drawTexture;
                finalSetup.push(obj);
            }

            index++;
        });

        this.passes = finalSetup;

    }

    run(){
        let gl = this.gl;
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        this.passes.forEach(obj => {
            obj.runPass();
        })
    }

    getOutput(){
        let passes = this.passes;
        return passes[passes.length - 1].getOutput();
    }
}

export default Composer;