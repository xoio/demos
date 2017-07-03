

// based on design of THREE.CLOCK
// https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
// delta time is global though to be more easily accessible

class Clock {
    static create(){
        window.DELTA_START = 0;
        window.DELTA_OLD = 0;
        window.DELTA_ELAPSED = 0;
    }

    static start(){
        if('performance' in window){
            DELTA_START = performance.now();
        }else{
            DELTA_START = Date.now();
        }

        DELTA_OLD = DELTA_START;
        DELTA_ELAPSED = 0;
    }

    static getDelta(){

        let current = 0;
        if('performance' in window){
            current = performance.now();
        }else{
            current = Date.now();
        }

        let diff = (current - DELTA_OLD) / 1000;
        DELTA_OLD = current;
        DELTA_ELAPSED += diff;

        return diff;
    }
}

export default Clock;