/**
 * Returns an array of common uniform locations that might
 * need to be looked up.
 * @returns {[string,string,string,string]}
 */
export function defaultUniforms(){
    return [
        "projectionMatrix",
        "modelMatrix",
        "modelViewMatrix",
        "normalMatrix",
        "viewMatrix",
        "time",
        "uTime"
    ]
}


/**
 * Binds a Uniform Buffer Object
 * @param gl {WebGLRenderingContext} the gl context
 * @param loc {Int} the uniform location of the UBO variable in a shader
 */
export function bindUBO(gl,loc){
    gl.bindBuffer(gl.UNIFORM_BUFFER,loc);
}

/**
 * Unbinds all currently bound UBOs
 * @param gl {WebGLRenderingContext} The associated WebGL context.
 */
export function unbindUBO(gl){
    gl.bindBuffer(gl.UNIFORM_BUFFER,null);
}