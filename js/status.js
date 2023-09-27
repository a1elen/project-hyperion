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
        target.tile.blood = true;
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
        for (const status of target.statuses) {
            if (status.constructor.name == "Stunned") {
                status.duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Stunned(duration));
        }
    }

    if (name == "Bleeding") {
        let count = 0;
        for (const status of target.statuses) {
            if (status.constructor.name == "Bleeding") {
                status.duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Bleeding(duration));
        }
    }

    if (name == "Shielded") {
        let count = 0;
        for (const status of target.statuses) {
            if (status.constructor.name == "Shielded") {
                status.duration += duration;
                count++;
            }
        }
        if (count < 1) {
            target.statuses.push(new Shielded(duration));
        }
    }

    if (name != "AllSeeingEye") {
        return;
    }
    let count = 0;
    for (const status of target.statuses) {
        if (status.constructor.name == "AllSeeingEye") {
            status.duration += duration;
            count++;
        }
    }
    if (count < 1) {
        target.statuses.push(new AllSeeingEye(duration));
    }
}