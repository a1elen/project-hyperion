traps = {}

trap = {
    name: "Trap",
    type: "trap",
    sprite: 0,
    visible: false,
    sound: "trap"
}

trap.action = function(monster) {

};
trap.disarm = function(target) {
    target.traps.splice(target.traps.indexOf(this));
}

traps.beartrap = Object.create(trap);
traps.beartrap.name = "Bear Trap";
traps.beartrap.sprite = 1103;
traps.beartrap.item = items.tools.beartrap;
traps.beartrap.action = function(monster) {
    playSound(this.sound);

    addStatus("Bleeding", randomRange(5, 10), monster);
    addStatus("Stunned", randomRange(4, 8), monster);
    addPopups("Skirr!", "white", monster);
    addPopups("Bleed!", "red", monster);
    addPopups("Stun!", "yellow", monster);

    this.blood = true;
    const neighbours = monster.tile.getAdjacentNeighbours();
    for (const neighbour of neighbours) {
        if (!neighbour.passable && randomRange(1, 3) == 3) {
            neighbour.wallBlood = true;
        }
    }

    this.visible = true;

    this.disarm(monster.tile);
};
traps.beartrap.disarm = function(target) {
    target.items.push(this.item)
    target.traps.splice(target.traps.indexOf(this));
};

traps.trapdoor = Object.create(trap);
traps.trapdoor.name = "Trapdoor";
traps.trapdoor.sprite = 252;
traps.trapdoor.sound = "trapdoor"
traps.trapdoor.action = function(monster) {
    
    if (monster.tile.dist(player.tile) < 6) {
        playSound(this.sound);
        shakeAmount = 50;
    }

    if (monster == player) {
        saveLevel();
        level++;
        startLevel(Math.min(maxHp, player.hp-5), player.spells, true);
        player.hit(10);
        player.bleed();
    } else {
        monster.hit(9999);
    }




    this.visible = true;
};

traps.pressurePlate = Object.create(trap);
traps.pressurePlate.name = "Pressure Plate";
traps.pressurePlate.sprite = 1105;
traps.pressurePlate.sound = "trapdoor"
traps.pressurePlate.action = function(monster) {
    monster.move(randomPassableTile());

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 50;
        playSound(this.sound);
    }

    this.visible = true;
}

traps.cobweb = Object.create(trap);
traps.cobweb.name = "Cobweb";
traps.cobweb.sprite = 1104;
traps.cobweb.action = function(monster) {
    addStatus("Stunned", 5, monster);
    addPopups("Webbed!", "white", monster);

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
    
    }

    this.visible = true;

    if (roll(1, 20) > 15) {
        this.disarm(monster.tile);
    }
}

traps.tripwire = Object.create(trap);
traps.tripwire.name = "Tripwire";
traps.tripwire.sprite = 1102;
traps.tripwire.action = function(monster) {
    addStatus("Stunned", randomRange(4, 8), monster);
    monster.hit(5);
    monster.tile.setEffect(401);

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
        playSound(this.sound);
    }

    this.visible = true;
    this.disarm(monster.tile);
}

traps.spiketrap = Object.create(trap);
traps.spiketrap.name = "Spiketrap";
traps.spiketrap.sprite = 1100;
traps.spiketrap.loaded = true;
traps.spiketrap.action = function(monster) {
    if (!this.loaded) {
        return;
    }
    addStatus("Stunned", randomRange(4, 8), monster);
    addStatus("Bledding", randomRange(4, 8), monster);
    monster.hit(5);

    this.blood = true;
    const neighbours = monster.tile.getAdjacentNeighbours();
    for (const neighbour of neighbours) {
        if (!neighbour.passable && randomRange(1, 3) == 3) {
            neighbour.wallBlood = true;
        }
    }

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
        playSound(this.sound);
    }

    this.visible = true;
    this.loaded = false;
    this.sprite = 1101;
    //this.disarm(monster.tile);
}