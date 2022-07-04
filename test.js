function gray(){
    var id=ctx.getImageData(0,0,c.width,c.height);
    console.log(id)
    function px(i){
        return {
            r:id.data[i],
            g:id.data[i+1],
            b:id.data[i+2],
            a:id.data[i+3]
        }
    }
    var pxArr=[[]]
    for(let i=0;i<id.width;i++){
        pxArr[i]=[]
        for(let j=0;j<id.height;j+=4){
            pxArr[i].push(px(i*id.width+j))
        }
    }

    

    return pxArr
}


function getColorIndicesForCoord(x, y, width = c.width) {
    let red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
};

var [redIndex, greenIndex, blueIndex, alphaIndex] = getColorIndicesForCoord(0,0)
