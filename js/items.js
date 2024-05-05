item = {
    name: "Item",
    type: "item",
    sprite: 0
}

items = {}

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