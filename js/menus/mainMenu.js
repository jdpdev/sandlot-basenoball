var MainMenu = function(menu, options) {
    this.myMenu = menu;
    this.graphics = game.add.graphics(0, 0);
    
    var signStart = new Phaser.Point(250, 120);
    var signSize = new Phaser.Point(500, 300);
    
    // Main panel
    this.graphics.beginFill(0xDEB887);
    this.graphics.drawRect(signStart.x, signStart.y, signSize.x, signSize.y);
    this.graphics.endFill();
    
    // Perspective
    this.graphics.beginFill(0x6e531e);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x, signStart.y + signSize.y),
            new Phaser.Point(signStart.x + signSize.x, signStart.y + signSize.y),
            new Phaser.Point(signStart.x + signSize.x, signStart.y),
            new Phaser.Point(signStart.x + signSize.x + 20, signStart.y + 20),
            new Phaser.Point(signStart.x + signSize.x + 20, signStart.y + signSize.y + 20),
            new Phaser.Point(signStart.x + 20, signStart.y + signSize.y + 20),
        ]);
    
    // Post
    this.graphics.beginFill(0xc9983a);
    this.graphics.drawRect(signStart.x + signSize.x * 0.5 - 20, signStart.y + signSize.y + 5, 40, 300);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 20, signStart.y + signSize.y + 5),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 20, signStart.y + signSize.y + 300),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 30, signStart.y + signSize.y + 300),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 30, signStart.y + signSize.y + 15),
        ]);
    this.graphics.endFill();
    
    // Text
    var titleText = game.add.text(0, 0, "SANDLOT\n      BASENOBALL", { font: "50px hvd_peaceregular", fill: "#ffffff", align: "left"});
    this.graphics.addChild(titleText);
    titleText.x = signStart.x + 25;
    titleText.y = signStart.y + 45;
    titleText.rotation = Math.PI / -40;
    
    // Play options
    var gameModeText = game.add.text(0, 0, "Local Multiplayer", { font: "20px hvd_peaceregular", fill: "#ffffff", align: "center"});
    this.graphics.addChild(gameModeText);
    gameModeText.x = signStart.x + signSize.x * 0.5 - 100;
    gameModeText.y = signStart.y + signSize.y * 0.5 + 60;
    
    gameModeText.inputEnabled = true;
    gameModeText.events.onInputOver.add(mainMenuOnGameHover, gameModeText);
    gameModeText.events.onInputOut.add(mainMenuOnGameOut, gameModeText);
    gameModeText.events.onInputUp.add(mainMenuOnGameInputUp, gameModeText);
    
    this.graphics.pivot = new Phaser.Point(500, 720);
    this.graphics.x = 450;
    this.graphics.y = 750;
    this.graphics.rotation = Math.PI;
    
    MainMenu.currentMainMenu = this;
}

MainMenu.prototype.open = function() {
    this.transitionIn();
}

MainMenu.prototype.close = function() {
    this.transitionOut();
}

MainMenu.prototype.destroy = function() {
    this.graphics.parent.removeChild(this.graphics);
}

MainMenu.prototype.transitionIn = function() {
    var tween = game.add.tween(this.graphics).to({rotation: 0.1}, 500, Phaser.Easing.Circular.Out, true);
}

MainMenu.prototype.transitionOut = function(onComplete) {
    var tween = game.add.tween(this.graphics).to({rotation: Math.PI}, 500, Phaser.Easing.Circular.In, true);
    tween.onComplete.add(this.destroy, this);
}

MainMenu.prototype.gotoSelectTeams = function() {
    this.transitionOut();
    this.myMenu.showHomeTeamSelection();
}

function mainMenuOnGameHover(event) {
    this.fill = "#ff0";
}

function mainMenuOnGameOut(event) {
    this.fill = "#fff";
}

function mainMenuOnGameInputUp(event) {
    MainMenu.currentMainMenu.gotoSelectTeams();
}

MainMenu.currentMainMenu = null;