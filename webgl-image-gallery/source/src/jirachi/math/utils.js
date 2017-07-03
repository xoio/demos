/**
 * Assigns the values of one matrix into another.
 * @param mat1 {Array} A matrix array. Usually a TypedArray
 * @param mat2 {Array} the matrix to pass values from, usually also a TypedArray.
 */
export function assignFromMatrix(mat1,mat2){
    if(mat1.length === mat2.length){
        let mat1len = mat1.length;
        for(var i = 0; i < mat1len; ++i){
            mat1[i] = mat2[i];
        }
    }else{
        console.error("assignFromMatrix:error - mat1 and mat2 have different lengths");
    }
}