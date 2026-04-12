ability = {
    name: "Ability",
    cd: 10
}

ability.forget = Object.create(ability);
ability.forget.name = "Forget spells";
ability.forget.cd = 100;
ability.forget.use = function(usr, target) {
    usr.spells = [];
}

ability.activeDodge = Object.create(ability);
ability.activeDodge.name = "Active Dodge";
ability.activeDodge.cd = 0;
ability.activeDodge.description = "Toggle: +5% dodge chance. Dodge moves to empty tile. If no empty tile: critical hit + 1 turn stun";
ability.activeDodge.use = function(usr, target) {
    usr.activeDodgeEnabled = !usr.activeDodgeEnabled;
    if (usr.activeDodgeEnabled) {
        addPopups("Active Dodge ON", "aqua", usr);
        addMessageLog("Active Dodge enabled - +5% dodge chance");
    } else {
        addPopups("Active Dodge OFF", "gray", usr);
        addMessageLog("Active Dodge disabled");
    }
}

ability.jump = Object.create(ability);
ability.jump.name = "Jump";
ability.jump.cd = 10;
ability.jump.description = "Jump to target tile within radius 3. Costs 10 hunger (or 1 HP if insufficient hunger)";
ability.jump.use = function(usr, target) {
    gameState = "jumpTarget";
    selectedTile = usr.tile;
    selectedTile.selected = true;
}