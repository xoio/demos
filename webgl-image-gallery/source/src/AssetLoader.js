

class AssetLoader {
    constructor(){
        this.loaded = [];
        this.queue = new createjs.LoadQueue(true);
    }

    onProgress(func){
        this.queue.on('progress',func);
        return this;
    }

    onFileComplete(func){
        if(!this.onFileCompleteBound){
            this.queue.on('fileload',func);
            this.onFileCompleteBound = true;
        }
        return this;
    }

    onComplete(func){
        if(!this.onCompleteBound){
            this.queue.on('complete',(e)=>{
                this.loaded = this.queue.getItems();


                func(this.loaded,e)
            });
            this.onCompleteBound = true;
        }
        return this;
    }





    loadManifest(manifest){
        this.queue.loadManifest(manifest);
        return this;
    }

}

export default AssetLoader;