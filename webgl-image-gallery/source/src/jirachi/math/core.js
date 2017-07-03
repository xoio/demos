/**
 * Flattens an nested array that is assumed to be nested with child arrays used in place of
 * an actual vector object. Note, this does not check for completeness and will automatically
 * only take the first 3 values of the child arrays
 * @param array the parent array
 * @param reSize {Number} the size of each nested array. Determines  how the array is unrolled.
 * @returns {Array}
 */
export function flattenArray(array,reSize=3){

    let fin = [];
    let len = array.length;
    for(let i = 0; i < len; ++i){
        let arr = array[i];

        if(reSize === 3){
            fin.push(arr[0],arr[1],arr[2]);
        }else{
            fin.push(arr[0],arr[1]);
        }
    }

    // map through to ensure we don't have any unknown / undefined values.
    // if so, set to 0
    fin = fin.map(itm => {
        if(itm === undefined || itm === null){
            return 0.0;
        }else{
            return itm;
        }

    })

    return fin;
}

/**
 * Does subtraction between two arrays. Assumes both arrays have 3 values each inside
 * @param array1 {Array} the array to subtract from
 * @param array2 {Array} the array to subtract
 * @returns {*[]}
 */
export function subArrays(array1,array2){

    let x1 = array1[0];
    let y1 = array1[1];
    let z1 = array1[2];

    let x2 = array2[0];
    let y2 = array2[1];
    let z2 = array2[2];
    return [x1 - x2, y1 - y2, z1 - z2];
}

export function addArrays(array1,array2){

    let x1 = array1[0];
    let y1 = array1[1];
    let z1 = array1[2];

    let x2 = array2[0];
    let y2 = array2[1];
    let z2 = array2[2];
    return [x1 + x2, y1 + y2, z1 + z2];
}

export function multiplyScalar(array1,scalar){

    let x1 = array1[0];
    let y1 = array1[1];
    let z1 = array1[2];

    return [x1 * scalar, y1 * scalar, z1 * scalar];
}
export function emptyVec2Array(count){
    return Array(count).fill(0).map(() => {
        return [0,0];
    });
}
export function emptyVec3Array(count){
    return Array(count).fill(0).map(() => {
        return [0,0,0];
    });
}

/**
 * Converts value to radians
 * @param deg a value in degrees
 */
export function toRadians(deg){
    return (deg * Math.PI) / 180;
}

/**
 * Normalizes array values
 * @param vec an array of 3 components.
 * @returns {*}
 */
export function normalizeArray(vec){
    var mag = 0
    for (var n = 0; n < vec.length; n++) {
        mag += vec[n] * vec[n]
    }
    mag = Math.sqrt(mag)

    // avoid dividing by zero
    if (mag === 0) {
        return Array.apply(null, new Array(vec.length)).map(Number.prototype.valueOf, 0)
    }

    for (var n = 0; n < vec.length; n++) {
        vec[n] /= mag
    }

    return vec
}

/**
 * Cross function.
 * @param a first "vector" / array
 * @param b second "vector" / array
 * @returns {[*,*,*]}
 */
export function cross(a,b){
    if(a.length === 3 && b.length === 3){
        let a1 = a[0];
        let a2 = a[1];
        let a3 = a[2];
        let b1 = b[0];
        let b2 = b[1];
        let b3 = b[2];

        return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1]
    }
}

/**
 * Creates an array with a range of values
 * @param from {Number} the value to start from
 * @param to {Number} the value end at.
 * @returns {Array}
 */
export function range(from,to){
    var result = [];
    var n = from;
    while (n < to) {
        result.push(n);
        n += 1;
    }
    return result;
}

/**
 * Returns a random vec3(in the form of an array)
 * @returns {*[]}
 */
export function randVec3(){
    return new Float32Array([
        Math.random(),
        Math.random(),
        Math.random()
    ]);
}

/**
 * Performs linear interpolation of a value
 * @param value the value to interpolate
 * @param min the minimum value
 * @param max the maximum value
 * @returns {number}
 */
export function lerp(value,min=0,max=1){
    return  min + (max -min) * value;
}

/**
 * Smoothly ease into values.
 * Taken from THREE.Math
 * @param x {Number} value to modify
 * @param min {Number}
 * @param max {Number}
 * @returns {number}
 */
export function smoothStep(x,min,max){
    if(x <= min) return 0;
    if(x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
}

/**
 * Returns a random float value between two numbers
 * @param min {Number} the minimum value
 * @param max {Number} the maximum value
 * @returns {number}
 */
export function randFloat(min=0,max=1){
    return min + Math.random() * (max - min + 1);
}

/**
 * Returns a random integer value between two numbers
 * @param min {Number} the minimum value
 * @param max {Number} the maximum value
 * @returns {number}
 */
export function randInt(min=0,max=1){
    return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Very simple array cloning util.
 * Note - only works with arrays who have 3 elements
 * @param arrayToClone the array to clone
 * @returns {*[]} the new array
 */
export function cloneArray(arrayToClone){
    return [
        arrayToClone[0],
        arrayToClone[1],
        arrayToClone[2]
    ]
}

/**
 * Ensures a value lies in between a min and a max
 * @param value
 * @param min
 * @param max
 * @returns {*}
 */
export function clamp(value,min,max){
    return min < max
        ? (value < min ? min : value > max ? max : value)
        : (value < max ? max : value > min ? min : value)
}

/**
 * ensures that when using an array as a 3d vector, that it actually
 * contains at max 3 components.
 * @param array the array to verify
 * @returns {*}
 */
export function isVector(array){
    // ensure 3 component vectors
    if (array.length >= 2 && array.length <= 3) {
        return array;
    }else{
        return false;
    }
}