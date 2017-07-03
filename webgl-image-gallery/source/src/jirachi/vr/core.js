import mat4 from '../math/mat4'

export function createFrameData(){

    if('VRFrameData' in window){
        return new VRFrameData();
    }

}

/**
 * Largely adapted from Three.js setup, initializes VR display and sets up some useful data.
 * https://github.com/mrdoob/three.js/blob/87cd4caca11544c0914d3828b299c8939bc981b2/examples/js/controls/VRControls.js
 * @returns {*}
 */
export function initVR(){
    let vrDisplay,vrDisplays;
    let standingMatrix = mat4.create();
    let frameData = null;

    // for Rift
    let scale = 1;

    // If true will use "standing space" coordinate system where y=0 is the
    // floor and x=0, z=0 is the center of the room.
    let standing = false;

    // Distance from the users eyes to the floor in meters. Used when
    // standing=true but the VRDisplay doesn't provide stageParameters.
    let userHeight = 1.6;

    frameData = createFrameData();

    if(navigator.getVRDisplays){
        return new Promise((resolve,reject) => {

            navigator.getVRDisplays().then(displays => {

                vrDisplays = displays;

                if ( displays.length > 0 ) {

                    vrDisplay = displays[ 0 ];

                } else {

                    console.error( 'VR input not available.' );
                }

                resolve({
                    displays:vrDisplays,
                    display:vrDisplay,
                    standingMatrix:standingMatrix,
                    userHeight:userHeight,
                    frameData:frameData !== undefined ? frameData : {},
                    scale:scale,
                    standing:standing
                })

            }).catch(()=>{
                console.warn("Unable to get VR displays")
            })
        });

    }else{
        console.log("Your browser doesn't support WebVR");
        return false;
    }


}
