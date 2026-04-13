objects = {}

object = {
    name: "Object",
    type: "object",
    sprite: 0,
}

objects.usable = Object.create(object);
objects.usable.type = "active-object";
objects.usable.use = function() {

};
objects.usable.getInteractions = function (player, tile) {
    return [
        {
            label: `Use ${this.name}`,
            run: () => {
                this.use(tile);
            },
        },
    ];
};

objects.decorative = Object.create(object);
objects.decorative.type = "decorative-object";
objects.decorative.getInteractions = function () {
    return [];
};

objects.door = Object.create(object);
objects.door.type = "door-object";
objects.door.category = "door";
objects.door.isDoor = true;
objects.door.name = "Door";
objects.door.closedSprite = SPRITES.DOOR_CLOSED;
objects.door.openSprite = SPRITES.DOOR_OPEN;
objects.door.isClosed = true;
objects.door.sprite = SPRITES.DOOR_CLOSED;
objects.door.getInteractions = function (player, tile) {
    const door = this;
    if (this.isClosed) {
        return [
            {
                label: "Open door",
                run() {
                    door.setOpen(tile);
                    addPopups("Creak", "brown", player);
                },
            },
        ];
    }
    return [
        {
            label: "Close door",
            run() {
                door.setClosed(tile);
                addPopups("Creak", "brown", player);
            },
        },
    ];
};
objects.door.setOpen = function (tile) {
    this.isClosed = false;
    this.sprite = this.openSprite;
    tile.passable = true;
    tile.blocksOpenVolume = false;
    tile.itemCapacity = 5;
};
objects.door.setClosed = function (tile) {
    this.isClosed = true;
    this.sprite = this.closedSprite;
    tile.passable = false;
    tile.blocksOpenVolume = true;
    tile.itemCapacity = 0;
};

// Usable objects
objects.usable.barrel = Object.create(objects.usable)
objects.usable.barrel.name = "Barrel";
objects.usable.barrel.sprite = SPRITES.BARREL;
objects.usable.barrel.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    tryAddItemToTile(target, items.tools.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    let lootTable;

    if (randomRange(1, 2) == 1) {
        lootTable = [items.food.apple, items.food.bread, items.food.meat]
    } else {
        lootTable = [makeSword(randomRange(0, 1), randomRange(0, 2))];
    }

    for (let i = 0; i < numberOfLoot; i++) {
        tryAddItemToTile(target, shuffle(lootTable)[0]);
    }
};
objects.usable.barrel.getInteractions = function(player, tile) {
    return [
        {
            label: "break barrel",
            run: () => {
                this.use(tile);
                addPopups("Broken", "brown", player);
            },
        },
    ];
};

objects.usable.bookshelf = Object.create(objects.usable)
objects.usable.bookshelf.name = "Bookshelf";
objects.usable.bookshelf.sprite = SPRITES.BOOKSHELF;
objects.usable.bookshelf.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    tryAddItemToTile(target, items.tools.woodscraps);

    let numberOfLoot = randomRange(1, 3);
    /*for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = []
        tryAddItemToTile(target, shuffle(lootTable)[0]);
    }*/
};

objects.usable.spiderCocoon = Object.create(objects.usable)
objects.usable.spiderCocoon.name = "Spider Cocoon";
objects.usable.spiderCocoon.sprite = SPRITES.SPIDER_COCOON;
objects.usable.spiderCocoon.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    //target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(2, 3), randomRange(0, 2))]
        tryAddItemToTile(target, shuffle(lootTable)[0]);
    }
};

objects.usable.coffin = Object.create(objects.usable)
objects.usable.coffin.name = "Coffin";
objects.usable.coffin.sprite = SPRITES.COFFIN;
objects.usable.coffin.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    tryAddItemToTile(target, items.tools.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(2, 3), randomRange(1, 2))]
        tryAddItemToTile(target, shuffle(lootTable)[0]);
    }
};

objects.usable.weaponStand = Object.create(objects.usable)
objects.usable.weaponStand.name = "Weapon Stand";
objects.usable.weaponStand.sprite = SPRITES.WEAPON_STAND;
objects.usable.weaponStand.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    tryAddItemToTile(target, items.tools.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(0, 4), randomRange(0, 4))]
        tryAddItemToTile(target, shuffle(lootTable)[0]);
    }
};

objects.usable.campfire = Object.create(objects.usable)
objects.usable.campfire.name = "Campfire";
objects.usable.campfire.sprite = SPRITES.CAMPFIRE;
objects.usable.campfire.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.usable.campfireLit);
};
objects.usable.campfire.getInteractions = function(player, tile) {
    return [
        {
            label: "Light campfire",
            run: () => {
                this.use(tile);
                addPopups("Lit", "orange", player);
            },
        },
    ];
};

objects.usable.campfireLit = Object.create(objects.usable)
objects.usable.campfireLit.name = "Lit Campfire";
objects.usable.campfireLit.sprite = SPRITES.CAMPFIRE_LIT;
objects.usable.campfireLit.lightRadius = 6;
objects.usable.campfireLit.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.usable.campfire);
};
objects.usable.campfireLit.getInteractions = function(player, tile) {
    const interactions = [
        {
            label: "Extinguish campfire",
            run: () => {
                this.use(tile);
                addPopups("Extinguished", "brown", player);
            },
        },
    ];
    
    if (player.pendingLevelUps > 0) {
        interactions.push({
            label: "Level Up",
            run: () => {
                player.pendingLevelUps--;
                openLevelUpMenu();
            },
        });
    }
    
    return interactions;
};

// Decorative objects

objects.decorative.gravel = Object.create(objects.decorative)
objects.decorative.gravel.name = "Gravel";
objects.decorative.gravel.sprite = SPRITES.DECOR_GRAVEL;

objects.decorative.standingTorch = Object.create(objects.decorative)
objects.decorative.standingTorch.name = "Standing Torch";
objects.decorative.standingTorch.sprite = SPRITES.STANDING_TORCH;
objects.decorative.standingTorch.getInteractions = function(player, tile) {
    return [
        {
            label: "Light standing torch",
            run: () => {
                tile.objects.splice(tile.objects.indexOf(this));
                tile.objects.push(objects.decorative.standingTorchLit);
                addPopups("Lit", "orange", player);
            },
        },
    ];
};

objects.decorative.standingTorchLit = Object.create(objects.decorative)
objects.decorative.standingTorchLit.name = "Standing Torch";
objects.decorative.standingTorchLit.sprite = SPRITES.STANDING_TORCH_LIT;
objects.decorative.standingTorchLit.lightRadius = 5;
objects.decorative.standingTorchLit.getInteractions = function(player, tile) {
    return [
        {
            label: "Extinguish standing torch",
            run: () => {
                tile.objects.splice(tile.objects.indexOf(this));
                tile.objects.push(objects.decorative.standingTorch);
                addPopups("Extinguished", "gray", player);
            },
        },
    ];
};
