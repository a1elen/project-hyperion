item = {
    name: "Item",
    type: "item",
    sprite: 0
}

food = Object.create(item);
food.type = "food";
food.hunger = 10;
food.get = function() {
    player.hunger = Math.min(100, player.hunger + this.hunger);
    return true;
};

items.food.apple = Object.create(food);
items.food.apple.name = "Apple";
items.food.apple.sprite = 73;