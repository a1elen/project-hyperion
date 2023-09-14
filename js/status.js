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
            target.heal(1 * target.will);
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
        check_dead();
        super.update(target);
    }
}

class Bleeding extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        target.hp--;
        //playSound("move");
        check_dead();
        super.update(target);
    }
}

class Shielded extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        target.shielded = true;
        super.update(target);
    }
}

class AllSeeingEye extends StatusEffect {
    constructor(duration) {
        super(duration);
    }

    update(target) {
        super.update(target);
    }
}

function addStatus(name, duration, target) {

    if (!target.statuses) {
        return;
    }

    if (name == "Stunned") {
        let count = 0;
        for (let i = 0; i < target.statuses.length; i++) {
            if (target.statuses[i].constructor.name == "Stunned") {
                target.statuses[i].duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Stunned(duration));
        }
    }

    if (name == "Bleeding") {
        let count = 0;
        for (let i = 0; i < target.statuses.length; i++) {
            if (target.statuses[i].constructor.name == "Bleeding") {
                target.statuses[i].duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Bleeding(duration));
        }
    }

    if (name == "Shielded") {
        let count = 0;
        for (let i = 0; i < target.statuses.length; i++) {
            if (target.statuses[i].constructor.name == "Shielded") {
                target.statuses[i].duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Shielded(duration));
        }
    }

    if (name == "AllSeeingEye") {
        let count = 0;
        for (let i = 0; i < target.statuses.length; i++) {
            if (target.statuses[i].constructor.name == "AllSeeingEye") {
                target.statuses[i].duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new AllSeeingEye(duration));
        }
    }
}