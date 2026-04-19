items = {}

item = {
    name: "Item",
    type: "item",
    sprite: 0,
    throwDamage: 1,
    quantity: 1,
}

function areItemsIdentical(item1, item2) {
    if (item1.type !== item2.type) return false;
    if (item1.name !== item2.name) return false;
    if (item1.sprite !== item2.sprite) return false;
    
    // Check weapons
    if (item1.type === "weapon") {
        if (item1.quality !== item2.quality) return false;
        if (item1.material !== item2.material) return false;
        if (item1.handedness !== item2.handedness) return false;
        if (item1.accuracy !== item2.accuracy) return false;
        if (item1.attackSpeed !== item2.attackSpeed) return false;
        // Check damageTypes array
        if (item1.damageTypes.length !== item2.damageTypes.length) return false;
        for (let i = 0; i < item1.damageTypes.length; i++) {
            if (item1.damageTypes[i].type !== item2.damageTypes[i].type) return false;
            if (item1.damageTypes[i].rolls !== item2.damageTypes[i].rolls) return false;
            if (item1.damageTypes[i].sides !== item2.damageTypes[i].sides) return false;
        }
    }
    
    // Check armor
    if (item1.type === "armor") {
        if (item1.ac !== item2.ac) return false;
        if (item1.ec !== item2.ec) return false;
        if (item1.quality !== item2.quality) return false;
        if (item1.material !== item2.material) return false;
        if (item1.slot !== item2.slot) return false;
        // Check resistances
        if (item1.resistances && item2.resistances) {
            for (const type in item1.resistances) {
                if (item1.resistances[type] !== item2.resistances[type]) return false;
            }
        }
    }
    
    // Check food
    if (item1.type === "food") {
        if (item1.hunger !== item2.hunger) return false;
    }
    
    // Check scrolls
    if (item1.type === "scroll") {
        if (item1.spell !== item2.spell) return false;
    }
    
    // Check throw damage
    if (item1.throwDamage !== item2.throwDamage) return false;
    
    // Check isLit state for items that have it (lanterns, torches, etc.)
    if (item1.isLit !== item2.isLit) return false;
    
    // Check statBoost property
    if (item1.statBoost && item2.statBoost) {
        if (item1.statBoost.stat !== item2.statBoost.stat) return false;
        if (item1.statBoost.value !== item2.statBoost.value) return false;
    } else if (item1.statBoost || item2.statBoost) {
        return false;
    }
    
    return true;
}

item.get = function() {
    // Check if identical item already exists in inventory
    for (let existingItem of player.inventory) {
        if (areItemsIdentical(this, existingItem)) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            addPopups("Picked up " + this.fullName(), "white", player);
            return true;
        }
    }
    
    // If no identical item found, add as new
    if (player.inventory.length < player.inventory_space) {
        this.quantity = 1;
        player.inventory.push(this);
        addPopups("Picked up " + this.fullName(), "white", player);
        return true;
    } else {
        addPopups("Not enough space", "white", player);
    }
};
item.fullName = function() {
    return this.name;
};

item.menuName = function() {
    let baseName;
    if (this.material) {
        // Check if name already starts with material (case-insensitive)
        const nameLower = this.name.toLowerCase();
        const materialLower = this.material.toLowerCase();
        if (nameLower.startsWith(materialLower)) {
            baseName = this.name;
        } else {
            baseName = `${this.material} ${this.name}`;
        }
    } else {
        baseName = this.name;
    }
    switch (this.quality) {
        case "Junk":
            return `-${baseName}-`;
        case "Rusted":
            return `/${baseName}/`;
        case "Normal":
            return baseName;
        case "Sharpened":
        case "Reinforced":
            return `+${baseName}+`;
        case "Masterpiece":
            return `*${baseName}*`;
        default:
            return baseName;
    }
};

// Food
items.food = Object.create(item);
items.food.type = "food";
items.food.hunger = 10;
items.food.eat = function() {
    player.hunger = Math.min(100, player.hunger + this.hunger);
    return true;
};

items.food.apple = Object.create(items.food);
items.food.apple.name = "Apple";
items.food.apple.sprite = SPRITES.FOOD_APPLE;
items.food.apple.hunger = 5;

items.food.meat = Object.create(items.food);
items.food.meat.name = "Meat";
items.food.meat.sprite = SPRITES.FOOD_MEAT;
items.food.meat.hunger = 50;

items.food.bread = Object.create(items.food);
items.food.bread.name = "Bread";
items.food.bread.sprite = SPRITES.FOOD_BREAD;
items.food.bread.hunger = 25;

items.food.carcass = Object.create(items.food);
items.food.carcass.name = "Carcass";
items.food.carcass.sprite = SPRITES.FOOD_CARCASS;
items.food.carcass.hunger = 15;

items.food.potato = Object.create(items.food);
items.food.potato.name = "Potato";
items.food.potato.sprite = SPRITES.POTATO;
items.food.potato.hunger = 10;

// Weapons
items.weapons = Object.create(item);
items.weapons.type = "weapon";
items.weapons.isWeapon = true;
items.weapons.quality = "Normal";
items.weapons.material = "Iron";
items.weapons.handedness = "one-handed"; // "one-handed" or "two-handed"
items.weapons.damageTypes = []; // Array of {type: "slash", rolls: 1, sides: 6}
items.weapons.accuracy = 0.8;
items.weapons.attackSpeed = 1.0; // 1.0 = normal, 1.25 = 25% faster
items.weapons.fullName = function() {
    const qualityPrefix = this.quality === "Normal" ? "" : this.quality + " ";
    return `${qualityPrefix}${this.material} ${this.name}`;
};

items.tools = Object.create(item);

items.tools.pickaxe = Object.create(items.tools);
items.tools.pickaxe.name = "Pickaxe"
items.tools.pickaxe.type = "tool";
items.tools.pickaxe.category = "pickaxe";
items.tools.pickaxe.sprite = SPRITES.PICKAXE;

items.tools.beartrap = Object.create(items.tools);
items.tools.beartrap.name = "Bear Trap";
items.tools.beartrap.sprite = SPRITES.TOOL_BEARTRAP;

items.tools.skull = Object.create(items.tools);
items.tools.skull.name = "Skull";
items.tools.skull.sprite = SPRITES.DECOR_SKULL;
items.tools.skull.category = "other";

items.tools.bone = Object.create(items.tools);
items.tools.bone.name = "Bone";
items.tools.bone.sprite = SPRITES.DECOR_BONE;
items.tools.bone.category = "other";

items.tools.woodscraps = Object.create(items.tools);
items.tools.woodscraps.name = "Wood Scraps";
items.tools.woodscraps.sprite = SPRITES.DECOR_WOODSCRAPS;
items.tools.woodscraps.category = "other";

function makeTorch() {
    const torch = Object.create(items.tools);
    torch.name = "Torch";
    torch.type = "tool";
    torch.sprite = SPRITES.TORCH;
    torch.isLit = false;
    torch.lightRadius = 0;
    torch.damageTypes = [{type: "fire", rolls: 1, sides: 2}];
    torch.activate = function() {
        this.isLit = !this.isLit;
        if (this.isLit) {
            this.sprite = SPRITES.TORCH_LIT;
            this.lightRadius = 3;
            addMessageLog("Torch lit.");
            addPopups("Lit", "yellow", player);
        } else {
            this.sprite = SPRITES.TORCH;
            this.lightRadius = 0;
            addMessageLog("Torch extinguished.");
            addPopups("Extinguished", "gray", player);
        }
    };
    torch.fullName = function() {
        return this.isLit ? "Torch (lit)" : "Torch";
    };
    return torch;
}

items.tools.torch = makeTorch();

// Armor
items.armor = Object.create(item);
items.armor.type = "armor";
items.armor.ac = 1;
items.armor.ec = 1;
items.armor.quality = "Normal";
items.armor.material = "Iron";
items.armor.resistances = {
    slash: 0,
    blunt: 0,
    pierce: 0,
    fire: 0,
    cold: 0,
    electrical: 0,
    poison: 0,
    arcane: 0,
    death: 0
};
items.armor.fullName = function() {
    const qualityPrefix = this.quality === "Normal" ? "" : this.quality + " ";
    return qualityPrefix+this.material+" "+this.name;
};

function makeLantern() {
    const lantern = Object.create(items.armor);
    lantern.name = "Lantern";
    lantern.type = "armor";
    lantern.sprite = SPRITES.LANTERN;
    lantern.isLit = false;
    lantern.lightRadius = 0;
    lantern.slot = "belt";
    lantern.activate = function() {
        this.isLit = !this.isLit;
        if (this.isLit) {
            this.sprite = SPRITES.LANTERN_LIT;
            this.lightRadius = 6;
            addMessageLog("Lantern lit.");
            addPopups("Lit", "yellow", player);
        } else {
            this.sprite = SPRITES.LANTERN;
            this.lightRadius = 0;
            addMessageLog("Lantern extinguished.");
            addPopups("Extinguished", "gray", player);
        }
    };
    lantern.fullName = function() {
        return this.isLit ? "Lantern (lit)" : "Lantern";
    };
    return lantern;
}

items.tools.lantern = makeLantern();

function makeHeadlamp() {
    const headlamp = Object.create(items.armor);
    headlamp.name = "Headlamp";
    headlamp.type = "armor";
    headlamp.sprite = SPRITES.HEADLAMP;
    headlamp.isLit = false;
    headlamp.lightRadius = 0;
    headlamp.slot = "headwear";
    headlamp.activate = function() {
        this.isLit = !this.isLit;
        if (this.isLit) {
            this.sprite = SPRITES.HEADLAMP_LIT;
            this.lightRadius = 6;
            addMessageLog("Headlamp lit.");
            addPopups("Lit", "yellow", player);
        } else {
            this.sprite = SPRITES.HEADLAMP;
            this.lightRadius = 0;
            addMessageLog("Headlamp extinguished.");
            addPopups("Extinguished", "gray", player);
        }
    };
    headlamp.fullName = function() {
        return this.isLit ? "Headlamp (lit)" : "Headlamp";
    };
    return headlamp;
}

items.tools.headlamp = makeHeadlamp();

// Stat-Boosting Rings
function makeStatRing(ringType) {
    const ring = Object.create(items.armor);
    ring.type = "armor";
    ring.slot = "ring";
    ring.ac = 0;
    ring.ec = 0;
    
    // Available stats to boost
    const stats = ["strength", "constitution", "perception", "agility", "arcane", "will"];
    const selectedStat = shuffle(stats)[0];
    ring.statBoost = { stat: selectedStat, value: 1 };
    
    // Set name and sprite based on ring type
    const ringData = {
        "gold": { name: "Gold Ring", sprite: SPRITES.RING_GOLD },
        "silver": { name: "Silver Ring", sprite: SPRITES.RING_SILVER },
        "sapphire": { name: "Sapphire Ring", sprite: SPRITES.SAPPHIRE_RING },
        "ruby": { name: "Ruby Ring", sprite: SPRITES.RUBY_RING }
    };
    
    const data = ringData[ringType];
    ring.name = data.name;
    ring.sprite = data.sprite;
    ring.material = ringType.charAt(0).toUpperCase() + ringType.slice(1);
    
    ring.fullName = function() {
        const statName = this.statBoost.stat.charAt(0).toUpperCase() + this.statBoost.stat.slice(1);
        return `${this.name} (+1 ${statName})`;
    };
    
    return ring;
}

// Stat-Boosting Belts
function makeStatBelt(beltType) {
    const belt = Object.create(items.armor);
    belt.type = "armor";
    belt.slot = "belt";
    belt.ac = 0;
    belt.ec = 0;
    
    // Available stats to boost
    const stats = ["strength", "constitution", "perception", "agility", "arcane", "will"];
    const selectedStat = shuffle(stats)[0];
    belt.statBoost = { stat: selectedStat, value: 1 };
    
    // Set name and sprite based on belt type
    const beltData = {
        "silver": { name: "Silver Belt", sprite: SPRITES.SILVER_BELT },
        "gold": { name: "Gold Belt", sprite: SPRITES.GOLD_BELT }
    };
    
    const data = beltData[beltType];
    belt.name = data.name;
    belt.sprite = data.sprite;
    belt.material = beltType.charAt(0).toUpperCase() + beltType.slice(1);
    
    belt.fullName = function() {
        const statName = this.statBoost.stat.charAt(0).toUpperCase() + this.statBoost.stat.slice(1);
        return `${this.name} (+1 ${statName})`;
    };
    
    return belt;
}

// Steel Armor
function makeSteelArmor(armorType) {
    const armor = Object.create(items.armor);
    armor.type = "armor";
    armor.slot = "headwear";
    armor.material = "Steel";
    armor.quality = "Normal";
    
    // Steel resistance pattern (from breastplate data)
    const steelResistances = {
        slash: 15,
        blunt: 16,
        pierce: 10,
        fire: 0,
        cold: 0,
        electrical: 0,
        poison: 0,
        arcane: 0,
        death: 0
    };
    
    if (armorType === "helmet") {
        armor.name = "Steel Helmet";
        armor.sprite = SPRITES.STEEL_HELMET;
        armor.ac = 3;
        armor.ec = -2;
    } else if (armorType === "cap") {
        armor.name = "Steel Cap";
        armor.sprite = SPRITES.STEEL_CAP;
        armor.ac = 2;
        armor.ec = 0;
    }
    
    armor.resistances = steelResistances;
    
    return armor;
}

// Leather Armor
items.armor.leatherCap = Object.create(items.armor);
items.armor.leatherCap.name = "Leather Cap";
items.armor.leatherCap.sprite = SPRITES.LEATHER_CAP;
items.armor.leatherCap.slot = "headwear";
items.armor.leatherCap.material = "Leather";
items.armor.leatherCap.ac = 1;
items.armor.leatherCap.ec = 1;
items.armor.leatherCap.resistances = {
    slash: 3,
    blunt: 2,
    pierce: 5,
    fire: 0,
    cold: 5,
    electrical: 0,
    poison: 5,
    arcane: 0,
    death: 0
};

items.armor.leatherBoots = Object.create(items.armor);
items.armor.leatherBoots.name = "Leather Boots";
items.armor.leatherBoots.sprite = SPRITES.LEATHER_BOOTS;
items.armor.leatherBoots.slot = "boots";
items.armor.leatherBoots.material = "Leather";
items.armor.leatherBoots.ac = 1;
items.armor.leatherBoots.ec = 2;
items.armor.leatherBoots.resistances = {
    slash: 2,
    blunt: 5,
    pierce: 3,
    fire: 0,
    cold: 5,
    electrical: 0,
    poison: 5,
    arcane: 0,
    death: 0
};

items.armor.leatherTrousers = Object.create(items.armor);
items.armor.leatherTrousers.name = "Leather Trousers";
items.armor.leatherTrousers.sprite = SPRITES.LEATHER_TROUSERS;
items.armor.leatherTrousers.slot = "legwear";
items.armor.leatherTrousers.material = "Leather";
items.armor.leatherTrousers.ac = 1;
items.armor.leatherTrousers.ec = 1;
items.armor.leatherTrousers.resistances = {
    slash: 3,
    blunt: 3,
    pierce: 4,
    fire: 0,
    cold: 5,
    electrical: 0,
    poison: 5,
    arcane: 0,
    death: 0
};

items.armor.leatherGloves = Object.create(items.armor);
items.armor.leatherGloves.name = "Leather Gloves";
items.armor.leatherGloves.sprite = SPRITES.LEATHER_GLOVES;
items.armor.leatherGloves.slot = "gloves";
items.armor.leatherGloves.material = "Leather";
items.armor.leatherGloves.ac = 1;
items.armor.leatherGloves.ec = 1;
items.armor.leatherGloves.resistances = {
    slash: 2,
    blunt: 2,
    pierce: 3,
    fire: 0,
    cold: 5,
    electrical: 0,
    poison: 5,
    arcane: 0,
    death: 0
};

items.armor.leatherTunic = Object.create(items.armor);
items.armor.leatherTunic.name = "Leather Tunic";
items.armor.leatherTunic.sprite = SPRITES.LEATHER_TUNIC;
items.armor.leatherTunic.slot = "bodyarmor";
items.armor.leatherTunic.material = "Leather";
items.armor.leatherTunic.ac = 2;
items.armor.leatherTunic.ec = 1;
items.armor.leatherTunic.resistances = {
    slash: 5,
    blunt: 4,
    pierce: 6,
    fire: 0,
    cold: 5,
    electrical: 0,
    poison: 10,
    arcane: 0,
    death: 0
};

// Armor Generators

function makeBodyarmor() {
    return makeChestplate();
}

function makeChestplate() {
    let materials = ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"];

    let matMap = new Map();
    matMap.set(materials[0], SPRITES.BREASTPLATE_COPPER);
    matMap.set(materials[1], SPRITES.BREASTPLATE_BRONZE);
    matMap.set(materials[2], SPRITES.BREASTPLATE_IRON);
    matMap.set(materials[3], SPRITES.BREASTPLATE_SILVER);
    matMap.set(materials[4], SPRITES.BREASTPLATE_GOLD);
    matMap.set(materials[5], SPRITES.BREASTPLATE_STEEL);

    let qualities = ["Junk", "Rusted", "Normal", "Reinforced", "Masterpiece"];

    let quaMap = new Map();
    quaMap.set(qualities[0], -2);
    quaMap.set(qualities[1], -1);
    quaMap.set(qualities[2], 0);
    quaMap.set(qualities[3], 1);
    quaMap.set(qualities[4], 2);

    // Material resistance bonuses
    let matResistMap = new Map();
    matResistMap.set("Copper", {slash: 5, blunt: 6, pierce: 4});
    matResistMap.set("Bronze", {slash: 7, blunt: 8, pierce: 5});
    matResistMap.set("Iron", {slash: 10, blunt: 11, pierce: 7});
    matResistMap.set("Silver", {slash: 12, blunt: 13, pierce: 8});
    matResistMap.set("Gold", {slash: 8, blunt: 9, pierce: 6});
    matResistMap.set("Steel", {slash: 15, blunt: 16, pierce: 10});

    items.armor.chestplate = Object.create(items.armor);
    items.armor.chestplate.name = "Chestplate";
    items.armor.chestplate.slot = "bodyarmor";
    items.armor.chestplate.quality = shuffle(qualities)[0];
    items.armor.chestplate.material = shuffle(materials)[0];
    items.armor.chestplate.ac = randomRange(3, 7)+quaMap.get(items.armor.chestplate.quality);
    items.armor.chestplate.ec = randomRange(-5, 0)+quaMap.get(items.armor.chestplate.quality);
    items.armor.chestplate.sprite = matMap.get(items.armor.chestplate.material);

    // Apply resistances based on material and quality
    const baseResist = matResistMap.get(items.armor.chestplate.material);
    const qualityMod = quaMap.get(items.armor.chestplate.quality);
    items.armor.chestplate.resistances = {
        slash: Math.max(0, baseResist.slash + qualityMod),
        blunt: Math.max(0, baseResist.blunt + qualityMod),
        pierce: Math.max(0, baseResist.pierce + qualityMod),
        fire: 0,
        cold: 0,
        electrical: 0,
        poison: 0,
        arcane: 0,
        death: 0
    };

    return items.armor.chestplate;
}

// Weapon Data Structure with Predetermined Stats
const WEAPON_DATA = {
    materials: ["Copper", "Bronze", "Iron", "Silver", "Gold", "Steel"],
    qualities: ["Junk", "Rusted", "Normal", "Sharpened", "Masterpiece"],
    qualityModifiers: {
        "Junk": -2,
        "Rusted": -1,
        "Normal": 0,
        "Sharpened": 1,
        "Masterpiece": 2
    },
    // Base damage types for each weapon type (before quality modifier)
    weaponBaseStats: {
        sword: {
            name: "Sword",
            category: "sword",
            damageTypes: [{type: "slash", rolls: 1, baseSides: 2}],
            handedness: "one-handed",
            accuracy: 0.95,
            attackSpeed: 1.1,
            spriteMap: {
                "Copper": SPRITES.SWORD_COPPER,
                "Bronze": SPRITES.SWORD_BRONZE,
                "Iron": SPRITES.SWORD_IRON,
                "Silver": SPRITES.SWORD_SILVER,
                "Gold": SPRITES.SWORD_GOLD,
                "Steel": SPRITES.SWORD_STEEL
            }
        },
        axe: {
            name: "Axe",
            category: "axe",
            damageTypes: [{type: "slash", rolls: 1, baseSides: 1}, {type: "blunt", rolls: 1, baseSides: 1}],
            handedness: {
                "Copper": "one-handed",
                "Bronze": "one-handed",
                "Iron": "two-handed",
                "Silver": "two-handed",
                "Gold": "two-handed",
                "Steel": "two-handed"
            },
            accuracy: 0.85,
            attackSpeed: 0.9,
            spriteMap: {
                "Copper": SPRITES.AXE_COPPER,
                "Bronze": SPRITES.AXE_BRONZE,
                "Iron": SPRITES.AXE_IRON,
                "Silver": SPRITES.AXE_SILVER,
                "Gold": SPRITES.AXE_GOLD,
                "Steel": SPRITES.AXE_STEEL
            }
        },
        hammer: {
            name: "Hammer",
            category: "hammer",
            damageTypes: [{type: "blunt", rolls: 1, baseSides: 2}],
            handedness: {
                "Copper": "one-handed",
                "Bronze": "two-handed",
                "Iron": "two-handed",
                "Silver": "two-handed",
                "Gold": "two-handed",
                "Steel": "two-handed"
            },
            accuracy: 0.85,
            attackSpeed: 0.85,
            spriteMap: {
                "Copper": SPRITES.HAMMER_COPPER,
                "Bronze": SPRITES.HAMMER_BRONZE,
                "Iron": SPRITES.HAMMER_IRON,
                "Silver": SPRITES.HAMMER_SILVER,
                "Gold": SPRITES.HAMMER_GOLD,
                "Steel": SPRITES.HAMMER_STEEL
            }
        },
        quarterstaff: {
            name: "Quarterstaff",
            category: "staff",
            damageTypes: [{type: "blunt", rolls: 1, baseSides: 3}],
            handedness: "two-handed",
            accuracy: 0.9,
            attackSpeed: 1.0,
            spriteMap: {
                "Wooden": SPRITES.STAFF_WOODEN,
                "Copper": SPRITES.STAFF_COPPER,
                "Bronze": SPRITES.STAFF_BRONZE,
                "Iron": SPRITES.STAFF_IRON,
                "Silver": SPRITES.STAFF_SILVER,
                "Gold": SPRITES.STAFF_GOLD
            }
        }
    }
};

// Weapon Generators

function makeSword(material, quality) {
    const baseStats = WEAPON_DATA.weaponBaseStats.sword;
    const materials = WEAPON_DATA.materials;
    const qualities = WEAPON_DATA.qualities;

    // Determine material
    if (material == undefined || material == null) {
        material = Math.floor(Math.random() * materials.length);
    }
    const materialName = materials[material];

    // Determine quality
    if (quality == undefined || quality == null) {
        quality = Math.floor(Math.random() * qualities.length);
    }
    const qualityName = qualities[quality];
    const qualityMod = WEAPON_DATA.qualityModifiers[qualityName];

    // Create weapon
    const weapon = Object.create(items.weapons);
    weapon.name = baseStats.name;
    weapon.category = baseStats.category;
    weapon.material = materialName;
    weapon.quality = qualityName;
    weapon.handedness = baseStats.handedness;
    weapon.accuracy = baseStats.accuracy;
    weapon.attackSpeed = baseStats.attackSpeed + (qualityMod * 0.05);
    weapon.sprite = baseStats.spriteMap[materialName];

    // Calculate damage types with quality modifier
    weapon.damageTypes = baseStats.damageTypes.map(d => ({
        type: d.type,
        rolls: d.rolls,
        sides: Math.max(1, d.baseSides + qualityMod)
    }));

    return weapon;
}

function makeAxe(material, quality) {
    const baseStats = WEAPON_DATA.weaponBaseStats.axe;
    const materials = WEAPON_DATA.materials;
    const qualities = WEAPON_DATA.qualities;

    // Determine material
    if (material == undefined || material == null) {
        material = Math.floor(Math.random() * materials.length);
    }
    const materialName = materials[material];

    // Determine quality
    if (quality == undefined || quality == null) {
        quality = Math.floor(Math.random() * qualities.length);
    }
    const qualityName = qualities[quality];
    const qualityMod = WEAPON_DATA.qualityModifiers[qualityName];

    // Determine handedness based on material
    const handedness = typeof baseStats.handedness === 'string' 
        ? baseStats.handedness 
        : baseStats.handedness[materialName];

    // Create weapon
    const weapon = Object.create(items.weapons);
    weapon.name = baseStats.name;
    weapon.category = baseStats.category;
    weapon.material = materialName;
    weapon.quality = qualityName;
    weapon.handedness = handedness;
    weapon.accuracy = baseStats.accuracy;
    weapon.attackSpeed = baseStats.attackSpeed + (qualityMod * 0.05);
    weapon.sprite = baseStats.spriteMap[materialName];

    // Calculate damage types with quality modifier
    weapon.damageTypes = baseStats.damageTypes.map(d => ({
        type: d.type,
        rolls: d.rolls,
        sides: Math.max(1, d.baseSides + qualityMod)
    }));

    return weapon;
}

function makeHammer(material, quality) {
    const baseStats = WEAPON_DATA.weaponBaseStats.hammer;
    const materials = WEAPON_DATA.materials;
    const qualities = WEAPON_DATA.qualities;

    // Determine material
    if (material == undefined || material == null) {
        material = Math.floor(Math.random() * materials.length);
    }
    const materialName = materials[material];

    // Determine quality
    if (quality == undefined || quality == null) {
        quality = Math.floor(Math.random() * qualities.length);
    }
    const qualityName = qualities[quality];
    const qualityMod = WEAPON_DATA.qualityModifiers[qualityName];

    // Determine handedness based on material
    const handedness = typeof baseStats.handedness === 'string' 
        ? baseStats.handedness 
        : baseStats.handedness[materialName];

    // Create weapon
    const weapon = Object.create(items.weapons);
    weapon.name = baseStats.name;
    weapon.category = baseStats.category;
    weapon.material = materialName;
    weapon.quality = qualityName;
    weapon.handedness = handedness;
    weapon.accuracy = baseStats.accuracy;
    weapon.attackSpeed = baseStats.attackSpeed + (qualityMod * 0.05);
    weapon.sprite = baseStats.spriteMap[materialName];

    // Calculate damage types with quality modifier
    weapon.damageTypes = baseStats.damageTypes.map(d => ({
        type: d.type,
        rolls: d.rolls,
        sides: Math.max(1, d.baseSides + qualityMod)
    }));

    return weapon;
}

function makeQuarterstaff(material, quality) {
    const baseStats = WEAPON_DATA.weaponBaseStats.quarterstaff;
    const materials = ["Wooden", "Copper", "Bronze", "Iron", "Silver", "Gold"];
    const qualities = WEAPON_DATA.qualities;

    // Determine material
    if (material == undefined || material == null) {
        material = Math.floor(Math.random() * materials.length);
    }
    const materialName = materials[material];

    // Determine quality
    if (quality == undefined || quality == null) {
        quality = Math.floor(Math.random() * qualities.length);
    }
    const qualityName = qualities[quality];
    const qualityMod = WEAPON_DATA.qualityModifiers[qualityName];

    // Determine handedness based on material
    const handedness = typeof baseStats.handedness === 'string' 
        ? baseStats.handedness 
        : baseStats.handedness[materialName];

    // Create weapon
    const weapon = Object.create(items.weapons);
    weapon.name = baseStats.name;
    weapon.category = baseStats.category;
    weapon.material = materialName;
    weapon.quality = qualityName;
    weapon.handedness = handedness;
    weapon.accuracy = baseStats.accuracy;
    weapon.attackSpeed = baseStats.attackSpeed + (qualityMod * 0.05);
    weapon.sprite = baseStats.spriteMap[materialName];

    // Calculate damage types with quality modifier
    weapon.damageTypes = baseStats.damageTypes.map(d => ({
        type: d.type,
        rolls: d.rolls,
        sides: Math.max(1, d.baseSides + qualityMod)
    }));

    return weapon;
}