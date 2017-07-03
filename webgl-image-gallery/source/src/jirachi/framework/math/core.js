/**
 * More math helper functions that takes advantage of Ramda to create some
 * newer helper functions.
 */

import {flattenArray,normalizeArray,emptyVec3Array} from '../../libs/jirachi/math/core'
import r from './ramda'


/**
 * Randomizes the value in a array. Assumes each array has at least 2 elements and no more than 3, but
 * can also accept a regular array
 * @param amap {Array} an array of values. Can be multi-dimensional
 */
export function randomize(amap){
    return r.reduce((acc,itm) => {
        if(itm instanceof Array){
            if(itm.length === 2){
                itm[0] = Math.random();
                itm[1] = Math.random();
            }else if(itm.length === 3){
                itm[0] = Math.random();
                itm[1] = Math.random();
                itm[2] = Math.random();
            }
        }else {
            itm = Math.random();
        }

        acc.push(itm);
        return acc;
    },[],amap);
}

/**
 * Normalizes an array
 * @param amap {Array} an multi-dimensional array of values
 */
export function normalize(amap){
    return r.reduce((acc,itm) => {
        itm = normalizeArray(itm);
        acc.push(itm);
        return acc;
    },[],amap);
}

/**
 * Creates a new list of values usable as attribute data. Assumes you want to make a "vec3" which
 * in this case is simply an array of 3 values.
 * @param count{Number} the number of vec3s to create
 * @param random{Boolean} whether or not the values ought to be random or just 0. If true, values will
 * also be normalized.
 * @returns {*} the final multi-dimensional array of values.
 */
export function createList(count,random=false){
    if(!random){
        return r.compose(emptyVec3Array)(count);
    }else{
        return r.compose(normalize,randomize,emptyVec3Array)(count);
    }
}


/**
 * Passthrough to the flattenArray function
 * @param map an array of items that are arrays ie [[0,1,2]]
 * @returns {Array} returns the unrolled array ie [0,1,2]
 */
export function unrollMap(map) {
    return flattenArray(map);
}

export function compose(...funcs){
}