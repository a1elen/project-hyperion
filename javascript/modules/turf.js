class Turf {
    constructor(x, y, sprite, floor, wall) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.floor = floor;
        this.wall = wall;

        this.entities = [];
        this.objects = [];
    }

    init() {

    }

    update() {

    }

    draw() {
        if (this.floor != undefined) graphics.drawSprite(this.floor.sprite, this.x, this.y);
        if (this.wall != undefined) graphics.drawSprite(this.wall.sprite, this.x, this.y);
    }

    setFloor() {
        this.floor = new Floor();
    }

    removeFloor() {
        this.floor = undefined;
    }

    setWall() {
        this.wall = new Wall();
    }

    removeWall() {
        this.wall = undefined;
    }
}

class Floor {
    constructor(sprite) {
        this.sprite = 2;
    }
}

class Wall {
    constructor(sprite) {
        this.sprite = 3;
    }
}