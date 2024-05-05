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
items.weapons.damageType = "slash";
items.weapons.quality = "Normal";
items.weapons.material = "Iron";
items.weapons.accuracy = 1;
items.weapons.attackSpeed = 1;
items.weapons.get = function() {
    player.inventory.push(this);
    addPopups("Picked up " + this.fullName, "white", player);
    return true;
};
items.weapons.fullName = function() {
    let name = this.quality+" "+this.material+" "+this.name;
    return name;
};

function makeSword() {
    materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], 51);
    matMap.set(materials[1], 52);
    matMap.set(materials[2], 53);
    matMap.set(materials[3], 55);
    matMap.set(materials[4], 54);
    matMap.set(materials[5], 43);

}
