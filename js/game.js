var gameStateName = "Game";

var HOME = 0;
var FIRST = 1;
var SECOND = 2;
var THIRD = 3;

var LINE_DRIVE = 0;
var GROUND_BALL = 1;
var FLY_BALL = 2;

var BALL_DEAD = 0;

// When the ball is not yet controlled by a fielder
var BALL_UNCONTROLLED = 1;

// Fielder had chance to control but missed
var BALL_FUMBLED = 2;

// When the ball has been aquired by a fielder
var BALL_CONTROLLED = 3;

// When the ball has been controlled and thrown to another fielder
var BALL_THROWN = 4;

var gameState = {

	// The teams
	homeTeam: null,
	awayTeam: null,

	battingTeam: null,
	fieldingTeam: null,

	umpire: null,
	
	numberOfInnings: 5,

	selectedBatterAction: null,
	selectedPitcherAction: null,
	selectedFielderAction: null,
	selectedRunnerAction: null,

	// What state the ball is in
	ballState: BALL_DEAD,

	// The fielding position of the fielder to whom the ball is traveling, or is with
	targetFielderPos: null,

	// The fielder with control of the ball
	activeFielder: null,

	// The runner with priority for a counter-fielder action.
	// Batter gets this off the bat, after that dependent on the situation.
	activeRunner: null,

	// Game state
	iCurrentInning: 0,
	bIsTopOfInning: true,

	aHomeInnings: [0, 0, 0, 0, 0, 0, 0, 0, 0],
	aAwayInnings: [0, 0, 0, 0, 0, 0, 0, 0, 0],

	// Since the batter-runner can reach base before a fly ball is caught,
	// need to cache until there's a fielding result
	batterRunnerWaitingResult: null,

	// Inning state
	iInningOuts: 0,
	iBatterStrikes: 0,
	iBatterBalls: 0,

	// Player object that occupies each base: home, first, second, third
	aRunnerLocations: [null, null, null, null],
	aRunnerTargets: [null, null, null, null],
	
	// List of runners out in the field, without regards to where they are on it
	aRunnersInField: [],

	// Number of runners currently in motion
	iRunningRunners: 0,

	// Whether the ball is in play and alive
	bIsBallInPlay: false,

	pitchTimer: null,

	pitcherInfoHUD: null,
	batterInfoHUD: null,
	countHUD: null,

	bGlobalUIPause: false,
	currentDialog: null,
	
	randomizer: null,
	
	init: function(homeTeam, awayTeam) {
		if (homeTeam != undefined || awayTeam != undefined) {
			this.setTeams(homeTeam, awayTeam);
		}	
	},

	preload: function() {
		game.load.json('mutineers', './data/teams/mutineers.json');
		game.load.json('spacebutts', './data/teams/spacebutts.json');

		actionManager.loadActions();
		lineManager.load();
	},

	create: function() {
		actionManager.parseActions();
		lineManager.parse();
		gameField.DrawField(game);
		this.randomizer = new Phaser.RandomDataGenerator();

		if (this.homeTeam == null) {
			this.homeTeam = new Team();
			this.homeTeam.loadTeam(game.cache.getJSON("mutineers"));	
		}

		if (this.awayTeam == null) {
			this.awayTeam = new Team();
			this.awayTeam.loadTeam(game.cache.getJSON("spacebutts"));	
		}
		
		this.startGame();
	},

	update: function() {

	},
	
	// Set the teams to be used for the game.
	// If a team object, uses that directly.
	// Anything else uses one of the default teams
	setTeams: function(home, away) {
		if (home == undefined) {
			this.homeTeam.loadTeam(game.cache.getJSON("mutineers"));
		} else {
			this.homeTeam = home;
		}
		
		if (away == undefined) {
			this.awayTeam.loadTeam(game.cache.getJSON("spacebutts"));
		} else {
			this.awayTeam = away;
		}
	},

	startGame: function() {
		//game.rnd.sow(new Date());
		
		var umpireInfo = {name: "Umpire Cat", icon: "FFF.FF.20.FF.AA0.FF.0F.FF"};
		this.umpire = new Player(0, umpireInfo, 0x222299);

		//this.showInningsChangeScreen();

		this.showUmpireDialog("Play ball!", function(option) {
			gameState.startInning();
		});
	},

	startInning: function() {
		this.aRunnersInField = [];
		
		if (this.bIsTopOfInning) {
			this.homeTeam.fieldTeam();
			this.awayTeam.batTeam(this.bIsTopOfInning);	

			this.fieldingTeam = this.homeTeam;
			this.battingTeam = this.awayTeam;
		} else {
			this.homeTeam.batTeam(this.bIsTopOfInning);
			this.awayTeam.fieldTeam();

			this.fieldingTeam = this.awayTeam;
			this.battingTeam = this.homeTeam;
		}

		this.iInningOuts = 0;
		this.iBatterStrikes = 0;
		this.iBatterBalls = 0;
		this.aRunnerLocations = [null, null, null, null];

		// HUD
		if (this.pitcherInfoHUD == null) {
			this.pitcherInfoHUD = new PitcherInfoHUD();
			this.pitcherInfoHUD.setPosition(5, 510);
		}

		if (this.batterInfoHUD == null) {
			this.batterInfoHUD = new BatterInfoHUD();
			this.batterInfoHUD.setPosition(325, 510);
		}

		if (this.countHUD == null) {
			this.countHUD = new CountHUD(this.awayTeam, this.homeTeam);
			this.countHUD.setPosition(625, 510);
		}

		this.pitcherInfoHUD.setPlayer(this.fieldingTeam.getPitcher());
		this.callNewBatter();
		this.countHUD.resetInning(this.iCurrentInning, this.bIsTopOfInning);
	},

	endInning: function() {
		if (!this.bIsTopOfInning) {
			this.iCurrentInning++;
		}
		
		// Check for end of game
		if (this.iCurrentInning == this.numberOfInnings - 1 && this.bIsTopOfInning) {
			if (this.countScore(this.aHomeInnings) > this.countScore(this.aAwayInnings)) {
				this.endGame();
				return;
			}
		} else if (this.iCurrentInning >= this.numberOfInnings) {
			this.endGame();
			return;
		}
		
		this.aRunnerLocations = [null, null, null, null];
		this.aRunnerTargets = [null, null, null, null];

		this.bIsTopOfInning = !this.bIsTopOfInning;
		//this.startInning();

		this.showInningsChangeScreen();
	},

	endGame: function() {

	},

	callNewBatter: function() {
		this.aRunnerLocations[HOME] = this.battingTeam.presentNextBatter();
		this.batterInfoHUD.setPlayer(this.aRunnerLocations[HOME]);
		this.registerRunner(this.aRunnerLocations[HOME]);

		this.showPlayerDialog(this.aRunnerLocations[HOME], true, "New Batter\n" + this.aRunnerLocations[HOME].getName(), function() {
			gameState.beginAtBat(gameState.aRunnerLocations[HOME], gameState.fieldingTeam.getPitcher());	
		});
	},
	
	registerRunner: function(runner) {	
		this.aRunnersInField.push(runner);
	},
	
	unregisterRunner: function(runner) {
		var index = this.aRunnersInField.indexOf(runner);
		
		if (index > -1) {
			this.aRunnersInField.splice(index, 1);
		}
	},

	/* *** Game Logic *****************************************************************
		- Begin at-bat
			1) Players make AP bets in secret
			2) Highest bid choses first
			3) Resolve base on stats and argument mods, have umpire announce
			...and so on
		- Ball in play
			1) Umpire decides where ball is going and how

	*/	

	// Begin an at bat between a batter and a pitcher
	beginAtBat: function(batter, pitcher) {
		this.iBatterStrikes = 0;
		this.iBatterBalls = 0;
		this.countHUD.resetCount();

		this.doPitch();
	},

	// Do a pitch for the current at-bat
	doPitch: function() {
		this.aRunnerLocations[HOME].showBattingStance();
		
		this.selectedBatterAction = null;
		this.selectedPitcherAction = null;

		this.pitcherInfoHUD.updatePlayer();
		this.batterInfoHUD.updatePlayer();

		this.selectPitcherAction();
	},

	// Have the pitcher select their action
	selectPitcherAction: function() {
		var pitcher = this.fieldingTeam.getPitcher();
		this.showChoiceDialog(pitcher, pitcher.getName() + " (Pitcher)", actionManager.getAvailablePitcherActions(pitcher, pitcher.getAP()), 
			function(action) {
				console.log("Pitcher selected action: " + action.text);
				pitcher.consumeAP(action.getCost());
				gameState.selectedPitcherAction = action;

				gameState.selectBatterAction();
			});
	},

	// Have the batter select their action
	selectBatterAction: function() {
		var batter = this.aRunnerLocations[HOME];
		this.showChoiceDialog(batter, batter.getName() + " (Batter)", actionManager.getAvailableBatterActions(batter, batter.getAP()), 
			function(action) {
				console.log("Batter selected action: " + action.text);
				batter.consumeAP(action.getCost());
				gameState.selectedBatterAction = action;

				//gameState.throwPitch();
				gameState.showPitcherAction();
			});
	},

	showPitcherAction: function() {
		var pitcher = this.fieldingTeam.getPitcher();
		this.showPlayerDialog(pitcher, true, pitcher.getName() + " (Pitcher)\n" + this.selectedPitcherAction.getRandomColor(), 
			function() {
				gameState.showBatterAction();
			});
	},

	showBatterAction: function() {
		var batter = this.aRunnerLocations[HOME];
		
		if (this.selectedBatterAction.getActionType() != ACTION_START_BATTER_LEAVE) {
			batter.showSwing();
		}
		
		this.showPlayerDialog(batter, true, batter.getName() + " (Batter)\n" + this.selectedBatterAction.getRandomColor(), 
			function() {
				gameState.throwPitch();
			});
	},

	// Once actions have been selected, throw the pitch
	throwPitch: function() {
		if (this.pitchTimer != null) {
			this.pitchTimer.destroy();
		}

		this.pitchTimer = this.game.time.create(true);
		this.pitchTimer.add(250, pitchTimerResolvePitch, this);
		this.pitchTimer.start();
	},

	// Resolve the current pitch
	resolvePitch: function() {
		this.pitchTimer.stop();
		//this.showUmpireDialog("Strike one!", null);

		var pitcher = this.fieldingTeam.getPitcher();
		var batter = this.aRunnerLocations[HOME];

		// Modify by their own actions
		var pitchSkill = this.selectedPitcherAction.modStat(STAT_PITCHING, pitcher.getInfo().pitching);
		var pitchPower = this.selectedPitcherAction.modStat(STAT_PITCH_POWER, pitcher.getInfo().pitchPower);
		var battingSkill = this.selectedBatterAction.modStat(STAT_BATTING, batter.getInfo().batting);
		var battingPower = this.selectedBatterAction.modStat(STAT_POWER, batter.getInfo().power);

		// Modify by opponent's actions
		pitchSkill = this.selectedBatterAction.modStat(STAT_PITCHING, pitchSkill);
		pitchPower = this.selectedBatterAction.modStat(STAT_PITCH_POWER, pitchPower);
		battingSkill = this.selectedPitcherAction.modStat(STAT_BATTING, battingSkill);
		battingPower = this.selectedPitcherAction.modStat(STAT_POWER, battingPower);
		
		var roll = game.rnd.frac(); //this.randomizer.frac(); //Math.random();
		var bInStrikeZone = roll <= pitchSkill / 10;

		// Unopposed pitch strike chance: pskill / 10
		if (this.selectedBatterAction.getActionType() == ACTION_START_BATTER_LEAVE) {
			console.log("pitcher rolls " + roll + " <= " + (pitchSkill / 10));

			if (bInStrikeZone) {
				this.recordStrike(true);
			} else {
				this.recordBall();
			}
		}

		// Batter contact chance: 
		//	delta: Total pitch skill - batting skill
		//	* d15  (25) = 80/20  miss/hit	
		//	* d0   (10) = 50/50
		//	* d-10 (0)  = 20/80
		else {
			if (!bInStrikeZone) {
				battingSkill -= 2;
				battingSkill = Math.max(0, battingSkill);
			}

			var pitchTotal = pitchSkill + pitchPower;
			var delta = pitchTotal - battingSkill + 10;
			var pitchPct = .2 + .6 * (delta / 25);
			var batPct = .8 - .6 * (delta / 25);
			var batRoll = game.rnd.frac(); //this.randomizer.frac(); //Math.random();

			// Made contact
			if (batRoll <= batPct) {
				console.log("batter made contact: " + batRoll + " <= " + batPct);
				this.handleHit(batPct - batRoll, battingSkill, battingPower);
			} else {
				console.log("swinging strike: " + batRoll + " <= " + batPct);
				this.recordStrike(false);
			}
		}
	},

	// Records a strike. Returns true on strike out.
	recordStrike: function(bLooking) {
		this.iBatterStrikes++;
		this.countHUD.addStrike();

		if (this.iBatterStrikes >= 3) {
			this.showUmpireDialog("Strike three! You're MEOW-t!", function() {
				gameState.recordOut(gameState.aRunnerLocations[HOME]);
			});
		} else {
			this.showUmpireDialog(lineManager.getStrikeLine(bLooking).text, function() {
				gameState.doPitch();
			});
		}
	},

	// Records a ball. Returns true on a walk.
	recordBall: function() {
		this.iBatterBalls++;
		this.countHUD.addBall();

		if (this.iBatterBalls >= 4) {
			this.showUmpireDialog("Ball four!", function() {
				gameState.walkBatter();
			});
		} else {
			var line = lineManager.getBallLine();
			this.showUmpireDialog(line.text, function() {
				
				if (line.special != 1) {
					gameState.doPitch();	
				} else {
					gameState.showBellyRubs();
				}
			});
		}
	},

	// Records an out. Returns true on end-of-inning.
	// Returns true if the ball is in play and is still alive
	recordOut: function(player) {
		this.iInningOuts++;
		//this.iRunningRunners--;
		console.log("Outs: " + this.iInningOuts + " (" + player + ")");

		this.sendBatterToDugout(player, true);
		this.countHUD.addOut();

		if (this.iInningOuts >= 3 || !this.areRunnersRunning()) {
			this.callDeadBall();
			return false;
		}
		
		for (var i = 0; i < this.aRunnerTargets.length; i++) {
			if (this.aRunnerTargets[i] == player) {
				this.aRunnerTargets[i] = null;
				break;
			}
		}

		return this.bIsBallInPlay;
	},

	recordRun: function(player) {
		console.log("Record run");

		if (this.bIsTopOfInning) {
			this.aAwayInnings[this.iCurrentInning]++;
		} else {
			this.aHomeInnings[this.iCurrentInning]++;
		}

		this.countHUD.addRun();
		this.sendBatterToDugout(player, false);
	},

	// Call dead ball after a ball put into play is resolved
	callDeadBall: function() {
		console.log("Dead ball!");
		this.fieldingTeam.resetFielders();
		this.bIsBallInPlay = false;
		this.ballState = BALL_DEAD;

		if (this.throwTimer != undefined) {
			this.throwTimer.destroy();
			this.throwTimer = undefined;
		}

		if (this.gatherTimer != undefined) {
			this.gatherTimer.destroy();
			this.gatherTimer = undefined;
		}

		if (this.iInningOuts >= 3) {
			this.endInning();
		} else {
			this.callNewBatter();
		}
	},

	// Walk the batter and advance all forced runners
	walkBatter: function() {
		var startBase = HOME;
		var bIsForced = true;
		
		for (var i = startBase; i <= THIRD; i++) {
			if (this.aRunnerLocations[i] == null) {
				bIsForced = false;
				continue;
			}
			
			// TODO have some AI decide a not-forced runner
			var targetBase = i + 1;
			
			if (targetBase > THIRD) {
				targetBase = HOME;
			}
			
			this.iRunningRunners++;
			this.aRunnerLocations[i].advanceToBase(targetBase);
			bIsForced = true;
		}
	},

	// Handle getting bat on ball
	// margin is the difference between roll and what they were rolling for
	handleHit: function(margin, battingSkill, battingPower) {
		//this.recordOut();

		// Hit types: line drive, ground ball, fly ball
		// 	* Line drives require high margin, and are most productive
		//	* Ground ball medium margin
		//	* Fly ball low margin 
		//
		// Margin caps at .8

		// Line drive, ground ball, fly ball
		var weights = [4, 5, 4];
		//var weights = [0, 1, 0];
		var weightTotal = 13;
		var hitType = 1;
		var roll = game.rnd.integerInRange(0, weightTotal); //Math.floor(Math.random() * weightTotal);

		for (var i = 0; i < weights.length; i++) {
			roll -= weights[i];

			if (roll <= 0) {
				hitType = i;
				break;
			}
		} 

		//hitType = FLY_BALL;

		// Based on the type of hit, pick a fielder to be the general vicinity.
		// Difficulty for fielder is function of margin, batting skill and power.
		// Fielder counters with fielding skill and speed.
		//
		// Line drive picks infield or outfield 
		//	- Can pick infielders or outfielders with even odds
		//	- Bskill and margin for outfield, +bpower for infield
		//	- If goes to outfield, almost guarantee at least a single
		// Fly ball picks infield or outfield
		//	- Better margin goes flatter, power how far
		// Grounder picks infield
		//	- Bskill for base difficulty, power function of margin
		//
		// TODO what range should difficulty be normalized to?
		//
		// Distance is literal distance the ball travels
		var targetFielder; //= this.getFielderByDistance(distance, hitType);
		
		switch (hitType) {
			// Line drive
			case 0:
				// Select target fielder
				//var targetFielder = this.getFielderByDistance(distance, hitType); //this.getRandomFielder(PITCHER, RIGHT_FIELD, true);
				var difficulty = 0;
				var distance = (battingPower / 10) * (gameField.homeRunInfluence - gameField.infieldRadius);
				
				console.log("Line drive, base distance: " + distance + " (" + (margin * 2) + ")");
				distance = gameField.infieldRadius + distance * this.adjustBySinCurve(margin * 2);
				
				targetFielder = this.getFielderByDistance(distance, hitType);

				// Infield and outfield use different math
				if (targetFielder < LEFT_FIELD) {
					difficulty = battingSkill * margin + battingPower;

					// Make it harder for the pitcher
					if (targetFielder == PITCHER && battingPower * margin >= 5) {
						difficulty += 2;
					}
				} else {
					difficulty = battingSkill * margin * 2 + battingPower;
				}

				console.log("Line drive to " + targetFielder + " (difficulty: " + difficulty + "), distance: " + distance);

				this.showUmpireDialog("Fe-line drive to " + GetPlayerPositionName(targetFielder) + "!", function() {
					gameState.putBallInPlay(LINE_DRIVE, targetFielder, difficulty, distance);
				});
				break;

			// Ground ball
			case 1:
				//var targetFielder = this.getRandomFielder(PITCHER, SHORT_STOP, true);
				var difficulty = battingSkill + battingPower * margin;
				var distance = game.math.clamp(battingPower / 8, 0, 1) * gameField.infieldInfluence;

				console.log("Ground ball, base distance: " + distance + " (" + (margin * 3) + ")");

				//targetFielder = THIRD_BASE;
				distance = this.adjustBySinCurve(margin * 3) * distance;
				targetFielder = this.getFielderByDistance(distance, hitType);

				if (targetFielder == CATCHER) {
					difficulty = game.math.clamp(difficulty - 3, 0, 10);
				} else if (targetFielder == PITCHER) {
					if (distance > gameField.basesRadius) {
						difficulty = game.math.clamp(difficulty + 1, 0, 10);
					}
				}
				
				console.log("Ground ball to " + targetFielder + " (difficulty: " + difficulty + "), distance: " + distance);
				
				this.showUmpireDialog("Ground ball to " + GetPlayerPositionName(targetFielder) + "!", function() {
					gameState.putBallInPlay(GROUND_BALL, targetFielder, difficulty, distance);
				});
				break;

			// Fly ball
			default:
			case 2:
				//var targetFielder = 0;
				var difficulty = 0;
				var distance = game.math.clamp(battingPower / 8, 0, 1) * gameField.homeRunInfluence;
				var goingToWall = "";

				// TODO make this a curve that gets adjusted by batting power?
				var roll = game.rnd.frac();

				console.log("Fly ball, base distance: " + distance + " (margin: " + roll + ")");
				
				difficulty = battingSkill + battingPower * roll;
				distance = this.adjustByHalfSinCurve(roll) * distance;
				targetFielder = this.getFielderByDistance(distance, hitType);
				
				//targetFielder = LEFT_FIELD;

				/*if (margin >= 0.6) {
					//targetFielder = this.getRandomFielder(LEFT_FIELD, RIGHT_FIELD, true);
					difficulty = battingSkill * margin + battingPower * margin;
					distance = gameField.infieldRadius + this.adjustBySinCurve(distance) * gameField.outfieldGap;
					targetFielder = this.getFielderByDistance(distance, hitType);
				} else if (margin >= 0.3) {
					//targetFielder = this.getRandomFielder(PITCHER, RIGHT_FIELD, true);
					difficulty = battingSkill * margin + battingPower * margin * 0.5;

					if (game.rnd.integerInRange(0,1) == 1) {
						distance = gameField.infieldRadius + this.adjustBySinCurve(distance) * gameField.outfieldGap;
					} else {
						distance = this.adjustBySinCurve(distance) * gameField.infieldRadius + 30;
					}
					
					targetFielder = this.getFielderByDistance(distance, hitType);

				} else {
					//targetFielder = this.getRandomFielder(PITCHER, SHORT_STOP, false);
					difficulty = 1;
					distance = this.adjustBySinCurve(distance) * gameField.infieldRadius - 20;
					targetFielder = this.getFielderByDistance(distance, hitType);
				}*/

				if (distance >= gameField.backWallInfluence) {
					//switch (Math.round(Math.random() * 3)) {
					switch (game.rnd.integerInRange(0, 3)) {
						case 0:
							goingToWall = " It's going to the wall!";
							break;

						case 1:
							goingToWall = " Someone gave it some catnip!";
							break;

						case 2:
							goingToWall = " It's got some legs!";
							break;

						case 3:
							goingToWall = " Back! Back! Back!";
							break;
					}

					difficulty += 3;
				}
				
				console.log("Fly ball to " + targetFielder + " (difficulty: " + difficulty + "), distance: " + distance);
				
				// TODO
				// calculate time to fielder based off of distance and hit type

				this.showUmpireDialog("Fly ball to " + GetPlayerPositionName(targetFielder) + "!" + goingToWall, function() {
					gameState.putBallInPlay(FLY_BALL, targetFielder, difficulty, distance);
				});
				break;
		}
	},
	
	// Pick a random fielder
	// startPos and endPos are the range of fielders to get, inclusive
	getRandomFielder: function(startPos, endPos, bExcludeCatcher) {
		var targetFielder = startPos + Math.floor(Math.random() * (endPos - startPos + 1));
		//var targetFielder = this.randomizer.integerInRange(startPos, endPos);

		if (targetFielder >= endPos + 1) {
			targetFielder = endPos;
		}

		// Exclude the catcher (index 1)
		if (bExcludeCatcher && startPos <= CATCHER && targetFielder > 0) {
			targetFielder += 1;
			
			if (targetFielder > endPos) {
				targetFielder = endPos;
			}
		}
		
		return targetFielder;
	},
	
	// Draw the random fielder with access to a ball of a certain distance
	getFielderByDistance: function(distance, hitType) {
		
		// Close enough for the catcher
		if (distance <= gameField.catcherInfluence) {
			return CATCHER;
		}
		
		// Far enough for outfielders only 
		if (distance >= gameField.outfieldInfluence) {
			return game.rnd.integerInRange(LEFT_FIELD, RIGHT_FIELD);
		}
		
		// Infield only
		if (distance > gameField.catcherInfluence && distance <= gameField.infieldInfluence) {
			var roll = game.rnd.integerInRange(FIRST_BASE, THIRD_BASE);
			
			if (roll == 1) {
				roll = FIRST_BASE;
			}
			
			return roll;
		}
		
		// Infield or outfield
		return game.rnd.integerInRange(FIRST_BASE, RIGHT_FIELD);
	},
	
	// Tell the runners that the ball is in play
	// Forced runners will all move to the next base. Non-forced will decide on their own.
	putBallInPlay: function(hitType, targetFielder, difficulty, distance) {
		var startBase = HOME;
		var bIsForced = true;
		this.bIsBallInPlay = true;
		this.ballState = BALL_UNCONTROLLED;
		this.hitType = hitType;
		this.activeRunner = this.aRunnerLocations[HOME];
		
		// Set the batters running
		for (var i = startBase; i <= THIRD; i++) {
			if (this.aRunnerLocations[i] == null) {
				bIsForced = false;
				continue;
			}
			
			var targetBase = i + 1;
			
			if (targetBase > THIRD) {
				targetBase = HOME;
			}
			
			//this.iRunningRunners++;
			this.aRunnerLocations[i].ballInPlay(targetBase, hitType, difficulty, targetFielder, bIsForced);
			bIsForced = true;
		}

		// Set the fielder fielding
		var fielder = this.fieldingTeam.getFielderForPosition(targetFielder);
		fielder.fieldBall(hitType, difficulty, distance);
		this.targetFielderPos = targetFielder;

		// Rest of the fielders move to back up
		// ...shortstop to second
		if (targetFielder == SECOND_BASE) {
			this.fieldingTeam.getFielderForPosition(SHORT_STOP).runToFieldingPosition(SECOND_BASE);
		} 

		// ...second to second
		else {
			this.fieldingTeam.getFielderForPosition(SECOND_BASE).runToFieldingPosition(SECOND_BASE);
		}

		// Pitcher backs up first
		if (targetFielder == FIRST_BASE) {
			this.fieldingTeam.getFielderForPosition(PITCHER).runToFieldingPosition(FIRST_BASE);
		} else if (targetFielder == THIRD_BASE) {
			this.fieldingTeam.getFielderForPosition(PITCHER).runToFieldingPosition(THIRD_BASE);
		}
	},

	// Called by a fielder when they have selected their action
	fielderSelectAction: function(fielder, action, hitType, difficulty, distance) {
		this.selectedFielderAction = action;
		this.activeFielder = fielder;
		
		console.log("Setting active fielder to: " + fielder.getName());

		var runner = this.activeRunner;

		// See if a runner can counter
		if (runner == null) {

		}

		this.activeRunner = null;

		if (runner != null) {
			var target = this.getTargetForRunner(runner);
			var baseName = this.getBaseName(target);

			this.showChoiceDialog(runner, runner.getName() + " (" + this.getBaseStatus(runner) + ")", actionManager.getAvailableRunnerActions(runner, runner.getAP()),
				function(choice) {
					gameState.selectedRunnerAction = choice;
					//gameState.resolveFielderGetBall(fielder, hitType, difficulty, distance);
					gameState.showFielderAction(fielder, runner, hitType, difficulty, distance);
				});	
		} else {
			//this.resolveFielderGetBall(fielder, hitType, difficulty, distance);
			this.showFielderAction(fielder, runner, hitType, difficulty, distance);
		}
	},

	showFielderAction: function(fielder, runner, hitType, difficulty, distance) {
		this.showPlayerDialog(fielder, true, fielder.getName() + " (Fielder)\n" + this.selectedFielderAction.getRandomColor(), 
			function() {
				if (gameState.selectedRunnerAction != null) {
					gameState.showRunnerAction(fielder, runner, hitType, difficulty, distance);
				} else {
					gameState.resolveFielderGetBall(fielder, hitType, difficulty, distance);
				}
			});
	},

	showRunnerAction: function(fielder, runner, hitType, difficulty, distance) {
		this.showPlayerDialog(runner, true, runner.getName() + " (" + this.getBaseStatus(runner) + ")\n" + this.selectedRunnerAction.getRandomColor(), 
			function() {
				gameState.resolveFielderGetBall(fielder, hitType, difficulty, distance);
			});
	},

	// Resolve the result of the fielder attempting to get the ball
	resolveFielderGetBall: function(fielder, hitType, difficulty, distance) {
		var fieldingPos = this.fieldingTeam.getFielderPosition(fielder) - 1;
		this.activeFielder = fielder;

		// Make fielding a little less strong
		difficulty += 2;

		if (fieldingPos >= LEFT_FIELD) {
			difficulty /= 2;
		}

		var fieldingSkill = this.selectedFielderAction.modStat(STAT_FIELDING, fielder.getInfo().fielding);

		if (this.selectedRunnerAction != null) {
			fieldingSkill = this.selectedRunnerAction.modStat(STAT_FIELDING, fielder.getInfo().fielding);
		}

		var delta = fieldingSkill - difficulty;
		var roll = game.rnd.frac(); //Math.random();
		var bSuccess = false;
		var hitter = this.aRunnerTargets[FIRST];

		// Delta 0 is even odds. Effective range is [-10, +5].
		if (delta >= 0) {
			delta = 0.5 + 0.5 * (delta / 5);
		} else {
			delta = 0.5 - 0.5 * (delta / -10);
		}

		bSuccess = roll <= delta;

		console.log("Fielder rolls " + roll + " <= " + delta);

		switch (hitType) {
			case LINE_DRIVE:
				if (bSuccess) {

					// Can make a play
					//if (this.recordOut(hitter)) {
						this.showUmpireDialog("Ball is caught! Yeerrrrrr meowt!", function() {
						
							// Ball is still in play, make another play?
							if (gameState.recordOut(hitter)) {

								// If anybody's running, tell them go to back
								for (var i = 0; i < gameState.aRunnerTargets.length; i++) {
									if (gameState.aRunnerTargets[i] != null) {
										gameState.aRunnerTargets[i].abortRun();
									}
								}

								// Throw options
								gameState.fielderGathersBall(fielder, true);
							}
						});
					//}
				}

				// Ball gets by, calculate a penalty time
				//
				else {
					var fielderDistance = Phaser.Point.distance(fielder.getPosition(), new Phaser.Point(gameField.homePlateX, gameField.homePlateY));

					if (fieldingPos == LEFT_FIELD || fieldingPos == RIGHT_FIELD) {
						this.showUmpireDialog("Blasted into the corner!", function() {
							gameState.delayFielderGather(fielder, 4000);
						});
					} else if (fieldingPos == CENTER_FIELD) {
						this.showUmpireDialog("Sails past to the wall!", function() {
							gameState.delayFielderGather(fielder, 4000);
						});
					} else if (fieldingPos < LEFT_FIELD) {
						// Outfield collects
						var outfielder;

						if (fieldingPos == FIRST_BASE) {
							outfielder = this.fieldingTeam.getFielderForPosition(RIGHT_FIELD);
							this.targetFielderPos = RIGHT_FIELD;
						} else if (fieldingPos == THIRD_BASE) {
							outfielder = this.fieldingTeam.getFielderForPosition(LEFT_FIELD);
							this.targetFielderPos = LEFT_FIELD;
						} else {
							outfielder = this.fieldingTeam.getFielderForPosition(CENTER_FIELD);
							this.targetFielderPos = CENTER_FIELD;
						}

						this.showUmpireDialog("It screams past the fielder!", function() {
							gameState.delayFielderGather(outfielder, 3000, true);
						});
					}
				}
				break;

			case GROUND_BALL:
				if (bSuccess) {
					this.showUmpireDialog("Fielder pounces on the ball!", function() {
						gameState.fielderGathersBall(fielder, false);
					});
				} else {
					this.showUmpireDialog("It gets past the fielder!", function() {
						gameState.delayFielderGather(fielder, 3000);
					});
				}
				break;

			case FLY_BALL:
				// Ball is caught
				if (bSuccess) {
					this.showUmpireDialog("Ball is caught! Yeerrrrrr meowt!", function() {
						
						// Batter-runner waiting for the catch
						if (gameState.batterRunnerWaitingResult != null) {
							hitter = gameState.batterRunnerWaitingResult;
							gameState.batterRunnerWaitingResult = null;
						}

						for (base in gameState.aRunnerLocations) {
							if (gameState.aRunnerLocations[base] == hitter) {
								gameState.aRunnerLocations[base] = null;
							}

							if (gameState.aRunnerTargets[base] == hitter) {
								gameState.aRunnerTargets[base] = null;
							}
						}

						// Ball is still in play, make another play?
						if (gameState.recordOut(hitter)) {
							gameState.fielderGathersBall(fielder, true);
						}
					});
				}

				// Can't make it. Calculate how much time the runner gets
				else {
					if (this.bIsBallInPlay) {
						this.showUmpireDialog("Ball drops safely!", function() {
							gameState.delayFielderGather(fielder, 2000);
						});
					}
				}
				break;
		}

		this.selectedFielderAction = null;
		this.selectedRunnerAction = null;
	},

	// Delay the fielder from gathering the ball
	delayFielderGather: function(fielder, delay, bAlternate) {
		if (bAlternate == undefined) {
			bAlternate = false;
		}
		
		console.log("Fielder delayed " + delay);

		if (this.gatherTimer != undefined) {
			this.gatherTimer.destroy();
		}

		var gatherTimer = game.time.create(true);
		gatherTimer.add(delay, this.completeDelayFielderGather, this, fielder);
		gatherTimer.start();

		this.gatherTimer = gatherTimer;
		this.ballState = BALL_FUMBLED;
		fielder.ballFumbled(delay, bAlternate);
		
		for (i in this.aRunnersInField) {
			this.aRunnersInField[i].fielderFumblesBall(fielder, this.fieldingTeam.getFielderPosition(fielder));
		}
	},

	completeDelayFielderGather: function(fielder) {
		this.fielderGathersBall(fielder, false);
	},

	// Called when the fielder has gathered the ball and can make a play
	fielderGathersBall: function(fielder, bCatch) {
		if (fielder == undefined || fielder == null) {
			console.log("caught problem");
		}
		
		console.log(fielder.getName() + " gathers ball (in play? " + this.bIsBallInPlay + ")");
		
		if (!this.bIsBallInPlay) {
			return;
		}

		// Dropped fly ball with nobody running?
		if (!this.areRunnersRunning()) {
			this.callDeadBall();
			return;
		}
		
		this.ballState = BALL_CONTROLLED;
		this.onBallFielded(fielder, this.fieldingTeam.getFielderPosition(fielder), bCatch);

		this.showBaseOptions(fielder, function(choice) {
			var position = gameState.fieldingTeam.getFielderPosition(fielder) - 1;

			console.log("Fielder throwing to: " + choice.text + " (" + position + ", " + choice.id + ")");

			// FB or TB run to their base instead of throw
			if ((position == FIRST_BASE && choice.id == FIRST) || (position == THIRD_BASE && choice.id == THIRD)) {

				// TODO Return to base, if needed
				gameState.showUmpireDialog("Out at " + GetPlayerPositionName(position) + "!", function() {
					gameState.recordOut(gameState.aRunnerTargets[choice.id]);
				});
			}

			// Throw to base
			else if (choice.id >= HOME) {
				gameState.fielderThrowToBase(fielder, choice.id);
			}
		});
	},

	// Notify all runners that a fielder has aquired the ball
	onBallFielded: function(fielder, position, bCatch) {
		console.log(fielder.getName() + " fields the ball");
		
		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] != null) {
				this.aRunnerTargets[base].fielderHasBall(fielder, position, bCatch);
			}
		}
	},

	// Fielder throws to a given base
	fielderThrowToBase: function(fielder, base) {
		var target = null;
		var targetBase = null;
		var position = gameState.fieldingTeam.getFielderPosition(fielder);

		switch (base) {
			case FIRST:
				
				targetBase = FIRST_BASE;
				break;

			case SECOND:
				if (position == SECOND_BASE) {
					targetBase = SHORT_STOP;
				} else {
					targetBase = SECOND_BASE;
				}
				break;

			case THIRD:
				targetBase = THIRD_BASE;
				break;

			case HOME:
				targetBase = CATCHER;
				break;
		}

		if (targetBase == null) {
			this.callDeadBall();
			return;
		}

		this.ballState = BALL_THROWN;
		this.targetFielderPos = targetBase;

		target = gameState.fieldingTeam.getFielderForPosition(targetBase);
		

		var fielderPos = fielder.getPosition();
		var targetPos = target.getPosition();
		var distance = Phaser.Point.distance(fielderPos, targetPos);
		var delay = distance / fielder.getThrowSpeed();

		target.showCatch(fielderPos);

		// TODO calculate skill

		console.log("Throw takes " + delay + " seconds to (" + targetBase + ")");

		if (this.throwTimer != undefined) {
			this.throwTimer.destroy();
		}

		var throwTimer = game.time.create(true);
		throwTimer.add(delay * 1000, this.fielderThrowComplete, this, target, targetBase - 1);
		throwTimer.start();

		this.throwTimer = throwTimer;
		this.onBallThrown(position, this.targetFielderPos);
	},

	// Notify all runners that a fielder has aquired the ball
	onBallThrown: function(from, to) {
		console.log("Ball is thrown from " + from + " to " + to);

		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] != null) {
				this.aRunnerTargets[base].ballThrownTo(from, to);
			}
		}
	},

	fielderThrowComplete: function(target, base) {
		if (!this.bIsBallInPlay) {
			return;
		}

		if (this.aRunnerTargets[base] != null) {
			// TODO make this a skill check
			this.showUmpireDialog("Runner is out at " + GetPlayerPositionName(base + 1) + "!", function() {
				if (gameState.recordOut(gameState.aRunnerTargets[base])) {

					// There are still plays to be made
					gameState.fielderGathersBall(target);
				}
			});
		} else {

		}
	},

	// Called by the runner if they decided to run
	runnerAcceptRun: function(runner, targetBase) {
		console.log("Runner " + runner.getName() + " is running");
		
		if (this.aRunnerTargets[FIRST] == runner && this.hitType == FLY_BALL && this.ballState == BALL_UNCONTROLLED) {
			this.batterRunnerWaitingResult = runner;
		}
		
		for (base in this.aRunnerLocations) {
			if (this.aRunnerLocations[base] == runner) {
				this.aRunnerLocations[base] = null;
			}

			if (this.aRunnerTargets[base] == runner) {
				this.aRunnerTargets[base] = null;
			}
		}

		this.aRunnerTargets[targetBase] = runner;
		this.iRunningRunners++;
	},

	// Called by the runner if they declined to run
	runnerDeclineRun: function(runner, targetBase) {
		console.log("Runner " + runner.getName() + " declined to run");

		if (this.aRunnerTargets[targetBase] == runner) {
			this.aRunnerTargets[targetBase] = null;
		}
	},

	// Called by runner when it's done, either when run complete or intercepted early
	// bAtBase true if reached base on its own
	runnerReportComplete: function(runner, targetBase, bAtBase) {
		console.log(runner.getName() + " reports run complete");
		
		this.iRunningRunners--;
		this.aRunnerTargets[targetBase] = null;

		if (targetBase == HOME) {
			this.recordRun(runner);
		} else {
			this.aRunnerLocations[targetBase] = runner;
		}

		if (this.hitType == FLY_BALL && this.ballState == BALL_UNCONTROLLED) {
			this.batterRunnerWaitingResult = runner;
		} else if (!this.areRunnersRunning()) {
			this.callDeadBall();
		}
	},

	// A runner has decided to change where it's running to 
	runnerChangeRunTarget: function(runner, targetBase) {	
		console.log(runner.getName() + " has changed to running to " + targetBase);
		
		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] == runner) { 
				this.aRunnerTargets[base] = null;
				break;
			}
		}

		this.aRunnerTargets[targetBase] = runner;
	},

	// Returns information about the ball's current status 
	getBallStatus: function() {
		return {"hit": this.hitType, "state": this.ballState, "target": this.targetFielderPos};
	},

	// Returns if the base can be run to. A base can be run to if it's empty
	// and no other runner has claimed it as a target
	canRunToBase: function(base) {
		return this.aRunnerTargets[base] == null && this.aRunnerLocations[base] == null;
	},

	// Returns if there are any runners active
	areRunnersRunning: function() {
		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] != null) {
				return true;
			}
		}

		return false;
	},
	
	// Given an array of inning scores, return the total score
	countScore: function(innings) {
		var count = 0;
		
		for (var i = 0; i < innings.length; i++) {
			count += innings[i];
		}
		
		return count;
	},

// ****************************************************
//	UI Help
// ****************************************************

	// Show the umpire's dialog box
	showUmpireDialog: function(text, onClose) {
		var dialog = new DialogBox(this.umpire, true, onClose);

		dialog.setText(text);
		dialog.setY(420);
	},
	
	// Shows a generic dialog for a specific player
	showPlayerDialog: function(player, bLeft, text, onClose) {
		var dialog = new DialogBox(player, bLeft, onClose);

		dialog.setText(text);
		dialog.setY(30);
	},

	// Show a choice dialog for a player
	showChoiceDialog: function(player, text, choices, callback) {
		var dialog = new ChoiceDialog(player, true, callback);
		dialog.setupChoices(text, choices);
		dialog.setY(30);
	},

	// Shows options for bases a fielder can throw to, based on runners
	showBaseOptions: function(player, callback) {
		var bases = [];
		bases.push({"id": FIRST, "text": "Throw to first base"});
		bases.push({"id": SECOND, "text": "Throw to second base"});
		bases.push({"id": THIRD, "text": "Throw to third base"});
		bases.push({"id": HOME, "text": "Throw to home"});
		bases.push({"id": -1, "text": "Hold the ball"});

		var dialog = new ChoiceDialog(player, true, callback);
		dialog.setupCustomChoices(player.getName() + " (" + GetPlayerPositionAbbr(player.fieldingPosition) + ")", bases);
		dialog.setY(30);
	},

	showInningsChangeScreen: function() {
		var batting = this.bIsTopOfInning ? this.awayTeam : this.homeTeam;
		var fielding = this.bIsTopOfInning ? this.homeTeam : this.awayTeam;

		var dialog = new InningsChangeScreen(this.aHomeInnings, this.aAwayInnings, this.iCurrentInning, this.bIsTopOfInning,
												batting, fielding);
	},
	
	// Tempt the batter with the danger of belly rubs
	showBellyRubs: function() {
		var player = this.aRunnerLocations[HOME];
		var choices = [];
		choices.push({"id": 0, "text": "Rub dat tummy"});
		choices.push({"id": 1, "text": "Oh hell no"});

		var dialog = new ChoiceDialog(player, true, function(choice) {
			if (choice.id == 0) {
				var roll = game.rnd.frac();
				console.log("Batter rubs dat tummy: " + roll);
				
				if (roll >= 0.75) {
					gameState.showUmpireDialog("(Hisses and claws) You're outta here!", function() {
						gameState.recordOut(gameState.aRunnerLocations[HOME]);
					});
				} else {
					gameState.showUmpireDialog("(Purrrrrrrrrr) Huh, what? Oh, uh... ball four!", function() {
						gameState.walkBatter();
					});
				}
			} else {
				gameState.doPitch();
			}
		});
		dialog.setupCustomChoices(player.getName() + " (Batter)", choices);
		dialog.setY(30);
	},

	closeInningsChangeScreen: function() {
		this.startInning();
	},

	dialogOpened: function(dialog) {
		if (this.currentDialog != null) {
			this.currentDialog.close();
		}

		this.bGlobalUIPause = true;
		this.currentDialog = dialog;
	},

	dialogClosed: function(dialog) {
		if (dialog == this.currentDialog) {
			this.bGlobalUIPause = false;
			this.currentDialog = null;
		}
	},

	sendBatterToDugout: function(player, bRetire) {
		var dugoutPos;

		if (player == null) {
			return;
		}
		
		this.unregisterRunner(player);

		// Clear run targets
		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] == player) {
				this.aRunnerTargets[base] = null;
			}
		}

		for (base in this.aRunnerLocations) {
			if (this.aRunnerLocations[base] == player) {
				this.aRunnerLocations[base] = null;
			}
		}

		if (this.bIsTopOfInning) {
			dugoutPos = gameField.GetAwayDugoutPos();
		} else {
			dugoutPos = gameField.GetHomeDugoutPos();
		}

		if (bRetire) {
			player.retireBatter(dugoutPos);
		} else {
			player.returnToDugout(dugoutPos);
		}
	},

	getTargetForRunner: function(runner) {
		for (base in this.aRunnerTargets) {
			if (this.aRunnerTargets[base] == runner) {
				return parseInt(base);
			}
		}

		return null;
	},

	getLocationForRunner: function(runner) {
		for (base in this.aRunnerLocations) {
			if (this.aRunnerLocations[base] == runner) {
				return parseInt(base);
			}
		}

		return null;
	},

	getBaseName: function(base) {
		switch (base) {
			case HOME:
				return "Home Base";

			case FIRST:
				return "First Base";

			case SECOND:
				return "Second Base";

			case THIRD:
				return "Third Base";
		}
	},

	getBaseStatus: function(runner) {
		var target = this.getTargetForRunner(runner);

		if (target != null) {
			return "Running to " + this.getBaseName(target);
		} else {
			var base = this.getLocationForRunner(runner);

			return "At " + this.getBaseName(base);
		}
	},

	// Given a value normalized [0,1], return a normalized version modified by a sin curve
	adjustBySinCurve: function(pct) {
		pct = game.math.clamp(pct, 0, 1);
		pct = Math.sin(pct * Math.PI - Math.PI / 2) / 2 + .5;
		return pct;
	},

	// Given a value normalized [0,1], return a normalized version modified by a sin curve
	adjustByHalfSinCurve: function(pct) {
		pct = game.math.clamp(pct, 0, 1);
		pct = Math.sin(pct * Math.PI - Math.PI / 2 + 0.4) / 2 + .5;
		return pct;
	},
	
	iconTest: function() {
		var teamA = 0xff0000;
		var teamB = 0x0000ff;
		
		//
		var icon = iconGenerator.generateIcon("00.00.00.00.00.00.00.00", teamA);
		icon.x = 0;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("01.00.04.00.01.00.03.01", teamB);
		icon.x = 150;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("02.00.08.00.02.00.02.02", teamA);
		icon.x = 300;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("03.00.21.00.03.00.01.03", teamB);
		icon.x = 450;
		icon.y = 0;
		
		icon = iconGenerator.generateIcon("04.00.00.00.04.00.00.04", teamA);
		icon.x = 600;
		icon.y = 0;
		
		//
		icon = iconGenerator.generateIcon("05.00.01.00.05.00.0E.05", teamB);
		icon.x = 0;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("00.00.05.00.06.00.0D.06", teamA);
		icon.x = 150;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("01.00.22.00.07.00.0C.07", teamB);
		icon.x = 300;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("02.00.00.00.08.00.0B.08", teamA);
		icon.x = 450;
		icon.y = 150;
		
		icon = iconGenerator.generateIcon("03.00.00.00.09.00.0A.09", teamB);
		icon.x = 600;
		icon.y = 150;
		
		//
		icon = iconGenerator.generateIcon("04.00.02.00.00.00.09.0A", teamA);
		icon.x = 0;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("05.00.06.00.01.00.08.0B", teamB);
		icon.x = 150;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("00.00.09.00.02.00.07.0C", teamA);
		icon.x = 300;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("01.00.00.00.03.00.06.0D", teamB);
		icon.x = 450;
		icon.y = 300;
		
		icon = iconGenerator.generateIcon("02.00.00.00.04.00.05.0E", teamA);
		icon.x = 600;
		icon.y = 300;
		
		//
		icon = iconGenerator.generateIcon("03.00.03.00.05.00.04.0F", teamB);
		icon.x = 0;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("04.00.07.00.06.00.03.10", teamA);
		icon.x = 150;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("05.00.20.00.07.00.02.11", teamB);
		icon.x = 300;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("00.00.00.00.08.00.01.12", teamA);
		icon.x = 450;
		icon.y = 450;
		
		icon = iconGenerator.generateIcon("01.00.00.00.09.00.00.13", teamB);
		icon.x = 600;
		icon.y = 450;

		// 
		icon = iconGenerator.generateIcon("FFF.FF.20.FF.AA0.FF.0F.FF", 0);
		icon.x = 0;
		icon.y = 600;
	}
};

function pitchTimerResolvePitch() {
	gameState.resolvePitch();
}

Math.clamp = function(value, min, max) {
	return Math.min(Math.max(value, min), max);
}