//DEFINE CANVAS AND CONTEXT
//-------------------------------------------------------------------------
var cvs = document.getElementById('gamecvs');
//sets a variable which calls the game canvas/container
var ctx = cvs.getContext('2d');
//allows the 2d image variant to be drawn on the canvas
//--------------------------------------------------------------------------


//FRAMERATE EDITING VARIABLES
//--------------------------------------------------------------------------
lastFrameTimeMs = 0,
    maxFPS = 100,
    delta = 0,
    timestep = 1000 / maxFPS,
    framesThisSecond = 0,
    lastFpsUpdate = 0;
//--------------------------------------------------------------------------


//DEFINE GLOBAL VARIABLES
//--------------------------------------------------------------------------
const grav = 0.0025;      //sets gravitational acceleration
const jump = 0.75;       //sets instantaneous flap speed setting 
const DEGREE = Math.PI / 180;
let frames = 0;
let pace = 0.2;
const backgrounds = ['assets/back1.png', 'assets/back2.png']
let myBackground = new Image()
myBackground.src = backgrounds[0]
let bgno=0
let position = []
let hb = false;
let user = false;
let testing = false;
var arrays = [
    ['assets/up.svg', 'assets/mid.svg', 'assets/down.svg', 'assets/mid.svg', 'assets/sup.svg', 'assets/smid.svg', 'assets/sdown.svg', 'assets/smid.svg'],
    ['assets/kup.svg', 'assets/kmid.svg', 'assets/kdown.svg', 'assets/kmid.svg', 'assets/skup.svg', 'assets/skmid.svg', 'assets/skdown.svg', 'assets/skmid.svg'],
    ['assets/eup.svg', 'assets/emid.svg', 'assets/edown.svg', 'assets/emid.svg','assets/seup.svg', 'assets/semid.svg', 'assets/sedown.svg', 'assets/semid.svg'],
    ['assets/gup.svg', 'assets/gmid.svg', 'assets/gdown.svg', 'assets/gmid.svg','assets/sgup.svg', 'assets/sgmid.svg', 'assets/sgdown.svg', 'assets/sgmid.svg'],
    ['assets/pxup.svg', 'assets/pxmid.svg', 'assets/pxdown.svg', 'assets/pxmid.svg','assets/pup.svg', 'assets/pmid.svg', 'assets/pdown.svg', 'assets/pmid.svg']
];
//--------------------------------------------------------------------------


//GAME STATES
//--------------------------------------------------------------------------
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    paused: 2,
    over: 3,
}
//--------------------------------------------------------------------------

//ASYNCH EVENTLISTENERS
//--------------------------------------------------------------------------
$("#overlay").on("click", function () {
    if(state.current===3){return;}
    if (state.current === 0 || 2) { state.current = 1 }      //if in get ready stage, the game should start game on click
    if (myBird.y - myBird.radius <= 0) { return; }
    if (state.current === 1) { myBird.flap(); }

})

var down = false;
document.addEventListener('keydown', function (event) {
    if (down) return;
    if(state.current===3){return;}
    down = true;
    if (event.which === 32) {
        if (state.current === 0 || 2) { state.current = 1 }      //if in get ready stage, the game should start game on click
        if (myBird.y - myBird.radius <= 0) { return; }
        if (state.current === 1) { myBird.flap(); }
        
    }

}, false);

document.addEventListener('keyup', function (e) {
    down = false;
    if (e.which >= 48 && event.which <= 57) { myBird.animation = arrays[(parseInt(e.key) - 1) % arrays.length].map((x) => x); }
    if (e.which === 20) { hb = (hb === false) ? true : false; }
    if (e.which === 13) { user = (user === false) ? true : false; }
    if (e.which === 17) { testing = (testing === false) ? true : false; }
    if (e.which === 16) { if (state.current === 1) { state.current++ } }
    if(e.which ===18){bgno=(bgno+1)%2; myBackground.src=backgrounds[bgno]}


}, false);
//--------------------------------------------------------------------------


//BACKGROUND
//--------------------------------------------------------------------------
var bg =
{
    draw: function () {
        ctx.drawImage(myBackground, 0, 0, cvs.width, cvs.height)
    },
}
//--------------------------------------------------------------------------


//DEFINE CLASS OF BIRD
//--------------------------------------------------------------------------
class Bird {
    constructor(x, y, height) {     //CONSTRUCTOR defines (and initializes some) properties which every new bird must contain
        this.username = prompt("Please enter your name", "");
        if(!this.username){this.username="guest"}
        this.score = 0
        this.x = x                     //parameters
        this.y = y
        this.height = height
        this.width = height * 1.58333     //sets bird width so it's correct ratio to height
        this.radius = height * 0.56        //sets radius so it's correct ratio to bird size
        this.frame = 0                  //flapping animation frame init at 0
        this.speed = 0                  //velocity which combined with gravity can be used to obtain new y positions
        this.rotation = 0               //starts rotation off at 0 (These will be measured in ^^DEGREES)
        this.animation = arrays[0].map((x) => x);       //initializes array to hold frames(will be different for each bird so it's empty)
        this.sprite = new Image();        //initializes the sprite as a new image so it can be draw and its src reset

    }


    draw() {
        document.getElementById("scoreboard").innerHTML = `<b>${this.score}</b>`;
        ctx.save(); //saves position of all elments
        ctx.translate(this.x, this.y);  //translates all elements
        ctx.rotate(this.rotation);  //rotates to the updated rotation angle
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        //redraws the bird sprite while the canvas is at this angle
        if (hb === true) {  //if hitboxes have been turned on
            ctx.beginPath();    //begin defining stroke path
            ctx.arc(0 + (this.height * 0.1), 0, this.radius, 0, 2 * Math.PI); //"0" because already tanslated to bird x.  2pi radians (full circle) 
            ctx.strokeStyle = "#FF0000"; //makes the stroke red
            ctx.lineWidth = 2; //makes the outline of the hitbox slightly thicker
            ctx.stroke();   //makes the circle
        }
        if (user === true) {
            ctx.font = "bold 20px Sans-Serif";
            ctx.textAlign = "center";
            ctx.fillText(this.username.toLowerCase(), 0 + (this.height * 0.1), -this.radius - 5);
        }
        ctx.restore(); //restores all element from b4 save to original values but keeps the skewed bird :)

    }
    flap() {
        this.speed = -jump; //speed is completely reset into jump (negative because the origin is at the top), 

    }//so the current downward speed won't affect the height of the jump.
    update(delta) {  //all properties are appropriately updated based on their conditions before redrawing can occur    

        if (frames % delta == 0) this.frame++
        this.frame = this.frame % 4;

        if (state.current === 0) {
            if (frames % (delta * 2 >= 0 && delta <= 8)) { this.frame++ }
            this.frame = this.frame % 4;
            this.y = 300;
            this.rotation = 0 * DEGREE;
            this.sprite.src = this.animation[this.frame]
            return;
        }

        if (state.current === 2) {
            if (frames % (delta * 2 >= 0 && delta <= 8)) { this.frame++ }
            this.frame = this.frame % 8 + 4;
            this.rotation = 0 * DEGREE;
            this.sprite.src = this.animation[this.frame]
            return;
        }

        if (this.y + this.height / 2 >= cvs.height - fg.height) {
            if (this.speed >= 0) { this.speed = 0 }
            this.rotation = 0;
            this.frame = 2;
            this.y = cvs.height - fg.height - this.height / 2;
            this.y += this.speed * delta
            if(!testing){state.current=3}
        }
        else {
            if (this.speed < 1.5) { this.speed += grav * delta; } //velocity incremented by acceleration pixels/interval^2
            this.sprite.src = this.animation[this.frame]  //finds the current frame to hold


            this.y += this.speed * delta;   //pos is changed by the speed b/c speed holds pos y change per interval

            if (this.speed >= jump * 0.6) {
                this.rotation = 90 * DEGREE;    //has fully finished its flap arc and is now in a nosedive
                this.frame = 1;
                if (this.speed <= jump * 0.6 + 0.5) { this.rotation = 0 }
            }


            else {
                this.rotation = -25 * DEGREE;       //is currently mid flapping arc and is thus tilted upward.
                //IF TIME ALLOWS, WE CAN ADD A MORE EASED TRANSITION JUST BY CREATING A ROTATION ARRAY RATHER THAN A SINGLE VARIABLE
                //AND ADDING ANOTHER FRAMES COUNTER

            }
        }


    }
}
//--------------------------------------------------------------------------


//OBJECT PLAYER's BIRD
//--------------------------------------------------------------------------
var myBird = new Bird(100, 300, 50)
//--------------------------------------------------------------------------


//FOREGROUND
//--------------------------------------------------------------------------
var front = new Image()
front.src = 'assets/front.png'
var pause = new Image(360,360)
pause.src='assets/pause.png'
var tut = new Image
tut.src='assets/thingpixel.svg'
var fg = {
    height: cvs.height * 0.144,
    x: 0,
    y: cvs.height * 0.855,
    width: cvs.width * 2,
    draw: function () {
        ctx.drawImage(front, this.x, this.y, this.width, this.height)
        if(state.current===0)
        {   ctx.globalAlpha=0.7
            ctx.drawImage(tut, cvs.width/2-140,cvs.height/2+50,280,280)
            ctx.globalAlpha=1
        }
        if(state.current===2)
        {ctx.drawImage(pause, cvs.width/2-180,cvs.height/2-180,360,360)}
        

    },
    update: function (delta) {
        if (state.current === state.game) { this.x = (this.x - pace * delta) % 448 }
    }
}
//--------------------------------------------------------------------------
let powerups = []
const icon = ["assets/grav.png"]
const message = ["grav has changed"]
class Powerup {
    constructor(ability, y, width) {
        this.ability = ability
        this.pic = new Image()
        this.pic.src = 'assets/grav.png'
        this.msg = message[ability]
        this.x = cvs.width
        this.y = y
        this.width = width
        this.height = width
        this.radius = width / 2
    }

    update(delta) {
        if (state.current === state.game) { this.x -= pace * delta }
        if (this.x + this.width <= 0) { position.shift() }
    }

    draw() {
        ctx.drawImage(this.pic, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
    }
}

//THE PIPE CLASS
//--------------------------------------------------------------------------
let collided = false;
class Pipes {
    constructor(gap, y) {
        this.height = 720
        this.width = 110
        this.top = new Image()
        this.bottom = new Image()
        this.gap = gap                    //gap width (to be determined by a randomizer as well)
        this.top.src = 'assets/top.png'
        this.bottom.src = 'assets/bottom.png'  //sourcing the images to be used
        this.y = y;       //to be set to a rand no. by server
        this.x = cvs.width; //all new pipe objects start at the end of the canvas

    }

    draw() {
        ctx.drawImage(this.top, this.x, this.y, this.width, this.height);  //draws pipe at current x & @ the randomized y pos
        ctx.drawImage(this.bottom, this.x, this.y + this.height + this.gap, this.width, this.height);  //draws pipe w/ y relative to top pipe
    }


    update(delta) {  //all properties are appropriately updated based on their conditions before redrawing can occur       
        if (state.current === state.game) { this.x -= pace * delta; }
        // if the pipes go beyond canvas, we delete them from the array
        if (this.x + this.width <= 0) { position.shift(); collided=false;}

        //COLLISION DETECTION
        if (state.current === 1) {
            if (myBird.x + myBird.height * 0.1 + myBird.radius > this.x
                && myBird.x + myBird.height * 0.1 - myBird.radius < this.x + this.width
                && myBird.y + myBird.radius > this.y
                && myBird.y - myBird.radius < this.y + this.height) {
                   if(!collided) {console.log("Collision T");if (!testing) {state.current === 3; myBird.speed=50}collided=true;}
                
            }
            if (myBird.x + myBird.height * 0.1 + myBird.radius > this.x
                && myBird.x + myBird.height * 0.1 - myBird.radius < this.x + this.width
                && myBird.y + myBird.radius > this.y + this.height + this.gap
                && myBird.y - myBird.radius < this.y + this.height + this.gap + this.height) {
                    if(!collided) {console.log("Collision B");if (!testing) {state.current === 3; myBird.speed=50}collided=true;}
            }
        }


        //PASS DETECTION

        if (this.x + this.width === myBird.x - myBird.radius / 2) { myBird.score++; }
    }
}
//--------------------------------------------------------------------------


function drawAll() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);        //clears the entire canvas
    bg.draw()
    myBird.draw()
    for (var i = 0; i < position.length; i++) {
        position[i].draw()
    }
    fg.draw()
}

function updateAll(delta) {
    myBird.update(delta)
    fg.update(delta)
    for (var i = 0; i < position.length; i++) {
        position[i].update(delta)
    }
}

var running = false,
    started = false;

function panic() {
    delta = 0;
}

function stop() {
    myBird.score=0
    position=[]
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    running = false;
    started = false;
    collided = false;
    state.current=0;
    cancelAnimationFrame(frameID);
  
}

function start() {
    if (!started) {
        started = true;
        frameID = requestAnimationFrame(function (timestamp) {
            drawAll();
            running = true;
            lastFrameTimeMs = timestamp;
            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            frameID = requestAnimationFrame(mainLoop);
        });
    }
}

function mainLoop(timestamp) {
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        frameID = requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
        updateAll(timestep);
        if (!position[0] || position[0].x === 0) { position.push(new Pipes(Math.random() * 30 + 190, Math.random() * 350 - 690)) }
        if (!powerups[0] || position[0].x === 0) {
            powerups.push(new Powerup(Math.floor(Math.random) * icon.length, Math.random * 500 + 50, 60))
        }
        delta -= timestep;
        frames++;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
        

    }

    drawAll()
    if (state.current===3)
        {stop()}
    frameID = requestAnimationFrame(mainLoop);
}
start()
