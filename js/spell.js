spells = {
    Teleport: function() {
        player.move(randomPassableTile());
    },
    Earthquake: function() {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = getTile(i, j);
                if (tile.monster) {
                    let numWalls = 8 - tile.getAdjacentPassableNeighbours().length;
                    tile.monster.hit(numWalls * 5);
                }
            }
        }
        shakeAmount = 20;
    },
    Banish: function() {
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].move(randomPassableTile());
            monsters[i].teleportCounter = randomRange(3, 6);
        }
    },
    Rewind: function() {
        startLevel(startingHp, player.spells);
    },
    HealingAura: function() {
        player.tile.getAdjacentNeighbours().forEach(function(t) {
            t.setEffect(13);
            if (t.monster) {
                t.monster.heal(5 * t.arcane);
            }
        });
        player.tile.setEffect(13);
        player.heal(5 * player.arcane);
    },
    Dash: function() {
        let newTile = player.tile;
        while (true) {
            let testTile = newTile.getNeighbour(player.lastMove[0], player.lastMove[1]);
            if (testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }
        if (player.tile != newTile) {
            player.move(newTile);
            newTile.getAdjacentNeighbours().forEach(t => {
                if (t.monster) {
                    t.setEffect(14);
                    addStatus("Stunned", randomRange(2, 5), t.monster);
                    t.monster.hit(1);
                }
            });
        }
    },
    Dig: function() {
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                let tile = getTile(i, j);
                if(!tile.passable) {
                    tile.replace(Floor);
                }
            }
        }
    },
    Midas: function() {
        let k = 0;
        for (let i = 0; i <= monsters.length; i++) {
            if (!monsters[k].isPlayer) {
                monsters[k].tile.treasure = true;
                monsters[k].die();
                k--;
            }
            k++;
        }
    },
    Spelunker: function() {
        player.tile.getAdjacentNeighbours().forEach(function(t) {
            if (!t.passable && inBounds(t.x, t.y)) {
                t.replace(Floor).treasure = true;
            }
        });
    },
    Berserk: function() {
        player.tile.setEffect(13);
        player.heal(5);

        //addStatus("Stunned", randomRange(1, 2), player);

        player.bonusAttack = 5;
    },
    Duplicate: function() {
        for (let i = player.spells.length - 1; i > 0; i--) {
            if (!player.spells[i]) {
                player.spells[i] = player.spells[i - 1];
            }
        }
    },
    Shield: function() {
        addStatus("Shielded", randomRange(5, 10), player);
    },
    Bolt: function() {
        boltTravel(player.lastMove, 15 + Math.abs(player.lastMove[1]), 5 * player.arcane);
        playSound("firebolt");
    },
    Cross: function() {
        let directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ];
        for (let k = 0; k < directions.length; k++) {
            boltTravel(directions[k], 15 + Math.abs(directions[k][1]), 5 * player.arcane);
        }
        playSound("firebolt");
    },
    Explosion: function() {
        let directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];
        for (let k = 0; k < directions.length; k++) {
            boltTravel(directions[k], 14, 5 * player.arcane);
        }
        playSound("firebolt");
    },
    Fear: function() {
        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].isPlayer) {
                addStatus("Stunned", randomRange(2, 8), monsters[i])
            }
        }
    },
    Heal: function() {
        player.tile.setEffect(13);
        player.heal(10);
    },
    Pray: function() {
        let outcome = randomRange(1, 5);
        switch(outcome) {
            case 1:
                player.tile.setEffect(13);
                player.heal(randomRange(5, player.maxHealth));
                break;
            case 2:
                addStatus("Stunned", randomRange(5, 10), player);
                break;
            case 3:
                addStatus("Shielded", randomRange(5, 10), player);
                break;
            case 4:
                if (randomRange(1, 2) == 1) {
                    player.strength++;
                    break;
                } else {
                    player.constitution++;
                    break;
                }
            case 5:
                addStatus("AllSeeingEye", randomRange(10, 50), player)
                break;
        }
    },
    Regenerate: function() {
        player.statuses.push(new HpRegen(10));
    },
    Matchstick: function() {
        player.statuses.push(new Burning(5));
        player.bonusAttack = 5;
    }
};

function boltTravel(direction, effect, damage) {
    let newTile = player.tile;
    while (true) {
        let testTile = newTile.getNeighbour(direction[0], direction[1]);
        if (testTile.passable) {
            newTile = testTile;
            if (newTile.monster) {
                newTile.monster.hit(damage);
            }
            newTile.setEffect(effect);
        } else {
            break;
        }
    }
}