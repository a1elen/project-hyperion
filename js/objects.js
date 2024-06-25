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

objects.decorative = Object.create(object);
objects.decorative.type = "decorative-object";

// Usable objects
objects.usable.barrel = Object.create(objects.usable)
objects.usable.barrel.name = "Barrel";
objects.usable.barrel.sprite = 1202;
objects.usable.barrel.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    let lootTable;

    if (randomRange(1, 2) == 1) {
        lootTable = [items.food.apple, items.food.bread, items.food.meat]
    } else {
        lootTable = [makeSword(randomRange(0, 1), randomRange(0, 2))];
    }
    
    for (let i = 0; i < numberOfLoot; i++) {
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.bookshelf = Object.create(objects.usable)
objects.usable.bookshelf.name = "Bookshelf";
objects.usable.bookshelf.sprite = 1205;
objects.usable.bookshelf.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(1, 3);
    /*for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = []
        target.items.push(shuffle(lootTable)[0]);
    }*/
};

objects.usable.spiderCocoon = Object.create(objects.usable)
objects.usable.spiderCocoon.name = "Spider Cocoon";
objects.usable.spiderCocoon.sprite = 1203;
objects.usable.spiderCocoon.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    //target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(2, 3), randomRange(0, 2))]
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.coffin = Object.create(objects.usable)
objects.usable.coffin.name = "Coffin";
objects.usable.coffin.sprite = 1204;
objects.usable.coffin.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(2, 3), randomRange(1, 2))]
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.weaponStand = Object.create(objects.usable)
objects.usable.weaponStand.name = "Weapon Stand";
objects.usable.weaponStand.sprite = 100;
objects.usable.weaponStand.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(0, 4), randomRange(0, 4))]
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.campfire = Object.create(objects.usable)
objects.usable.campfire.name = "Campfire";
objects.usable.campfire.sprite = 1200;
objects.usable.campfire.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.usable.campfireLit);
};

objects.usable.campfireLit = Object.create(objects.usable)
objects.usable.campfireLit.name = "Lit Campfire";
objects.usable.campfireLit.sprite = 1201;
objects.usable.campfireLit.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.usable.campfire);
};

// Decorative objects

objects.decorative.gravel = Object.create(objects.decorative)
objects.decorative.gravel.name = "Gravel";
objects.decorative.gravel.sprite = 93;

objects.decorative.woodscraps = Object.create(objects.decorative)
objects.decorative.woodscraps.name = "Woodscraps";
objects.decorative.woodscraps.sprite = 1150;

objects.decorative.skull = Object.create(objects.decorative)
objects.decorative.skull.name = "Skull";
objects.decorative.skull.sprite = 850;

objects.decorative.bone = Object.create(objects.decorative)
objects.decorative.bone.name = "Bone";
objects.decorative.bone.sprite = 851;
