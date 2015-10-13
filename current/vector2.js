var Vector2 = function()
{
	this.x = 0;
	this.y = 0;
};

Vector2.prototype.set = function(x, y)
{
	this.x = x;
	this.y = y;
}

Vector2.prototype.normalize = function()
{
	var length = Math.sqrt( this.x * this.x + this.y * this.y );
	{
		this.x /= length;
		this.y /= length;
	}
}

Vector2.prototype.add = function(v2)
{
	this.x += v2.x;
	this.y += v2.y;
}

Vector2.prototype.subtract = function(v2)
{
	this.x -= v2.x;
	this.y -= v2.y;
}

Vector2.prototype.multiplyScalar = function(num)
{
	this.x *= num
	this.y *= num
}

Vector2.prototype.copy = function()
{
	var a = new Vector2;
	
	a.x = this.x;
	a.y = this.y;
	
	return a;
}