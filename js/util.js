function tryTo(description, callback) {
    for (let timeout=1000; timeout>0; timeout--) {
        if (callback()) {
            return
        }
    }
    throw 'Timeout while trying to ' + description;
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roll(count, sides) {
    if (count > 1) {
        let rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(randomRange(1, sides));
        }
        return rolls;
    } else {
        return randomRange(1, sides);
    }
}

function rollSum(count, sides) {
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum = sum + randomRange(1, sides);
    }
    return sum;
}

function shuffle(arr) {
    let temp, r;
    for (let i = 1; i < arr.length; i++) {
        r = randomRange(0, i);
        temp = arr[i];
        arr[i] = arr[r];
        arr[r] = temp;
    }
    return arr;
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function rightPad(textArray) {
    let finalText = "";
    textArray.forEach(text => {
        text+="";
        for(let i = text.length; i < 10; i++) {
            text += " ";
        }
        finalText += text;
    });
    return finalText;
}