// Displays pitching stat information about a player
var PitcherInfoHUD = function() {
	PlayerInfoHUD.call(this, true);

	//this.pitchSkill = this.addInfo("Pit", 0, 10);
	//this.pitchPower = this.addInfo("Pow", 0, 10);
}

PitcherInfoHUD.prototype = Object.create(PlayerInfoHUD.prototype);
PitcherInfoHUD.prototype.constructor = PitcherInfoHUD;

PitcherInfoHUD.prototype.setPlayer = function(player) {
	PlayerInfoHUD.prototype.setPlayer.call(this, player);

	if (this.ap == undefined) {
		this.ap = this.addInfo("AP", player.getAP(), player.getMaxAP());
	} else {
		this.drawInfo(this.ap, "AP", player.getAP(), player.getMaxAP());
	}

	if (this.pitchSkill == undefined) {
		this.pitchSkill = this.addInfo("Skill", player.getInfo().pitching, 10);
	} else {
		this.drawInfo(this.pitchSkill, "Skill", player.getInfo().pitching, 10);
	}

	if (this.pitchPower == undefined) {
		this.pitchPower = this.addInfo("Power", player.getInfo().pitchPower, 10);
	} else {
		this.drawInfo(this.pitchPower, "Power", player.getInfo().pitchPower, 10);
	}
}

PitcherInfoHUD.prototype.updatePlayer = function() {
	var player = this.player;

	this.drawInfo(this.ap, "AP", player.getAP(), player.getMaxAP());
	this.drawInfo(this.pitchSkill, "Skill", player.getInfo().pitching, 10);
	this.drawInfo(this.pitchPower, "Power", player.getInfo().pitchPower, 10);
}