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
		this.arguing = json.arguing;
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