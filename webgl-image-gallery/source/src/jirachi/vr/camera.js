import {PerspectiveCamera} from '../framework/camera'
import {createFrameData} from './core'
import mat4 from '../math/mat4'

/**
 * Creates a object representing a VR camera. Cobbled together from various parts of Three.js and webvr.info
 * @param display {WebVRDisplayO} a web vr display object
 * @param canvas {Node} a optional canvas node to help set convenience values for
 * altering the viewport for each eye.
 * @returns {*}
 */
export function createVRCamera(display,canvas=null){

    let frameData = null;
    frameData = createFrameData();

    let cameraL = PerspectiveCamera();
    let cameraR = PerspectiveCamera();

    let width = canvas !== null ?  canvas.width : window.innerWidth;
    let height = canvas !== null ? canvas.height : window.innerHeight;

    let matrixWorldInverse = mat4.create();

    // tweak dimensions as viewport changes
    window.addEventListener('resize',()=>{
        width = canvas !== null ?  canvas.width : window.innerWidth;
        height = canvas !== null ? canvas.height : window.innerHeight;

    });



    return {
        cameraL:cameraL,
        cameraR:cameraR,
        matrixWorldInverse:matrixWorldInverse,

        /**
         * Returns view and projection matrices for left eye.
         * @returns {{proj: Float32Array, view: Float32Array}}
         */
        getLeftEye(){

            display.getFrameData(frameData);
            return {
                proj:frameData.leftProjectionMatrix,
                view:frameData.leftViewMatrix,
                bounds:{
                    x:0,
                    y:0,
                    width:width * 0.5,
                    height:height
                }
            }
        },
        /**
         * Returns view and projection matrices for right eye
         * @returns {{proj: Float32Array, view: Float32Array}}
         */
        getRightEye(){
            display.getFrameData(frameData);
            return {
                proj:frameData.rightProjectionMatrix,
                view:frameData.rightViewMatrix,
                bounds:{
                    x:width * 0.5,
                    y:0,
                    width:width * 0.5,
                    height:height
                }
            }
        }
    }
}