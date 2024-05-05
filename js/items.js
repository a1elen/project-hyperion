items = {}

item = {
    name: "Item",
    type: "item",
    sprite: 0
}

// Food
items.food = Object.create(item);
items.food.type = "food";
items.food.hunger = 10;
items.food.get = function() {
    player.hunger = Math.min(100, player.hunger + this.hunger);
    return true;
};

items.food.apple = Object.create(items.food);
items.food.apple.name = "Apple";
items.food.apple.sprite = 73;

items.food.meat = Object.create(items.food);
items.food.meat.name = "Meat";
items.food.meat.sprite = 50;

items.food.bread = Object.create(items.food);
items.food.bread.name = "Bread";
items.food.bread.sprite = 74;

// Weapons
items.weapons = Object.create(item);
items.weapons.type = "weapon";
items.weapons.diceRolls = 1;
items.weapons.diceSides = 1;
items.weapons.quality = "Normal";
items.weapons.material = "Iron";
items.weapons.accuracy = 1;
items.weapons.attackSpeed = 1;
items.weapons.get = function() {
    player.inventory.push(this);
    addPopups("Picked up " + this.fullName(), "white", player);
    return true;
};
items.weapons.fullName = function() {
    return this.quality+" "+this.material+" "+this.name+" ["+this.diceRolls+"d"+this.diceSides+"]";
};



function makeSword() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 51);
    matMap.set(materials[1], 52);
    matMap.set(materials[2], 53);
    matMap.set(materials[3], 55);
    matMap.set(materials[4], 54);
    matMap.set(materials[5], 43);

    let qualities = ["Junk", "Rusted", "Normal", "Sharpened", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    items.weapons.sword = Object.create(items.weapons);
    items.weapons.sword.name = "Sword"
    items.weapons.sword.damageType = "slash";
    items.weapons.sword.quality = shuffle(qualities)[0];
    items.weapons.sword.material = shuffle(materials)[0];
    items.weapons.sword.diceRolls = randomRange(1, 2);
    items.weapons.sword.diceSides = randomRange(3, 7)-quaMap.get(items.weapons.sword.quality);
    items.weapons.sword.sprite = matMap.get(items.weapons.sword.material);

    return items.weapons.sword;
}

function makeAxe() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 51);
    matMap.set(materials[1], 52);
    matMap.set(materials[2], 76);
    matMap.set(materials[3], 55);
    matMap.set(materials[4], 54);
    matMap.set(materials[5], 43);

    let qualities = ["Junk", "Rusted", "Normal", "Sharpened", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    items.weapons.axe = Object.create(items.weapons);
    items.weapons.axe.name = "Axe"
    items.weapons.axe.damageType = "slash";
    items.weapons.axe.quality = shuffle(qualities)[0];
    items.weapons.axe.material = materials[2];
    items.weapons.axe.diceRolls = 1;
    items.weapons.axe.diceSides = randomRange(5, 12)-quaMap.get(items.weapons.axe.quality);
    items.weapons.axe.sprite = matMap.get(items.weapons.axe.material);

    return items.weapons.axe;
}

function makeHammer() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 51);
    matMap.set(materials[1], 52);
    matMap.set(materials[2], 77);
    matMap.set(materials[3], 55);
    matMap.set(materials[4], 54);
    matMap.set(materials[5], 43);

    let qualities = ["Junk", "Rusted", "Normal", "Sharpened", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    items.weapons.hammer = Object.create(items.weapons);
    items.weapons.hammer.name = "Hammer"
    items.weapons.hammer.damageType = "blunt";
    items.weapons.hammer.quality = shuffle(qualities)[0];
    items.weapons.hammer.material = materials[2];
    items.weapons.hammer.diceRolls = 1;
    items.weapons.hammer.diceSides = randomRange(4, 11)-quaMap.get(items.weapons.hammer.quality);
    items.weapons.hammer.sprite = matMap.get(items.weapons.hammer.material);

    return items.weapons.hammer;
}