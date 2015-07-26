// Displays stat information about a player
var CountHUD = function(away, home) {
	this.hudWidth = 150;
	this.hudHeight = 85;
	this.hudPositionX = 0;
	this.hudPositionY = 0;
	this.graphics = game.add.graphics(0, 0);

	this.homeScore = 0;
	this.awayScore = 0;

	this.graphics.beginFill(0xD2B48C, 1);
	this.graphics.drawRect(0, 0, this.hudWidth, this.hudHeight);
	this.graphics.endFill();

	// Teams
	var font = { font: "16px elliotsixregular", fill: "#ffffff", align: "left"};
	var fontBig = { font: "20px elliotsixregular", fill: "#ffffff", align: "left"};
	var awayTeamY = 5;
	var homeTeamY = 30;

	this.addPlainText(this.graphics, away.name.substr(0, 3), font, 5, awayTeamY);
	this.addPlainText(this.graphics, home.name.substr(0, 3), font, 5, homeTeamY);

	// Score
	this.awayScoreLabel = this.addPlainText(this.graphics, "0", font, 50, awayTeamY);
	this.homeScoreLabel = this.addPlainText(this.graphics, "0", font, 50, homeTeamY);

	// Inning
	this.inningLabel = this.addPlainText(this.graphics, " ", fontBig, 80, 10);
}

CountHUD.prototype.setPosition = function(x, y) {
	if (this.graphics != null) {
		this.graphics.x = x;
		this.graphics.y = y;
	}

	this.hudPositionX = x;
	this.hudPositionY = y;
}

// Reset for a new inning
CountHUD.prototype.resetInning = function(inning, bTop) {
	this.inningLabel.text = (bTop ? "Top" : "Bot") + " " + (inning + 1);

	this.resetCount();
}

// Reset the balls/strikes display
CountHUD.prototype.resetCount = function() {
	this.ballCount = 0;
	this.strikeCount = 0;
	this.outCount = 0;

	this.drawStrikes();
	this.drawBalls();
	this.drawOuts();
}

CountHUD.prototype.addStrike = function() {

}

CountHUD.prototype.drawStrikes = function() {

}

CountHUD.prototype.addBall = function() {

}

CountHUD.prototype.drawBalls = function() {

}

CountHUD.prototype.addOut = function() {
	this.outCount++;
	this.drawOuts();
}

CountHUD.prototype.drawOuts = function() {
	// First out
	if (this.outCount > 0) {
		this.graphics.beginFill(0xff0000);
	} else {
		this.graphics.beginFill(0x880000);
	}

	this.graphics.drawCircle(95, 45, 15);
	this.graphics.endFill();

	// Second out
	if (this.outCount > 1) {
		this.graphics.beginFill(0xff0000);
	} else {
		this.graphics.beginFill(0x880000);
	}

	this.graphics.drawCircle(115, 45, 15);
	this.graphics.endFill();
}

CountHUD.prototype.addRun = function() {

}

CountHUD.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
}