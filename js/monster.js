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
        this.aware = false;
        this.teleportCounter = randomRange(3, 6);
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [-1, 0];
        this.level = 1;
        this.bonusAttack = 0;
        this.moveSpeed = 100;
        this.attackSpeed = 100;
        this.moveCounter = 0;
        this.attackCounter = 0;
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
        this.isHumanoid = false;

        this.rightHand;
        this.leftHand;
        this.rangedWeapon;
        
        this.headwear;
        this.bodyarmor;
        this.gloves;
        this.legwear;
        this.boots;

        this.necklace;
        this.rightFinger;
        this.leftFinger;
        this.belt;

        this.weapon;
        this.armor;

        this.inventory = [];
        this.inventory_space = 9;

        this.abilities = [];
        this.mastery = [];
        
        // Damage resistances (percentage, 0-100)
        this.resistances = {
            slash: 0,
            blunt: 0,
            pierce: 0,
            fire: 0,
            cold: 0,
            electrical: 0,
            poison: 0,
            arcane: 0,
            death: 0
        };

        this.trapSense = false;

        // main stats
        this.initMainStats(1, 1, 1, 1, 1, 1);
        this.initSkills(1, 1, 1, 0, 0, 0, 0, 1);
    }

    initMainStats(strength, constitution, perception, agility, arcane, will) {
        this.strength = strength;
        this.constitution = constitution;
        this.perception = perception;
        this.agility = agility;
        this.arcane = arcane;
        this.will = will;
    }

    initSkills(fighting, endurance, dodge, swordSkill, axeSkill, hammerSkill, staffSkill, magic) {
        this.fighting = fighting;
        this.endurance = endurance;
        this.dodge = dodge;
        this.swordSkill = swordSkill;
        this.axeSkill = axeSkill;
        this.hammerSkill = hammerSkill;
        this.staffSkill = staffSkill;
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
            this.die(undefined);
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

        if (this.pressurePlateCooldown > 0) {
            this.pressurePlateCooldown--;
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
        this.rearm();
        //this.evasionClass = this.agility;
    }

    moveToPlayer() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();

        neighbours = neighbours.filter(t => !t.monster || t.monster.isPlayer);

        // Avoid traps if creature has trapSense
        if (this.trapSense) {
            neighbours = neighbours.filter(t => !t.objects.some(o => o.category === "trap"));
        }

        if (!neighbours.length) {
            return;
        }
        neighbours.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
        const newTile = neighbours[0];
        this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }

    doStuff() {
        let neighbours = this.tile.getAdjacentPassableNeighbours();
        
        // Set aware if monster can see player (within 8 tiles)
        if (this.tile.dist(player.tile) < 8) {
            this.aware = true;
        }
        
        // Set angry if monster is close enough to attack (within 4 tiles)
        if (this.tile.dist(player.tile) < 4) {
            this.angry = true;
        }
        
        // Debug logging
        if (this.aware || this.angry) {
            console.log(`Monster ${this.constructor.name}: aware=${this.aware}, angry=${this.angry}, dist=${this.tile.dist(player.tile)}`);
        }
        
        // Avoid traps if creature has trapSense
        if (this.trapSense) {
            neighbours = neighbours.filter(t => !t.objects.some(o => o.category === "trap"));
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
            drawSprite(SPRITES.TELEPORT, this.getDisplayX(), this.getDisplayY());
        } else {
            drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            if (this.stunned) this.drawStun();
            if (this.aware && !this.angry) this.drawAware();
            if (this.angry) this.drawHostile();
            this.drawHp();
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

        drawText(`${this.hp}/${this.maxHealth}`,
        10, false, y + 2.5, "white", x+tileSize/2, "center")
    }

    drawStun() {
        drawSprite(
            SPRITES.STUN,
            this.getDisplayX(),
            this.getDisplayY()
        );
    }

    drawAware() {
        drawSprite(
            SPRITES.AWARE,
            this.getDisplayX(),
            this.getDisplayY()
        );
    }

    drawHostile() {
        drawSprite(
            SPRITES.HOSTILE,
            this.getDisplayX(),
            this.getDisplayY()
        );
    }

    performAttack(newTile, weapon = null) {
        if (randomRange(1, 100) < this.strength) {
            addStatus("Stunned", randomRange(2, 2 + this.strength), newTile.monster);
            addPopups("Stun!", "yellow", this);
        }

        if (this.bleedingChance != 0 && randomRange(1, 100) < this.bleedingChance) {
            addStatus("Bleeding", randomRange(2, 5), newTile.monster);
            addPopups("Bleed!", "red", this);
        }

        if (newTile.monster.shielded || newTile.monster.teleportCounter > 1) {
            return false;
        }

        this.offsetX = (newTile.x - this.tile.x) / 2;
        this.offsetY = (newTile.y - this.tile.y) / 2;

        let damage = 0;

        let hitChance;
        let attackWeapon = weapon || this.rightHand || this.weapon;
        
        if (attackWeapon != undefined && attackWeapon.isWeapon) {
            // Apply category-specific skill bonus to accuracy
            let skillBonus = 0;
            if (attackWeapon.category === "sword") skillBonus = this.swordSkill * 0.02;
            else if (attackWeapon.category === "axe") skillBonus = this.axeSkill * 0.02;
            else if (attackWeapon.category === "hammer") skillBonus = this.hammerSkill * 0.02;
            else if (attackWeapon.category === "staff") skillBonus = this.staffSkill * 0.02;
            
            hitChance = 90 * (attackWeapon.accuracy + skillBonus);
        } else {
            hitChance = 90;
        }

        // Calculate damage and track dice rolls for D&D style display
        let damageBreakdown = [];
        if (attackWeapon != undefined && attackWeapon.isWeapon) {
            // Calculate damage from all damage types and track dice rolls
            damage = 0;
            for (const dmgType of attackWeapon.damageTypes) {
                const roll = rollSum(dmgType.rolls, dmgType.sides);
                damage += roll;
                damageBreakdown.push(`${dmgType.rolls}d${dmgType.sides}=${roll}`);
            }
            const strengthBonus = this.strength * (this.fighting / 100 + 0.5);
            damage += strengthBonus;
            if (strengthBonus > 0) {
                damageBreakdown.push(`+${strengthBonus.toFixed(1)}`);
            }
        } else {
            damage = rollSum(this.weaponDamage[0], this.weaponDamage[1]) + this.strength * (this.fighting / 100 + 0.5);
            damageBreakdown.push(`${this.weaponDamage[0]}d${this.weaponDamage[1]}=${damage - this.strength * (this.fighting / 100 + 0.5)}`);
            const strengthBonus = this.strength * (this.fighting / 100 + 0.5);
            if (strengthBonus > 0) {
                damageBreakdown.push(`+${strengthBonus.toFixed(1)}`);
            }
        }
        const preArmorDamage = damage;
        const armorReduction = newTile.monster.armorClass;
        damage = Math.max(1, Math.floor(damage - armorReduction));
        
        // Apply resistance based on damage type
        let resistanceApplied = false;
        let resistancePercent = 0;
        if (attackWeapon != undefined && attackWeapon.isWeapon && attackWeapon.damageTypes.length > 0) {
            const primaryDamageType = attackWeapon.damageTypes[0].type;
            if (newTile.monster.resistances && newTile.monster.resistances[primaryDamageType] > 0) {
                resistancePercent = newTile.monster.resistances[primaryDamageType];
                const resistedDamage = Math.floor(damage * (resistancePercent / 100));
                damage -= resistedDamage;
                damage = Math.max(1, damage);
                resistanceApplied = true;
                damageBreakdown.push(`-${resistedDamage.toFixed(1)} (${resistancePercent}% ${primaryDamageType} res)`);
            }
        }

        if (randomRange(1, 100) < 5) {
            damage = damage*2; // CRIT
        }

        let dodgeChance;
        let enemy = newTile.monster;

        dodgeChance = enemy.evasionClass + enemy.agility*(enemy.dodge/100+0.5);

        // Add +5% dodge chance if active dodge is enabled
        if (enemy.activeDodgeEnabled) {
            dodgeChance += 5;
        }

        if (randomRange(1, 100) > hitChance) {
            addPopups("Missed!", "gray", enemy);
            if (this == player) {
                const weaponName = attackWeapon ? attackWeapon.fullName() : "unarmed";
                addMessageLog(`You missed ${newTile.monster.constructor.name} with ${weaponName}`);
            }
            return false;
        }

        if (randomRange(1, 100) <= dodgeChance) {
            enemy.tryDodge();
            if (this == player) {
                addMessageLog(newTile.monster.constructor.name + " dodged your attack!");
            }
            return false;
        }

        addPopups("("+damage+")", "white", enemy);
        if (this == player) {
            const weaponName = attackWeapon ? attackWeapon.fullName() : "unarmed";
            let damageTypeStr = "";
            if (attackWeapon && attackWeapon.damageTypes && attackWeapon.damageTypes.length > 0) {
                damageTypeStr = ` (${attackWeapon.damageTypes.map(d => `${d.rolls}d${d.sides} | ${d.type}`).join(", ")})`;
            }
            addMessageLog(`You hit ${newTile.monster.constructor.name} with ${weaponName}${damageTypeStr} for ${Math.round(damage)} damage`);
        }
        newTile.monster.hit(damage, this);

        damage += this.bonusAttack;

        this.bonusAttack = 0;

        shakeAmount = 5;
        return true;
    }

    tryMove(dx, dy) {
        const newTile = this.tile.getNeighbour(dx, dy);
        if (!newTile.passable) {
            return;
        }
        this.lastMove = [dx, dy];
        if (newTile.monster) {
            if (this.isPlayer != newTile.monster.isPlayer) {
                // Check if dual-wielding (both hands have different weapons)
                const isDualWielding = this.rightHand && this.leftHand && this.rightHand !== this.leftHand;
                
                let attackHit;
                if (isDualWielding) {
                    // Attack with both weapons simultaneously
                    attackHit = this.performAttack(newTile, this.rightHand);
                    this.performAttack(newTile, this.leftHand);
                } else {
                    // Single weapon attack
                    attackHit = this.performAttack(newTile);
                }
                
                if (attackHit) {
                    // Handle attack speed for extra attacks
                    let attackWeapon = this.rightHand || this.weapon;
                    let attackSpeed = (attackWeapon && attackWeapon.isWeapon) ? attackWeapon.attackSpeed : 1.0;
                    
                    // Apply half attack speed for dual-wielding
                    if (isDualWielding) {
                        attackSpeed = attackSpeed / 2;
                    }
                    
                    // Apply category-specific skill bonus to attack speed
                    if (attackWeapon && attackWeapon.isWeapon && attackWeapon.category) {
                        let skillBonus = 0;
                        if (attackWeapon.category === "sword") skillBonus = this.swordSkill * 0.01;
                        else if (attackWeapon.category === "axe") skillBonus = this.axeSkill * 0.01;
                        else if (attackWeapon.category === "hammer") skillBonus = this.hammerSkill * 0.01;
                        else if (attackWeapon.category === "staff") skillBonus = this.staffSkill * 0.01;
                        attackSpeed += skillBonus;
                    }
                    
                    this.attackCounter += (attackSpeed - 1.0);
                    
                    // Grant extra attacks when counter reaches 1.0
                    while (this.attackCounter >= 1.0) {
                        this.attackCounter -= 1.0;
                        addPopups("Extra attack!", "yellow", this);
                        if (this == player) {
                            addMessageLog("Extra attack!");
                        }
                        if (isDualWielding) {
                            this.performAttack(newTile, this.rightHand);
                            this.performAttack(newTile, this.leftHand);
                        } else {
                            this.performAttack(newTile);
                        }
                    }
                }
            }
        } else {
            this.move(newTile);
        }
        
        // Stop resting if player moves or attacks
        if (this.isPlayer) {
            stopResting();
        }
        
        return true;
    }

    tryDodge() {
        let newTile = this.tile.getAdjacentPassableNeighbours();
        newTile = newTile.filter((tile) => !tile.monster)

        addPopups("Dodged!", "white", this);

        if (newTile == undefined) {
            return;
        }

        const newTileChosen = shuffle(newTile)[0];

        if (newTileChosen == undefined) {
            return;
        }

        if (randomRange(1, 100) > 10) {
            return;
        }

        const dx = newTileChosen.x - this.tile.x;
        const dy = newTileChosen.y - this.tile.y;
        this.move(this.tile.getNeighbour(dx, dy));

    }

    hit(damage, attacker) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.die(attacker);
        }

        // Stop resting if player takes damage
        if (this.isPlayer) {
            stopResting();
            let breakdownStr = `${Math.round(damage)} damage`;
            if (attacker && attacker.weapon && attacker.weapon.damageTypes) {
                let dmgStr = attacker.weapon.damageTypes.map(d => `${d.rolls}d${d.sides}`).join(", ");
                breakdownStr = `${dmgStr} = ${Math.round(damage)} damage`;
            }
            if (attacker) {
                addMessageLog(`${attacker.constructor.name} hit you for ${breakdownStr}`);
            } else {
                addMessageLog(`You took ${breakdownStr}`);
            }
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

    dropFromInventory(item) {
        if (!tryAddItemToTile(this.tile, item)) return;
        this.inventory.splice(this.inventory.indexOf(item), 1);
    }

    useAbility(ability) {
        this.abilities[ability].use(this, this);
        if (this.abilities[ability].cd !== undefined) {
            this.abilities[ability].currentCooldown = this.abilities[ability].cd;
        }
    }

    die(attacker) {
        this.dead = true;
        this.tile.monster = null;
        this.sprite = SPRITES.CORPSE;
        this.bleed();
        if (this.inventory.length > 0) {
            for (const item of [...this.inventory]) {
                this.dropFromInventory(item);
            }
        }
        this.killedByPlayer = attacker && attacker.isPlayer;
        
        // Add death message for non-player monsters
        if (!this.isPlayer) {
            addMessageLog(`${this.constructor.name} died`);
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
        // Handle right hand weapon
        if (this.rightHand != undefined) {
            this.weaponDamage[0] = this.rightHand.damage_min || 1;
            this.weaponDamage[1] = this.rightHand.damage_max || 5;
        }

        // Handle left hand weapon (for dual-wielding)
        if (this.leftHand != undefined && this.leftHand !== this.rightHand) {
            // Left hand weapon is different from right hand - dual wielding
        }

        // Reset armor class and evasion class
        this.armorClass = 1;
        this.evasionClass = 1;

        // Reset resistances to base values
        this.resistances = {
            slash: 0,
            blunt: 0,
            pierce: 0,
            fire: 0,
            cold: 0,
            electrical: 0,
            poison: 0,
            arcane: 0,
            death: 0
        };

        // Apply stats from all equipped armor pieces
        const armorSlots = ['headwear', 'bodyarmor', 'gloves', 'legwear', 'boots', 'belt'];
        for (const slot of armorSlots) {
            const armor = this[slot];
            if (armor != undefined) {
                // Apply armor class and evasion class
                if (slot === 'bodyarmor') {
                    this.armorClass = armor.ac;
                    this.evasionClass = armor.ec;
                }

                // Apply resistances
                if (armor.resistances) {
                    for (const type in armor.resistances) {
                        this.resistances[type] += armor.resistances[type];
                    }
                }
            }
        }

    }

    wield(index, hand = "right") {
        if (!this.isHumanoid) {
            if (this.isPlayer) {
                addMessageLog("Only humanoids can equip items.");
            }
            return;
        }

        if (index < 0 || index >= this.inventory.length) return;

        let itemToEquip = this.inventory[index];
        
        // Handle two-handed weapons
        if (itemToEquip.handedness === "two-handed") {
            // Unequip both hands
            this.unequipHand("right");
            this.unequipHand("left");
            
            // Equip in both hands
            this.rightHand = itemToEquip;
            this.leftHand = itemToEquip;
            
            // Handle stacked items
            if (itemToEquip.quantity && itemToEquip.quantity > 1) {
                itemToEquip.quantity--;
            } else {
                this.inventory.splice(index, 1);
            }
            
            if (this.isPlayer) {
                addMessageLog(`Equipped ${itemToEquip.fullName()} in both hands.`);
            }
        } else {
            // One-handed item - equip in specified hand
            this.unequipHand(hand);
            
            if (hand === "right") {
                this.rightHand = itemToEquip;
            } else if (hand === "left") {
                this.leftHand = itemToEquip;
            }
            
            // Handle stacked items
            if (itemToEquip.quantity && itemToEquip.quantity > 1) {
                itemToEquip.quantity--;
            } else {
                this.inventory.splice(index, 1);
            }
            
            if (this.isPlayer) {
                addMessageLog(`Equipped ${itemToEquip.fullName()} in ${hand} hand.`);
            }
        }
        
        this.rearm();
    }

    unequipHand(hand) {
        let weaponToUnequip = null;
        if (hand === "right") {
            weaponToUnequip = this.rightHand;
            this.rightHand = undefined;
        } else if (hand === "left") {
            weaponToUnequip = this.leftHand;
            this.leftHand = undefined;
        }
        
        if (weaponToUnequip) {
            // Check if identical item already exists in inventory
            let foundStack = false;
            for (let existingItem of this.inventory) {
                if (areItemsIdentical(weaponToUnequip, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    foundStack = true;
                    break;
                }
            }
            if (!foundStack) {
                weaponToUnequip.quantity = 1;
                this.inventory.push(weaponToUnequip);
            }
        }
    }

    eat(index) {
        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "food") {
                if (l == index) {
                    this.inventory[i].eat();
                    // Handle stacked items
                    if (this.inventory[i].quantity && this.inventory[i].quantity > 1) {
                        this.inventory[i].quantity--;
                    } else {
                        this.inventory.splice(i, 1);
                    }
                }
                l++;
            }
        } 
    }

    wear(index) {
        if (!this.isHumanoid) {
            if (this.isPlayer) {
                addMessageLog("Only humanoids can equip armor.");
            }
            return;
        }
        if (this.bodyarmor != undefined) {
            // Check if identical item already exists in inventory
            let foundStack = false;
            for (let existingItem of this.inventory) {
                if (areItemsIdentical(this.bodyarmor, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    foundStack = true;
                    break;
                }
            }
            if (!foundStack) {
                this.bodyarmor.quantity = 1;
                this.inventory.push(this.bodyarmor);
            }
            this.bodyarmor = undefined;
        }
        if (this.belt != undefined) {
            // Check if identical item already exists in inventory
            let foundStack = false;
            for (let existingItem of this.inventory) {
                if (areItemsIdentical(this.belt, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    foundStack = true;
                    break;
                }
            }
            if (!foundStack) {
                this.belt.quantity = 1;
                this.inventory.push(this.belt);
            }
            this.belt = undefined;
        }

        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "armor") {
                if (l == index) {
                    switch(this.inventory[i].slot) {
                        case "bodyarmor": 

                        this.bodyarmor = this.inventory[i];
                        this.rearm();
                        // Handle stacked items
                        if (this.inventory[i].quantity && this.inventory[i].quantity > 1) {
                            this.inventory[i].quantity--;
                        } else {
                            this.inventory.splice(i, 1);
                        }
                        break;
                        case "belt":
                        this.belt = this.inventory[i];
                        // Handle stacked items
                        if (this.inventory[i].quantity && this.inventory[i].quantity > 1) {
                            this.inventory[i].quantity--;
                        } else {
                            this.inventory.splice(i, 1);
                        }
                        if (this.isPlayer) {
                            addMessageLog(`Equipped ${this.belt.fullName()} to belt.`);
                        }
                        break;
                    }
                }
                l++;
            }
        } 
    }

    drop(index) {
        const item = this.inventory[index];
        if (!tryAddItemToTile(this.tile, item)) {
            addPopups("No room on floor!", "white", this);
            return;
        }
        
        // Handle stacked items
        if (item.quantity && item.quantity > 1) {
            item.quantity--;
            // Create a copy to drop with quantity 1
            const droppedItem = Object.create(Object.getPrototypeOf(item));
            Object.assign(droppedItem, item);
            droppedItem.quantity = 1;
            this.tile.items[this.tile.items.length - 1] = droppedItem;
        } else {
            this.inventory.splice(index, 1);
        }
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
        // Determine sprite based on race and destiny combination
        let spriteIndex;
        let className;
        let raceName;
        
        if (selectedRaceForGame && selectedDestinyForGame) {
            // Use character creation selections
            const race = selectedRaceForGame.name.toUpperCase();
            const destiny = selectedDestinyForGame.name.toUpperCase().replace(/ /g, '_');
            const spriteKey = `${destiny}_${race}`;
            spriteIndex = SPRITES[spriteKey] || 0;
            className = selectedDestinyForGame.name;
            raceName = selectedRaceForGame.name;
        } else if (playerClass == 1) {
            spriteIndex = SPRITES.PLAYER_WARRIOR;
            className = "Warrior";
            raceName = "Human";
        } else {
            spriteIndex = SPRITES.PLAYER_MAGE;
            className = "Mage";
            raceName = "Human";
        }
        
        super(tile, spriteIndex, 10);
        
        this.isHumanoid = true;

        if (selectedRaceForGame && selectedDestinyForGame) {
            // Store on player for persistence across level transitions
            this.playerRace = selectedRaceForGame;
            this.playerDestiny = selectedDestinyForGame;
            // Stats will be applied by character creation system
            this.initMainStats(5, 5, 5, 5, 5, 5);
            this.initSkills(0, 0, 0, 0, 0, 0, 0, 0);
            numSpells = 1;
        } else if (playerClass == 1) {
            this.initMainStats(5, 5, 5, 5, 5, 5);
            this.initSkills(1, 1, 1, 0, 0, 0, 0, 0);
            numSpells = 3;
        } else {
            this.initMainStats(5, 5, 5, 5, 5, 5);
            this.initSkills(0, 0, 0, 0, 0, 0, 0, 4);
            this.maxMana = 50;
            this.mana = 50;
            numSpells = 9;
        }
        
        this.className = className;
        this.race = raceName;
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

        this.activeDodgeEnabled = false;
        this.abilities.push(Object.create(ability.forget));
        this.abilities.push(Object.create(ability.activeDodge));
        this.abilities.push(Object.create(ability.jump));
        this.visionRadius = 6;
        this.ambientLightRadius = 2;
        this.pendingLevelUps = 0;
    }

    levelUp() {
        this.level++;
        this.pendingLevelUps++;
        addPopups("Level up available!", "yellow", this);
        addMessageLog("Level up available! Use a lit campfire to level up.");
    }

    update() {
        super.update()
    }

    tryDodge() {
        if (this.activeDodgeEnabled) {
            let emptyTiles = this.tile.getAdjacentPassableNeighbours();
            emptyTiles = emptyTiles.filter((tile) => !tile.monster);

            if (emptyTiles.length > 0) {
                const newTileChosen = shuffle(emptyTiles)[0];
                const dx = newTileChosen.x - this.tile.x;
                const dy = newTileChosen.y - this.tile.y;
                this.move(this.tile.getNeighbour(dx, dy));
                addPopups("Active Dodge!", "aqua", this);
                addMessageLog("Active dodge - moved to safety");
            } else {
                // No empty tile - critical damage and stun
                const criticalDamage = Math.floor(this.maxHealth * 0.3);
                this.hit(criticalDamage, this);
                addStatus("Stunned", 1, this);
                addPopups("CRITICAL HIT!", "red", this);
                addPopups("Stunned!", "yellow", this);
                addMessageLog("No space to dodge - critical hit for " + Math.round(criticalDamage) + " damage and stunned!");
            }
        } else {
            super.tryDodge();
        }
    }

    tryMove(dx, dy) {
        if (this.stunned) {
            this.moveCounter += this.moveSpeed;
            check_for_tick();
            return
        }

        const newTile = this.tile.getNeighbour(dx, dy);
        if (!newTile.passable) {
            return;
        }
        this.lastMove = [dx, dy];
        if (newTile.monster) {
            if (this.isPlayer != newTile.monster.isPlayer) {
                // Check if dual-wielding (both hands have different weapons)
                const isDualWielding = this.rightHand && this.leftHand && this.rightHand !== this.leftHand;
                
                let attackHit;
                if (isDualWielding) {
                    // Attack with both weapons simultaneously
                    attackHit = this.performAttack(newTile, this.rightHand);
                    this.performAttack(newTile, this.leftHand);
                } else {
                    // Single weapon attack
                    attackHit = this.performAttack(newTile);
                }
                
                if (attackHit) {
                    // Handle attack speed for extra attacks
                    let attackWeapon = this.rightHand || this.weapon;
                    let attackSpeed = attackWeapon ? attackWeapon.attackSpeed : 1.0;
                    
                    // Apply half attack speed for dual-wielding
                    if (isDualWielding) {
                        attackSpeed = attackSpeed / 2;
                    }
                    
                    // Apply category-specific skill bonus to attack speed
                    if (attackWeapon && attackWeapon.category) {
                        let skillBonus = 0;
                        if (attackWeapon.category === "sword") skillBonus = this.swordSkill * 0.01;
                        else if (attackWeapon.category === "axe") skillBonus = this.axeSkill * 0.01;
                        else if (attackWeapon.category === "hammer") skillBonus = this.hammerSkill * 0.01;
                        else if (attackWeapon.category === "staff") skillBonus = this.staffSkill * 0.01;
                        attackSpeed += skillBonus;
                    }
                    
                    this.attackCounter += (attackSpeed - 1.0);
                    
                    // Grant extra attacks when counter reaches 1.0
                    while (this.attackCounter >= 1.0) {
                        this.attackCounter -= 1.0;
                        addPopups("Extra attack!", "yellow", this);
                        addMessageLog("Extra attack!");
                        if (isDualWielding) {
                            this.performAttack(newTile, this.rightHand);
                            this.performAttack(newTile, this.leftHand);
                        } else {
                            this.performAttack(newTile);
                        }
                    }
                    
                    this.moveCounter += this.moveSpeed;
                    check_for_tick();
                }
            }
        } else {
            this.move(newTile);
            this.moveCounter += this.moveSpeed;
            check_for_tick();
        }
        return true;
    }

    addSpell(spell) {
        const newSpell = spell;
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

    castScroll(index) {
        let l = 0;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].type == "scroll") {
                if (l == index) {
                    spells[this.inventory[i].spell]();
                    playSound("spell");
                    // Handle stacked items
                    if (this.inventory[i].quantity && this.inventory[i].quantity > 1) {
                        this.inventory[i].quantity--;
                    } else {
                        this.inventory.splice(i, 1);
                    }
                }
                l++;
            }
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

    use(dx, dy) {
        const t = this.tile.getNeighbour(dx, dy);
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                this.tile.getNeighbour(ox, oy).selected = false;
            }
        }

        const opts = collectTileInteractions(player, t);
        if (opts.length === 0) {
            t.use();
            tick();
            gameState = "running";
            return;
        }
        openGameMenu("Interactions", [], opts);
    }

    throwItem(index, targetTile) {
        const item = this.inventory[index];
        if (!item) return;

        // Handle stacked items - create a copy with quantity 1 to throw
        let itemToThrow = item;
        if (item.quantity && item.quantity > 1) {
            item.quantity--;
            itemToThrow = Object.create(Object.getPrototypeOf(item));
            Object.assign(itemToThrow, item);
            itemToThrow.quantity = 1;
        } else {
            this.inventory.splice(index, 1);
        }

        // Add item to target tile
        tryAddItemToTile(targetTile, itemToThrow);

        // Deal damage if there's a monster on the target tile
        const damage = itemToThrow.throwDamage || 1;
        if (targetTile.monster && targetTile.monster !== this) {
            targetTile.monster.hit(damage, this);
            addPopups("("+damage+")", "white", targetTile.monster);
            addMessageLog(`You threw ${itemToThrow.fullName ? itemToThrow.fullName() : itemToThrow.name} at ${targetTile.monster.constructor.name}: 1d${damage} = ${Math.round(damage)} damage`);
        } else {
            addMessageLog("You threw " + (itemToThrow.fullName ? itemToThrow.fullName() : itemToThrow.name));
        }

        // Skip a turn
        tick();
    }
}

class Spider extends Monster {
    constructor (tile) {
        super(tile, SPRITES.SPIDER, 2);
        this.initMainStats(2, 3, 5, 5, 1, 1);
        this.updateStats();
        this.initSkills(1, 2, 1, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class Spiderling extends Monster {
    constructor (tile) {
        super(tile, SPRITES.SPIDERLING, 1);
        this.initMainStats(1, 2, 4, 6, 1, 1);
        this.updateStats();
        this.initSkills(1, 1, 1, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 75;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class PoisonSpider extends Monster {
    constructor (tile) {
        super(tile, SPRITES.POISON_SPIDER, 3);
        this.initMainStats(3, 4, 5, 5, 1, 1);
        this.updateStats();
        this.initSkills(2, 3, 2, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 2;
        this.resistances.poison = 50;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }
}

class Worm extends Monster {
    constructor (tile) {
        super(tile, SPRITES.WORM, 1);
        this.initMainStats(1, 4, 1, 3, 1, 1);
        this.updateStats();
        this.initSkills(2, 2, 2, 0, 0, 0, 0, 0);
        this.hp = Math.floor(this.maxHealth / 2);
        this.xpPoints = 2;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }

    doStuff() {
        const neighbours = this.tile.getAdjacentNeighbours().filter(t => !t.passable && inBounds(t.x, t.y));
        if (neighbours.length) {
            if (roll(1, 10) > 8) {
                neighbours[0].replace(Floor, SPRITES.HOLE);
                addPopups("Munch!", "brown", this);

                if (this.hp < this.maxHealth) {
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
        super(tile, SPRITES.SNAKE, 1);
        this.initMainStats(2, 2, 2, 6, 1, 1);
        this.updateStats();
        this.initSkills(2, 3, 2, 0, 0, 0, 0, 0);
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
        super(tile, SPRITES.ZOMBIE, 3);
        this.initMainStats(6, 4, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(3, 4, 1, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.moveSpeed = 150;
        this.xpPoints = 3;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }
}

class Skeleton extends Monster {
    constructor (tile) {
        super(tile, SPRITES.SKELETON, 2);
        this.initMainStats(3, 3, 2, 1, 1, 1);
        this.updateStats();
        this.initSkills(3, 4, 2, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.angry = false;
        this.trapSense = true;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 2;
    }

    update() {
        if (this.angry) {
            this.sprite = SPRITES.SKELETON_ANGRY;
        }
        super.update();
    }
}

class RedDragonBaby extends Monster {
    constructor (tile) {
        super(tile, SPRITES.RED_DRAGON_BABY, 2);
        this.initMainStats(7, 7, 4, 4, 2, 2);
        this.updateStats();
        this.initSkills(5, 5, 5, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 10;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 3;
    }
}

class GreenSlime extends Monster {
    constructor (tile) {
        super(tile, SPRITES.GREEN_SLIME, 2);
        this.initMainStats(2, 1, 1, 1, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 200;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 1;
    }
}

class Mouse extends Monster {
    constructor (tile) {
        super(tile, SPRITES.MOUSE, 2);
        this.initMainStats(1, 1, 1, 5, 1, 1);
        this.updateStats();
        this.initSkills(0, 0, 0, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 50;
        this.weaponDamage[0] = 0;
        this.weaponDamage[1] = 1;
    }
}

class StoneGolem extends Monster {
    constructor (tile) {
        super(tile, SPRITES.STONE_GOLEM, 2);
        this.initMainStats(7, 9, 3, 2, 1, 1);
        this.updateStats();
        this.initSkills(4, 5, 3, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 200;
        this.trapSense = true;
        this.weaponDamage[0] = 3;
        this.weaponDamage[1] = 3;
    }
}

class GoblinRanger extends Monster {
    constructor (tile) {
        super(tile, SPRITES.GOBLIN_RANGER, 2);
        this.isHumanoid = true;
        this.initMainStats(5, 3, 3, 4, 1, 1);
        this.updateStats();
        this.initSkills(5, 4, 3, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 75;
        this.trapSense = true;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 2;
    }
}

class GoblinSpear extends Monster {
    constructor (tile) {
        super(tile, SPRITES.GOBLIN_SPEAR, 2);
        this.isHumanoid = true;
        this.initMainStats(5, 3, 2, 6, 1, 1);
        this.updateStats();
        this.initSkills(4, 5, 2, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 100;
        this.trapSense = true;
        this.weaponDamage[0] = 2;
        this.weaponDamage[1] = 4;
    }
}

class GoblinSwordsman extends Monster {
    constructor (tile) {
        super(tile, SPRITES.GOBLIN_SWORDSMAN, 2);
        this.isHumanoid = true;
        this.initMainStats(8, 6, 2, 1, 1, 1);
        this.updateStats();
        this.initSkills(7, 6, 4, 0, 0, 0, 0, 0);
        this.hp = this.maxHealth;
        this.xpPoints = 1;
        this.moveSpeed = 125;
        this.trapSense = true;
        this.weaponDamage[0] = 1;
        this.weaponDamage[1] = 3;
    }
}