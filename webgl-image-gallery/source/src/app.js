import Site from './site'
import data from './data'
import AssetLoader from './AssetLoader'
if('serviceWorker' in navigator){
    loadWorker().then(() => {
        loadSite();
    });
}else{
    loadSite();
}

function loadWorker(){
	return navigator.serviceWorker.register('./service-worker.js')
		.then(reg => {
			console.log("Successful - ", reg);
		}, err => {
			console.log("unable to register - ",err);
		})
}

function loadSite(){
    new AssetLoader()
        .loadManifest(data)
        .onComplete((assets) => {

            new Site(assets)
        })
}