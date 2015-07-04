function Team() {
	var name = "";

	// List of the team's players. Indexed by player uid.
	var players;

	// The order players bat in, using player uid
	var battingOrder;
	
	// Where the players field at, using player uid
	var fieldingPositions;

	// Load information about the team from a json object
	this.loadTeam = function(json) {
		name = json["name"];
		battingOrder = json["battingOrder"];
		fieldingPositions = json["fieldingPositions"];

		var pList = json["players"];
		var tmpInfo;
		var tmpPlayer;

		players = new Object();

		for (var i = 0; i < pList.length; i++) {
			tmpInfo = new PlayerInfo(pList[i]);
			players[pList[i]["id"]] = new Player(pList[i]["id"], tmpInfo);
		}
	}

	// Begin the fielding half-inning
	this.fieldTeam = function() {
		for (var i = 0; i < fieldingPositions.length; i++) {
			players[fieldingPositions[i]].setAsFielder(i);
		}
	}

	// Begin the batting half-innning
	this.batTeam = function() {

	}
}