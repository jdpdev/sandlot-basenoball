function PlayerInfo(json) {
	// The name of the player
	this.name = json.name;

	// True if right handed, false if not
	this.handedness = json.hand;

	// Stats
	this.power = json.power;
	this.batting = json.batting;
	this.pitching = json.pitching;
	this.speed = json.speed;
	this.fielding = json.fielding;
	this.imagination = json.imagination;
	this.arguing = json.arguing;
}