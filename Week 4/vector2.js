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

Vector2.prototype.normalize = function(dirX, dirY)
{
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude != 0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		this.dirX *= oneOverMag;
		this.dirY *= oneOverMag
	}
}

Vector2.prototype.add = function(x, y)
{
	var a = new Vector2();
	a.set(this.x, this.y);
	
	var b = new Vector2();
	b.set(x, y);
	
	
}

