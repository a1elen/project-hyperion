class Monster {
    constructor(tile, sprite, hp) {
        this.move(tile);
        this.sprite = sprite;
        this.maxHealth = 10;
        this.hp = hp;
        this.teleportCounter = randomRange(3, 6);
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [-1, 0];
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
        playSound("healthUp");
        this.hp = Math.min(this.maxHealth, this.hp+damage);
    }

    update() {
        if (this.statuses.length > 0) {
            for (let i = 0; i < this.statuses.length; i++) {

                if (this.statuses[i].constructor.name == "Stunned") {
                    if (this.statuses[i].duration < 1) {
                        this.stunned = false;
                    }
                }

                if (this.statuses[i].constructor.name == "Shielded") {
                    if (this.statuses[i].duration < 1) {
                        this.shielded = false;
                    }
                }

                if (this.statuses[i].constructor.name == "AllSeeingEye") {
                    player.cursed = true;
                    if (this.statuses[i].duration < 1) {
                        player.cursed = false;
                    }
                }

                if (this.statuses[i].duration < 1) {
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
        this.attack = this.strength// * this.weaponDamage;
        this.maxHealth = this.constitution * 10;
        this.evasion = this.agiity;
        this.defense = Math.floor((this.constitution + this.agiity) / 2);
        this.evasionClass = this.agility;
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();

        neighbours = neighbours.filter(t => !t.monster || t.monster.isPlayer);

        if (neighbours.length) {
            neighbours.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
            let newTile = neighbours[0];
            this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
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
        let healthBarWidth = 60;
        let healthBarHeight = 5;
        
        let maxWidth = healthBarWidth;
        let width = (this.hp / this.maxHealth) * maxWidth;
        let height;

        let x = ((this.getDisplayX() * tileSize) - healthBarWidth / 2) + (tileSize / 2);
        let y = ((this.getDisplayY() * tileSize) - healthBarHeight / 2) + tileSize;

        ctx.fillStyle = 'rgba(255, 74, 83, 0.75)';
        ctx.fillRect(x, y, width, healthBarHeight);

        // Draw health/attack/armor text
        drawText(this.hp + "/" + this.maxHealth
        + " !" + this.attack
        + " #" + this.defense,
        10, false, y + 5, "white", x)
    }

    drawStun() {
        drawSprite(
            17,
            this.getDisplayX(),
            this.getDisplayY()
        );
    }

    tryMove(dx, dy) {
        let newTile = this.tile.getNeighbour(dx, dy);
        if (newTile.passable) {
            this.lastMove = [dx, dy];
            if (!newTile.monster) {
                this.move(newTile);
            } else {
                if (this.isPlayer != newTile.monster.isPlayer) {
                    if (randomRange(1, 100) < this.strength) {
                        addStatus("Stunned", randomRange(2, 2 + this.strength), newTile.monster);
                    }

                    if (this.bleedingChance != 0) {
                        if (randomRange(1, 100) < this.bleedingChance) {
                            addStatus("Bleeding", randomRange(2, 5), newTile.monster);
                        }
                    }

                    /*let damage = Math.max((this.attack + this.bonusAttack), 1)

                    if (newTile.monster.defense > damage) {
                        if (randomRange(1, 2) > 1) {
                            damage = Math.floor(clamp(damage / 2, 1, damage));
                        }
                    } else {
                        damage = Math.floor(clamp(damage - newTile.monster.defense / 4, 1, damage));
                    }

                    if (randomRange(1, 100) < this.perception) {
                        damage = damage * 2;
                        newTile.monster.tile.blood = true;
                    }
                    


                    if (randomRange(1, 100 ) < newTile.monster.evasion) {
                        check_for_tick();
                        return;
                    }
                    */

                    if (newTile.monster.shielded || newTile.monster.teleportCounter > 1) {
                        check_for_tick();
                        return;
                    }

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;

                    let damage = 0;

                    console.log("first roll" + roll(1, 20) + this.fighting + " > " + newTile.monster.evasionClass + newTile.monster.dodge);
                    console.log("second roll " + roll(1, 20) + this.weaponSkill + " > " + newTile.monster.armorClass + newTile.monster.endurance);
                    if (roll(1, 20) + this.fighting > newTile.monster.evasionClass + newTile.monster.dodge) {
                        if (roll(1, 20) + this.weaponSkill > newTile.monster.armorClass + newTile.monster.endurance) {
                            if (roll(1, 20) == 20) {
                                damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]) * 2;
                            } else {
                                damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]);
                            }
                        }
                    }

                    damage = damage + this.bonusAttack;

                    newTile.monster.hit(damage, this);

                    this.bonusAttack = 0;

                    shakeAmount = 5;
                }
            }
            return true;
        }
    }

    hit(damage, attacker) {

        /*if (attacker.strength > this.constitution) {
            if (randomRange(1, 100) < attacker.strength) {
                
            }
        }*/

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

    die() {
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 1;
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

    upgrade(amount) {
        //let upgradeHp = randomRange(1, 2) * amount;
        //this.maxHealth = this.maxHealth + upgradeHp;
        //this.hp = this.hp + upgradeHp;

        //this.attack = this.attack + randomRange(1, 2) * amount;
        //this.defense = this.defense + randomRange(1, 2) * Math.floor(amount / 2)
        for (let i = 0; i < amount; i++) {
            let chosenSkill = randomRange(1, 4);
            
            if (chosenSkill == 1) {
                this.fighting += amount;
            } else if (chosenSkill == 2) {
                this.dodge += amount;
            } else if (chosenSkill == 3) {
                this.weaponSkill += amount;
            } else {
                this.endurance += amount;
            }
        }
        this.updateStats();

        this.hp = this.maxHealth;
        this.xpPoints = (this.xpPoints + randomRange(1, 5)) * level;
        this.rare = true;
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
            numSpells = 9;
        }
        this.hp = this.constitution * 10;
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
        if(playerClass == 1) {
            if (randomRange(1, 2) > 1) {
                this.fighting++;
            } else {
                this.weaponSkill++;
            }
        } else {
            if (randomRange(1, 2) > 1) {
                this.agiity++;
            } else {
                this.arcane++;
            }
        }

        this.updateStats();

        let levelHealth = clamp(randomRange(this.constitution, this.maxHealth-this.hp), 1, this.maxHealth);
        this.hp += levelHealth;
    }

    update() {
        super.update()
        //this.shield--;
        //if (this.shield < 0) this.shield = 0;
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
        let newSpell = shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    }

    castSpell(index) {
        let spellName = this.spells[index];
        if (spellName) {
            //delete this.spells[index];
            this.spells.splice(index, 1);
            spells[spellName]();
            playSound("spell");
            gameState = "running";
        }
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

    use() {
        this.tile.use();
    }
}

class Spider extends Monster {
    constructor (tile) {
        super(tile, 4, 2);
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        //this.attack = 1;
        //this.defense = 0;
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
        this.hp = this.maxHealth / 2;
        //this.attack = 1;
        //this.defense = 0;
        this.xpPoints = 2;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentNeighbours().filter(t => !t.passable && inBounds(t.x, t.y));
        if (neighbours.length) {
            neighbours[0].replace(Floor);
 
            if (this.hp >= this.maxHealth) {
                let spawnTile = shuffle(this.tile.getAdjacentPassableNeighbours().filter(t => !t.monster))[0];
                let monster = new Worm(spawnTile);
                monsters.push(monster);
                this.hp = Math.floor(this.hp / 2);
            } else {
                this.heal(Math.floor(this.maxHealth / 10));
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
        //this.attack = 1;
        //this.defense = 0;
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
        //this.attack = 1;
        //this.defense = 1;
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
        //this.attack = 2;
        //this.defense = 0;
        this.xpPoints = 1;
        this.angry = false;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();
        if (this.tile.dist(player.tile) < 4) {
            this.angry = true;
            this.sprite = 8;
        }
        if (neighbours.length && !this.angry) {
            this.tryMove(neighbours[0].x - this.tile.x, neighbours[0].y - this.tile.y);
        } else {
            super.doStuff();
        }
    }
}

class RedDragonBaby extends Monster {
    constructor (tile) {
        super(tile, 21, 2);
        this.initMainStats(4, 5, 4, 4, 2, 2);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        //this.attack = 2;
        //this.defense = 0;
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
        //this.attack = 2;
        //this.defense = 0;
        this.xpPoints = 1;
        this.moveSpeed = 200;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}