
var canvas, ctx;
var backgroundImage;
var iBgShiftX = 100;

var dragon, enemy = null;
var balls = [];
var enemies = [];

var dragonW = 75;
var dragonH = 70;
var iSprPos = 0; 
var iSprDir = 0; // initial dragon direction
var iEnemyW = 128; // enemy width
var iEnemyH = 128; // enemy height
var iBallSpeed = 10; // initial ball speed
var iEnemySpeed = 2; // initial enemy speed

var dragonSound; // dragon sound
var wingsSound; // wings sound
var explodeSound, explodeSound2; // explode sounds
var laughtSound; // wings sound

var bMouseDown = false; // mouse down state
var iLastMouseX = 0;
var iLastMouseY = 0;
var iScore = 0;
// -------------------------------------------------------------

// objects :
function Dragon(x, y, w, h, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image;
    this.bDrag = false;
}
function Ball(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
function Enemy(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
// -------------------------------------------------------------
// get random number between X and Y
function getRand(x, y) {
    return Math.floor(Math.random()*y)+x;
}

// draw functions :
function drawScene() { // main drawScene function
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

    // draw background
    iBgShiftX += 4;
    if (iBgShiftX >= 800) {
        iBgShiftX = 0;
    }
    ctx.drawImage(backgroundImage, 0 + iBgShiftX, 0, 1900, 900, 0, 0, 2000, 600);

    // in case of mouse down - move dragon more close to our mouse
    if (bMouseDown) {
        if (iLastMouseX > dragon.x) {
            dragon.x += 5;
        }
        if (iLastMouseY > dragon.y) {
            dragon.y += 5;
        }
        if (iLastMouseX < dragon.x) {
            dragon.x -= 5;
        }
        if (iLastMouseY < dragon.y) {
            dragon.y -= 5;
        }
    }

    // draw dragon
    ctx.drawImage(dragon.image, dragon.x - dragon.w/2, dragon.y - dragon.h/2, dragon.w, dragon.h);

    // draw fireballs
    if (balls.length > 0) {
        for (var key in balls) {
            if (balls[key] != undefined) {
                ctx.drawImage(balls[key].image, balls[key].x, balls[key].y);
                balls[key].x += balls[key].speed;

                if (balls[key].x > canvas.width) {
                    delete balls[key];
                }
            }
        }
    }

    // draw enemies
    if (enemies.length > 0) {
        for (var ekey in enemies) {
            if (enemies[ekey] != undefined) {
                ctx.drawImage(enemies[ekey].image, enemies[ekey].x, enemies[ekey].y);
                enemies[ekey].x += enemies[ekey].speed;

                if (enemies[ekey].x < - iEnemyW) {
                    delete enemies[ekey];

                    // play laught sound
                    laughtSound.currentTime = 0;
                    laughtSound.play();
                }
            }
        }
    }

    // collision detection
    if (balls.length > 0) {
        for (var key in balls) {
            if (balls[key] != undefined) {

                if (enemies.length > 0) {
                    for (var ekey in enemies) {
                        if (enemies[ekey] != undefined && balls[key] != undefined) {
                            if (balls[key].x + balls[key].w > enemies[ekey].x && balls[key].y + balls[key].h > enemies[ekey].y && balls[key].y < enemies[ekey].y + enemies[ekey].h) {
                                delete enemies[ekey];
                                delete balls[key];
                                iScore++;

                                // play explode sound #2
                                explodeSound2.currentTime = 0;
                                explodeSound2.play();
                            }
                        }
                    }
                }
            }
        }
    }

    // draw score
    ctx.font = '16px Verdana';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + iScore * 10, 900, 580);
    ctx.fillText('Please click "1" to cast fireball', 100, 580);

}

// -------------------------------------------------------------

// initialization
$(function(){
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;

    // load background image
    backgroundImage = new Image();
    backgroundImage.src = 'images/skyrim.jpg';
    backgroundImage.onload = function() {
    }
    backgroundImage.onerror = function() {
        console.log('Error loading the background image.');
    }

    // 'Dragon' music init
    dragonSound = new Audio('media/dragon.wav');
    dragonSound.volume = 0.9;

    // 'Laught' music init
    laughtSound = new Audio('media/laught.wav');
    laughtSound.volume = 0.9;

    // 'Explode' music inits
    explodeSound = new Audio('media/explode1.wav');
    explodeSound.volume = 0.9;
    explodeSound2 = new Audio('media/explosion.wav');
    explodeSound2.volume = 0.9;

    // 'Wings' music init
    wingsSound = new Audio('media/wings.wav');
    wingsSound.volume = 0.9;
    wingsSound.addEventListener('ended', function() { // loop wings sound
        this.currentTime = 0;
        this.play();
    }, false);
    wingsSound.play();

    // 呼叫攻擊物件
    var oBallImage = new Image();
    oBallImage.src = 'images/fireball.png';
    oBallImage.onload = function() { }

    // 呼叫敵人物件
    var oEnemyImage = new Image();
    oEnemyImage.src = 'images/enemy.png';
    oEnemyImage.onload = function() { }

    // 呼叫玩家物件
    var oDragonImage = new Image();
    oDragonImage.src = 'images/dragon.gif';
    oDragonImage.onload = function() {
        dragon = new Dragon(400, 300, dragonW, dragonH, oDragonImage);
    }

    $('#scene').mousedown(function(e) { // binding mousedown event (for dragging)
        var mouseX = e.layerX || 0;
        var mouseY = e.layerY || 0;
        if(e.originalEvent.layerX) { // changes for jquery 1.7
            mouseX = e.originalEvent.layerX;
            mouseY = e.originalEvent.layerY;
        }

        bMouseDown = true;

        if (mouseX > dragon.x- dragon.w/2 && mouseX < dragon.x- dragon.w/2 +dragon.w &&
            mouseY > dragon.y- dragon.h/2 && mouseY < dragon.y-dragon.h/2 +dragon.h) {

            dragon.bDrag = true;
            dragon.x = mouseX;
            dragon.y = mouseY;
        }
    });

    $('#scene').mousemove(function(e) { // 滑鼠事件
        var mouseX = e.layerX || 0;
        var mouseY = e.layerY || 0;
        if(e.originalEvent.layerX) {
            mouseX = e.originalEvent.layerX;
            mouseY = e.originalEvent.layerY;
        }

        // 記錄物件最後座標
        iLastMouseX = mouseX;
        iLastMouseY = mouseY;

        // 物件跟隨滑鼠移動
        if (dragon.bDrag) {
            dragon.x = mouseX;
            dragon.y = mouseY;
        }

   
    });

    $('#scene').mouseup(function(e) { // binding mouseup event
        dragon.bDrag = false;
        bMouseDown = false;

        // play dragon sound
        dragonSound.currentTime = 0;
        dragonSound.play();
    });

    $(window).keydown(function(event){ // keyboard alerts
        switch (event.keyCode) {
            case 49: // '1' key
                balls.push(new Ball(dragon.x, dragon.y, 32, 32, iBallSpeed, oBallImage));

                // play explode sound #1
                explodeSound.currentTime = 0;
                explodeSound.play();
                break;
        }
    });

    setInterval(drawScene, 30); // loop drawScene

    // 控制敵人增加頻率
    var enTimer = null;
    function addEnemy() {
        clearInterval(enTimer);

        var randY = getRand(0, canvas.height - iEnemyH);
        enemies.push(new Enemy(canvas.width, randY, iEnemyW, iEnemyH, - iEnemySpeed, oEnemyImage));

        var interval = getRand(500, 5000);
        enTimer = setInterval(addEnemy, interval); // loop drawScene
    }
    addEnemy();
});