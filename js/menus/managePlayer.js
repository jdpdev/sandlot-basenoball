var ManagePlayer = function(teamManager, player) {
    this.myMenu = teamManager;
    this.myPlayer = player;
    this.graphics = game.add.graphics(0, 0);
    teamManager.graphics.addChild(this.graphics);
    
    var signStart = new Phaser.Point(-175, -350);
    var signSize = new Phaser.Point(450, 300);
    
    /*this.graphics.pivot = new Phaser.Point(signStart.x + signSize.x * 0.5, 
                                            signStart.y + signSize.y + 300);*/
    this.graphics.x = 500;
    this.graphics.y = 600;
    this.graphics.rotation = 0.1;
    
    // *************************************************************************
    // Main panel
    this.graphics.beginFill(0xac762f);
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
    this.graphics.drawRect(signStart.x + signSize.x * 0.5 - 20, signStart.y + signSize.y + 5, 40, 75);
    this.graphics.endFill();
    
    this.graphics.beginFill(0x5f471a);
    this.graphics.drawPolygon([
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 20, signStart.y + signSize.y + 5),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 20, signStart.y + signSize.y + 70),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 30, signStart.y + signSize.y + 70),
            new Phaser.Point(signStart.x + signSize.x * 0.5 + 30, signStart.y + signSize.y + 15),
        ]);
    this.graphics.endFill();
    
    // *************************************************************************
    // Player Icon
    this.displayIcon(signStart.x + 10, signStart.y + 10);
    
    // Name
    this.playerName = this.addPlainText(this.graphics, player.getName(), 
                        { font: "20px hvd_peaceregular", fill: "#ffffff", align: "left"},
                        signStart.x + 10, signStart.y + 145);
                        
    // Icon
    this.addIconCycler(this.graphics, "Skin", SKIN_COLOR, signStart.x + 10, signStart.y + 180);
    this.addIconCycler(this.graphics, "Face", FACE_SHAPE, signStart.x + 10, signStart.y + 205);
    this.addIconCycler(this.graphics, "Hair", HEAD_DECO, signStart.x + 10, signStart.y + 230);
    this.addIconCycler(this.graphics, "Color", HEAD_COLOR, signStart.x + 10, signStart.y + 255);
    this.addIconCycler(this.graphics, "Shirt", SHIRT_COLOR, signStart.x + 10, signStart.y + 280);
}

ManagePlayer.prototype.displayIcon = function(x, y) {
    if (this.icon != undefined) {
        x = this.icon.x;
        y = this.icon.y;
        this.graphics.removeChild(this.icon);
    }
    
    this.icon = this.myPlayer.getPortrait();
    this.graphics.addChild(this.icon);
    this.icon.x = x;
    this.icon.y = y;
}

ManagePlayer.prototype.addPlainText = function(parent, string, style, x, y) {
    var text = game.add.text(x, y, string, style);
    parent.addChild(text);
    
    return text;
}

ManagePlayer.prototype.addIconCycler = function(parent, name, slot, x, y) {
    var title = this.addPlainText(parent, name, { font: "18px Arial", fill: "#ffffff", align: "left"}, x + 30, y);
    
    var leftButton = game.add.graphics(x, y);
    parent.addChild(leftButton);
    leftButton.beginFill(0xffffff, 1);
    leftButton.drawRect(0, 0, 20, 20);
    leftButton.endFill();
    
    var rightButton = game.add.graphics(x + iconGenerator.iconWidth, y);
    parent.addChild(rightButton);
    rightButton.beginFill(0xffffff, 1);
    rightButton.drawRect(-20, 0, 20, 20);
    rightButton.endFill();
    
    leftButton.inputEnabled = true;
    leftButton.events.onInputUp.add(function(event) {
        this.cycleSlot(slot, -1);
    }, this);
    
    rightButton.inputEnabled = true;
    rightButton.events.onInputUp.add(function(event) {
        this.cycleSlot(slot, 1);
    }, this);
}

ManagePlayer.prototype.cycleSlot = function(slot, direction) {
    var newIcon = iconGenerator.cycleIconSlot(this.myPlayer.getPortraitDesc(), slot, direction);
    this.myPlayer.setPortraitDesc(newIcon);
    this.displayIcon();
}