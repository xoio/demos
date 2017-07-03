// future support for decorators

/**
 * Default setup of common GL based things.
 * - Ensures a context exists and warns if it doesn't.
 *
 * @param gl
 */
export function defaultSetup(gl){
    if(gl === undefined || gl === null || (!gl instanceof WebGLRenderingContext)){
        console.warn("Object requires a WebGL context");
    }else{
        this.gl = gl;
    }
}