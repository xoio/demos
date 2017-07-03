window.jraDebug = false;
window.toggleDebug = function(){
    window.jraDebug = !window.jraDebug;
}


/**
 * Checks the context to ensure it has the desired extension enabled
 * @param ctx {WebGLRenderingContext} the webgl context to check
 * @param extension {String} the name of the extension to look for
 */
export function checkExtension(ctx,extension){
    if(ctx.getExtension(extension)){
        return true;
    }else{
        return false;
    }
}


/**
 * Logs an error message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function logError(message,renderImmediate=false){
    let css = "background:red;color:white; padding-left:2px; padding-right:2px;";
    if(window.jraDebug || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}


/**
 * Logs an warning message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function logWarn(message,renderImmediate){
    let css = "background:yellow;color:red; padding-left:2px; padding-right:2px;";
    if(window.jraDebug || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}


/**
 * Logs an regular message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function log(message,renderImmediate){
    let css = "background:#46A6B2;color:#296169;padding-left:2px; padding-right:2px;";
    if(window.jraDebug || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}
