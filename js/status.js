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
        super.update(target);
    }
}

class Burning extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        target.hp--;
        super.update(target);
    }
}

function addStatus(name, duration, target) {

    if (name == "Stunned") {
        let count = 0;
        for (let i = 0; i < target.statuses.length; i++) {
            if (target.statuses[i].consctructor.name == "Stunned") {
                target.statuses[i].duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Stunned(duration));
        }
    }
}