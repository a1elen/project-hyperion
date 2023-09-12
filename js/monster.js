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
        this.xpPoints = 1;
        this.isPlayer = false;
        this.statuses = [];
    }

    heal(damage) {
        this.hp = Math.min(this.maxHealth, this.hp+damage);
        //if (this.maxHealth < this.hp) this.maxHealth = this.hp;
    }

    update() {
        if (this.statuses.length > 0) {
            for (let i = 0; i < this.statuses.length; i++) {

                if (this.statuses[i].constructor.name == "Stunned") {
                    if (this.statuses[i].duration < 1) {
                        this.stunned = false;
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

        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        let healthBarWidth = 60;
        let healthBarHeight = 5;
        
        let maxWidth = healthBarWidth;
        let width = (this.hp / this.maxHealth) * maxWidth;
        let height;

        let x = ((this.getDisplayX() * 64) - healthBarWidth / 2) + 32;
        let y = ((this.getDisplayY() * 64) - healthBarHeight / 2) + 64;

        //ctx.fillStyle = "red";
        ctx.fillStyle = 'rgba(255, 74, 83, 0.75)';
        ctx.fillRect(x, y, width, healthBarHeight);

        // Draw health/attack/armor text
        drawText(this.hp + "/" + this.maxHealth
        + " !" + this.attack
        + " #" + this.defense,
        10, false, y + 5, "white", x)

        /*
        for (let i = 0; i < this.hp; i++) {
            drawSprite(
                9,
                this.getDisplayX() + (i % 3) * (5 / 16),
                this.getDisplayY() - Math.floor(i / 3) * (5 / 16)
            );
        }
        */
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
                    //this.attackedThisTurn = true;
                    //newTile.monster.stunned = true;
                    if (randomRange(1, 100) < this.strength) {
                        addStatus("Stunned", randomRange(2, 2 + this.strength), newTile.monster);
                    }

                    let damage = Math.max((this.attack + this.bonusAttack) - newTile.monster.defense, 1)

                    if (randomRange(1, 100) < this.perception) {
                        damage = damage * 2;
                    }

                    newTile.monster.hit(damage);
                    this.bonusAttack = 0;

                    shakeAmount = 5;

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;
                }
            }
            return true;
        }
    }

    hit(damage) {

        if (randomRange(1, 100 ) < this.evasion) {
            return;
        }

        if (this.shield > 0 || this.teleportCounter > 1) {
            return;
        }

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
}

class Player extends Monster {
    constructor (tile) {
        if (playerClass == 1) {
            super(tile, 0, 10);

            this.strength = 5;
            this.constitution = 4;
            this.perception = 2;
            this.agiity = 2;
            this.arcane = 1;
            this.will = 1;

            this.hp = this.constitution * 5;
        } else {
            super(tile, 1, 10);

            this.strength = 1;
            this.constitution = 2;
            this.perception = 2;
            this.agiity = 3;
            this.arcane = 4;
            this.will = 4;

            this.hp = this.constitution * 5;
        }
        this.maxHealth = this.hp;
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(Object.keys(spells)).splice(0, numSpells);
        this.moveSpeed = 100;
        this.shield = 0;
        this.xpToLevel = 10;
        this.xp = 0;
        this.level = 1;
        this.weaponDamage = 1;
        this.evasion = this.agility;
        numSpells = this.arcane;
    }

    levelUp() {
        this.level++;
        if(playerClass == 1) {
            if (randomRange(1, 2) > 1) {
                this.strength++;
            } else {
                this.constitution++;
            }
        } else {
            if (randomRange(1, 2) > 1) {
                this.agiity++;
            } else {
                this.arcane++;
            }
        }

        this.attack = this.strength * this.weaponDamage;
        this.maxHealth = this.constitution * 5;
        this.evasion = this.agiity;
        numSpells = this.arcane;

        let levelHealth = randomRange(this.constitution, this.maxHealth-this.hp);
        this.hp += levelHealth;
    }

    update() {
        this.shield--;
        super.update();
        if (this.shield < 0) this.shield = 0;
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
            delete this.spells[index];
            spells[spellName]();
            playSound("spell");
            gameState = "running";
        }
    }
}

class Spider extends Monster {
    constructor (tile) {
        super(tile, 4, 2);
        this.maxHealth = this.hp;
        this.attack = 1;
        this.defense = 0;
        this.xpPoints = 1;
    }
}

class Worm extends Monster {
    constructor (tile) {
        super(tile, 5, 1);
        this.maxHealth = 10;
        this.attack = 1;
        this.defense = 0;
        this.xpPoints = 2;
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentNeighbours().filter(t => !t.passable && inBounds(t.x, t.y));
        if (neighbours.length) {
            neighbours[0].replace(Floor);
            this.heal(1);
        } else {
            super.doStuff();
        }
    }
}

class Snake extends Monster {
    constructor (tile) {
        super(tile, 6, 1);
        this.maxHealth = this.hp;
        this.attack = 1;
        this.defense = 0;
        this.moveSpeed = 50;
        this.xpPoints = 2;
    }

    /*doStuff() {
        this.attackedThisTurn = false;
        super.doStuff();

        if (!this.attackedThisTurn) {
            super.doStuff();
        }
    }*/
}

class Zombie extends Monster {
    constructor (tile) {
        super(tile, 7, 3);
        this.maxHealth = this.hp;
        this.attack = 1;
        this.defense = 1;
        this.moveSpeed = 200;
        this.xpPoints = 3;
    }

    /*update() {
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned) {
            this.stunned = true;
        }
    }*/
}

class Skeleton extends Monster {
    constructor (tile) {
        super(tile, 8, 2);
        this.maxHealth = this.hp;
        this.attack = 2;
        this.defense = 0;
        this.xpPoints = 1;
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();
        if (neighbours.length) {
            this.tryMove(neighbours[0].x - this.tile.x, neighbours[0].y - this.tile.y);
        }
    }
}