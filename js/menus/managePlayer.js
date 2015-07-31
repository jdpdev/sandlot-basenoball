var ManagePlayer = function(teamManager, player) {
    this.myMenu = teamManager;
    this.myPlayer = player;
    this.graphics = game.add.graphics(0, 0);
    this.updatePlayDisplay = false;
    teamManager.graphics.addChild(this.graphics);
    
    var signStart = new Phaser.Point(-175, -450);
    var signSize = new Phaser.Point(450, 330);
    
    /*this.graphics.pivot = new Phaser.Point(signStart.x + signSize.x * 0.5, 
                                            signStart.y + signSize.y + 300);*/
    this.graphics.x = 500;
    this.graphics.y = 700;
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
                        { font: "20px elliotsixregular", fill: "#ffffff", align: "left"},
                        signStart.x + 10, signStart.y + 145);

    this.playerName.inputEnabled = true;
    this.playerName.events.onInputUp.add(function(event) {
        var dialog = $("#changeNameDialog");
        var thisClosure = this;
        $(dialog).show();
        $(dialog).find("input").val(player.getName());
        $(dialog).find(".submitBtn").click(function() {
            $(this).closest("div").hide();
            
            var newName = $(this).closest("div").find("input").val();
            player.setName(newName);
            thisClosure.playerName.text = newName;
            thisClosure.updatePlayDisplay = true;
        });

        $(dialog).find(".cancelBtn").click(function() {
            $(this).closest("div").hide();
        });
    }, this);
                        
    // Icon
    this.addIconCycler(this.graphics, "Skin", SKIN_COLOR, signStart.x + 10, signStart.y + 180);
    this.addIconCycler(this.graphics, "Face", FACE_SHAPE, signStart.x + 10, signStart.y + 205);
    this.addIconCycler(this.graphics, "Hair", HEAD_DECO, signStart.x + 10, signStart.y + 230);
    this.addIconCycler(this.graphics, "Color", HEAD_COLOR, signStart.x + 10, signStart.y + 255);
    this.addIconCycler(this.graphics, "Shirt", SHIRT_COLOR, signStart.x + 10, signStart.y + 280);

    // Close btn
    var closeBtn = this.addPlainText(this.graphics, "Close", { font: "30px hvd_peaceregular", fill: "#ffffff", align: "left"},
                                        signStart.x + 340, signStart.y + signSize.y - 50);
    closeBtn.inputEnabled = true;
    closeBtn.events.onInputOver.add(function(event) {
        this.fill = "#ff0";
    }, closeBtn);
    closeBtn.events.onInputOut.add(function(event) {
        this.fill = "#fff";
    }, closeBtn);
    closeBtn.events.onInputUp.add(function(event) {
        this.myMenu.closePlayerViewer(this.myPlayer);
    }, this);

    // Skills
    var skillX = signStart.x + iconGenerator.iconWidth + 20;
    this.addSkillBar(this.graphics, GetSkillName(STAT_POWER), STAT_POWER, skillX, signStart.y + 10);
    this.addSkillBar(this.graphics, GetSkillName(STAT_BATTING), STAT_BATTING, skillX, signStart.y + 35);
    this.addSkillBar(this.graphics, GetSkillName(STAT_PITCH_POWER), STAT_PITCH_POWER, skillX, signStart.y + 60);
    this.addSkillBar(this.graphics, GetSkillName(STAT_PITCHING), STAT_PITCHING, skillX, signStart.y + 85);
    this.addSkillBar(this.graphics, GetSkillName(STAT_SPEED), STAT_SPEED, skillX, signStart.y + 110);
    this.addSkillBar(this.graphics, GetSkillName(STAT_FIELDING), STAT_FIELDING, skillX, signStart.y + 135);
    this.addSkillBar(this.graphics, GetSkillName(STAT_IMAGINATION), STAT_IMAGINATION, skillX, signStart.y + 160);

    this.graphics.rotation = Math.PI;
    this.open();
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
    var title = this.addPlainText(parent, name, { font: "18px elliotsixregular", fill: "#ffffff", align: "left"}, x + 30, y);
    
    var leftButton = this.drawLeftArrow(parent, x, y);
    var rightButton = this.drawRightArrow(parent, x + iconGenerator.iconWidth, y);
    
    leftButton.inputEnabled = true;
    leftButton.events.onInputUp.add(function(event) {
        this.cycleSlot(slot, -1);
        this.updatePlayDisplay = true;
    }, this);
    
    rightButton.inputEnabled = true;
    rightButton.events.onInputUp.add(function(event) {
        this.cycleSlot(slot, 1);
        this.updatePlayDisplay = true;
    }, this);
}

ManagePlayer.prototype.cycleSlot = function(slot, direction) {
    var newIcon = iconGenerator.cycleIconSlot(this.myPlayer.getPortraitDesc(), slot, direction);
    this.myPlayer.setPortraitDesc(newIcon);
    this.displayIcon();
}

ManagePlayer.prototype.addSkillBar = function(parent, name, skill, x, y) {
    var title = this.addPlainText(parent, name, { font: "15px elliotsixregular", fill: "#ffffff", align: "left"}, x, y);
    var leftButton = this.drawLeftArrow(parent, x + 100, y);
    var rightButton = this.drawRightArrow(parent, x + 270, y);

    var stat = this.myPlayer.getInfo().getValueForSkill(skill);
    this.drawSkillGradient(stat, 10, x + 130, y);

    leftButton.inputEnabled = true;
    rightButton.inputEnabled = true;

    leftButton.events.onInputUp.add(function(event) {
        var value = this.myPlayer.getInfo().incrementSkill(skill, -1);
        this.drawSkillGradient(value, 10, x + 130, y);
        this.myMenu.updateTeamPoints();
    }, this);

    rightButton.events.onInputUp.add(function(event) {
        var value = this.myPlayer.getInfo().incrementSkill(skill, +1);
        this.drawSkillGradient(value, 10, x + 130, y);
        this.myMenu.updateTeamPoints();
    }, this);
}

ManagePlayer.prototype.drawSkillGradient = function(value, max, x, y) {
    this.graphics.beginFill(0x333333, 1);
    this.graphics.drawRect(x, y + 3, 130, 15);
    this.graphics.endFill();

    this.graphics.beginFill(0xffcc00, 1);
    this.graphics.drawRect(x, y + 3, 130 * (value / max), 15);
    this.graphics.endFill();
}

ManagePlayer.prototype.drawLeftArrow = function(parent, x, y) {
    var leftButton = game.add.graphics(x, y);
    parent.addChild(leftButton);
    leftButton.beginFill(0xffffff, 0.01);
    leftButton.drawRect(0, 0, 20, 20);
    leftButton.endFill();

    var text = this.addPlainText(parent, "-", { font: "24px hvd_peaceregular", fill: "#ffffff", align: "left"}, 6, -2);
    leftButton.addChild(text);

    return leftButton;
}

ManagePlayer.prototype.drawRightArrow = function(parent, x, y) {
    var rightButton = game.add.graphics(x, y);
    parent.addChild(rightButton);
    rightButton.beginFill(0xffffff, 0.01);
    rightButton.drawRect(-20, 0, 20, 20);
    rightButton.endFill();

    var text = this.addPlainText(parent, "+", { font: "24px hvd_peaceregular", fill: "#ffffff", align: "left"}, 6, -2);
    rightButton.addChild(text);

    return rightButton;
}

// *****************************************************************************
ManagePlayer.prototype.open = function() {
    this.transitionIn();
}

ManagePlayer.prototype.close = function() {
    this.transitionOut();

    if (this.updatePlayDisplay) {
        this.myMenu.updatePlayerDetails(this.myPlayer);
    }

    this.myPlayer = null;
    this.myMenu = null;
}

ManagePlayer.prototype.destroy = function() {
    this.graphics.parent.removeChild(this.graphics);
}

ManagePlayer.prototype.transitionIn = function() {
    var tween = game.add.tween(this.graphics).to({rotation: 0.1}, 500, Phaser.Easing.Circular.Out, true);
}

ManagePlayer.prototype.transitionOut = function(onComplete) {
    var tween = game.add.tween(this.graphics).to({rotation: Math.PI}, 500, Phaser.Easing.Circular.In, true);
    tween.onComplete.add(this.destroy, this);
}