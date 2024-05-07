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
objects.usable.barrel.use = function() {
    objects.usable.barrel.sprite = 101;
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

objects.usable.campfire = Object.create(objects.usable)
objects.usable.campfire.name = "Campfire";
objects.usable.campfire.sprite = 98;
objects.usable.campfire.use = function() {
    objects.usable.campfire.sprite = 99;
};

// Decorative objects

objects.decorative.gravel = Object.create(objects.decorative)
objects.decorative.gravel.name = "Gravel";
objects.decorative.gravel.sprite = 93;