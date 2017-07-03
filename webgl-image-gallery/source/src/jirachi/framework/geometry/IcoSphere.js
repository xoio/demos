import {normalizeArray,flattenArray,addArrays,multiplyScalar} from '../../math/core'
const PHI = (1.0 / ((1.0 + Math.sqrt(5.0)) / 2.0));


export default function IcoSphere(subdivisions=2){
    let positions = [
        [-PHI, 1.0, 0.0], [PHI, 1.0, 0.0], [-PHI, -1.0, 0.0], [PHI, -1.0, 0.0],
        [0.0, -PHI, 1.0], [0.0, PHI, 1.0], [0.0, -PHI, -1.0], [0.0, PHI, -1.0],
        [1.0, 0.0, -PHI], [1.0, 0.0, PHI], [-1.0, 0.0, -PHI], [-1.0, 0.0, PHI]
    ];

    let normals = [
        [-PHI, 1.0, 0.0], [PHI, 1.0, 0.0], [-PHI, -1.0, 0.0], [PHI, -1.0, 0.0],
        [0.0, -PHI, 1.0], [0.0, PHI, 1.0], [0.0, -PHI, -1.0], [0.0, PHI, -1.0],
        [1.0, 0.0, -PHI], [1.0, 0.0, PHI], [-1.0, 0.0, -PHI], [-1.0, 0.0, PHI]
    ];

    let indices = [
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6, 11, 10, 2,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    ]


    for (var j = 0; j < subdivisions; ++j) {
        const numTriangles = indices.length / 3;
        for (var i = 0; i < numTriangles; ++i) {
            let index0 = indices[i * 3 + 0];
            let index1 = indices[i * 3 + 1];
            let index2 = indices[i * 3 + 2];

            let index3 = positions.length;
            let index4 = index3 + 1;
            let index5 = index4 + 1;

            indices[i * 3 + 1] = index3;
            indices[i * 3 + 2] = index5;

            // add new triangles
            indices[i * 3 + 1] = index3;
            indices[i * 3 + 2] = index5;

            indices.push( index3 );
            indices.push( index1 );
            indices.push( index4 );
            indices.push( index5 );
            indices.push( index3 );
            indices.push( index4 );

            indices.push( index5 );
            indices.push( index4 );
            indices.push( index2 );

            // add new positions
            positions.push( multiplyScalar(addArrays(positions[index0],positions[index1]),0.5) );
            positions.push( multiplyScalar(addArrays(positions[index1],positions[index2]),0.5) );
            positions.push( multiplyScalar(addArrays(positions[index2],positions[index0]) ,0.5));

            // add new normals
            normals.push( multiplyScalar(addArrays(normals[index0], normals[index1]) ,0.5));
            normals.push( multiplyScalar(addArrays(normals[index1], normals[index2]) ,0.5));
            normals.push( multiplyScalar(addArrays(normals[index2], normals[index0]), 0.5) );

        }
    }

    let uvs = Array(normals.length).fill(0).map(() => {
        return [0,0];
    });

    positions = positions.map(itm => {
        return normalizeArray(itm);
    });
    normals = normals.map(itm => {
        return normalizeArray(itm);
    })

    for(var i = 0; i < normals.length;++i){
        let normal = normals[i];
        uvs[i][0] = 0.5 - 0.5 * Math.atan(normal[0],-normal[2]) / M_PI;
        uvs[i][1] = 1.0 - Math.acos(normal[1]) / M_PI;
    }

    function addVertex(i,uv){
        let index = indices[i];
        indices[i] = positions.length;
        positions.push(positions[index]);
        normals.push(normals[index]);
        uvs.push(uv);
    }

    let numTriangles = indices.length / 3;
    for(var i = 0; i < numTriangles; ++i){
        let uv0 = uvs[indices[i * 3 + 0]];
        let uv1 = uvs[indices[i * 3 + 1]];
        let uv2 = uvs[indices[i * 3 + 2]];

        let d1 = uv1[0] - uv0[0];
        let d2 = uv2[0] - uv0[0];
        if(Math.abs(d1) > 0.5 && Math.abs(d2) > 0.5){
            addVertex(i * 3 + 0,addArrays(uv0,[ (d1 > 0.0) ? 1.0 : -1.0, 0.0 ] ))
        }else if(Math.abs(d1) > 0.5){
            addVertex( i * 3 + 1, addArrays(uv1,[ (d1 < 0.0) ? 1.0 : -1.0, 0.0 ]));
        } else if (Math.abs(d2) > 0.5){
            addVertex( i * 3 + 2, addArrays(uv2,[ (d2 < 0.0) ? 1.0 : -1.0, 0.0 ]));
        }
    }

    return {
        vertices:positions,
        normals:normals,
        uvs:uvs,
        indices:indices,
        numVertices:positions.length,
        numIndices:indices.length
    }
}