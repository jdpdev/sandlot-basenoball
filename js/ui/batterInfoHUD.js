// Displays pitching stat information about a player
var BatterInfoHUD = function() {
	PlayerInfoHUD.call(this, false);
}

BatterInfoHUD.prototype = Object.create(PlayerInfoHUD.prototype);
BatterInfoHUD.prototype.constructor = BatterInfoHUD;

BatterInfoHUD.prototype.setPlayer = function(player) {
	PlayerInfoHUD.prototype.setPlayer.call(this, player);

	if (this.ap == undefined) {
		this.ap = this.addInfo("AP", player.getAP(), player.getMaxAP());
	} else {
		this.drawInfo(this.ap, "AP", player.getAP(), player.getMaxAP());
	}

	if (this.batSkill == undefined) {
		this.batSkill = this.addInfo("Skill", player.getInfo().batting, 10);
	} else {
		this.drawInfo(this.batSkill, "Skill", player.getInfo().batting, 10);
	}

	if (this.batPower == undefined) {
		this.batPower = this.addInfo("Power", player.getInfo().power, 10);
	} else {
		this.drawInfo(this.batPower, "Power", player.getInfo().power, 10);
	}
}

BatterInfoHUD.prototype.updatePlayer = function() {
	var player = this.player;
	
	this.drawInfo(this.ap, "AP", player.getAP(), player.getMaxAP());
	this.drawInfo(this.batSkill, "Skill", player.getInfo().batting, 10);
	this.drawInfo(this.batPower, "Power", player.getInfo().power, 10);
}