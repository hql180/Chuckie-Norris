var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

// score
var score = 0;


// some variables to calculate the Frames Per Second (FPS - this tells us
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

// drawmap variables
// specifying how big level is
var MAP ={tw:60, th:15};
// size of tile grid
var TILE = 35;
// size of a tile in tileset
var TILESET_TILE = TILE * 2;
// number of pixels between tile images
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
// number of columns in tileset
var TILESET_COUNT_X = 14;
// rows
var TILESET_COUNT_Y = 14;


// LAYER CONSTANTS
var LAYER_COUNT = 3;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
// not drawing enemy layer because don't want to draw markers / add collision with object

var enemies = [];

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

// applying forces
// setting meter
var METER = TILE;
// exaggerated gravity
var GRAVITY = METER * 9.8 * 6;
// max horizontal speed
var MAXDX = METER * 10;
// max vertical speed
var MAXDY = METER * 15;
// acceleration
var ACCEL = MAXDX * 2;
// friction
var FRICTION = MAXDX * 6;
// large jump impulse
var JUMP = METER * 1500;

// enemy stuff
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

// gamestate constants
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

var bullets = [];

var player = new Player();
var keyboard = new Keyboard();

//sound variables
var musicBackground;
var sfxFire;

// loading tileset image for use
var tileset = document.createElement("img");
tileset.src = "tileset.png";



// COLLISION CHECKS
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 ||
		x2 + w2 < x1 ||
		y2 > y1 + h1)
		{
			return false;
		}
		return true;
}

// collision maps
var cells = []; // array to hold collision data
function initialize() 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) // initialize collision map
	{
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++)
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++)
			{
				if(level1.layers[layerIdx].data[idx] !=0) 
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1)
				{
					// setting value for cells that have no value
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
	
	// sound stuff
	musicBackground = new Howl(
	{
		urls: ["background.oog"],
		leep: true,
		buffer: true,
		volume: .5
	});
	musicBackground.play();
	
	sfxFire = new Howl(
	{
		urls: ["fireEffect.ogg"],
		buffer: true,
		volume: 1,
		onend: function() 
		{
			isSfxPlaying = false;
		}
	});
}

// checks to see if on or off screen
function cellAtPixelCoord(layer, x, y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
		return 1;
	// lets player drop off bottom of screen
	if(y>SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>=MAP.tw || ty<0)
		return 1;
	if(ty>=MAP.th)
		return 0;
	return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

var worldOffsetX = 0;
function drawMap()
{
 var startX = -1;
 var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
 var tileX = pixelToTile(player.position.x);
 var offsetX = TILE + Math.floor(player.position.x%TILE);

 startX = tileX - Math.floor(maxTiles / 2);

 if(startX < -1)
 {
	 startX = 0;
	 offsetX = 0;
 }
 if(startX > MAP.tw - maxTiles)
 {
	 startX = MAP.tw - maxTiles + 1;
	 offsetX = TILE;
 }
	worldOffsetX = startX * TILE + offsetX;
	
	for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
 {
	for( var y = 0; y < level1.layers[layerIdx].height; y++ )
 {
		var idx = y * level1.layers[layerIdx].width + startX;
		for( var x = startX; x < startX + maxTiles; x++ )
 {
			if( level1.layers[layerIdx].data[idx] != 0 )
			{
			 // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
			 // so subtract one from the tileset id to get the correct tile
			 var tileIndex = level1.layers[layerIdx].data[idx] - 1;
			 var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
			(TILESET_TILE + TILESET_SPACING);
			 var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
			(TILESET_TILE + TILESET_SPACING);
			 context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
			(x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
			}
			idx++;
			}
		}
	}
}


function gameStateSplash(deltaTime)
{
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
		gameState = STATE_GAME;
	}
}

function gameStateGame(deltaTime)
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
	// update player before drawing map
	player.update(deltaTime);
	
	drawMap();
	player.draw();
	
	// ADDING ENEMIES
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++)
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0)
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	}
		
	
	//drawing enemies
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime);
		enemies[i].draw();
	}
	
	
	
	// adding bullet x enemies collision
	
	// adding player x enemy collision
	for(var i=0; i<enemies.length; i++)
	{
		if(intersects(player.position.x, player.position.y, TILE, TILE, 
						enemies[i].x, enemies[i].y, TILE, TILE) == true)
		{
			player.alive = false;
		}
	}
		
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

function gameStateGameover(deltaTime)
{
	
}

function run()
{
	var deltaTime = getDeltaTime();
	
	switch(gameState)
	{
		case STATE_SPLASH:
			gameStateSplash(deltaTime);
		break;
		case STATE_GAME:
			gameStateGame(deltaTime);
		break;
		case STATE_GAMEOVER:
			gameStateGameover(deltaTime);
		break;
	}
}

// calling collision map initialization
// keeping out of run function to avoid disaster
initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
