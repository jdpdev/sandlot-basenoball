// player - is the Player that the dialog is open for
// bLeft - Whether to put the player icon on the left (true) or right (false)
// onClose - function(option) called when dialog is closed
var DialogBox = function(player, bLeft, onClose, height, bShadowTop) {
	dialogCloseCallback = onClose;

	this.surface = game.add.graphics(0, 0);
	this.icon = player.getPortrait();
	this.player = player;

	this.surface.addChild(this.icon);

	if (height == undefined) {
		height = 150;
	}

	// Draw the frame
	this.windowWidth = game.width - 100;
	this.windowHeight = height;

	this.setupWindow(bShadowTop);
}

DialogBox.prototype.setupWindow = function(bShadowTop) {
	this.surface.beginFill(0xD2B48C, 1);
	this.surface.drawRect(0, 0, this.windowWidth, this.windowHeight);
	this.surface.endFill();
	
	// Shadow
	this.surface.beginFill(0x6e531e, 1);
	
	if (!bShadowTop) {
		this.surface.drawPolygon(
				new Phaser.Point(0, 0),
				new Phaser.Point(this.windowWidth, 0),
				new Phaser.Point(this.windowWidth - 20, -20),
				new Phaser.Point(20, -20)
			);
	} else {
		this.surface.drawPolygon(
				new Phaser.Point(0, this.windowHeight),
				new Phaser.Point(this.windowWidth, this.windowHeight),
				new Phaser.Point(this.windowWidth - 20, this.windowHeight + 20),
				new Phaser.Point(20, this.windowHeight + 20)
			);
	}
	
	this.surface.endFill();
	
	// Post
	if (!bShadowTop) {
		this.surface.beginFill(0xD2B48C, 1);
		this.surface.drawRect(this.windowWidth * 0.5 - 20, -105, 40, 100);
		this.surface.endFill();
	} else {
		this.surface.beginFill(0xD2B48C, 1);
		this.surface.drawRect(this.windowWidth * 0.5 - 20, this.windowHeight + 5, 40, 100);
		this.surface.endFill();
	}
	
	this.surface.pivot.x = this.windowWidth * 0.5;
	this.surface.pivot.y = this.windowHeight * 0.5;
	
	this.surface.rotation = -0.01; //game.rnd.realInRange(-0.02, 0.02);

	this.icon.x = 15;
	this.icon.y = 10;

	// Create the text
	this.textField = this.createText();
	this.textField.x = 15 + iconGenerator.iconWidth + 10;
	this.textField.y = 10;

	// Click to close
	this.surface.inputEnabled = true;
	this.surface.events.onInputUp.add(dialogBoxInputUp, this);

	gameState.dialogOpened(this);
}

// Cleans up and closes the dialog
DialogBox.prototype.close = function() {
	this.clearDialog();
}

DialogBox.prototype.clearDialog = function() {
	if (this.surface.parent != undefined) {
		this.surface.parent.removeChild(this.surface);
		this.surface.destroy();
		gameState.dialogClosed(this);
	}
}

DialogBox.prototype.setY = function(y) {
	this.surface.x = 50 + this.windowWidth * 0.5;
	this.surface.y = y + this.windowHeight * 0.5;
}

DialogBox.prototype.createText = function() {
	var style = { font: "20px Arial", fill: "#ffffff", align: "left" };
    var text = game.add.text(0, 0, "", style);
    text.anchor.set(0);

    this.surface.addChild(text);

    return text;
}

DialogBox.prototype.setText = function(text) {
	this.textField.setText(text);
}

function dialogBoxInputUp(event) {
	if (dialogCloseCallback != null) {
		dialogCloseCallback();
	}

	this.close();
}

var dialogCloseCallback = null;