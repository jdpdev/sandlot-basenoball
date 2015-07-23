var ManageTeam = function(menu, options) {
    this.myMenu = menu;
    this.graphics = game.add.graphics(0, 0);
    this.teamGroup = new Phaser.Group(game, this.graphics, "teamGroup");
    
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
                    (options.home ? "HOME" : "AWAY"), { font: "60px hvd_peaceregular", fill: "#ffffff", align: "left"});
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
    });
    
    this.createButton(signStart.x + 10, signStart.y + 35, "Load", function(event) {
        console.log("load team from json");
    });
    
    this.createButton(signStart.x + 10, signStart.y + 80, "Mutineers", function(event) {
        console.log("load the Mutineers");
        this.displayTeam(this.loadTeamFromFile("mutineers"));
    });
    
    this.createButton(signStart.x + 10, signStart.y + 105, "Spacebutts", function(event) {
        console.log("load the Spacebutts");
        this.displayTeam(this.loadTeamFromFile("spacebutts"));
    });
}

ManageTeam.prototype.createButton = function(x, y, text, onSelected) {
    var button = game.add.text(x, y, text, { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"});
    this.graphics.addChild(button);
    button.inputEnabled = true;
    
    button.events.onInputOver.add(function(event) {
        this.fill = "#ff0";
    }, button);
    
    button.events.onInputOut.add(function(event) {
        this.fill = "#fff";
    }, button);
    
    button.events.onInputUp.add(onSelected, this);
    
    return button;
}

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
    
}

// Creates a team with random properties
ManageTeam.prototype.createRandomTeam = function() {
    
}

ManageTeam.prototype.displayTeam = function(team) {
    this.teamGroup.removeChildren();
    
    var bigText = { font: "30px hvd_peaceregular", fill: "#ffffff", align: "left"};
    var middleText = { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"}
    var smallText = { font: "15px hvd_peaceregular", fill: "#ffffff", align: "left"}
    
    // ******** Team name
    var teamName = this.addPlainText(this.teamGroup, team.name + " (" + team.totalTeamSkillPoints() + " pts)", bigText, 0, 10);
}

ManageTeam.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
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