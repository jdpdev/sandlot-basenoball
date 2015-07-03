function Player(thisGame, playerInfo) {
	this.playerInfo = playerInfo;

	// Create icon via graphics
	this.icon = thisGame.add.graphics(0, 0);
	this.icon.beginFill(0xff00ff, 1);
	this.icon.drawRect(0, 0, 10, 20);
	this.icon.endFill();

	// ** Methods ******************************************************
	this.setPosition = function (x, y) {
		this.icon.x = x;
		this.icon.y = y;
	}
}