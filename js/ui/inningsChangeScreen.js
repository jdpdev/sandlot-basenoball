// Dialog to display on half-innings change.
var InningsChangeScreen = function(homeScore, awayScore, currentInning, bTop, battingTeam, fieldingTeam, bIsGameOver) {
    if (bIsGameOver == undefined) {
        bIsGameOver = false;
    }
    
	this.graphics = game.add.graphics(game.width * 0.5, 0);

	var signStart = new Phaser.Point(-300, 50);
    var signSize = new Phaser.Point(600, 300);

    // Main panel
    this.graphics.beginFill(0xDEB887);
    this.graphics.drawRect(signStart.x, signStart.y, signSize.x, signSize.y);
    this.graphics.endFill();

    // Perspective
    this.graphics.beginFill(0x6e531e);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x, signStart.y),
            new Phaser.Point(signStart.x + signSize.x, signStart.y),
            new Phaser.Point(signStart.x + signSize.x - 20, signStart.y - 20),
            new Phaser.Point(signStart.x + 20, signStart.y - 20),
        ]);
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + 40, signStart.y - 80, 40, 75);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + 80, signStart.y - 80),
            new Phaser.Point(signStart.x + 80, signStart.y - 5),
            new Phaser.Point(signStart.x + 90, signStart.y - 15),
            new Phaser.Point(signStart.x + 90, signStart.y - 80),
        ]);
    this.graphics.endFill();
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + signSize.x - 80, signStart.y - 80, 40, 75);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + signSize.x - 80, signStart.y - 80),
            new Phaser.Point(signStart.x + signSize.x - 80, signStart.y - 5),
            new Phaser.Point(signStart.x + signSize.x - 90, signStart.y - 15),
            new Phaser.Point(signStart.x + signSize.x - 90, signStart.y - 80),
        ]);
    this.graphics.endFill();

    var bigStencilStyle = { font: "30px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var smallStencilStyle = { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var writingStyle = { font: "20px elliotsixregular", fill: "#ffffff", align: "left"};
    var smallWritingStyle = { font: "14px elliotsixregular", fill: "#ffffff", align: "left"};

    // *******************************************************************
    var boxScoreX = signStart.x + 10;
    var boxScoreY = signStart.y + 10;

    // Boxscore Innings
    var inningWidth = 40;
	var inningX = boxScoreX + 150;
	var runsX = inningX + (gameState.numberOfInnings * inningWidth);
	var hitsX = inningX + ((gameState.numberOfInnings + 1) * inningWidth);

    for (var i = 0; i < gameState.numberOfInnings; i++) {
	    this.addPlainText(this.graphics, (i + 1) + "", smallStencilStyle, inningX + (i * inningWidth), boxScoreY);
	}

	this.addPlainText(this.graphics, "R", smallStencilStyle, runsX, boxScoreY);
	//this.addPlainText(this.graphics, "H", smallStencilStyle, hitsX, boxScoreY);

    // Boxscore Teams
    var homeName, homeTeam;
    var awayName, awayTeam;
    var homeY = boxScoreY + 60;
    var awayY = boxScoreY + 30;

    if (bTop) {
        homeTeam = fieldingTeam;
    	homeName = fieldingTeam.name;
    	
    	awayTeam = battingTeam;
    	awayName = battingTeam.name;
    } else {
        awayTeam = fieldingTeam;
    	awayName = fieldingTeam.name;
    	
    	homeTeam = battingTeam;
    	homeName = battingTeam.name;
    }

    this.addPlainText(this.graphics, awayName, writingStyle, boxScoreX, awayY);
    this.addPlainText(this.graphics, homeName, writingStyle, boxScoreX, homeY);

    // Boxscore Scores
    var homeRuns = 0;
    var awayRuns = 0;

    for (var i = 0; i < gameState.numberOfInnings; i++) {
    	if (i > currentInning) {
    		break;
    	}

    	if (i < currentInning || !bTop) {
    		homeRuns += homeScore[i];
    		awayRuns += awayScore[i];

    		this.addPlainText(this.graphics, homeScore[i].toString(), writingStyle, inningX + (i * inningWidth), homeY);
    		this.addPlainText(this.graphics, awayScore[i].toString(), writingStyle, inningX + (i * inningWidth), awayY);
    	} else {
    		awayRuns += awayScore[i];
    		this.addPlainText(this.graphics, awayScore[i].toString(), writingStyle, inningX + (i * inningWidth), awayY);
    	}
    }
    
    this.addPlainText(this.graphics, homeRuns.toString(), writingStyle, runsX, homeY);
    this.addPlainText(this.graphics, awayRuns.toString(), writingStyle, runsX, awayY);
	//this.addPlainText(this.graphics, "0", writingStyle, hitsX, homeY);
	//this.addPlainText(this.graphics, "0", writingStyle, hitsX, awayY);
	
	this.homeRuns = homeRuns;
	this.awayRuns = awayRuns;

    // *******************************************************************
    // Next up
    if (!bIsGameOver) {
        this.drawNextUp(battingTeam, currentInning, boxScoreX, boxScoreY, bTop, bigStencilStyle, writingStyle, smallWritingStyle);
    } else {
        this.drawGameOver(homeTeam, awayTeam, boxScoreX, boxScoreY, bigStencilStyle, writingStyle, smallWritingStyle);
    }

    // *******************************************************************
    // Setup

    this.graphics.inputEnabled = true;
    this.graphics.events.onInputUp.add(function() {
    	gameState.closeInningsChangeScreen();
    }, this);

    gameState.dialogOpened(this);
}

InningsChangeScreen.prototype.drawNextUp = function(battingTeam, currentInning, boxScoreX, boxScoreY, bTop, bigStencilStyle, writingStyle, smallWritingStyle) {
    this.addPlainText(this.graphics, "Batting Next", bigStencilStyle, boxScoreX + 10, boxScoreY + 120);
    this.addPlainText(this.graphics, (bTop ? "Top" : "Bottom") + " of the " + (currentInning + 1) + " inning", 
    					writingStyle, boxScoreX + 245, boxScoreY + 130);

    var nextUpBatters = battingTeam.getBattersUpNext();
    var iconsX = boxScoreX + 10;
    var iconsY = boxScoreY + 170;
    var iconsSize = 75;
    var statsX;
    var icon;
    var iX, iY;
    var maxBarWidth = 80;

    for (var i = 0; i < nextUpBatters.length; i++) {
    	iX = iconsX + i * (iconsSize + 120);
    	iY = iconsY;
    	statsX = iX + iconsSize + 10

    	// Icon
    	icon = nextUpBatters[i].getPortrait();
    	this.graphics.addChild(icon);

    	icon.x = iX;
    	icon.y = iY;
    	icon.width = iconsSize;
    	icon.height = iconsSize;

    	// Name
    	this.addPlainText(this.graphics, nextUpBatters[i].getName() + "\n" + GetPlayerPositionName(nextUpBatters[i].fieldingPosition), 
    						smallWritingStyle, iX, iY + iconsSize);

    	// Stats
    	this.addPlainText(this.graphics, "H", smallWritingStyle, statsX, iY + 2);
    	this.addPlainText(this.graphics, "P", smallWritingStyle, statsX, iY + 27);
    	this.addPlainText(this.graphics, "S", smallWritingStyle, statsX, iY + 52);

    	this.graphics.beginFill(0x666666, 1);
    	this.graphics.drawRect(statsX + 15, iY + 2, maxBarWidth, 20);
    	this.graphics.drawRect(statsX + 15, iY + 27, maxBarWidth, 20);
    	this.graphics.drawRect(statsX + 15, iY + 52, maxBarWidth, 20);
    	this.graphics.endFill();

    	this.graphics.beginFill(0xffcc00, 1);
    	this.graphics.drawRect(statsX + 15, iY + 2, maxBarWidth * (nextUpBatters[i].getInfo().batting / 10), 20);
    	this.graphics.drawRect(statsX + 15, iY + 27, maxBarWidth * (nextUpBatters[i].getInfo().power / 10), 20);
    	this.graphics.drawRect(statsX + 15, iY + 52, maxBarWidth * (nextUpBatters[i].getInfo().speed / 10), 20);
    	this.graphics.endFill();
    }
}

InningsChangeScreen.prototype.drawGameOver = function(homeTeam, awayTeam, boxScoreX, boxScoreY, bigStencilStyle, writingStyle, smallWritingStyle) {
    // Tie
    if (this.awayRuns == this.homeRuns) {
        var minorText = "";
        var bUseUmpire = false;
        var icon;
        
        switch (game.rnd.integerInRange(0, 5)) {
            case 0:
                minorText = "Damnit, mom's calling!";
                break;
                
            case 1:
                minorText = "Guys, it's getting pretty dark.";
                break;
                
            default:
            case 2:
                minorText = "That creepy guy with that van's back.";
                break;
                
            case 3:
                minorText = "Wait, you can do that in baseball?";
                break;
                
            case 4:
                minorText = "Feed me feed me feed me feed me feed me feed me.";
                bUseUmpire = true;
                break;
                
            case 5:
                minorText = "Nap time!";
                bUseUmpire = true;
                break;
        }
        
        if (bUseUmpire) {
            icon = gameState.umpire.getPortrait();
        } else {
            icon = homeTeam.getRandomMember().getPortrait();
        }
        
        this.graphics.addChild(icon);
        icon.x = boxScoreX + 40;
        icon.y = boxScoreY + 120;
        icon.width = 75;
        icon.height = 75;
        
        this.addPlainText(this.graphics, "It's a tie!", bigStencilStyle, boxScoreX + 130, boxScoreY + 120);
        this.addPlainText(this.graphics, minorText, writingStyle, boxScoreX + 140, boxScoreY + 160);
    } 
    
    // Result
    else {
        var text = "";
        var minorText = "";
        var icon = gameState.umpire.getPortrait();

        if (this.awayRuns > this.homeRuns) {
            text = awayTeam.name + " wins the game!";
        } else {
            text = homeTeam.name + " wins the game!";
        }

        switch (game.rnd.integerInRange(0, 4)) {
            case 0:
                minorText = "Everykitten performed to expectations.";
                break;

            case 1:
                minorText = "Here's a trophy mouse.";
                break;

            default:
            case 2:
                minorText = "Now feed me.";
                break;

            case 3:
                minorText = "You may choose one representative\nto rub my belly.";
                break;

            case 4:
                minorText = "Loser cleans my litter box.";
                break;
        }

        this.graphics.addChild(icon);
        icon.x = boxScoreX + 40;
        icon.y = boxScoreY + 120;
        icon.width = 75;
        icon.height = 75;
        
        this.addPlainText(this.graphics, text, bigStencilStyle, boxScoreX + 130, boxScoreY + 120);
        this.addPlainText(this.graphics, minorText, writingStyle, boxScoreX + 140, boxScoreY + 160);
    }
}

InningsChangeScreen.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
}

InningsChangeScreen.prototype.close = function() {
	if (this.graphics.parent != undefined) {
		this.graphics.parent.removeChild(this.graphics);
		gameState.dialogClosed(this);
	}
}