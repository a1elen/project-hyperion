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
objects.usable.barrel.sprite = 64;
objects.usable.barrel.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [items.food.apple, items.food.bread, items.food.meat]
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.bookshelf = Object.create(objects.usable)
objects.usable.bookshelf.name = "Bookshelf";
objects.usable.bookshelf.sprite = 71;

objects.usable.spiderCocoon = Object.create(objects.usable)
objects.usable.spiderCocoon.name = "Spider Cocoon";
objects.usable.spiderCocoon.sprite = 68;

objects.usable.coffin = Object.create(objects.usable)
objects.usable.coffin.name = "Coffin";
objects.usable.coffin.sprite = 69;
objects.usable.coffin.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.decorative.woodscraps);

    let numberOfLoot = randomRange(0, 3);
    for (let i = 0; i < numberOfLoot; i++) {
        let lootTable = [makeSword(randomRange(2, 3), randomRange(0, 2))]
        target.items.push(shuffle(lootTable)[0]);
    }
};

objects.usable.campfire = Object.create(objects.usable)
objects.usable.campfire.name = "Campfire";
objects.usable.campfire.sprite = 98;
objects.usable.campfire.use = function(target) {
    target.objects.splice(target.objects.indexOf(this));
    target.objects.push(objects.usable.campfireLit);
};

objects.usable.campfireLit = Object.create(objects.usable)
objects.usable.campfireLit.name = "Lit Campfire";
objects.usable.campfireLit.sprite = 99;
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
objects.decorative.woodscraps.sprite = 101;
