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
	this.maxAP = 50;

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

	this.getMaxAP = function() {
		return this.maxAP;
	}

	this.consumeAP = function(amount) {
		this.currentAP -= amount;

		if (this.currentAP < 0) {
			this.currentAP = 0;
		}
	}

	this.getPortrait = function() {
		/*if (this.portrait == null) {
			this.portrait = iconGenerator.generateIcon(this.getPortraitDesc(), this.teamColor);
			this.portrait.parent.removeChild(this.portrait);
		}

		return this.portrait;*/

		return iconGenerator.generateIcon(this.getPortraitDesc(), this.teamColor);
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








	// ** Batter ******************************************************
	
	this.retireBatter = function(dugoutPos) {
		this.returnToDugout(dugoutPos, true);
	}
	









	// ** Runner ******************************************************

	// Advance the runner to a base unopposed.
	// base is the id of the base to advance to
	this.advanceToBase = function(base) {
		var basePos = this.getBasePosition(base);

		this.runTween = game.add.tween(this.worldIcon).to({x: basePos.x, y: basePos.y}, this.getRunSpeedTime(), Phaser.Easing.Default, true);
		this.runTarget = base;
		this.runTween.onComplete.add(this.onAdvanceCompleted, this);
	}

	// Runner has advanced to their base
	this.onAdvanceCompleted = function(target, tween) {
		target.myPlayer.runTween = null;
		gameState.runnerReportComplete(this, target.myPlayer.runTarget, true);
	}

	// The ball has been put in play, the batter has to decide what to do.
	//	targetBase is the base the runner would run to, defined in game.js
	//	hitType is defined in game.js
	//	difficulty is how well it's hit
	//	targetFielder is the fielder it's going to
	//	bForced is if the run is forced
	this.ballInPlay = function(targetBase, hitType, difficulty, targetFielder, bForced) {

		// Not forced, decide if we really want to run
		if (!bForced) {
			console.log("Batter " + this.getName() +  " decides not to run");
			return;
		}

		var basePos = this.getBasePosition(targetBase);

		this.runTween = game.add.tween(this.worldIcon).to({x: basePos.x, y: basePos.y}, this.getRunSpeedTime(), Phaser.Easing.Default, true);
		this.runTarget = targetBase;
		this.runTween.onComplete.add(this.onRunCompleted, this);
	}

	this.onRunCompleted = function(target, tween) {
		target.myPlayer.runTween = null;
		gameState.runnerReportComplete(this, target.myPlayer.runTarget, true);
	}

	// Returns the position of a base, as a point
	this.getBasePosition = function(base) {
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

		return basePos;
	}

	// Returns how long it takes this runner to get to a base, in ms
	this.getRunSpeedTime = function() {
		return 3000;
	}

	this.getRunSpeed = function() {
		// Run speed, used when running and fielding, is calibrated on time to get to base
		// skill 0 = 5sec
		// skill 5 = 4sec
		// skill 10 = 3sec

		return gameField.basesRadius / (5 - ((this.getInfo().speed / 10) * 2));
	}







	// ** Fielding ******************************************************
	this.fieldBall = function(hitType, difficulty, distance) {
		var myDist = new Phaser.Point(this.worldIcon.x - gameField.homePlateX, this.worldIcon.y - gameField.homePlateY).getMagnitude();

		// Simulate running to the point
		var runTimer = game.time.create(true);
		runTimer.add(myDist / this.getRunSpeed(), this.runToFieldFinished, this, hitType, difficulty);
		runTimer.start();
	}

	// Present fielding choices
	this.runToFieldFinished = function(hitType, difficulty) {
		gameState.showChoiceDialog(this, "Fielder select action:", actionManager.getAvailableFielderActions(this, this.getAP()), 
			function(action) {
				console.log("Fielder selected action: " + action.text);
				this.consumeAP(action.getCost());
			});
	}
}
















// **********************************************************************
//	"Static" methods
// **********************************************************************

// Returns human-friendly name for a fielding index
function GetPlayerPositionName(positionIndex) {
	if (positionIndex < PITCHER || positionIndex > RIGHT_FIELD) {
		return "Imaginary Fielder";
	}

	switch (positionIndex) {
		case PITCHER: 		return "Pitcher";
		case CATCHER: 		return "Catcher";
		case FIRST_BASE: 	return "First Base";
		case SECOND_BASE: 	return "Second Base";
		case THIRD_BASE: 	return "Third Base";
		case SHORT_STOP: 	return "Shortstop";
		case LEFT_FIELD: 	return "Left Field";
		case CENTER_FIELD: 	return "Center Field";
		case RIGHT_FIELD: 	return "Right Field";
	}
}