class Loader {
	constructor({
		contentType="blob"
				}={}){
		if(!window.fetch){
			this.req = new XMLHttpRequest();
		}

		this.contentType = contentType;
	}



	loadItem(url,contentType="blob"){
		if(window.fetch){

			let req = fetch(url,{
				headers:{
					'Content-Type':'text/plain'
				}
			});

			let content = req.then(itm => {
				switch (contentType){
					case "blob":
						return itm.blob();
						break;
					case "text":
						return itm.text();
						break;
				}
			});

			return content;

		}else{

		}


	}
}

export default Loader;