items = {}

item = {
    name: "Item",
    type: "item",
    sprite: 0,
}

item.get = function() {
    if (player.inventory.length < player.inventory_space) {
        player.inventory.push(this);
        addPopups("Picked up " + this.fullName(), "white", player);
        return true;
    } else {
        addPopups("Not enough space", "white", player);
    }
};
item.fullName = function() {
    return this.name;
};

// Food
items.food = Object.create(item);
items.food.type = "food";
items.food.hunger = 10;
items.food.eat = function() {
    player.hunger = Math.min(100, player.hunger + this.hunger);
    return true;
};

items.food.apple = Object.create(items.food);
items.food.apple.name = "Apple";
items.food.apple.sprite = 73;
items.food.apple.hunger = 10;

items.food.meat = Object.create(items.food);
items.food.meat.name = "Meat";
items.food.meat.sprite = 50;
items.food.meat.hunger = 50;

items.food.bread = Object.create(items.food);
items.food.bread.name = "Bread";
items.food.bread.sprite = 74;
items.food.bread.hunger = 30;

// Weapons
items.weapons = Object.create(item);
items.weapons.type = "weapon";
items.weapons.diceRolls = 1;
items.weapons.diceSides = 1;
items.weapons.quality = "Normal";
items.weapons.material = "Iron";
items.weapons.accuracy = 80;
items.weapons.attackSpeed = 1;
items.weapons.fullName = function() {
    return this.quality+" "+this.material+" "+this.name+" ["+this.diceRolls+"d"+this.diceSides+"]";
};

items.weapons.pickaxe = Object.create(items.weapons);
items.weapons.pickaxe.name = "Pickaxe"
items.weapons.pickaxe.type = "weapon";
items.weapons.pickaxe.diceRolls = 1;
items.weapons.pickaxe.diceSides = 4;
items.weapons.pickaxe.sprite = 56;

// Armor
items.armor = Object.create(item);
items.armor.type = "armor";
items.armor.ac = 1;
items.armor.ec = 1;
items.armor.quality = "Normal";
items.armor.material = "Iron";
items.armor.fullName = function() {
    return this.quality+" "+this.material+" "+this.name+" ["+this.ac+"/"+this.ec+"]";
};

items.tools = Object.create(item);

items.tools.beartrap = Object.create(items.tools);
items.tools.beartrap.name = "Bear Trap";
items.tools.beartrap.sprite = 29;

// Armor Generators

function makeBodyarmor() {
    return makeChestplate();
}

function makeChestplate() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 58);
    matMap.set(materials[1], 59);
    matMap.set(materials[2], 60);
    matMap.set(materials[3], 62);
    matMap.set(materials[4], 61);
    matMap.set(materials[5], 63);

    let qualities = ["Junk", "Rusted", "Normal", "Reinforced", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    items.armor.chestplate = Object.create(items.armor);
    items.armor.chestplate.name = "Chestplate";
    items.armor.chestplate.slot = "bodyarmor";
    items.armor.chestplate.quality = shuffle(qualities)[0];
    items.armor.chestplate.material = shuffle(materials)[0];
    items.armor.chestplate.ac = randomRange(3, 7)+quaMap.get(items.armor.chestplate.quality);
    items.armor.chestplate.ec = randomRange(-5, 0)+quaMap.get(items.armor.chestplate.quality);
    items.armor.chestplate.sprite = matMap.get(items.armor.chestplate.material);

    return items.armor.chestplate;
}

// Weapon Generators

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
    items.weapons.sword.diceSides = randomRange(3, 7)+quaMap.get(items.weapons.sword.quality);
    items.weapons.accuracy = randomRange(80, 90);
    items.weapons.sword.sprite = matMap.get(items.weapons.sword.material);

    return items.weapons.sword;
}

function makeAxe() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 82);
    matMap.set(materials[1], 83);
    matMap.set(materials[2], 76);
    matMap.set(materials[3], 85);
    matMap.set(materials[4], 84);
    matMap.set(materials[5], 86);

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
    items.weapons.axe.material = shuffle(materials)[0];
    items.weapons.axe.diceRolls = 1;
    items.weapons.axe.diceSides = randomRange(5, 12)+quaMap.get(items.weapons.axe.quality);
    items.weapons.accuracy = randomRange(60, 70);
    items.weapons.axe.sprite = matMap.get(items.weapons.axe.material);

    return items.weapons.axe;
}

function makeHammer() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 87);
    matMap.set(materials[1], 88);
    matMap.set(materials[2], 77);
    matMap.set(materials[3], 90);
    matMap.set(materials[4], 89);
    matMap.set(materials[5], 91);

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
    items.weapons.hammer.material = shuffle(materials)[0];
    items.weapons.hammer.diceRolls = 1;
    items.weapons.hammer.diceSides = randomRange(4, 11)+quaMap.get(items.weapons.hammer.quality);
    items.weapons.accuracy = randomRange(60, 70);
    items.weapons.hammer.sprite = matMap.get(items.weapons.hammer.material);

    return items.weapons.hammer;
}

function makeStaff() {
    let materials = ["Wooden", "Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 78);
    matMap.set(materials[1], 52);
    matMap.set(materials[2], 77);
    matMap.set(materials[3], 55);
    matMap.set(materials[4], 54);
    matMap.set(materials[5], 43);

    let qualities = ["Broken", "Scratched", "Normal", "Hardened", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    items.weapons.staff = Object.create(items.weapons);
    items.weapons.staff.name = "Quaterstaff"
    items.weapons.staff.damageType = "blunt";
    items.weapons.staff.quality = shuffle(qualities)[0];
    items.weapons.staff.material = materials[0];
    items.weapons.staff.diceRolls = 1;
    items.weapons.staff.diceSides = randomRange(3, 6)+quaMap.get(items.weapons.staff.quality);
    items.weapons.accuracy = randomRange(70, 80);
    items.weapons.staff.sprite = matMap.get(items.weapons.staff.material);

    return items.weapons.staff;
}