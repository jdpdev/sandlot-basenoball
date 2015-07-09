// player - is the Player that the dialog is open for
// bLeft - Whether to put the player icon on the left (true) or right (false)
// onClose - function(action) called when dialog is closed
function ChoiceDialog(player, bLeft, onClose) {
	DialogBox.call(this, player, bLeft, onClose);

	this.surface.inputEnabled = false;
	this.choiceList = [];

	currentChoiceDialog = this;
}

ChoiceDialog.prototype = Object.create(DialogBox.prototype);
ChoiceDialog.prototype.constructor = ChoiceDialog;

// Extends DialogBox::close
ChoiceDialog.prototype.close = function() {
	currentChoiceDialog = null;
	this.clearDialog();
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

}

function choiceTextOnInputOver(event) {
	this.fill = "#ffff00";
}

function choiceTextOnInputOut(event) {
	this.fill = "#ffffff";	
}

function choiceTextOnInputUp(event) {
	this.fill = "#ffffff";	

	if (dialogCloseCallback != null) {
		dialogCloseCallback(this.thisAction);
	}

	currentChoiceDialog.close();
}

var currentChoiceDialog = null;