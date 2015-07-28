var actionManager = {

	actionPath: "./data/actions/",
	batterCache: "batterActions",
	
	batterActions: null,
	runnerActions: null,
	pitcherActions: null,
	fielderActions: null,

	// Called by game on statup
	loadActions: function() {
		game.load.json("batterActions", './data/actions/batter.json');
		game.load.json("pitcherActions", './data/actions/pitcher.json');
		game.load.json("fielderActions", './data/actions/fielding.json');
	},

	parseActions: function() {
		// Batter
		var actions = game.cache.getJSON("batterActions")["actions"];
		this.batterActions = [];

		for (var i = 0; i < actions.length; i++) {
			this.batterActions.push(new Action(actions[i]));
		}

		// Pitcher
		actions = game.cache.getJSON("pitcherActions")["actions"];
		this.pitcherActions = [];

		for (var i = 0; i < actions.length; i++) {
			this.pitcherActions.push(new Action(actions[i]));
		}

		// Fielding
		actions = game.cache.getJSON("fielderActions")["actions"];
		this.fielderActions = [];

		for (var i = 0; i < actions.length; i++) {
			this.fielderActions.push(new Action(actions[i]));
		}
	},

	// Returns a list of batter actions that are available to the given player with an amount of ap to spend
	getAvailableBatterActions: function(playerInfo, ap) {
		return this.getAvailableActions(this.batterActions, playerInfo, ap);
	},

	// Returns a list of pitcher actions that are available to the given player with an amount of ap to spend
	getAvailablePitcherActions: function(playerInfo, ap) {
		return this.getAvailableActions(this.pitcherActions, playerInfo, ap);
	},

	// Returns a list of pitcher actions that are available to the given player with an amount of ap to spend
	getAvailableFielderActions: function(playerInfo, ap) {
		return this.getAvailableActions(this.fielderActions, playerInfo, ap);
	},

	getAvailableActions: function(actions, playerInfo, ap) {
		var returnActions = [];

		for (var i = 0; i < actions.length; i++) {
			if (!actions[i].isAffordable(playerInfo, ap)) {
				continue;
			}

			if (actions[i].isUsable(playerInfo)) {
				returnActions.push(actions[i]);
			}
		}

		return returnActions;
	}
}

// *****************************************************************************
//	Types of actions
// *****************************************************************************

// START ACTIONS
// Actions that happen at the start of an encounter. Essentially set the tone for what's 
// going to be happening.

// Take no action
var ACTION_START_BATTER_LEAVE = 0;

// Swing normally
var ACTION_START_BATTER_SWING = 1;

// Swing with extra power, at cost of control
var ACTION_START_BATTER_SLUG = 2;

// Swing with extra control, at cost of power
var ACTION_START_BATTER_TARGET = 3;

var ACTION_START_PITCHER_FASTBALL = 4;

var ACTION_START_PITCHER_CHANGEUP = 5;

var ACTION_START_PITCHER_BREAKING = 6;

var ACTION_START_PITCHER_LOB = 7;

// REPONSE ACTIONS
// Actions that happen in response to other actions. These modify or nullify action that has happened.


// STAT SHORTCUTS
// Player stats
var STAT_POWER = "pow";
var STAT_BATTING = "bat";
var STAT_PITCH_POWER = "ppow";
var STAT_PITCHING = "pit";
var STAT_SPEED = "spe";
var STAT_FIELDING = "fie";
var STAT_IMAGINATION = "ima";
var STAT_ARGUING = "arg";

// Result stats, modifying how results are calculated
var STAT_LINE_DRIVE = "ldr";
var STAT_GROUND_BALL = "gdb"
var STAT_FLY_BALL = "fly";

// *****************************************************************************
//	Wrapper for an action described in json
// *****************************************************************************
var Action = function(json) {
	this.text = json.text;
	this.actionType = json.type;
	this.cost = json.cost;
	this.requirements = json.requires;
	this.mods = json.mods;

	for (var i = 0; i < this.requirements.length; i++) {
		if (this.requirements[i].min == undefined) {
			this.requirements[i].min = 0;
		}

		if (this.requirements[i].max == undefined) {
			this.requirements[i].max = 10;
		}
	}
}

Action.prototype.getCost = function() {
	return this.cost;
}

Action.prototype.getActionType = function() {
	return this.actionType;
}

// Returns if the action is affordable to the given player with the given ap
Action.prototype.isAffordable = function(playerInfo, ap) {
	return this.cost <= ap;
}

// Returns if the action is usable by the given player
Action.prototype.isUsable = function(player) {
	var bUsable = true;
	var playerInfo = player.getInfo();

	for (var i = 0; i < this.requirements.length; i++) {
		switch (this.requirements[i].stat) {
			case STAT_POWER:
				if (!this.isValueInRange(playerInfo.power, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_BATTING:
				if (!this.isValueInRange(playerInfo.batting, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_PITCH_POWER:
				if (!this.isValueInRange(playerInfo.pitchPower, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_PITCHING:
				if (!this.isValueInRange(playerInfo.pitching, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_SPEED:
				if (!this.isValueInRange(playerInfo.speed, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_FIELDING:
				if (!this.isValueInRange(playerInfo.fielding, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_IMAGINATION:
				if (!this.isValueInRange(playerInfo.imagination, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case STAT_ARGUING:
				if (!this.isValueInRange(playerInfo.arguing, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;
		}
	}

	return bUsable;
}

Action.prototype.isValueInRange = function(value, min, max) {
	return min <= value && value <= max;
}

// Returns the value of a stat modified by the action
Action.prototype.modStat = function(stat, value) {
	for (var i = 0; i < this.mods.length; i++) {
		if (this.mods[i].stat == stat) {
			return value + this.mods[i].amount;
		}
	}

	return value;
}

Action.prototype.getModDisplay = function(mod) {
	var display = "";

	switch (mod.stat) {
		case STAT_POWER:
			display = "Power";
			break;

		case STAT_BATTING:
			display = "Batting";
			break;

		case STAT_PITCH_POWER:
			display = "Pitch Power";
			break;

		case STAT_PITCHING:
			display = "Pitching";
			break;

		case STAT_SPEED:
			display = "Speed";
			break;

		case STAT_FIELDING:
			display = "Fielding";
			break;

		case STAT_IMAGINATION:
			display = "Imagination";
			break;

		case STAT_ARGUING:
			display = "Arguing";
			break;
	}

	if (mod.amount >= 0) {
		display += " +" + mod.amount;
	} else {
		display += " " + mod.amount;
	}

	return display;
}