var c = document.querySelector('canvas');
var ctx = c.getContext('2d');

/**The number of cursors to orbit the center */
var numCursors = 1;

window.addEventListener('resize', e => {
    windowResize();
});

function windowResize(){
    c.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    c.height = c.width;
}

windowResize();

/**Possible types for drawing */
const types = {
    circle: 'circle',
    square: 'square',
    line: 'line'
};
/**The type to draw with */
var curType = types.square;

/**The rate that the drawing function happens */
var interval = 10;

function rndCol(){
    function hx(){
        var ret=Number(Math.floor(Math.random()*255)).toString(16)
        if(ret.length===1)
            ret='0'+ret;
        return ret
    }
    return '#'+hx()+hx()+hx()
}

/**Used for getting global variables which are defined on the spot */
const options = {
    isRandomColor:false,
    isGlow:false,
    getNumCursors() {
        return document.getElementById('numCurs').value;
    },
    setColor() {
        if (options.isRandomColor) {
            ctx.fillStyle = rndCol();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.shadowColor = ctx.fillStyle;
        } else {
            var temp = '#'+document.getElementById('color').value;
            ctx.fillStyle = temp;
            ctx.strokeStyle = temp;
            ctx.shadowColor = temp;
        }
        if (options.isGlow && ctx.shadowBlur != 50)
            ctx.shadowBlur = 50;
        else
            ctx.shadowBlur = 0;
    },
    setLineDash() {
        let t=document.getElementById('dash').value 
        ctx.setLineDash( [t,t] )
    },
    setAll() {
        options.setColor();
        options.setLineDash();
    }
}

document.getElementsByName('types').forEach(e=>{
    e.addEventListener('change',event=>{
        if(e.checked)
            curType=types[e.id]
    })
})

function element(name, attributes) {
    var node = document.createElement(name);
    if (attributes)
        for (var attr in attributes)
            if (attributes.hasOwnProperty(attr))
                node.setAttribute(attr, attributes[attr]);
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (typeof child === 'string')
            child = document.createTextNode(child);
        node.appendChild(child);
    }
    return node;
}

function append(type, {parent = document.body,text } = {}) {
    var ele = document.createElement(type);
    ele.innerHTML = text;
    parent.appendChild(ele);
}

/**If the mouse is down */
var mouseDown = false;

/**The cursors that say where to draw */
var cursors = [];

/**The last point for the case of drawing lines */
var lineLastPoint = {x:0,y:0};

/**The brush size */
var bSize = 5;

/**Used for quick figures like a line or circle */
const cx = {
    fill: {
        circle(x, y, rad) {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        },
        cCircle(x, y, rad) {
            ctx.moveTo(x, y);
            ctx.arc(x, y, rad, 0, Math.PI * 2);
        },
        cRect(x, y, w, h) {
            ctx.rect(x, y, w, h);
        }
    },
    stroke: {
        circle(x, y, rad) {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
        }
    },
    line(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    },
    cLine(x1, y1, x2, y2) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
}

/**The current point without the offsets*/
var curP = {x:0,y:0};
/**The point of the mouse, with offsets */
var mousePoint ={x:0,y:0};

var canDraw = true;

function onMove() {
    if (document.activeElement == document.querySelector('canvas'))
        return;
    var oldP = curP;
    curP = {x:mousePoint.x - c.offsetLeft + window.scrollX,y: mousePoint.y - c.offsetTop + window.scrollY};

    if (mouseDown) {
        if (curType === types.circle || curType === types.square) {
            radialPoints(curP.x, curP.y);
        } else if (curType === types.line || curType === types.arc) {
            radialLines(curP.x, curP.y, oldP.x, oldP.y);
        }
    }
    setTimeout(onMove, interval);
}

/**Draws the points radially */
function radialPoints(startX, startY) {
    numCursors = options.getNumCursors();
    cursors = [];
    var center = {x:c.width/2,y:c.height/2}
    var change = {x:startX - center.x,y:startY-center.y};
    var angOfChange = (Math.PI * 2) / numCursors;
    
    var r = Math.hypot(change.x,change.y)

    options.setAll();
    ctx.translate(center.x,center.y);
    ctx.save()

    ctx.beginPath();
    for (let i = 0; i < numCursors; i++) {
        ctx.rotate(angOfChange);
        ctx.moveTo(0,r);

        if(curType === types.square){
            ctx.rect(change.x-bSize/2,change.y-bSize/2,bSize,bSize);
        }else if(curType===types.circle ){
            ctx.arc(change.x,change.y,bSize,0,Math.PI*2)
        }
        
    }
    ctx.fill()
    ctx.resetTransform();

    ctx.beginPath();
    /*
    cursors.forEach(c => {
        if (curType === types.square) {
            cx.fill.cRect(c.x - bSize , c.y - bSize , bSize * 2, bSize * 2);
        }else if (curType === types.circle) {
            cx.fill.cCircle(c.x, c.y, bSize);
        }
    })
    ctx.fill();
    */
}

/**Draws the lines radially */
function radialLines(startX, startY, oldX, oldY) {

    options.setAll();

    numCursors = options.getNumCursors();
    cursors = [];
    var old = [];

    var center ={x:c.width / 2,y: c.height / 2};
    var vec ={x:startX - center.x,y: startY - center.y};
    var vecOld = {x: oldX - center.x,y: oldY - center.y}
    var angOfChange = (Math.PI * 2) / numCursors;
    ctx.lineWidth = bSize;
    ctx.beginPath()
    ctx.translate(c.width/2,c.height/2);
    ctx.save();
    for (let i = 0; i < numCursors; i++) {
        ctx.rotate(angOfChange)
        if(curType === types.line)
            cx.cLine(vec.x, vec.y, vecOld.x, vecOld.y);

    }
    ctx.stroke()
    ctx.resetTransform();
}

/**Get the mouse position */
c.addEventListener('mousemove', event => {
    //event.preventDefault();
    event.stopPropagation();
    mousePoint.x = event.x;
    mousePoint.y = event.y;
});

/**Add touch support */
c.addEventListener('touchmove',event=>{
    event.stopPropagation();
    mousePoint.x = Math.round(event.changedTouches[0].clientX);
    mousePoint.y = Math.round(event.changedTouches[0].clientY);
})

/**Begin drawing at interval */
setTimeout(onMove, interval);

//Check when the mouse is down
c.addEventListener('mousedown', e => {
    clickOrTouchStart(e)
});

function clickOrTouchStart(e){
    //e.preventDefault();    
    e.stopPropagation();

    var p;
    if(e.touches){
        p=e.touches[0]
    }else{
        p=e
    }

    mousePoint={x:e.clientX,y:e.clientY}
    curP=mousePoint
    

    mouseDown = true;
}

//Touch support
c.addEventListener('touchstart', e => {
    clickOrTouchStart(e)
    
});

//Check when the mouse is up
document.addEventListener('mouseup', () => {
    mouseDown = false;
});

document.addEventListener('touchend', () => {
    mouseDown = false;
});
document.addEventListener('touchcancel',()=>{
    mouseDown = false;
})

/**Quickly clear the canvas */
function clearCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
}

/**Keybind for clearing the canvas */
document.addEventListener('keyup', (event) => {
    if (event.key === 'c')
       clearCanvas();
    if (event.key === '1')
        curType = types.circle;
    else if(event.key ==='2')
        curType = types.square;
});

function addUpAndDown(...ids){
    ids.forEach(id=>add(id));
    function add(id){
        /**@type {HTMLInputElement} */
        var ele=document.getElementById(id);
        var upBtn=document.createElement('button');
        var dwnBtn=document.createElement('button');

        upBtn.innerHTML='&uparrow;'
        upBtn.classList.add('changeBtn')
        dwnBtn.innerHTML='&downarrow;'
        dwnBtn.classList.add('changeBtn')

        upBtn.addEventListener('click',e=>{
            var val=Number(ele.value);
            var step = Number(ele.step)||1;
            val+=step;
            if(ele.max&&(val>Number(ele.max)))
                val=Number(ele.max);
            ele.value=val;
            if(typeof ele.onchange === 'function')
                ele.onchange()
        })
        dwnBtn.addEventListener('click',e=>{
            var val=Number(ele.value);
            var step = Number(ele.step)||1;
            val-=step;
            if(ele.min&&(val<Number(ele.min)))
                val=Number(ele.min);
            ele.value=val;
            if(typeof ele.onchange === 'function')
                ele.onchange()
        })
        ele.after(upBtn,dwnBtn)
    }
}
addUpAndDown('numCurs','dash','interval','width');