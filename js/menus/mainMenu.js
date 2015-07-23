var MainMenu = function(x, y, screenWidth, screenHeight) {
    this.graphics = game.add.graphics(x, y);
    
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
    
    var titleText = game.add.text(0, 0, "SANDLOT\n      BASENOBALL", { font: "50px hvd_peaceregular", fill: "#ffffff", align: "left"});
    this.graphics.addChild(titleText);
    titleText.x = signStart.x + 25;
    titleText.y = signStart.y + 45;
    titleText.rotation = Math.PI / -40;
    
    var gameModeText = game.add.text(0, 0, "Local Multiplayer", { font: "20px hvd_peaceregular", fill: "#ffffff", align: "center"});
    this.graphics.addChild(gameModeText);
    gameModeText.x = signStart.x + signSize.x * 0.5 - 100;
    gameModeText.y = signStart.y + signSize.y * 0.5 + 60;
}