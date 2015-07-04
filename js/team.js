function Team() {
	var name = "";
	var players = new Object();
	var battingOrder = [];
	var pitchingOrder = [];

	this.loadTeam = function(json) {
		name = json["name"];
		battingOrder = json["battingOrder"];
		pitchingOrder = json["pitchingOrder"];

		var pList = json["players"];
		var tmpInfo;
		var tmpPlayer;

		for (var i = 0; i < pList.length; i++) {
			tmpInfo = new PlayerInfo(pList[i]);
			players[pList[i]["id"]] = new Player(pList[i]["id"], tmpInfo);
		}
	}
}