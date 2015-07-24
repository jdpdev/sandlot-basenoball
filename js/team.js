function Team() {
	var name = "";

	// List of the team's players. Indexed by player uid.
	var players;

	// The order players bat in, using player uid
	var battingOrder;
	
	// Where the players field at, using player uid
	var fieldingPositions;

	var teamColor;

	// Index of the batter currently at the plate
	var iCurrentBatterIndex = -1;

	// Load information about the team from a json object
	this.loadTeam = function(json) {
		this.name = json["name"];
		this.battingOrder = json["battingOrder"];
		this.fieldingPositions = json["fieldingPositions"];
		this.teamColor = json["teamColor"];
		this.iCurrentBatterIndex = -1;

		var pList = json["players"];
		var tmpInfo;
		var tmpPlayer;

		this.players = new Object();

		for (var i = 0; i < pList.length; i++) {
			tmpInfo = new PlayerInfo(pList[i]);
			this.players[pList[i]["id"]] = new Player(pList[i]["id"], tmpInfo, this.teamColor);
		}
	}
	
	this.setTeamColor = function(color) {
		this.teamColor = color;
		
		for (id in this.players) {
			this.players[id].teamColor = color;
		}
	}
	
	// Returns the sum of all players' skill points
	this.totalTeamSkillPoints = function() {
		var total = 0;
		
		for (player in this.players) {
			var info = this.players[player].getInfo();
			total += info.power;
			total += info.batting;
			total += info.pitchPower;
			total += info.pitching;
			total += info.speed;
			total += info.fielding;
			total += info.imagination;
		}
		
		return total;
	}

	// Begin the fielding half-inning
	this.fieldTeam = function() {
		for (var i = 0; i < this.fieldingPositions.length; i++) {
			this.players[this.fieldingPositions[i]].setAsFielder(i);
		}
	}

	this.resetFielders = function() {
		for (var i = 0; i < this.fieldingPositions.length; i++) {
			this.players[this.fieldingPositions[i]].returnToFieldingPosition(i);
		}
	}

	// Begin the batting half-innning
	this.batTeam = function(bTopInning) {
		for (var i = 0; i < this.fieldingPositions.length; i++) {
			if (bTopInning) {
				this.players[this.fieldingPositions[i]].returnToDugout(gameField.GetAwayDugoutPos(), true);
			} else {
				this.players[this.fieldingPositions[i]].returnToDugout(gameField.GetHomeDugoutPos(), true);
			}
		}
	}

	// Present the next batter in the lineup to the plate
	// Returns the player object
	this.presentNextBatter = function() {
		this.iCurrentBatterIndex++;

		if (this.iCurrentBatterIndex >= 8) {
			this.iCurrentBatterIndex = 0;
		}

		this.players[this.battingOrder[this.iCurrentBatterIndex]].setAsBatter();
		return this.players[this.battingOrder[this.iCurrentBatterIndex]];
	},

	// Returns the pitcher player
	this.getPitcher = function() {
		return this.getFielderForPosition(PITCHER);
	}

	// Returns the fielder at a specific position
	this.getFielderForPosition = function(position) {
		return this.players[this.fieldingPositions[position]];
	}

	// Return the position a given fielder is fielding at
	this.getFielderPosition = function(fielder) {
		for (var i = 0; i < this.fieldingPositions.length; i++) {
			if (this.players[this.fieldingPositions[i]] == fielder) {
				return i + 1;
			}
		}

		return -1;
	}
}