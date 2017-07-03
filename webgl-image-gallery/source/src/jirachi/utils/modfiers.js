/**
 * Makes all faces use unique vertices.
 * Adapted from Three.js ExplodeModifier
 * @param geo
 */
import {flattenArray} from '../math/core'

// TODO destructure this so we don't have to reconstruct faces
export function explode(geo){
	let vertices = [];


	if(geo.hasOwnProperty("cells") || geo.hasOwnProperty("indices")) {
		let indices = geo.cells !== undefined ? geo.cells : geo.indices;
		let verts = geo.vertices;


		// construct faces
		let faces = [];
		for(var i = 0; i < indices.length;i += 3){
			faces.push(
				[indices[i],
				indices[i + 1],
				indices[i + 2]]
			);
		}

		for(let i = 0; i < faces.length;++i){
			let n = vertices.length;
			let face = faces[i];

			let a = face[0];
			let b = face[1];
			let c = face[2];

			let va = verts[a];
			let vb = verts[b];
			let vc = verts[c];

			vertices.push(va,vb,vc);
			face[0] = n;
			face[1] = n + 1;
			face[2] = n + 2;
		}


		return {
			vertices:flattenArray(vertices),
			indices:flattenArray(faces)
		}


	}else{
		console.warn("Explode modifier can't be used because the geometry doesn't have indices");
		return false;
	}

}