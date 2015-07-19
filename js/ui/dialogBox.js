// player - is the Player that the dialog is open for
// bLeft - Whether to put the player icon on the left (true) or right (false)
// onClose - function(option) called when dialog is closed
var DialogBox = function(player, bLeft, onClose, height) {
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

	this.setupWindow();
}

DialogBox.prototype.setupWindow = function() {
	this.surface.beginFill(0xD2B48C, 1);
	this.surface.drawRect(0, 0, this.windowWidth, this.windowHeight);
	this.surface.endFill();

	this.icon.x = 15;
	this.icon.y = 10;

	// Create the text
	this.textField = this.createText();
	this.textField.x = 15 + iconGenerator.iconWidth + 10;
	this.textField.y = 10;

	// Click to close
	this.surface.inputEnabled = true;
	this.surface.events.onInputUp.add(dialogBoxInputUp, this);
}

// Cleans up and closes the dialog
DialogBox.prototype.close = function() {
	this.clearDialog();
}

DialogBox.prototype.clearDialog = function() {
	this.surface.parent.removeChild(this.surface);
}

DialogBox.prototype.setY = function(y) {
	this.surface.x = 50;
	this.surface.y = y;
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