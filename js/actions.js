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
	},

	parseActions: function() {
		var actions = game.cache.getJSON("batterActions")["actions"];
		this.batterActions = [];

		for (var i = 0; i < actions.length; i++) {
			this.batterActions.push(new Action(actions[i]));
		}
	},

	// Returns a list of batter actions that are available to the given player with an amount of ap to spend
	getAvailableBatterActions: function(playerInfo, ap) {
		var returnActions = [];

		for (var i = 0; i < this.batterActions.length; i++) {
			if (!this.batterActions[i].isAffordable(playerInfo, ap)) {
				continue;
			}

			if (this.batterActions[i].isUsable(playerInfo)) {
				returnActions.push(this.batterActions[i]);
			}
		}

		return returnActions;
	}
}

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

// Returns if the action is affordable to the given player with the given ap
Action.prototype.isAffordable = function(playerInfo, ap) {
	return this.cost <= ap;
}

// Returns if the action is usable by the given player
Action.prototype.isUsable = function(playerInfo) {
	var bUsable = true;

	for (var i = 0; i < this.requirements; i++) {
		switch (this.requirements[i].stat) {
			case "pow":
				if (!this.isValueInRange(playerInfo.power, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "bat":
				if (!this.isValueInRange(playerInfo.batting, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "pit":
				if (!this.isValueInRange(playerInfo.pitching, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "spe":
				if (!this.isValueInRange(playerInfo.speed, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "fie":
				if (!this.isValueInRange(playerInfo.fielding, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "ima":
				if (!this.isValueInRange(playerInfo.imagination, this.requirements[i].min, this.requirements[i].max)) {
					return false;
				} 
				break;

			case "arg":
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