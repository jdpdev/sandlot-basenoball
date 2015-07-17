var PITCHER = 0;
var CATCHER = 1;
var FIRST_BASE = 2;
var SECOND_BASE = 3;
var THIRD_BASE = 4;
var SHORT_STOP = 5;
var LEFT_FIELD = 6;
var CENTER_FIELD = 7;
var RIGHT_FIELD = 8;

function Player(id, playerInfo, teamColor) {
	this.id = id;
	this.playerInfo = playerInfo;
	this.worldIcon = null;
	this.portrait = null;

	this.fieldingPosition = 0;

	this.playerWidth = 0;
	this.playerHeight = 0;

	this.teamColor = parseInt(teamColor);

	this.currentAP = 50;

	// Tween used when running
	this.runTween = null;

	this.runCompleteCallback = null;
	this.runTarget = -1;

	// ** Getters and setters **************************************************
	this.setPosition = function (position) {
		this.worldIcon.x = position.x;
		this.worldIcon.y = position.y;
	}

	this.getName = function() {
		return this.playerInfo.name;
	}

	this.getPortraitDesc = function() {
		return this.playerInfo.icon;
	}

	this.getAP = function() {
		return this.currentAP;
	}

	this.getPortrait = function() {
		if (this.portrait == null) {
			this.portrait = iconGenerator.generateIcon(this.getPortraitDesc(), this.teamColor);
			this.portrait.parent.removeChild(this.portrait);
		}

		return this.portrait;
	}

	this.getInfo = function() {
		return this.playerInfo;
	}

	// ** Methods **************************************************************
	this.setAsFielder = function(position) {
		this.fieldingPosition = position;

		if (this.worldIcon == null) {
			this.drawFielder();
		}

		this.setPosition(this.getFieldingPosition(position));
	}

	// Step the batter up to the plate
	this.setAsBatter = function() {
		var pos;

		if (this.playerInfo.handedness) {
			pos = gameField.GetLeftBattingBoxPos();
		} else {
			pos = gameField.GetRightBattingBoxPos();
		}

		pos.y -= this.playerHeight;
		this.setPosition(pos);
	}

	this.returnToDugout = function(position, bRun) {
		if (this.worldIcon == null) {
			this.drawFielder();
		}

		//if (!bRun) {
			this.setPosition(position);
		//}
	}

	// ** Fielding ******************************************************
	this.getFieldingPosition = function(position) {
		var point;

		switch (position) {
			// Pitcher
			case PITCHER:
				point = gameField.GetMoundPos();
				break;

			// Catcher
			case CATCHER:
				point = gameField.GetHomePlatePos();
				point.y += 30;
				break;
				
			// First base
			case FIRST_BASE:
				point = gameField.GetFirstBasePos();
				point.x -= 20;
				break;
				
			// Second base
			case SECOND_BASE:
				point = gameField.GetWideSecondBasePos();
				break;
				
			// Third base
			case THIRD_BASE:
				point = gameField.GetThirdBasePos();
				point.x += 20;
				break;
				
			// Shortstop
			case SHORT_STOP:
				point = gameField.GetShortstopPos();
				break;
				
			// Left field
			case LEFT_FIELD:
				point = gameField.GetLeftFieldPos();
				break;
				
			// Center field
			case CENTER_FIELD:
				point = gameField.GetCenterFieldPos();
				break;
				
			// Right field
			case RIGHT_FIELD:
				point = gameField.GetRightFieldPos();
				break;
		}

		point.x -= this.playerWidth * 0.5;
		point.y -= this.playerHeight;

		return point;
	}

	this.drawFielder = function() {
		this.playerWidth = 16;
		this.playerHeight = 30;

		if (this.fieldingPosition == CATCHER) {
			this.playerHeight = 15;
		}

		// Create icon via graphics
		this.worldIcon = game.add.graphics(0, 0);
		this.worldIcon.beginFill(this.teamColor, 1);
		this.worldIcon.drawRect(0, 0, this.playerWidth, this.playerHeight);
		this.worldIcon.endFill();
		this.worldIcon.myPlayer = this;

		this.teamNumber = game.add.text(0, 0, this.id, { font: "14px Arial", fill: "#000000", align: "left" });
		this.worldIcon.addChild(this.teamNumber);

		this.teamNumber.x = 0;
		this.teamNumber.y = 0;
	}

	// ** Batting ******************************************************
	
	this.retireBatter = function(dugoutPos) {
		this.returnToDugout(dugoutPos, true);
	}
	
	// Advance the runner to a base
	// base is the id of the base to advance to
	this.advanceToBase = function(base) {
		var basePos;
		
		switch (base) {
			default:
			case HOME:
				basePos = gameField.GetHomePlatePos();
				break;
				
			case FIRST:
				basePos = gameField.GetFirstBasePos();
				break;
				
			case SECOND:
				basePos = gameField.GetSecondBasePos();
				break;
				
			case THIRD:
				basePos = gameField.GetThirdBasePos();
				break;
		}

		basePos.x -= this.playerWidth * 0.5;
		basePos.y -= this.playerHeight;
		
		this.runTween = game.add.tween(this.worldIcon).to({x: basePos.x, y: basePos.y}, 3000, Phaser.Easing.Default, true);
		this.runTarget = base;
		this.runTween.onComplete.add(this.onRunCompleted, this);
	}

	this.onRunCompleted = function(target, tween) {
		target.myPlayer.runTween = null;
		gameState.runnerReportComplete(this, target.myPlayer.runTarget, true);

		/*if (target.myPlayer.runCompleteCallback != null && target.myPlayer.runCompleteCallback != undefined) {
			target.myPlayer.runCompleteCallback(this.runTarget);
		}*/
	}
}

function playerOnRunCompleted(target, tween) {
	target.myPlayer.runTween = null;

	if (target.myPlayer.runCompleteCallback != null && target.myPlayer.runCompleteCallback != undefined) {
		target.myPlayer.runCompleteCallback(this.runTarget);
	}
}