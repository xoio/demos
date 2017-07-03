import Mesh from '../framework/Mesh'
import View from '../framework/View'
import vert from '../shaders/env.vert'
import frag from '../shaders/env.frag'
import noise from '../shaders/simplex3d.glsl'
import {cross,normalizeArray,subArrays,flattenArray} from '../libs/jirachi/math/core'

// more or less a straight port from @yiwen_lin 's pseudo-cubemap
class Env extends View{
    constructor(gl,domeRadius=200.0){
        super(gl);
        this.mesh = new Mesh(gl,{
            vertex:[noise,vert],
            fragment:frag
        });

        this.domeRadius= domeRadius;
        this._build();
    }

    _build(){
        const num = 60.0;
        const uvGap = 1 / num;
        let positions = [];
        let normals = [];
        let centers = [];
        let uvs = [];
        let indices = [];
        let count = 0;

        for(var j = 0; j < num; ++j){
            for(var i = 0; i < num ; ++i){
                let v0 = this._getPosition(i,j);
                let v1 = this._getPosition(i + 1,j);
                let v2 = this._getPosition(i + 1,j + 1);
                let v3 = this._getPosition(i,j + 1);
                let n = this._getNormal(v0,v1,v3);
                let c = this._getCenter(v0,v2);

                positions.push(v0,v1,v2,v3);
                normals.push(n,n,n,n);
                centers.push(c,c,c,c);
                uvs.push([i / num,j / num]);
                uvs.push([i / num + uvGap, j / num])
                uvs.push([i / num + uvGap, j / num + uvGap]);
                uvs.push([i / num, j / num + uvGap])
                indices.push(count * 4 + 0);
                indices.push(count * 4 + 1);
                indices.push(count * 4 + 2);
                indices.push(count * 4 + 0);
                indices.push(count * 4 + 2);
                indices.push(count * 4 + 3);

                count++;
            }
        }
        this.mesh.addAttribute('position',flattenArray(positions));
        this.mesh.addAttribute('uvs',flattenArray(uvs));
        this.mesh.addAttribute('normals',flattenArray(normals));
        this.mesh.addAttribute('centers',flattenArray(centers));
        this.mesh.addIndices(indices);

    }

    draw(camera){
        this.mesh.draw(camera);
    }

    _getNormal(p0,p1,p2){
        let pp0 = p0;
        let pp1 = p1;
        let pp2 = p2;

        let v0 = subArrays(pp1,pp0);
        let v1 = subArrays(pp2,pp0);
        let n = cross(v1,v0);
        n = normalizeArray(n);
        return n;
    }

    _getCenter(p0,p1){
        return [
            (p0[0] + p1[0]) / 2.0,
            (p0[1] + p1[1]) / 2.0,
            (p0[2] + p1[2]) / 2.0
        ]
    }
    _getPosition(i,j){
        const num  = 60.0;
        let pos = [0, 0, 0];
        let ry = i/num * PI * 2.0;
        let rx = j/num * PI - PI/2;

        pos[1] = sin(rx) * this.domeRadius;
        let r = cos(rx) * this.domeRadius;
        pos[0] = cos(ry) * r;
        pos[2] = sin(ry) * r;

        return pos;
    }
}


export default Env;