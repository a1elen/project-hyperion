class StatusEffect {
    constructor(duration) {
        this.duration = duration;
    }

    update(target) {
        if (this.duration >= 1) {
            this.duration--;
        }
    }

    countDown() {
        

    }
}

class Quicken extends StatusEffect {
    constructor(duration) {
        super(duration);
    }
}

class HpRegen extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        if (target.hp < target.maxHealth) { 
            target.hp++;
        }
        super.update(target);
    }
}

class Stunned extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        target.stunned = true;
    }
}