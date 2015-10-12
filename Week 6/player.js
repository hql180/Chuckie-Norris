// animation reference constants
var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_MAX = 8;
var ANIM_SHOOT_LEFT = 6;
var ANIM_SHOOT_RIGHT = 7;

// creating player create function
var Player = function()
{
	// loading sprite
	this.sprite = new Sprite("ChuckNorris.png");
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[0, 1, 2, 3, 4, 5, 6, 7]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[8, 9, 10, 11, 12]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[52, 53, 54, 55, 56, 57, 58, 59]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[60, 61, 62, 63, 64]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
			[79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93]);
			
	for(var i=0; i<ANIM_MAX; i++)
	{
		this.sprite.setAnimationOffset(i, -55, -87);
	}
	
	this.position = new Vector2();
	this.position.set(9*TILE, 0*TILE);
	
	this.width = 159;
	this.height = 163;
		
	this.velocity = new Vector2();
	
	this.falling = true;
	this.jumping = false;
	
	this.direction = LEFT;
	
	this.alive = true;
	
	// shoot timer
	this.cooldownTimer = 0;
};

Player.prototype.update = function(deltaTime)
{
	this.sprite.update(deltaTime);
	
	var left = false;
	var right = false;
	var jump = false;
	var shoot = false;
		
	// movement keyevents
	if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true) 
	{
		left = true;
		this.direction = LEFT;
		if(this.sprite.currentAnimation != ANIM_WALK_LEFT &&
			this.jumping == false && shoot == false)
			this.sprite.setAnimation(ANIM_WALK_LEFT);
	}
	else if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true)
	{
		right = true;
		this.direction = RIGHT;
		if(this.sprite.currentAnimation != ANIM_WALK_RIGHT &&
			this.jumping == false && shoot == false)
			this.sprite.setAnimation(ANIM_WALK_RIGHT);
	}
	else
	{
		if(this.jumping == false && this.falling == false && shoot == false)
		{
			if(this.direction == LEFT)
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
					this.sprite.setAnimation(ANIM_IDLE_LEFT);
			}
			else
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
					this.sprite.setAnimation(ANIM_IDLE_RIGHT);
			}
		}
	}
	// jump keyevent
	if(keyboard.isKeyDown(keyboard.KEY_UP) == true)
	{
		jump = true;
	}
	// shoot keyevent
	if(this.cooldownTimer>0)
	{
		this.cooldownTimer -= deltaTime;
	}
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
		shoot = true;
	}
	
	
	
	// checking previous velocity
	var wasleft = this.velocity.x < 0;
	var wasright = this.velocity.x > 0;
	var falling = this.falling;
	var ddx = 0; //acceleration
	var ddy = GRAVITY;
	
	if (left)
		ddx = ddx - ACCEL;
	else if (wasleft)
		ddx = ddx + FRICTION;
	
	if (right)
		ddx = ddx + ACCEL;
	else if (wasright)
		ddx = ddx - FRICTION;
	
	if (jump && !this.jumping && !falling)
	{
		ddy = ddy - JUMP;
		this.jumping = true;
		if(this.direction == LEFT)
			this.sprite.setAnimation(ANIM_JUMP_LEFT);
		else
			this.sprite.setAnimation(ANIM_JUMP_RIGHT);
	}
	if (shoot)
	{
		if(this.direction == LEFT && this.sprite.currentAnimation != ANIM_SHOOT_LEFT)
			this.sprite.setAnimation(ANIM_SHOOT_LEFT);
		else
			this.sprite.setAnimation(ANIM_SHOOT_RIGHT);
		
		sfxFire.play();
		this.cooldownTimer = 0.3;
		
		
	}
		
	// calculate the new position and velocity:
	this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
	this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);
	
	if ((wasleft && (this.velocity.x > 0)) ||
		(wasright && (this.velocity.x < 0)))
		{
			// clamp at 0 to prevent friction jiggle
			this.velocity.x = 0;
		}
	
	// collision detection
	// Our collision detection logic is greatly simplified by the fact that the player is a rectangle
	// and is exactly the same size as a single tile. So we know that the player can only ever
	// occupy 1, 2 or 4 cells.
	
	// This means we can short-circuit and avoid building a general purpose collision detection
	// engine by simply looking at the 1 to 4 cells that the player occupies:
	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x)%TILE; // true if player overlaps right
	var ny = (this.position.y)%TILE; // true if player overlaps below
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
	var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
	
	// checks for platforms above and below when player has vertical velocity
	if (this.velocity.y > 0)
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx))
		{
			// clamp position.y to prevent falling through platforms
			this.position.y = tileToPixel(ty);
			this.velocity.y = 0; 	// stops vertical velocity
			this.falling = false; 	// no longer falling
			this.jumping = false; 	// no longer jumping
			
			// figure out later
			ny = 0;					// no longer overlaps the cells below
		}
	}
	
	else if (this.velocity.y < 0)
	{
		if ((cell && !celldown) || (cellright && !celldiag && nx))
		// stops player jumping up through platforms
		{
			this.position.y = tileToPixel(ty + 1);
			this.velocity.y = 0;	// stops upward velocity
			cell = celldown;
			cellright = celldiag;
			ny = 0;
		}
		// horizontal movement
		if (this.velocity.x > 0)
		{
			if ((cellright && !cell) || (celldiag && !celldown && ny))
			{
				this.position.x = tileToPixel(tx);
				this.velocity.x = 0;	// stops x velocity
			}
		}
		else if (this.velocity.x < 0)
		{
			if ((cell && !cellright) || (celldown && !celldiag && ny))
			{
				this.position.x = tileToPixel(tx + 1);
				this.velocity.x = 0;
			}
		}
	}
}

Player.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
}


