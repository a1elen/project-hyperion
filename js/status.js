class StatusEffect {
    constructor(duration) {
        this.duration = duration;
    }

    update(target) {
        if (duration >= 1) {
            duration--;
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