// player - is the Player that the dialog is open for
// bLeft - Whether to put the player icon on the left (true) or right (false)
// onClose - function(action) called when dialog is closed
function ChoiceDialog(player, bLeft, onClose) {
	DialogBox.call(this, player, bLeft, onClose, 175);

	this.surface.inputEnabled = false;
	this.choiceList = [];

	currentChoiceDialog = this;
}

ChoiceDialog.prototype = Object.create(DialogBox.prototype);
ChoiceDialog.prototype.constructor = ChoiceDialog;

// Extends DialogBox::close
ChoiceDialog.prototype.close = function() {
	this.clearChoices();
	currentChoiceDialog = null;
	this.clearDialog();
}

ChoiceDialog.prototype.setupWindow = function() {
	DialogBox.prototype.setupWindow.call(this);

	var startX = this.icon.x;
	var startY = this.icon.y + iconGenerator.iconHeight + 5;
	
	this.apSurface = game.add.graphics(0, 0);
	this.surface.addChild(this.apSurface);
	this.apSurface.x = startX;
	this.apSurface.y = startY;

	this.drawAPBar(0);
}

ChoiceDialog.prototype.drawAPBar = function(subtract) {
	var totalWidth = iconGenerator.iconWidth;
	var height = 15;
	var showAPAmount = this.player.getAP() - subtract;
	var fullAPWidth = (totalWidth - 2) * (this.player.getAP() / this.player.getMaxAP());
	var apWidth = (totalWidth - 2) * (showAPAmount / this.player.getMaxAP());

	this.apSurface.beginFill(0x444444, 1);
	this.apSurface.drawRect(0, 0, totalWidth, height);
	this.apSurface.endFill();

	this.apSurface.beginFill(0x00ff00, 1);
	this.apSurface.drawRect(1, 1, apWidth, height - 2);
	this.apSurface.endFill();

	if (subtract > 0) {
		this.apSurface.beginFill(0xff0000, 1);
		this.apSurface.drawRect(apWidth + 1, 1, fullAPWidth - apWidth, height - 2);
		this.apSurface.endFill();
	}
}

// Sets up a choice for the user. "actions" is an array of Action objects
ChoiceDialog.prototype.setupChoices = function(text, actions) {
	this.setText(text);

	var textBounds = this.textField.getBounds();
	var startY = textBounds.y + textBounds.height + 5;
	var choice;

	for (var i = 0; i < actions.length; i++) {
		choice = this.addChoice(actions[i], textBounds.x, startY);

		this.choiceList.push(choice);
		startY += 25;
	}
}

// Internal method, adds an action as a choice
// Returns the choice object
ChoiceDialog.prototype.addChoice = function(action, x, y) {
	var choice = this.createText();
	choice.setText(action.text + " (" + (action.cost * -1) + "AP)");
	choice.x = x;
	choice.y = y;

	choice.thisAction = action;

	// setup input
	choice.inputEnabled = true;
	choice.events.onInputOver.add(choiceTextOnInputOver, choice);
	choice.events.onInputOut.add(choiceTextOnInputOut, choice);
	choice.events.onInputUp.add(choiceTextOnInputUp, choice);

	return choice;
}

// Removes all choices
ChoiceDialog.prototype.clearChoices = function() {
	for (var i = 0; i < this.choiceList.length; i++) {
		this.surface.removeChild(this.choiceList[i]);
	}
}

function choiceTextOnInputOver(event) {
	this.fill = "#ffff00";
	currentChoiceDialog.drawAPBar(this.thisAction.getCost());
}

function choiceTextOnInputOut(event) {
	this.fill = "#ffffff";	
	currentChoiceDialog.drawAPBar(0);
}

function choiceTextOnInputUp(event) {
	this.fill = "#ffffff";	
	currentChoiceDialog.close();

	if (dialogCloseCallback != null) {
		dialogCloseCallback(this.thisAction);
	}
}

var currentChoiceDialog = null;