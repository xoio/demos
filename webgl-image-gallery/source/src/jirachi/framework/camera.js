import mat4 from '../math/mat4'
import vec3 from '../math/vec3'

/**
 * Builds the base items needed in any Camera
 * @returns {*}
 * @constructor
 */
export function BuildCameraBase(){
    // projection matrix.
    let proj = mat4.create();

    // view matrix
    let view = mat4.create();

    // inverse of the view matrix
    let inverseView = mat4.create();

    // camera position
    let pos = vec3.create(0,0,0);

    // camera direction
    let direction = vec3.create(0,0,-1);

    // orientation
    let orientation = mat4.create();

    // up
    let up = vec3.create(0,1,0);

    // center
    let center = vec3.create();

    // eye
    let eye = vec3.create();

    return {
        type:"camera",
        position:pos,
        projection:proj,
        view:view,
        inverseView:inverseView,
        eye:eye,
        center:center,
        up:up,
        zoom:0,
        direction:direction,
        lookAt(eye,aCenter=null){
            this.eye = vec3.clone(eye);
            this.center = aCenter !== null ? vec3.clone(aCenter) : this.center;

            vec3.copy(this.position,eye);
            mat4.identity(this.view);
            mat4.lookAt(this.view,eye,this.center,this.up)
        },
        /**
         * Updates camera position
         * @param position {Array} position vector
         * @param direction {Array} direction vector
         * @param up {Array} up vector (note that it's unlikely this will change often)
         */
        update(position,direction,up){
            this.up = up;
            this.direction = direction;
            this.lookAt(position);
        },

        translate(x=1,y=1,z=1){

        },
        setProjection(mProj) {
            this.projection = mat4.clone(mProj);
        },

        setView(mView) {
            this.view = mat4.clone(mView);
        },

        getProjection(){
            return this.projection;
        },

        getView(){
            return this.view;
        },
        getInverseView(){
            mat4.identity(this.inverseView);
            return mat4.invert(this.inverseView,this.view);
        }
    }
}

export function fullscreenAspectRatio(){
    return window.innerWidth / window.innerHeight;
}

export function createOrthoCamera(left=1,right=-1,top=1,bottom=-1,near=0.1,far=100){
    let camera = BuildCameraBase();
    camera.left = left;
    camera.right = right;
    camera.top = top;
    camera.bottom = bottom;

    camera.projection = mat4.ortho(camera.projection,left,right,top,bottom,near,far);
    camera.name = "orthographic camera"
    return camera;

}

/**
 * Constructs the base for a perspective camera
 * @param fov {Number} field of view
 * @param aspect {Number} aspect ratio
 * @param near {Number} near value
 * @param far {Number} far value
 * @returns {{position, projection, view, proj, eye, center, up, lookAt, setProjection, setView}|*}
 * @constructor
 */
export function createPerspectiveCamera(fov=60.0,aspect=window.innerWidth / window.innerHeight,near=0.1,far=10000.0){
    let camera = BuildCameraBase();
    camera.lookAt([0,0,0])
    camera.fov = fov;
    camera.near = near;
    camera.far = far;
    camera.aspect = aspect;
    camera.name = "perspective camera";
    mat4.perspective(camera.projection,fov,aspect,near,far);

    // initial translation, just so we can ensure something shows up and no one thinks something's weird.
    mat4.translate(camera.view,camera.view,[0,0,-10])
    return camera;
}

export function updateAspectRatio(camera,aspect){
    camera.aspect = aspect;
	mat4.perspective(camera.projection,camera.fov,camera.aspect,camera.near,camera.far);

	return camera;
}

/**
 * Function to set camera zoom.
 * @param camera a camera object. The type property will get checked for the type "camera"
 * @param zoom the zoom level
 * @returns {*}
 */
export function setZoom(camera,zoom){
    if(camera.hasOwnProperty("type") && camera.type === "camera"){
        camera.zoom = zoom;
        camera.position = [0,0,zoom];
        camera.lookAt([0,0,0])
        mat4.translate(camera.view,camera.view,[0,0,zoom]);
    }
    return camera;
}

/**
 * Translates the camera. Assumes that the position is a 3 component vector.
 * @param camera {Object} a camera object. The type property will get checked for the type "camera"
 * @param position {Array} an array for the new position. assumed to be 3 component array at the most.
 */
export function translateCamera(camera,position){
    // ensure that position is an Array and has at least 2 components, but less than 3
    if(position instanceof Array && position.length >= 2 && position.length <= 3){
        if(camera.hasOwnProperty("type") && camera.type === "camera"){
            // if the length is more than 2, we know that we need to translate the z position as well.
            if(position.length > 2){
                // update zoom
                camera["zoom"] = position[2];
                mat4.translate(camera.view,camera.view,[...position]);
            }else {
                mat4.translate(camera.view,camera.view,[position[0],position[1],camera.zoom]);
            }
        }
    }
    return camera;
}

