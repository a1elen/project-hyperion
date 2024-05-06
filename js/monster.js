class Monster {
    constructor(tile, sprite, hp) {
        this.move(tile);
        this.sprite = sprite;
        this.maxHealth = 10;
        this.hp = hp;
        
        this.maxMana = 10;
        this.mana = 10;

        this.hunger = 100;

        this.angry = false;
        this.teleportCounter = randomRange(3, 6);
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [-1, 0];
        this.level = 1;
        this.bonusAttack = 0;
        this.moveSpeed = 100;
        this.attackSpeed = 100;
        this.moveCounter = 0;
        this.bonusDefense = 0;
        this.attack = 1;
        this.defense = 0;
        this.stunCounter = 0;
        this.stunned = false;
        this.shielded = false;
        this.xpPoints = 1;
        this.isPlayer = false;
        this.statuses = [];
        this.bleedingChance = 0;
        this.weaponDamage = new Array(1, 1);
        this.armorClass = 1;
        this.evasionClass = 1;

        this.rightHand;
        this.leftHand;
        
        this.headwear;
        this.bodyarmor;
        this.gloves;
        this.legwear;
        this.boots;

        this.necklace;
        this.rightFinger;
        this.leftFinger;

        this.weapon;
        this.armor;

        this.inventory = [];
        this.inventory_space = 9;

        this.abilities = [];
        this.mastery = [];
        this.resistances = [];

        // main stats
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.initSkills(1, 1, 1, 1, 1);
    }

    initMainStats(strength, constitution, perception, agility, arcane, will) {
        this.strength = strength;
        this.constitution = constitution;
        this.perception = perception;
        this.agility = agility;
        this.arcane = arcane;
        this.will = will;
    }

    initSkills(fighting, endurance, dodge, weaponSkill, magic) {
        this.fighting = fighting;
        this.endurance = endurance;
        this.dodge = dodge;
        this.weaponSkill = weaponSkill;
        this.magic = magic;
    }

    heal(damage) {
        if (this.hp < this.maxHealth) {
            this.hp = Math.min(this.maxHealth, this.hp+damage);
            playSound("healthUp");
            addPopups("+"+damage, "green", this);
        }
    }

    healMana(damage) {
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana+damage);
            playSound("healthUp");
            addPopups("+"+damage, "aqua", this);
        }
    }

    update() {
        if (this.hp <= 0) {
            this.die();
        }

        if (this.statuses.length > 0) {
            for (let i = 0; i < this.statuses.length; i++) {

                if (this.statuses[i].constructor.name == "Stunned" && this.statuses[i].duration <= 1) {
                    this.stunned = false;
                }

                if (this.statuses[i].constructor.name == "Shielded" && this.statuses[i].duration <= 1) {
                    this.shielded = false;
                }

                if (this.statuses[i].constructor.name == "AllSeeingEye") {
                    player.cursed = true;
                    if (this.statuses[i].duration < 1) {
                        player.cursed = false;
                    }
                }

                if (this.statuses[i].duration <= 1) {
                    this.statuses.splice(i, 1);
                } else {
                    this.statuses[i].update(this);
                }

            }
        }

        this.teleportCounter--;
        if (this.teleportCounter > 0) {
            return
        }

        if (this.stunned == true) {
            return;
        }

        while (this.moveCounter < 100) {
            if (!this.isPlayer) this.doStuff();
            this.moveCounter += this.moveSpeed;
        }
        this.moveCounter -= 100;
    }

    updateStats() {
        this.attack = this.strength;
        this.maxHealth = this.constitution * 5;
        this.evasion = this.agiity;
        this.defense = Math.floor((this.constitution + this.agiity) / 2);
        //this.evasionClass = this.agility;
    }

    moveToPlayer() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();

        neighbours = neighbours.filter(t => !t.monster || t.monster.isPlayer);

        if (!neighbours.length) {
            return;
        }
        neighbours.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
        const newTile = neighbours[0];
        this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }

    doStuff() {
        const neighbours = this.tile.getAdjacentPassableNeighbours();
        if (this.tile.dist(player.tile) < 4) {
            this.angry = true;
        }
        if (neighbours.length && !this.angry) {
            this.tryMove(neighbours[0].x - this.tile.x, neighbours[0].y - this.tile.y);
        } else {
            this.moveToPlayer();
        }


    }

    getDisplayX() {
        return this.tile.x + this.offsetX;
    }

    getDisplayY() {
        return this.tile.y + this.offsetY;
    }

    draw() {
        if (this.teleportCounter > 1) {
            drawSprite(10, this.getDisplayX(), this.getDisplayY());
        } else {
            drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
            if (this.stunned) this.drawStun();
        }

        if (this.rare == true) {
            ctx.fillStyle = 'rgba(200, 0, 0, 0.25)';
            ctx.fillRect(this.getDisplayX() * tileSize, this.getDisplayY() * tileSize,
            tileSize, tileSize);
        }

        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        const healthBarWidth = 64;
        const healthBarHeight = 5;

        const width = (this.hp / this.maxHealth) * healthBarWidth;

        const x = ((this.getDisplayX() * tileSize) - healthBarWidth / 2) + (tileSize / 2);
        const y = ((this.getDisplayY() * tileSize) - healthBarHeight / 2) + tileSize;

        ctx.fillStyle = 'rgba(255, 74, 83, 0.75)';
        ctx.fillRect(x, y - 2.5, width, healthBarHeight);

        // Draw health/attack/armor text
        drawText(`lvl:${this.level}`,
        10, false, y + 10 - tileSize-8, "white", x+tileSize/2, "center")

        /*drawText(`${this.weaponDamage[0]}d${this.weaponDamage[1]}`
        + " #" + this.armorClass
        + " E" + this.evasionClass,
        10, false, y - 5, "white", x)*/

        drawText(`${this.hp}/${this.maxHealth}`,
        10, false, y + 2.5, "white", x+tileSize/2, "center")
    }

    drawStun() {
        drawSprite(
            17,
            this.getDisplayX(),
            this.getDisplayY()
        );
    }

    tryMove(dx, dy) {
        const newTile = this.tile.getNeighbour(dx, dy);
        if (!newTile.passable) {
            return;
        }
        this.lastMove = [dx, dy];
        if (newTile.monster) {
            if (this.isPlayer != newTile.monster.isPlayer) {
                if (randomRange(1, 100) < this.strength) {
                    addStatus("Stunned", randomRange(2, 2 + this.strength), newTile.monster);
                    addPopups("Stun!", "yellow", this);
                }

                if (this.bleedingChance != 0 && randomRange(1, 100) < this.bleedingChance) {
                    addStatus("Bleeding", randomRange(2, 5), newTile.monster);
                    addPopups("Bleed!", "red", this);
                }

                if (newTile.monster.shielded || newTile.monster.teleportCounter > 1) {
                    check_for_tick();
                    return;
                }

                this.offsetX = (newTile.x - this.tile.x) / 2;
                this.offsetY = (newTile.y - this.tile.y) / 2;

                let damage = 0;

                /*if (roll(1, 20) + this.fighting + this.weaponSkill > newTile.monster.evasionClass + newTile.monster.dodge || newTile.monster.stunned) {
                    if (roll(1, 20) + this.fighting + this.weaponSkill > newTile.monster.armorClass + newTile.monster.endurance) {
                        if (roll(1, 20) >= 20) {
                            if (this.weapon != undefined) {
                                damage = rollSum(this.weapon.diceRolls, this.weapon.diceSides) * 2;
                            } else {
                                damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]) * 2;
                            }
                            newTile.monster.bleed();
                            addPopups("-"+damage, "red", newTile.monster);
                        } else {
                            if (this.weapon != undefined) {
                                damage = rollSum(this.weapon.diceRolls, this.weapon.diceSides);
                            } else {
                                damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]);
                            }
                        }
                        addPopups("-"+damage, "white", newTile.monster);
                        newTile.monster.hit(damage, this);

                    } else {
                        addPopups("Blocked", "white", newTile.monster);
                    }
                } else {
                    newTile.monster.tryDodge();
                }*/

                let hitChance;
                
                if (this.weapon != undefined) {
                    hitChance = (this.fighting + this.weapon.accuracy) / 2;
                } else {
                    hitChance = (this.fighting + 100) / 2;
                }

                if (this.weapon != undefined) {
                    damage = rollSum(this.weapon.diceRolls, this.weapon.diceSides) + this.strength/2;
                } else {
                    damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]) + this.strength/2;
                }
                damage = Math.max(0, Math.floor(damage - newTile.monster.armorClass));

                let dodgeChance;

                dodgeChance = (newTile.monster.dodge+newTile.monster.agility+newTile.monster.evasionClass)/2;

                let randomNumber = randomRange(1, 100);
                if (randomNumber <= hitChance && randomNumber >= dodgeChance) {
                    newTile.monster.hit(damage, this);
                } else {
                    newTile.monster.tryDodge();
                }

                damage += this.bonusAttack;

                this.bonusAttack = 0;

                shakeAmount = 5;
            }
        } else {
            this.move(newTile);
        }
        return true;
    }

    tryDodge() {
        let newTile = this.tile.getAdjacentPassableNeighbours();
        newTile = newTile.filter((tile) => !tile.monster)

        if (newTile == undefined) {
            return;
        }

        const newTileChosen = shuffle(newTile)[0];

        if (newTileChosen == undefined) {
            return;
        }

        const dx = newTileChosen.x - this.tile.x;
        const dy = newTileChosen.y - this.tile.y;
        //this.tryMove(dx, dy);
        this.move(this.tile.getNeighbour(dx, dy));
        addPopups("Dodged!", "white", this);
    }

    hit(damage, attacker) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.die();
        }

        // Sound
        if (this.isPlayer) {
            playSound("hit1");
        } else {
            playSound("hit2");
        }
    }

    bleed() {
        this.tile.liquid = "Blood";
        this.tile.liquidVolume += randomRange(50, 200);
    }

    drop(item) {
        this.tile.items.push(item);
        this.inventory.splice(this.inventory.indexOf(item), 1);
    }

    die() {
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 1;
        this.bleed();
        if (this.inventory.length > 0) {
            for (let item of this.inventory) {
                this.drop(item);
            }
        }
        check_dead();
    }

    move (tile) {
        if (this.tile) {
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;
        }
        this.tile = tile;
        tile.monster = this;
        tile.stepOn(this);
    }

    rearm() {
        if (this.weapon != undefined) {
            this.weaponDamage[0] = this.weapon.damage_min;
            this.weaponDamage[1] = this.weapon.damage_max;
        }

        if (this.armor != undefined) {
            this.armorClass = this.bodyarmor.av;
            this.evasionClass = this.bodyarmor.ev;
        }

    }

    /*wield(weapon) {
        if (this.weapon != undefined) {
            this.drop(this.weapon)
        }
        this.weapon = weapon;
        this.weaponDamage[0] = this.weapon.damage_min;
        this.weaponDamage[1] = this.weapon.damage_max;
    }*/

    wield(index) {
        if (this.weapon != undefined) {
            this.inventory.push(this.weapon);
            this.weapon = undefined;
        }

        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "weapon") {
                if (l == index) {
                    this.weapon = this.inventory[i];
                    this.weaponDamage[0] = this.weapon.damage_min;
                    this.weaponDamage[1] = this.weapon.damage_max;
                    this.inventory.splice(i, 1);
                }
                l++;
            }
        } 
    }

    eat(index) {
        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "food") {
                if (l == index) {
                    this.inventory[i].eat();
                    this.inventory.splice(i, 1);
                }
                l++;
            }
        } 
    }

    /*wear(armor) {
        if (this.armor != undefined) {
            this.drop(this.armor)
        }

        this.armor = armor;
        this.armorClass = this.armor.av;
        this.evasionClass = this.armor.ev;
    }*/

    wear(index) {
        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "armor") {
                if (l == index) {
                    switch(this.inventory[i].slot) {
                        case "bodyarmor": 
                        if (this.bodyarmor != undefined) {
                            this.inventory.push(this.bodyarmor);
                            this.bodyarmor = undefined;
                        }

                        this.bodyarmor = this.inventory[i];
                        this.rearm();
                        this.inventory.splice(i, 1);
                        break;
                    }
                }
                l++;
            }
        } 
    }

    drop(index) {
        this.tile.items.push(this.inventory[index]);
        this.inventory.splice(index, 1);
    }

    levelUp() {
        this.level++;

        for (let i = 0; i < 5; i++) {
            switch(randomRange(1, 5)) {
                case 1: this.fighting++; break;
                case 2: this.endurance++; break;
                case 3: this.dodge++; break;
                case 4: this.weaponSkill++; break;
                case 5: this.magic++; break;
            }
        }

        this.updateStats();
        //this.hp = this.maxHealth;
        this.xpPoints = (this.xpPoints + randomRange(1, 5)) * this.level;
        this.rare = false;
        addPopups("Level up!", "yellow", this);
    }
}

class Player extends Monster {
    constructor (tile) {
        if (playerClass == 1) {
            super(tile, 0, 10);

            this.initMainStats(5, 5, 5, 5, 5, 5);
            this.initSkills(1, 1, 1, 1, 0);
            numSpells = 3;
        } else {
            super(tile, 20, 10);

            this.initMainStats(5, 5, 5, 5, 5, 5);
            this.initSkills(0, 0, 0, 0, 4);
            
            this.maxMana = 50;
            this.mana = 50;
            numSpells = 9;
        }
        this.hp = this.constitution * 5;
        this.maxHealth = this.hp;
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(Object.keys(spells)).splice(0, 1);
        this.moveSpeed = 100;
        this.xpToLevel = 10;
        this.xp = 0;
        this.level = 1;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 5;
        this.evasion = this.agility;
        this.attack = this.strength * this.weaponDamage;
        this.cursed = false;
        this.updateStats();
    }

    levelUp() {
        this.level++;

        for (let i = 0; i < 5; i++) {
            switch(randomRange(1, 5)) {
                case 1: this.fighting++; break;
                case 2: this.endurance++; break;
                case 3: this.dodge++; break;
                case 4: this.weaponSkill++; break;
                case 5: this.magic++; break;
            }
        }

        this.updateStats();

        const levelHealth = clamp(randomRange(this.constitution, this.maxHealth-this.hp), 1, this.maxHealth);
        //this.hp = Math.min(this.maxHealth, this.hp+levelHealth);
    }

    update() {
        super.update()
    }

    tryMove(dx, dy) {
        if (this.stunned) {
            this.moveCounter += this.moveSpeed;
            check_for_tick();
            return
        }

        if (super.tryMove(dx, dy)) {
            this.moveCounter += this.moveSpeed;
            check_for_tick();
        }
    }

    addSpell() {
        const newSpell = shuffle(Object.keys(spells))[0];
        addPopups("Learned " + newSpell, "white", player);
        this.spells.push(newSpell);
    }

    castSpell(index) {
        if (this.mana >= 5) {
            const spellName = this.spells[index];
            if (!spellName) {
                return;
            }
            //this.spells.splice(index, 1);
            spells[spellName]();
            playSound("spell");
            this.mana -= 5;
        } else {
            addPopups("Not enough mana!", "aqua", player);
        }

        gameState = "running";
    }

    pickUp() {
        this.tile.get();
    }

    moveUp() {
        this.tile.moveUp(player);
    }

    moveDown() {
        this.tile.moveDown(player);
    }

    use(dx, dy) {
        this.tile.getNeighbour(dx, dy).use();
        tick();
        gameState = "running";

        player.tile.getNeighbour(0, -1).selected = false;
        player.tile.getNeighbour(0, 1).selected = false;
        player.tile.getNeighbour(-1, 0).selected = false;
        player.tile.getNeighbour(1, 0).selected = false;

        player.tile.getNeighbour(1, -1).selected = false;
        player.tile.getNeighbour(1, 1).selected = false;
        player.tile.getNeighbour(-1, 1).selected = false;
        player.tile.getNeighbour(-1, -1).selected = false;
    }
}

class Spider extends Monster {
    constructor (tile) {
        super(tile, 4, 2);
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class Worm extends Monster {
    constructor (tile) {
        super(tile, 5, 1);
        this.initMainStats(1, 1, 1, 2, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = Math.floor(this.maxHealth / 2);
        this.xpPoints = 2;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }

    doStuff() {
        const neighbours = this.tile.getAdjacentNeighbours().filter(t => !t.passable && inBounds(t.x, t.y));
        if (neighbours.length) {
            if (roll(1, 10) > 8) {
                neighbours[0].replace(Floor);
                addPopups("Munch!", "brown", this);

                if (this.hp >= this.maxHealth) {
                    const spawnTile = shuffle(this.tile.getAdjacentPassableNeighbours().filter(t => !t.monster))[0];
                    if (spawnTile != undefined) {
                        const monster = new Worm(spawnTile);
                        monsters.push(monster);
                        this.hp = Math.floor(this.hp / 2);
                    }

                } else {
                    this.heal(Math.max(1, Math.floor(this.maxHealth / 10)));
                }
            }
        } else {
            super.doStuff();
        }
    }
}

class Snake extends Monster {
    constructor (tile) {
        super(tile, 6, 1);
        this.initMainStats(1, 1, 2, 2, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.moveSpeed = 75;
        this.xpPoints = 2;
        this.bleedingChance = 10;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class Zombie extends Monster {
    constructor (tile) {
        super(tile, 7, 3);
        this.initMainStats(2, 3, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.moveSpeed = 150;
        this.xpPoints = 3;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }
}

class Skeleton extends Monster {
    constructor (tile) {
        super(tile, 30, 2);
        this.initMainStats(2, 2, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.angry = false;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }

    update() {
        if (this.angry) {
            this.sprite = 8;
        }
        super.update();
    }
}

class RedDragonBaby extends Monster {
    constructor (tile) {
        super(tile, 21, 2);
        this.initMainStats(4, 5, 4, 4, 2, 2);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 10;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 3;
    }
}

class GreenSlime extends Monster {
    constructor (tile) {
        super(tile, 22, 2);
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 200;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class Mouse extends Monster {
    constructor (tile) {
        super(tile, 46, 2);
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 50;
        this.weaponDamage[0] = 0;
        this.weaponDamage[1] = 1;
    }
}

class StoneGolem extends Monster {
    constructor (tile) {
        super(tile, 45, 2);
        this.initMainStats(4, 4, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 200;
        this.weaponDamage[0] = 3;
        this.weaponDamage[1] = 3;
    }
}

class GoblinRanger extends Monster {
    constructor (tile) {
        super(tile, 48, 2);
        this.initMainStats(2, 1, 3, 4, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 75;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 2;
    }
}

class GoblinSpear extends Monster {
    constructor (tile) {
        super(tile, 47, 2);
        this.initMainStats(2, 2, 2, 2, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 100;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 4;
    }
}

class GoblinSwordsman extends Monster {
    constructor (tile) {
        super(tile, 49, 2);
        this.initMainStats(4, 3, 2, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 125;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 3;
    }
}