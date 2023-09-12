class StatusEffect {
    constructor(duration) {
        this.duration = duration;
    }

    update(target) {
        if (this.duration >= 1) {
            this.duration--;
            target.hp++;
        }
    }

    countDown() {
        

    }
}

class Quick extends StatusEffect {
    constructor(duration) {
        super(duration);
    }
}