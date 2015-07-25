function PlayerInfo(json) {
	if (json != undefined) {
		// The name of the player
		this.name = json.name;
	
		// True if right handed, false if not
		this.handedness = json.hand;
	
		this.icon = json.icon;
	
		// Stats
		this.power = json.power;
		this.batting = json.batting;
		this.pitchPower = json.pitchPower;
		this.pitching = json.pitching;
		this.speed = json.speed;
		this.fielding = json.fielding;
		this.imagination = json.imagination;
		this.arguing = 0; //json.arguing;
	} else {
		this.power = 0;
		this.batting = 0;
		this.pitchPower = 0;
		this.pitching = 0;
		this.speed = 0;
		this.fielding = 0;
		this.imagination = 0;
		this.arguing = 0;
	}

	// Return a simple representation of this object built for json output
	this.toJson = function() {
		var json = new Object();
		
		json.name = this.name;
		json.handedness = this.hand;
		json.icon = this.icon;
		json.power = this.power;
		json.batting = this.batting;
		json.pitchPower = this.pitchPower;
		json.pitching = this.pitching;
		json.speed = this.speed;
		json.fielding = this.fielding;
		json.imagination = this.imagination;
		json.arguing = 0;

		return json;
	}

	this.getValueForSkill = function(skill, amount) {
		switch (skill) {
			case STAT_POWER:
				return this.power;

			case STAT_BATTING:
				return this.batting;
				
			case STAT_PITCH_POWER:
				return this.pitchPower;
				
			case STAT_PITCHING:
				return this.pitching;
				
			case STAT_SPEED:
				return this.speed;
				
			case STAT_FIELDING:
				return this.fielding;
				
			case STAT_IMAGINATION:
				return this.imagination;
				
			case STAT_ARGUING:
				return this.arguing;
				
		}
	}

	this.incrementSkill = function(skill, amount) {
		switch (skill) {
			case STAT_POWER:
				this.power = Math.min(Math.max(this.power + amount, 0), 10);
				return this.power;

			case STAT_BATTING:
				this.batting = Math.min(Math.max(this.batting + amount, 0), 10);
				return this.batting;
				
			case STAT_PITCH_POWER:
				this.pitchPower = Math.min(Math.max(this.pitchPower + amount, 0), 10);
				return this.pitchPower;
				
			case STAT_PITCHING:
				this.pitching = Math.min(Math.max(this.pitching + amount, 0), 10);
				return this.pitching;
				
			case STAT_SPEED:
				this.speed = Math.min(Math.max(this.speed + amount, 0), 10);
				return this.speed;
				
			case STAT_FIELDING:
				this.fielding = Math.min(Math.max(this.fielding + amount, 0), 10);
				return this.fielding;
				
			case STAT_IMAGINATION:
				this.imagination = Math.min(Math.max(this.imagination + amount, 0), 10);
				return this.imagination;
				
			case STAT_ARGUING:
				this.arguing = Math.min(Math.max(this.arguing + amount, 0), 10);
				return this.arguing;
				
		}

		return this.sumSkillPoints();
	}

	this.sumSkillPoints = function() {
		return this.power + this.batting + this.pitchPower + this.pitching + this.speed
				+ this.fielding + this.imagination + this.arguing;
	}
}

// Convert enum to text
function GetSkillName(skill) {
	switch (skill) {
		case STAT_POWER:
			return "Power";

		case STAT_BATTING:
			return "Batting";
			
		case STAT_PITCH_POWER:
			return "Pitch Power";
			
		case STAT_PITCHING:
			return "Pitching";
			
		case STAT_SPEED:
			return "Speed";
			
		case STAT_FIELDING:
			return "Fielding";
			
		case STAT_IMAGINATION:
			return "Imagination";
			
		case STAT_ARGUING:
			return "Arguing";
			
	}
}

// Generate random player info with a point limit
function GenerateRandomPlayerInfo(name, points) {
	var random;
	var info = new PlayerInfo();
	var maxStat = 10;
	
	for (var i = 0; i < points; i++) {
		random = Math.floor(Math.random() * 7);
		
		if (random == 7) {
			random--;
		}
		
		DistributePoint(info, random, maxStat);
	}
	
	info.name = name;
	info.handedness = Math.random() >= 0.5;
	info.icon = iconGenerator.generateRandomIcon();
	
	return info;
}

function DistributePoint(info, stat, maxStat) {
	switch (stat) {
		case 0:
			if (info.power < maxStat) {
				info.power++;
				break;
			}
			
		case 1:
			if (info.batting < maxStat) {
				info.batting++;
				break;
			}
			
		case 2:
			if (info.pitchPower < maxStat) {
				info.pitchPower++;
				break;
			}
			
		case 3:
			if (info.pitching < maxStat) {
				info.pitching++;
				break;
			}
			
		case 4:
			if (info.speed < maxStat) {
				info.speed++;
				break;
			}
			
		case 5:
			if (info.fielding < maxStat) {
				info.fielding++;
				break;
			}
			
		case 6:
			if (info.imagination < maxStat) {
				info.imagination++;
				break;
			}
			
			DistributePoint(info, stat, maxStat);
			break;
	}
}