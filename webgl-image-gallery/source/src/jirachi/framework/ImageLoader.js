import parseDDS from '../parsers/dds'
import parseHDR from '../parsers/hdr'


/**
 * Loads a DDS image
 * @param url path to the image
 * @returns {Promise} returns a Promise. Resolves with dds data in it.
 */
export function loadDDS(url){
    let req = new XMLHttpRequest();
    let responseType = "arraybuffer";
    req.open("GET",url,true);
    req.responseType = responseType;

    return new Promise((resolve,reject) => {
        req.onload = function(){
            let dds = parseDDS(req.response);
            resolve(dds);
        }

        req.onerror = function(e){
            console.log(e)
            reject(e)
        }
        req.send();
    })
}

/**
 * Loads an .hdr image
 * @param url {String} url to the image
 */
export function loadHDR(url){
    let req = new XMLHttpRequest();
    let responseType = "arraybuffer";
    req.open("GET",url,true);
    req.responseType = responseType;

    return new Promise((resolve,reject) => {

        req.onload = function(){
            let hrd = parseHDR(req.response);
            resolve(hrd);
        }

        req.onerror = function(e){
            reject(e);
        }

        req.send();
    })
}

class AssetLoader {
    constructor(images=[]){
        this.images = images;
    }

    _preFetchData(){

    }
}