var ManageTeam = function(menu, options) {
    this.selectedTeam = null;
    this.otherTeam = options.otherTeam;
    this.myMenu = menu;
    this.graphics = game.add.graphics(0, 0);
    this.teamGroup = new Phaser.Group(game, this.graphics, "teamGroup");
    this.playerList = [];
    this.bIsSelectingHomeTeam = (options.home == undefined ? true : options.home);
    this.playerViewer = null;
    
    var signStart = new Phaser.Point(100, 100);
    var signSize = new Phaser.Point(600, 400);
    
    this.teamGroup.x = signStart.x + 150;
    this.teamGroup.y = signStart.y;
    
    // Tack-on
    this.graphics.beginFill(0xd6b968);
    this.graphics.drawRect(signStart.x + 300, signStart.y - 70, 200, 100);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + 300, signStart.y - 70),
            new Phaser.Point(signStart.x + 290, signStart.y - 55),
            new Phaser.Point(signStart.x + 290, signStart.y),
            new Phaser.Point(signStart.x + 300, signStart.y),
        ]);
    this.graphics.endFill();
    
    var text = game.add.text(signStart.x + 310, signStart.y - 65, 
                    (this.bIsSelectingHomeTeam ? "HOME" : "AWAY"), { font: "60px hvd_peaceregular", fill: "#ffffff", align: "left"});
    this.graphics.addChild(text);
    
    // Main panel
    this.graphics.beginFill(0xDEB887);
    this.graphics.drawRect(signStart.x, signStart.y, signSize.x, signSize.y);
    this.graphics.endFill();
    
    // Perspective
    this.graphics.beginFill(0x6e531e);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x, signStart.y),
            new Phaser.Point(signStart.x, signStart.y + signSize.y),
            new Phaser.Point(signStart.x + signSize.x, signStart.y + signSize.y),
            new Phaser.Point(signStart.x + signSize.x - 20, signStart.y + signSize.y + 20),
            new Phaser.Point(signStart.x - 20, signStart.y + signSize.y + 20),
            new Phaser.Point(signStart.x - 20, signStart.y + 20),
        ]);
    this.graphics.endFill();
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + signSize.x * 0.5 - 20, signStart.y + signSize.y + 5, 40, 300);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + signSize.x * 0.5 - 20, signStart.y + signSize.y + 5),
            new Phaser.Point(signStart.x + signSize.x * 0.5 - 20, signStart.y + signSize.y + 300),
            new Phaser.Point(signStart.x + signSize.x * 0.5 - 30, signStart.y + signSize.y + 300),
            new Phaser.Point(signStart.x + signSize.x * 0.5 - 30, signStart.y + signSize.y + 15),
        ]);
    this.graphics.endFill();
    
    // Pivot
    this.graphics.pivot = new Phaser.Point(signStart.x + signSize.x * 0.5, 
                                            signStart.y + signSize.y + 300);
    this.graphics.x = 370;
    this.graphics.y = 800;
    this.graphics.rotation = Math.PI + 0.5;
    
    // Buttons
    this.createButton(signStart.x + 10, signStart.y + 10, "New", function(event) {
        console.log("make new team");
        this.displayTeam(this.createRandomTeam());
    }, null, { font: "20px elliotsixregular", fill: "#ffffff", align: "left"});
    
    this.createButton(signStart.x + 10, signStart.y + 35, "Load", function(event) {
        console.log("load team from json");
        var manager = this;

        var dialog = $("#saveTeamDialog");
        $(dialog).show();
        $(dialog).find("a").click(function(event) {
            var textArea = $(this).closest("div").find("textarea");
            var json = $(textArea).val();
            manager.loadTeamFromJSON(json);
            $(this).closest('div').hide();
        });
    }, null, { font: "20px elliotsixregular", fill: "#ffffff", align: "left"});
    
    this.createButton(signStart.x + 10, signStart.y + 80, "Mutineers", function(event) {
        console.log("load the Mutineers");
        this.displayTeam(this.loadTeamFromFile("mutineers"));
    }, null, { font: "20px elliotsixregular", fill: "#ffffff", align: "left"});
    
    this.createButton(signStart.x + 10, signStart.y + 105, "Spacebutts", function(event) {
        console.log("load the Spacebutts");
        this.displayTeam(this.loadTeamFromFile("spacebutts"));
    }, null, { font: "20px elliotsixregular", fill: "#ffffff", align: "left"});

    if (this.bIsSelectingHomeTeam) {
        this.displayTeam(this.loadTeamFromFile("mutineers"));
    } else {
        this.displayTeam(this.loadTeamFromFile("spacebutts"));
    }
}

ManageTeam.prototype.createButton = function(x, y, text, onSelected, parent, style) {
    if (parent == undefined || parent == null) {
        parent = this.graphics;
    }

    if (style == undefined) {
        style = { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"};
    }

    var button = game.add.text(x, y, text, style);
    button.inputEnabled = true;
    
    button.events.onInputOver.add(function(event) {
        this.fill = "#ff0";
    }, button);
    
    button.events.onInputOut.add(function(event) {
        this.fill = "#fff";
    }, button);
    
    button.events.onInputUp.add(onSelected, this);
    parent.addChild(button);
    
    return button;
}

ManageTeam.prototype.homeTeamColor = 0xfff200;
ManageTeam.prototype.awayTeamColor = 0xf50a38;

// *****************************************************************************
// Draw team information

// Create a team from a saved file
ManageTeam.prototype.loadTeamFromFile = function(name) {
    var team = new Team();
    team.loadTeam(game.cache.getJSON(name));
    
    return team;
}

// Create a team object from a json string
ManageTeam.prototype.loadTeamFromJSON = function(json) {
    var jsonObj = JSON.parse(json);
    var team = new Team();
    team.loadTeam(jsonObj);

    this.displayTeam(team);
}

// Creates a team with random properties
ManageTeam.prototype.createRandomTeam = function() {
    var team = GenerateRandomTeam(20);
    return team;
}

ManageTeam.prototype.displayTeam = function(team) {
    this.teamGroup.removeChildren();
    this.selectedTeam = team;
    
    if (this.bIsSelectingHomeTeam) {
        team.setTeamColor(this.homeTeamColor);
    } else {
        team.setTeamColor(this.awayTeamColor);
    }
    
    var bigText = { font: "30px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var middleText = { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"}
    var smallText = { font: "15px elliotsixregular", fill: "#ffffff", align: "left"}
    
    // ******** Team name
    this.teamNameLabel = this.addPlainText(this.teamGroup, team.name + " (" + team.totalTeamSkillPoints() + " pts)", bigText, 0, 10);

    this.teamNameLabel.inputEnabled = false;
    this.teamNameLabel.events.onInputUp.add(function() {
        var dialog = $("#changeTeamNameDialog");
        var thisClosure = this;
        $(dialog).show();
        $(dialog).find("input").val(team.getName());
        $(dialog).find(".submitBtn").click(function() {
            $(this).closest("div").hide();
            
            var newName = $(this).closest("div").find("input").val();
            thisClosure.selectedTeam.setName(newName);
            thisClosure.teamNameLabel.text = newName;
            thisClosure.updateTeamPoints();
        });

        $(dialog).find(".cancelBtn").click(function() {
            $(this).closest("div").hide();
        });
    }, this);

    // ******** Players
    var players = team.players;
    var group;
    var player;
    var i = 0;
    var icon;
    var nameLabel;
    var positionLabel;
    var position;

    this.playerList = new Object();

    //for (var i = 0; i < players.length; i++) {
    for (var key in players) {
        player = players[key];
        group = new Phaser.Group(game, this.teamGroup, "player" + key);
        
        icon = player.getPortrait();
        icon.width = 60;
        icon.height = 60;
        icon.x = 0;
        icon.y = 0;

        group.addChild(icon);
        group.x = 10 + (i % 2) * 250;
        group.y = 60 + Math.floor(i / 2) * 65;

        position = team.getFielderPosition(player) - 1;

        nameLabel = this.addPlainText(group, player.getName(), smallText, icon.x + 65, icon.y);
        positionLabel = this.addPlainText(group, "" + GetPlayerPositionName(position), smallText, icon.x + 65, icon.y + 20);
        i++;
        
        icon.inputEnabled = true;
        icon.menu = this;
        icon.player = player;
        icon.events.onInputUp.add(function() {
            if (this.menu.isPlayerViewerOpen()) {
                return;
            }

            this.menu.openPlayerViewer(this.player);
        }, icon);
        
        group.player = player;
        group.icon = icon;
        group.nameLabel = nameLabel;
        this.playerList[player.getId()] = group;
    }

    // *********** Continue buttons
    var jsonButton = this.createButton(170, 350, "Save Team", function(event) {
        var json = JSON.stringify(this.selectedTeam.toJson());

        var dialog = $("#saveTeamDialog");
        $(dialog).find("textarea").val(json);
        $(dialog).show();
        $(dialog).find("a").click(function() {
            $(dialog).hide();
        })
    }, this.teamGroup);

    var selectButton = this.createButton(320, 350, "Select", function(event) {
        this.selectCurrentTeam();
    }, this.teamGroup);
    
    var instruction = this.addPlainText(this.teamGroup, "(Click us to customize!)", smallText,
                                        180, 325);
}

// Update the display for a player
ManageTeam.prototype.updatePlayerDetails = function(player) {
    var group = this.playerList[player.getId()];

    if (group == undefined) {
        return;
    }

    group.nameLabel.text = player.getName();

    var newIcon = player.getPortrait();
    newIcon.x = group.icon.x;
    newIcon.y = group.icon.y;
    newIcon.width = group.icon.width;
    newIcon.height = group.icon.height;

    newIcon.inputEnabled = true;
    newIcon.menu = this;
    newIcon.player = player;
    newIcon.events.onInputUp.add(function() {
        if (this.menu.isPlayerViewerOpen()) {
            return;
        }

        this.menu.openPlayerViewer(this.player);
    }, newIcon);

    group.removeChild(group.icon);
    group.addChild(newIcon);
}

ManageTeam.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
}

// Select the team currently loaded to play with
ManageTeam.prototype.selectCurrentTeam = function() {
    if (this.isPlayerViewerOpen()) {
        return;
    }

    if (this.bIsSelectingHomeTeam) {
        this.selectedTeam.setTeamColor(this.homeTeamColor);
        this.myMenu.showAwayTeamSelection(this.selectedTeam);
    } else {
        this.selectedTeam.setTeamColor(this.awayTeamColor);
        this.myMenu.startGame(this.otherTeam, this.selectedTeam);
    }
}

ManageTeam.prototype.updateTeamPoints = function() {
    this.teamNameLabel.text = this.selectedTeam.name + " (" + this.selectedTeam.totalTeamSkillPoints() + " pts)";
}

// *****************************************************************************
ManageTeam.prototype.open = function() {
    this.transitionIn();
}

ManageTeam.prototype.close = function() {
    this.transitionOut();
}

ManageTeam.prototype.destroy = function() {
    this.graphics.parent.removeChild(this.graphics);
}

ManageTeam.prototype.transitionIn = function() {
    var tween = game.add.tween(this.graphics).to({rotation: -0.05}, 500, Phaser.Easing.Circular.Out, true);
}

ManageTeam.prototype.transitionOut = function(onComplete) {
    var tween = game.add.tween(this.graphics).to({rotation: Math.PI}, 500, Phaser.Easing.Circular.In, true);
    tween.onComplete.add(this.destroy, this);
}

// *****************************************************************************

ManageTeam.prototype.isPlayerViewerOpen = function() {
    return this.playerViewer != null;
}

ManageTeam.prototype.openPlayerViewer = function(player) {
    this.playerViewer = new ManagePlayer(this, player);
}

ManageTeam.prototype.closePlayerViewer = function(player) {
    if (this.playerViewer != null) {
        this.playerViewer.close();
        this.playerViewer = null;
    }
}