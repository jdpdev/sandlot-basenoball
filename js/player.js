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

	this.currentAP = 20 + this.playerInfo.imagination * 8;
	this.maxAP = this.currentAP;

	// Tween used when running
	this.runTween = null;

	this.runCompleteCallback = null;
	this.runTarget = -1;
	this.bIsRunning = false;

	// ** Getters and setters **************************************************
	this.setPosition = function (position) {
		this.worldIcon.x = position.x;
		this.worldIcon.y = position.y;
	}

	this.getPosition = function() {
		return new Phaser.Point(this.worldIcon.x, this.worldIcon.y);
	}
	
	this.getId = function() {
		return this.id;
	}

	this.getName = function() {
		return this.playerInfo.name;
	}

	this.setName = function(value) {
		return this.playerInfo.name = value;
	}

	this.getPortraitDesc = function() {
		return this.playerInfo.icon;
	}
	
	this.setPortraitDesc = function(desc) {
		this.playerInfo.icon = desc;
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
		} else if (this.currentAP > this.maxAP) {
			this.currentAP = this.maxAP;
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

	// Represent the player as an object for json encoding
	this.toJson = function() {
		var json = this.playerInfo.toJson();
		json["id"] = this.id;
		return json;
	}

	// Returns if the run the player is doing is forced
	this.isRunForced = function() {
		return this.bIsForcedRun == true;
	}

	// ** Methods **************************************************************
	this.setAsFielder = function(position) {
		this.interruptRun();
		this.fieldingPosition = position;

		if (this.worldIcon == null) {
			this.drawFielder();
		}

		this.showWaitingFielder();
		this.setPosition(this.getFieldingPosition(position));
	}

	this.returnToFieldingPosition = function() {
		this.worldIcon.update = function() { };
		this.showWaitingFielder();
		this.setPosition(this.getFieldingPosition(this.fieldingPosition));	
	}

	// Step the batter up to the plate
	this.setAsBatter = function() {
		var pos;

		if (this.playerInfo.handedness) {
			pos = gameField.GetLeftBattingBoxPos();
		} else {
			pos = gameField.GetRightBattingBoxPos();
		}
		
		this.showBattingStance();

		//pos.y -= this.playerHeight;
		this.setPosition(pos);
	}

	this.returnToDugout = function(position, bRun) {
		if (this.worldIcon == null) {
			this.drawFielder();
		}
		
		this.interruptRun();
		this.showWaitingFielder();

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

		/*point.x -= this.playerWidth * 0.5;
		point.y -= this.playerHeight;*/

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

	// Change the world icon to a new pose
	this.changePose = function(pose) {
		if (pose == this.currentPose) {
			return;
		}
		
		var position = new Phaser.Point(0, 0);
		
		if (this.worldIcon != null) {
			position.x = this.worldIcon.x;
			position.y = this.worldIcon.y;
			this.worldIcon.destroy(true);
		}
		
		this.currentPose = pose;
		
		this.worldIcon = PlayerGenerator.generateWorldIcon(this.playerInfo.icon, pose, this.teamColor, this.playerInfo.handedness);
		this.worldIcon.x = position.x;
		this.worldIcon.y = position.y;
	}
	
	this.showBattingStance = function() {
		this.changePose(this.playerInfo.handedness ? POSE_BATTER_RIGHT : POSE_BATTER_LEFT);
	}

	// Change to the swing pose
	this.showSwing = function() {
		this.changePose(this.playerInfo.handedness ? POSE_BATTER_SWING_RIGHT : POSE_BATTER_SWING_LEFT);
	}

	this.showWaitingFielder = function() {
		if (this.fieldingPosition == CATCHER) {
			this.changePose(POSE_FIELDER_CATCHER);
		} else {
			this.changePose(POSE_FIELDER_WAITING);
		}
	}
	
	this.showHighCatch = function() {
		this.changePose(POSE_FIELDER_CATCH_UP);
	}
	
	this.showLowCatch = function() {
		this.changePose(POSE_FIELDER_CATCH_DOWN);
	}
	
	this.showCatch = function(fromPos) {
		if (fromPos.x <= this.worldIcon.x) {
			this.changePose(POSE_FIELDER_CATCH_RIGHT);	
		} else {
			this.changePose(POSE_FIELDER_CATCH_LEFT);	
		}
	}
	
	this.showRunning = function(from, to) {
		if (from.x <= to.x) {
			this.changePose(POSE_RUNNING_RIGHT);	
		} else {
			this.changePose(POSE_RUNNING_LEFT);	
		}
	}
	
	this.showRunnerWaiting = function() {
		this.changePose(POSE_RUNNING_WAITING);	
	}

	// ** Batter ******************************************************
	
	this.retireBatter = function(dugoutPos) {
		this.returnToDugout(dugoutPos, true);
		this.interruptRun();
		this.bIsRunning = false;
	}
	









	// ** Runner ******************************************************

	// Advance the runner to a base unopposed.
	// base is the id of the base to advance to
	this.advanceToBase = function(base) {
		var basePos = this.getBasePosition(base);

		this.runTween = game.add.tween(this.worldIcon).to({x: basePos.x, y: basePos.y}, 3000, Phaser.Easing.Default, true);
		this.runTarget = base;
		this.runTween.onComplete.add(this.onAdvanceCompleted, this);
		
		this.showRunning(this.getPosition(), basePos);
		gameState.runnerAcceptRun(this, base);
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

		this.worldIcon.player = this;
		this.targetFielder = targetFielder;

		// If a fly ball, hold on running immediately
		if (bForced) {
			this.startRun(targetBase, bForced);
		} else if (hitType == FLY_BALL) {
			console.log("Runner " + this.getName() + " holding at base");
			this.bIsRunning = false;
		} else {
			this.startRun(targetBase, bForced);
		}

		/*this.runTween = game.add.tween(this.worldIcon).to({x: basePos.x, y: basePos.y}, this.getRunSpeedTime(), Phaser.Easing.Default, true);
		this.runTarget = targetBase;
		this.runTween.onComplete.add(this.onRunCompleted, this);*/
	}

	// Start running fully to a base
	this.startRun = function(target, bForced) {
		if (this.bIsRunning) {
			return;
		}

		console.log(this.getName() + " is starting run to " + target);

		this.bIsForcedRun = bForced;
		this.targetBasePos = this.getBasePosition(target);
		this.runTarget = target;

		this.showRunning(this.getPosition(), this.targetBasePos);
		gameState.runnerAcceptRun(this, this.runTarget);

		this.bIsRunning = true;
		this.worldIcon.player = this;
		this.worldIcon.update = this.runnerOnUpdate;
	}

	// Move some distance to the next base, but hold up for result of the fielder.
	// Used for fly balls.
	this.startHoldUpRun = function(target, bForced) {
		this.bIsHoldingShort = true;

		this.startRun(target, bForced);
	}

	// Stop the player from running
	this.interruptRun = function() {
		if (!this.bIsRunning) {
			return;
		}

		this.showRunnerWaiting();
		this.worldIcon.update = function() { };
		this.bIsRunning = false;
	}

	this.onRunCompleted = function() {
		this.worldIcon.update = function() { };
		this.bIsRunning = false;

		// Done no matter what
		if (this.runTarget == HOME) {
			console.log(this.getName() + " has reached home");
			this.completeRun();
			return;
		}

		// Check if we want to go for extra
		var status = gameState.getBallStatus();
		var nextBase = this.runTarget + 1;
		
		if (nextBase > THIRD) {
			nextBase = HOME;
		}

		if (!gameState.canRunToBase(nextBase)) {
			console.log(this.getName() + " can't continue running to " + nextBase);
			
			try {
				this.completeRun();
			} catch (err) {
				console.log("caught error: " + err);
			}
			return;
		}

		console.log(this.getName() + " thinking about whether to continue running");

		switch (status.state) {
			case BALL_UNCONTROLLED:
				switch (nextBase) {
					default:
					case SECOND:
						this.completeRun();
						break;

					case THIRD:
					case HOME:
						this.startRun(nextBase, false);
						break;
				}
				break;

			case BALL_FUMBLED:
				if (status.target < LEFT_FIELD) {
					this.completeRun();
					break;
				}
				
				switch (nextBase) {
					default:
					case SECOND:
						if (status.target >= LEFT_FIELD) {
							this.startRun(nextBase, false);
						} else {
							this.completeRun();
						}
						break;

					case THIRD:
					case HOME:
						this.startRun(nextBase, false);
						break;
				}
				break;

			case BALL_THROWN:
				if (status.target == CATCHER && nextBase == SECOND) {
					this.startRun(SECOND, false);
				} else {
					this.completeRun();
				}
				break;

			default:
				this.completeRun();
				break;
		}
	}

	// Tell the game that we're done running
	this.completeRun = function() {
		gameState.runnerReportComplete(this, this.runTarget, true);
		this.bIsRunning = false;
	}

	this.runnerOnUpdate = function() {
		if (!this.player.bIsRunning || gameState.bGlobalUIPause) {
			return;
		}

		var player = this.player;
		var delta = game.time.elapsed * 0.001;
		var pDiff = new Phaser.Point(player.targetBasePos.x - player.worldIcon.x, player.targetBasePos.y - player.worldIcon.y);
		var speedStep = player.getRunSpeed() * delta;
		var bDone = false;
		var distanceLeft = pDiff.getMagnitude();

		// Hold short
		if (this.bIsHoldingShort && distanceLeft <= 125) {
			return;
		} 

		// Gotta go fast
		else if (distanceLeft > speedStep) {
			pDiff.setMagnitude(speedStep);
		} else {
			bDone = true;
		}

		player.worldIcon.x += pDiff.x;
		player.worldIcon.y += pDiff.y;

		if (bDone) {
			player.onRunCompleted();
		}
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

		/*basePos.x -= this.playerWidth * 0.5;
		basePos.y -= this.playerHeight;*/

		return basePos;
	}

	this.getRunSpeed = function() {
		// Run speed, used when running and fielding, is calibrated on time to get to base
		// skill 0 = 4sec
		// skill 5 = 3sec
		// skill 10 = 2sec

		return gameField.basesRadius / (4 - ((this.getInfo().speed / 10) * 2));
	}
	
	this.getRunSpeedTime = function() {
		return gameField.basesRadius / this.getRunSpeed();
	}

	this.abortRun = function() {
		if (!this.bIsRunning || this.runTarget == FIRST) {
			return;
		}
		
		console.log(this.getName() + " is aborting the run to " + this.runTarget);

		this.runTarget--;

		if (this.runTarget < HOME) {
			this.runTarget = HOME;
		}

		var target = this.getBasePosition(this.runTarget);
		this.targetBasePos = target;
		this.showRunning(this.getPosition(), target);
		gameState.runnerChangeRunTarget(this, this.runTarget);
	}

	// ** Running AI ******************************************************

	// Global notification that a fielder has obtained the ball
	// 
	this.fielderHasBall = function(fielder, position, bOnCatch) {
		console.log(this.getName() + " >> fielder " + fielder.getName() + " has the ball");
		
		// Have to return to base
		if (this.bIsHoldingShort && bOnCatch) {
			this.abortRun();
		} 

		// Decide if we want to abort
		else if (this.bIsRunning) {
			try {
				var myPos = this.getPosition();
				var basePos = this.getBasePosition(this.runTarget);
				var distanceFromBase = Phaser.Point.distance(
										myPos,
										basePos
									);
			} catch (err) {
				console.log("!!! caught error");
			}

			if (!this.bIsForcedRun) {

				// Whether we want to continue is based on where we're going and where the
				// fielder is.
				switch (this.runTarget) {
					case SECOND:
						// Stop no matter who the fielder is
						if (gameState.canRunToBase(FIRST) && distanceFromBase >= 90) {
							this.abortRun();
						}
						break;

					case THIRD:
						if (position < LEFT_FIELD && gameState.canRunToBase(SECOND) && distanceFromBase >= 90) {
							this.abortRun();
						}
						break;
						
					case HOME:
						if (position < LEFT_FIELD && gameState.canRunToBase(THIRD) && distanceFromBase >= 90) {
							this.abortRun();
						}
						break;
				}
			}			
		} else {

			// Assume that we're waiting for a fly ball catch?
			// If on second or third, try to advance
			if (this.runTarget > SECOND) {
				this.startRun();
			}
		}

		this.bIsHoldingShort = false;
	}

	// Global notification that the ball has been thrown to a base
	// From is a fielder position, defined in player.js
	// To is a base index, defined in game.js
	this.ballThrownTo = function(from, to) {

		// On a throw to home, sneak to second, maybe third?
		if (to == HOME && from >= LEFT_FIELD && this.runTarget == SECOND) {
			this.startRun();
		}
	}



	// ** Fielding ******************************************************
	this.fieldBall = function(hitType, difficulty, distance) {
		var myDelta = new Phaser.Point(this.worldIcon.x - gameField.homePlateX, this.worldIcon.y - gameField.homePlateY);
		var distance = distance - myDelta.getMagnitude();
		var runSpeed = this.getRunSpeed();
		var fieldTime = 0; 
		var tweenPos = new Phaser.Point(this.worldIcon.x, this.worldIcon.y);
		var tweenTime;

		switch (hitType) {
			case LINE_DRIVE:
				this.showHighCatch();
				
				if (this.fieldingPosition < LEFT_FIELD) {
					fieldTime = 750;
					tweenTime = fieldTime * game.rnd.realInRange(0.5, 0.75);
					
					var direction = Phaser.Point.normalRightHand(myDelta);

					if (this.fieldingPosition == FIRST_BASE) {
						direction = Phaser.Point.negative(direction);
					}

					direction.setMagnitude(runSpeed * tweenTime / 1000);
					tweenPos = Phaser.Point.add(tweenPos, direction);
					difficulty += 3;
				} else {
					fieldTime = 1250;
					tweenTime = fieldTime * game.rnd.frac();

					myDelta.setMagnitude(distance);
					myDelta = Phaser.Point.rotate(myDelta, 0, 0, game.rnd.integerInRange(-15, 15), true);

					tweenPos = Phaser.Point.add(myDelta, new Phaser.Point(this.worldIcon.x, this.worldIcon.y));
				}
				break;

			case GROUND_BALL:
				this.showLowCatch();
				
				fieldTime = 1250;
				tweenTime = fieldTime * game.rnd.realInRange(0.75, 1);
					
				var direction;

				// Catcher always charges in front
				if (this.fieldingPosition == CATCHER) {
					direction = new Phaser.Point(0, -1);
					direction = Phaser.Point.rotate(direction, 0, 0, game.rnd.integerInRange(-40, 40), true);
					tweenPos = new Phaser.Point(gameField.homePlateX, gameField.homePlateY);
				} 

				// Cut off if behind, charge in front
				else {
					if (distance > 0) {
						direction = Phaser.Point.normalRightHand(myDelta);
						tweenTime *= 0.5;

						if (this.fieldingPosition == FIRST_BASE) {
							direction = Phaser.Point.negative(direction);
						}
					} else {
						myDelta = Phaser.Point.negative(myDelta);
						myDelta = Phaser.Point.rotate(myDelta, 0, 0, game.rnd.integerInRange(-15, 15), true);
						direction = myDelta;
					}
				}

				direction.setMagnitude(runSpeed * tweenTime / 1000);
				tweenPos = Phaser.Point.add(tweenPos, direction);
				break;

			case FLY_BALL:
				this.showHighCatch();
				
				if (this.fieldingPosition < LEFT_FIELD) {
					fieldTime = 3000;
				} else {
					fieldTime = 4000;
				}

				tweenTime = fieldTime * game.rnd.realInRange(0.25, 0.5);
				myDelta = Phaser.Point.rotate(myDelta, 0, 0, game.rnd.angle(), true);
				direction = myDelta;

				break;
		}
		
		console.log("distance from fielder: " + distance);

		// Translate to stand on point
		tweenPos.x -= this.playerWidth * 0.5;
		tweenPos.y -= this.playerHeight;
		
		var tween = game.add.tween(this.worldIcon).to({x: tweenPos.x, y: tweenPos.y}, 
									tweenTime, Phaser.Easing.Default, true);
	
		// Simulate running to the point
		var runTimer = game.time.create(true);
		runTimer.add(fieldTime, this.runToFieldFinished, this, hitType, difficulty, distance);
		runTimer.start();
	}

	// Fielder did not successfully field the ball, so pick a direction to run in while waiting
	this.ballFumbled = function(time, bAlternate) {
		this.showLowCatch();
		
		// Pick random direction
		var roll = game.rnd.realInRange(game.math.PI2 / -8, game.math.PI2 / 8);
		var normal = new Phaser.Point(0, -1);
		
		if (bAlternate) {
			normal = Phaser.Point.negative(normal);
		}
		
		normal = Phaser.Point.rotate(normal, 0, 0, roll);
		normal.setMagnitude(70);

		var position = this.getPosition();
		position = Phaser.Point.add(position, normal);
		
		position.x -= this.playerWidth * 0.5;
		position.y -= this.playerHeight;
		
		var tween = game.add.tween(this.worldIcon).to({x: position.x, y: position.y}, 
									time, Phaser.Easing.Default, true);

		//this.worldIcon.x = position.x;
		//this.worldIcon.y = position.y;
	}

	// Present fielding choices
	this.runToFieldFinished = function(hitType, difficulty, distance) {
		var fielder = this;

		gameState.showChoiceDialog(this, this.getName() + " (" + GetPlayerPositionAbbr(this.fieldingPosition) + ")", actionManager.getAvailableFielderActions(this, this.getAP()), 
			function(action) {
				console.log("Fielder selected action: " + action.text);
				fielder.consumeAP(action.getCost());
				gameState.fielderSelectAction(fielder, action, hitType, difficulty, distance);
			});
	}

	this.runToFieldingPosition = function(base) {
		
		if (base == SECOND_BASE) {
			this.targetBasePos = gameField.GetSecondBasePos();
		} else {
			this.targetBasePos = this.getFieldingPosition(base);
		}

		this.bIsRunning = true;

		this.worldIcon.player = this;
		this.worldIcon.update = this.fielderOnUpdate;
	}

	this.fielderOnUpdate = function() {
		if (!this.player.bIsRunning || gameState.bGlobalUIPause) {
			return;
		}

		var player = this.player;
		var delta = game.time.elapsed * 0.001;
		var pDiff = new Phaser.Point(player.targetBasePos.x - player.worldIcon.x, player.targetBasePos.y - player.worldIcon.y);
		var speedStep = player.getRunSpeed() * delta;
		var bDone = false;

		if (pDiff.getMagnitude() > speedStep) {
			pDiff.setMagnitude(speedStep);
		} else {
			bDone = true;
		}

		player.worldIcon.x += pDiff.x;
		player.worldIcon.y += pDiff.y;

		if (bDone) {
			player.onFieldingRunCompleted();
		}
	}

	this.onFieldingRunCompleted = function() {
		this.worldIcon.update = function() { };
		this.bIsRunning = false;
	}

	// Calibrated on distance from first to third base
	// skill 0 = 2 sec
	// skill 5 = 1 sec
	// skill 10 = 0.5 sec
	this.getThrowSpeed = function() {
		var distance = Phaser.Point.distance(gameField.GetFirstBasePos(), gameField.GetThirdBasePos());

		if (this.getInfo().fielding > 5) {
			return distance / (1 - ((this.getInfo().fielding / 10)));
		} else {
			return distance / (2 - ((this.getInfo().fielding / 5)));
		}
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

// Returns human-friendly name for a fielding index
function GetPlayerPositionAbbr(positionIndex) {
	if (positionIndex < PITCHER || positionIndex > RIGHT_FIELD) {
		return "---";
	}

	switch (positionIndex) {
		case PITCHER: 		return "P";
		case CATCHER: 		return "C";
		case FIRST_BASE: 	return "1B";
		case SECOND_BASE: 	return "2B";
		case THIRD_BASE: 	return "3B";
		case SHORT_STOP: 	return "SS";
		case LEFT_FIELD: 	return "LF";
		case CENTER_FIELD: 	return "CF";
		case RIGHT_FIELD: 	return "RF";
	}
}

function GenerateRandomPlayer(id, name, points) {
	return new Player(id, GenerateRandomPlayerInfo(name, points), "0xff00ff");
}