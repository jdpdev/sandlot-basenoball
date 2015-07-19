// Displays stat information about a player
var PlayerInfoHUD = function(bLeft) {
	this.hudWidth = 150;
	this.hudHeight = 85;
	this.bLeft = bLeft;
	this.currentIcon = null;
	this.hudPositionX = 0;
	this.hudPositionY = 0;

	// 
	this.infoList = [];
	this.infoPlaceX = 0;
	this.infoPlaceY = 0;
}

PlayerInfoHUD.prototype.setPlayer = function(player) {
	if (this.surface == undefined) {
		this.surface = game.add.graphics(0, 0);
	} 

	if (this.currentIcon != null) {
		this.surface.removeChild(this.currentIcon);
	}

	this.player = player;

	this.currentIcon = player.getPortrait();
	this.surface.addChild(this.currentIcon);

	this.surface.x = this.hudPositionX;
	this.surface.y = this.hudPositionY;

	this.currentIcon.width = 75;
	this.currentIcon.height = 75;

	this.surface.beginFill(0xD2B48C, 1);

	if (this.bLeft) {
		this.currentIcon.x = 3;
		this.currentIcon.y = 3;
		this.surface.drawRect(0, 0, this.hudWidth, this.hudHeight);
		this.infoPlaceX = 80;
	} else {
		this.currentIcon.x = -78;
		this.currentIcon.y = 3;
		this.surface.drawRect(-this.hudWidth, 0, this.hudWidth, this.hudHeight);
		this.infoPlaceX = -this.hudWidth + 5;
	}	

	this.infoPlaceY = 5;
	this.surface.endFill();
}

PlayerInfoHUD.prototype.setPosition = function(x, y) {
	if (this.surface != null) {
		this.surface.x = x;
		this.surface.y = y;
	}

	this.hudPositionX = x;
	this.hudPositionY = y;
}

// Adds an info item
PlayerInfoHUD.prototype.addInfo = function(name, value, maxValue) {
	var info = game.add.graphics(0, 0);
	this.surface.addChild(info);
	this.infoList.push(info);

	// Position
	info.x = this.infoPlaceX;
	info.y = this.infoPlaceY;
	this.infoPlaceY += 26;

	// Text
	info.nameLabel = game.add.text(0, 0, "", { font: "12px Arial", fontWeight: "bold", fill: "#ffffff", align: "left" });
	info.addChild(info.nameLabel);

	this.drawInfo(info, name, value, maxValue);

	return info;
}

// Draws contents of an info
PlayerInfoHUD.prototype.drawInfo = function(info, name, value, maxValue) {
	var barWidth = 65;

	info.nameLabel.setText(name);

	// BG
	info.beginFill(0x99713c, 1);
	info.drawRect(0, 14, barWidth, 10);
	info.endFill();

	// Bar
	info.beginFill(0xffff00, 1);
	info.drawRect(0, 14, barWidth * (value / maxValue), 10);
	info.endFill();
}