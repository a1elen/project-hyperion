DEBUG = false;

translateX = 0;
translateY = 0;

selectedItemIndex = null;
selectedInventoryItemIndex = 0;
selectedAbilityIndex = 0;
selectedStatsIndex = 0;
selectedDebugOptionIndex = 0;
selectedEquipmentSlotIndex = 0;
selectedEquipItemIndex = 0;
currentEquipSlotKey = "";
currentEquipSlotName = "";

isResting = false;

playerPendingLevelUps = 0;

// Level-up menu state
levelUpMenuState = {
    isActive: false,
    phase: "stats", // "stats" or "skills"
    upgradesRemaining: 3,
    currentOptions: [],
    selectedOptionIndex: 0
};

// Character creation menu state
characterCreationState = {
    phase: "race", // "race" or "destiny"
    selectedRaceIndex: 0,
    selectedDestinyIndex: 0
};

// Race data structures
const RACES = [
    {
        name: "Human",
        description: "Balanced and versatile. Humans have equal aptitude in all attributes.",
        stats: {
            strength: 5,
            constitution: 5,
            perception: 5,
            agility: 5,
            arcane: 5,
            will: 5
        }
    },
    {
        name: "Dwarf",
        description: "Hardy and strong, but lacking in perception and arcane abilities. Masters of endurance.",
        stats: {
            strength: 6,
            constitution: 4,
            perception: 2,
            agility: 2,
            arcane: 1,
            will: 1
        }
    },
    {
        name: "Elf",
        description: "Graceful and perceptive with strong arcane potential, but physically fragile.",
        stats: {
            strength: 2,
            constitution: 3,
            perception: 7,
            agility: 8,
            arcane: 6,
            will: 6
        }
    }
];

// Destiny (class) data structures
const DESTINIES = [
    {
        name: "Desert Knight",
        description: "A formidable warrior trained in the harsh desert wastes. Expert in combat and endurance.",
        skills: {
            fighting: 2,
            endurance: 2,
            dodge: 1,
            swordSkill: 1,
            axeSkill: 1,
            hammerSkill: 0,
            staffSkill: 0,
            magic: 0
        },
        startingInventory: [
            { type: "torch" },
            { type: "weapon", weaponType: "sword", material: 2, quality: 2 }
        ]
    },
    {
        name: "Disciple",
        description: "A mystical seeker who has forgone martial training in pursuit of arcane mastery.",
        skills: {
            fighting: 0,
            endurance: 0,
            dodge: 2,
            swordSkill: 0,
            axeSkill: 0,
            hammerSkill: 0,
            staffSkill: 0,
            magic: 2
        }
    },
    {
        name: "Waste of Skin",
        description: "A blank slate with no special training. Must prove their worth through struggle.",
        skills: {
            fighting: 0,
            endurance: 0,
            dodge: 0,
            swordSkill: 0,
            axeSkill: 0,
            hammerSkill: 0,
            staffSkill: 0,
            magic: 0
        }
    }
];

function processRest() {
    if (!isResting) return;
    
    // Stop resting if at full health
    if (player.hp >= player.maxHealth) {
        isResting = false;
        addMessageLog("Fully rested.");
        return;
    }
    
    // Stop resting if no hunger
    if (player.hunger <= 0) {
        isResting = false;
        addMessageLog("Too hungry to rest.");
        return;
    }
    
    // Burn hunger and heal health
    const hungerCost = 2;
    const healAmount = 2;
    
    player.hunger = Math.max(0, player.hunger - hungerCost);
    player.heal(healAmount);
    
    addPopups("Resting...", "aqua", player);
    
    // Continue resting next turn
    tick();
    
    // Schedule next rest turn
    if (isResting && player.hp < player.maxHealth && player.hunger > 0) {
        setTimeout(() => {
            if (isResting && gameState === "running") {
                processRest();
            }
        }, 100);
    } else if (isResting) {
        isResting = false;
        if (player.hp >= player.maxHealth) {
            addMessageLog("Fully rested.");
        } else if (player.hunger <= 0) {
            addMessageLog("Too hungry to rest.");
        }
    }
}

function stopResting() {
    if (isResting) {
        isResting = false;
        addMessageLog("Resting interrupted.");
    }
}

function tileGasHoverLabel(tile) {
    if (!tile.floorSolid) {
        return "Pit — fall to z−1";
    }
    if (tile.blocksOpenVolume) {
        return "Gas: — (solid / sealed)";
    }
    if (tile.liquid) {
        return `Gas above ${tile.liquid} · ${tile.gasSummaryString()}`;
    }
    return `Gas: ${tile.gasSummaryString()}`;
}

gameMenuTitle = "";
gameMenuSubtitleLines = [];
gameMenuOptions = [];

function closeGameMenu() {
    gameState = "running";
    gameMenuTitle = "";
    gameMenuSubtitleLines = [];
    gameMenuOptions = [];
}

function openGameMenu(title, subtitleLines, options) {
    gameMenuTitle = title || "";
    gameMenuSubtitleLines = subtitleLines ? subtitleLines.slice() : [];
    gameMenuOptions = options ? options.slice() : [];
    gameState = "gameMenu";
}

function drawGameMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 600;
    const innerPadX = 12;
    const innerPadY = 10;
    const colGap = 16;
    const footerH = 20;
    const titleRowH = 22;
    const nOpt = gameMenuOptions.length;
    const invTwoCol =
        gameMenuTitle === "Inventory" && gameMenuSubtitleLines.length > 0;
    let subtitleH;
    if (invTwoCol) {
        const invCount = Math.max(0, gameMenuSubtitleLines.length - 1);
        const invRows = invCount === 0 ? 0 : Math.ceil(invCount / 2);
        subtitleH = lineH + (invCount > 0 ? 4 + invRows * lineH : 0);
    } else {
        subtitleH = gameMenuSubtitleLines.length * lineH;
    }
    const optRows = nOpt === 0 ? 0 : Math.ceil(nOpt / 2);
    const gapBeforeOpts = nOpt > 0 ? 6 : 0;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const menuH =
        innerPadY * 2 +
        titleRowH +
        subtitleH +
        gapBeforeOpts +
        optRows * lineH +
        footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);

    drawUIBox(mx, my, menuW, menuH);

    let y = my + innerPadY + titleSize;
    drawText(gameMenuTitle, titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;

    if (invTwoCol) {
        const firstLine = gameMenuSubtitleLines[0];
        const firstText = typeof firstLine === 'object' ? firstLine.text : firstLine;
        const firstColor = typeof firstLine === 'object' ? firstLine.color : "violet";
        drawText(firstText, bodySize, false, y, firstColor, canvas.width / 2, "center");
        y += lineH;
        const items = gameMenuSubtitleLines.slice(1);
        if (items.length > 0) {
            y += 4;
            const itemRows = Math.ceil(items.length / 2);
            const colW = (menuW - innerPadX * 2 - colGap) / 2;
            for (let r = 0; r < itemRows; r++) {
                for (let c = 0; c < 2; c++) {
                    const idx = r * 2 + c;
                    if (idx >= items.length) break;
                    const item = items[idx];
                    const itemText = typeof item === 'object' ? item.text : item;
                    const itemColor = typeof item === 'object' ? item.color : "white";
                    const xCol = mx + innerPadX + c * (colW + colGap);
                    drawText(itemText, bodySize, false, y + r * lineH, itemColor, xCol);
                }
            }
            y += itemRows * lineH;
        }
    } else {
        for (const line of gameMenuSubtitleLines) {
            const lineText = typeof line === 'object' ? line.text : line;
            const lineColor = typeof line === 'object' ? line.color : "white";
            drawText(lineText, bodySize, false, y, lineColor, canvas.width / 2, "center");
            y += lineH;
        }
    }

    if (nOpt > 0) {
        y += gapBeforeOpts;
        const colW = (menuW - innerPadX * 2 - colGap) / 2;
        const baseY = y;
        for (let r = 0; r < optRows; r++) {
            const rowY = baseY + r * lineH;
            for (let c = 0; c < 2; c++) {
                const idx = r * 2 + c;
                if (idx >= nOpt) break;
                const prefix = idx < 9 ? `${idx + 1}) ` : "";
                const text = prefix + gameMenuOptions[idx].label;
                const xCol = mx + innerPadX + c * (colW + colGap);
                drawText(text, bodySize, false, rowY, "aqua", xCol);
            }
        }
    }

    const footY = my + menuH - innerPadY - 4;
    let foot = "Escape — close";
    if (nOpt > 0) foot += "   ·   1–9 — select";
    drawText(foot, 13, false, footY, "gray", canvas.width / 2, "center");
}

function getItemCategory(item) {
    if (item.type === "food") return "food";
    if (item.type === "weapon") return "weapons";
    if (item.type === "armor") return "armor";
    if (item.type === "tool") return "tools";
    if (item.type === "scroll") return "scrolls";
    if (item.type === "book") return "books";
    if (item.throwDamage && item.throwDamage > 1) return "throwable";
    return "other";
}

function getCategoryOrder(category) {
    const order = {
        "food": 0,
        "throwable": 1,
        "weapons": 2,
        "armor": 3,
        "tools": 4,
        "scrolls": 5,
        "books": 6,
        "other": 7
    };
    return order[category] !== undefined ? order[category] : 7;
}

function sortInventoryByCategory(inventory) {
    const sorted = [...inventory];
    sorted.sort((a, b) => {
        const categoryA = getItemCategory(a);
        const categoryB = getItemCategory(b);
        const orderA = getCategoryOrder(categoryA);
        const orderB = getCategoryOrder(categoryB);
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // Within same category, sort by name
        const nameA = a.fullName ? a.fullName() : a.name;
        const nameB = b.fullName ? b.fullName() : b.name;
        return nameA.localeCompare(nameB);
    });
    return sorted;
}

function getItemDescription(item) {
    let desc = [];
    if (item.category) {
        desc.push({text: `Category: ${item.category}`, color: "white"});
    }
    if (item.type === "weapon") {
        if (item.damageTypes && item.damageTypes.length > 0) {
            const damageStr = item.damageTypes.map(d => `${d.rolls}d${d.sides} ${d.type}`).join(", ");
            desc.push({text: `Damage: ${damageStr}`, color: "white"});
        }
        desc.push({text: `Accuracy: x${item.accuracy.toFixed(2)}`, color: "white"});
        desc.push({text: `Attack Speed: ${item.attackSpeed.toFixed(2)}`, color: "aqua"});
        if (item.handedness) {
            desc.push({text: `Handedness: ${item.handedness}`, color: "white"});
        }
    } else if (item.type === "armor") {
        desc.push({text: `Armor Class: ${item.ac}`, color: "white"});
        desc.push({text: `Evasion Class: ${item.ec}`, color: "white"});
        if (item.resistances) {
            const physicalResist = [];
            if (item.resistances.slash > 0) physicalResist.push(`Slash +${item.resistances.slash}%`);
            if (item.resistances.blunt > 0) physicalResist.push(`Blunt +${item.resistances.blunt}%`);
            if (item.resistances.pierce > 0) physicalResist.push(`Pierce +${item.resistances.pierce}%`);
            if (physicalResist.length > 0) {
                desc.push({text: `Resist: ${physicalResist.join(", ")}`, color: "aqua"});
            }
        }
    } else if (item.type === "food") {
        desc.push({text: `Hunger: +${item.hunger}`, color: "white"});
    }
    if (item.throwDamage) {
        desc.push({text: `Throw Damage: ${item.throwDamage}`, color: "white"});
    }
    return desc;
}

function calculatePlayerStats() {
    let totalAC = 0;
    let totalEC = 0;
    let totalResistances = {
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
    let damageStr = "None";
    
    // Calculate armor stats
    const armorSlots = ['headwear', 'bodyarmor', 'gloves', 'legwear', 'boots', 'belt'];
    for (const slot of armorSlots) {
        const armor = player[slot];
        if (armor && armor.type === "armor") {
            if (slot === 'bodyarmor') {
                totalAC = armor.ac;
                totalEC = armor.ec;
            }
            if (armor.resistances) {
                for (const type in armor.resistances) {
                    totalResistances[type] += armor.resistances[type];
                }
            }
        }
    }
    
    // Calculate weapon damage
    if (player.rightHand && player.rightHand.damageTypes) {
        damageStr = player.rightHand.damageTypes.map(d => `${d.rolls}d${d.sides} ${d.type}`).join(", ");
    } else if (player.leftHand && player.leftHand.damageTypes) {
        damageStr = player.leftHand.damageTypes.map(d => `${d.rolls}d${d.sides} ${d.type}`).join(", ");
    }
    
    return {
        ac: totalAC,
        ec: totalEC,
        resistances: totalResistances,
        damage: damageStr
    };
}

function getAvailableActions(item) {
    let actions = [];
    actions.push({key: "d", action: "Drop"});
    actions.push({key: "w", action: "Wield"});
    if (item.type === "weapon") {
        if (item.activate) {
            actions.push({key: "a", action: "Activate"});
        }
    } else if (item.type === "armor") {
        actions.push({key: "W", action: "Wear"});
        if (item.activate) {
            actions.push({key: "a", action: "Activate"});
        }
    } else if (item.type === "food") {
        actions.push({key: "e", action: "Eat"});
    } else if (item.activate) {
        actions.push({key: "a", action: "Activate"});
    }
    actions.push({key: "t", action: "Throw"});
    return actions;
}

function getAbilityDescription(ability) {
    let desc = [];
    if (ability.cd !== undefined) {
        desc.push({text: `Cooldown: ${ability.cd} turns`, color: "white"});
    }
    if (ability.description) {
        desc.push({text: ability.description, color: "aqua"});
    }
    return desc;
}

function getAbilityActions(ability) {
    let actions = [];
    actions.push({key: "Enter", action: "Use"});
    return actions;
}

function openInventoryGameMenu() {
    selectedInventoryItemIndex = 0;
    gameState = "inventoryMenu";
}

function drawInventoryMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 700;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    
    // Collect all items from inventory and equipment slots
    const allItems = [];
    const equippedSlots = ['rightHand', 'leftHand', 'headwear', 'bodyarmor', 'rightFinger', 'leftFinger', 'gloves', 'legwear', 'boots', 'necklace', 'belt'];
    
    // Add inventory items
    for (let i = 0; i < player.inventory.length; i++) {
        const item = player.inventory[i];
        allItems.push({
            item: item,
            source: 'inventory',
            index: i,
            equipped: false
        });
    }
    
    // Add equipped items
    for (const slot of equippedSlots) {
        if (player[slot]) {
            const item = player[slot];
            // Check if this item is already in the list (to avoid duplicates)
            const alreadyInList = allItems.find(ai => ai.item === item);
            if (!alreadyInList) {
                allItems.push({
                    item: item,
                    source: 'equipment',
                    slot: slot,
                    equipped: true
                });
            }
        }
    }
    
    // Sort all items by category
    const sortedItems = sortInventoryByCategory(allItems.map(ai => ai.item));
    
    // Build item lines with category headers
    const itemLines = [];
    let currentCategory = null;
    let displayIndex = 0;
    
    for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        const itemData = allItems.find(ai => ai.item === item);
        const category = getItemCategory(item);
        
        // Add category header if category changed
        if (category !== currentCategory) {
            itemLines.push({
                text: category.charAt(0).toUpperCase() + category.slice(1),
                color: "aqua",
                isHeader: true
            });
            currentCategory = category;
        }
        
        let text = item.fullName != undefined ? item.fullName() : item.name;
        let text_color = "white";
        if (item.quality != undefined) {
            switch(item.quality) {
                case "Junk": text_color = "grey"; break;
                case "Rusted": text_color = "orange"; break;
                case "Normal": text_color = "white"; break;
                case "Sharpened": text_color = "aqua"; break;
                case "Masterpiece": text_color = "violet"; break;
                case "Sharp": text_color = "aqua"; break;
            }
        }
        
        // Add stack count if quantity > 1
        if (item.quantity && item.quantity > 1) {
            text += ` (x${item.quantity})`;
        }
        
        // Add "(equipped)" suffix for equipped items
        if (itemData && itemData.equipped) {
            text += " (equipped)";
        }
        
        const originalIndex = itemData && itemData.source === 'inventory' ? itemData.index : -1;
        itemLines.push({
            text: `${displayIndex + 1}) ${text}`,
            color: text_color,
            originalIndex: originalIndex,
            isHeader: false,
            displayIndex: displayIndex,
            itemData: itemData
        });
        displayIndex++;
    }
    
    // Map display index to item for selection
    const selectedItemData = selectedInventoryItemIndex < sortedItems.length ? 
        allItems.find(ai => ai.item === sortedItems[selectedInventoryItemIndex]) : null;
    const selectedItem = selectedItemData ? selectedItemData.item : null;
    const itemDesc = selectedItem ? getItemDescription(selectedItem) : [];
    
    // Get available actions based on whether item is equipped or in inventory
    let actions = [];
    if (selectedItem) {
        if (selectedItemData && selectedItemData.equipped) {
            // Actions for equipped items
            actions.push({key: "u", action: "Unequip"});
            actions.push({key: "d", action: "Drop"});
            actions.push({key: "t", action: "Throw"});
            if (selectedItem.activate) {
                actions.push({key: "a", action: "Activate"});
            }
        } else {
            // Actions for inventory items
            actions = getAvailableActions(selectedItem);
        }
    }
    
    const leftColWidth = 280;
    const rightColWidth = 320;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    
    // Calculate fixed height with minimum like equipment menu
    const contentHeight = Math.max(itemLines.length * lineH, 20 * lineH);
    const menuH = innerPadY * 2 + titleRowH + lineH + 10 + contentHeight + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);
    
    let y = my - titleSize - 5;
    drawText("Inventory", titleSize, false, y, "violet", canvas.width / 2, "center");
    
    drawUIBox(mx, my, menuW, menuH);
    
    y = my + innerPadY + titleSize;
    y += titleRowH;
    
    // Draw gold
    drawText(`Gold: ${score}`, bodySize, false, y, "white", mx + innerPadX);
    y += lineH + 10;
    
    // Draw separator line
    const separatorX = mx + innerPadX + leftColWidth;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(separatorX, my + innerPadY);
    ctx.lineTo(separatorX, my + menuH - innerPadY);
    ctx.stroke();
    
    // Draw item list with category headers
    const listX = mx + innerPadX;
    let currentDisplayIndex = 0;
    for (let i = 0; i < itemLines.length; i++) {
        const item = itemLines[i];
        if (item.isHeader) {
            drawText(item.text, bodySize, true, y + i * lineH, item.color, listX);
        } else {
            const isSelected = item.displayIndex === selectedInventoryItemIndex;
            if (isSelected) {
                ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
                ctx.fillRect(listX, y + i * lineH - 2 - lineH / 2, leftColWidth, lineH);
            }
            const color = isSelected ? "yellow" : item.color;
            drawText(item.text, bodySize, false, y + i * lineH, color, listX);
            currentDisplayIndex++;
        }
    }
    
    // Draw selected item details
    if (selectedItem) {
        const descX = mx + innerPadX + leftColWidth + 30;
        let descY = my + innerPadY + titleSize + titleRowH + 10;
        
        drawText("Item Details:", bodySize, false, descY, "violet", descX);
        descY += lineH;
        
        for (const line of itemDesc) {
            drawText(line.text, bodySize, false, descY, line.color, descX);
            descY += lineH;
        }
        
        // Draw available actions
        descY += 10;
        drawText("Actions:", bodySize, false, descY, "violet", descX);
        descY += lineH;
        
        const actionText = actions.map(a => `${a.key}: ${a.action}`).join("  ");
        drawText(actionText, bodySize, false, descY, "aqua", descX);
    }
    
    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("Arrow keys: Navigate  ·  Escape: Close", 13, false, footY, "gray", canvas.width / 2, "center");
}

function openSpellsGameMenu() {
    const opts = [];
    for (let i = 0; i < numSpells; i++) {
        const idx = i;
        opts.push({
            label: player.spells[i] || "---",
            run: () => player.castSpell(idx),
        });
    }
    openGameMenu("Spells", [], opts);
}

function openWieldGameMenu() {
    const opts = player.inventory.map((item, i) => ({
        label: item.fullName ? item.fullName() : item.name,
        run: () => {
            if (item.handedness === "two-handed") {
                player.wield(i, "both");
            } else {
                openHandSelectionMenu(i);
            }
        },
    }));
    openGameMenu("Wield item", [], opts);
}

function openHandSelectionMenu(itemIndex) {
    const item = player.inventory[itemIndex];
    const opts = [
        {
            label: "Right hand",
            run: () => player.wield(itemIndex, "right"),
        },
        {
            label: "Left hand",
            run: () => player.wield(itemIndex, "left"),
        },
    ];
    openGameMenu(`Equip ${item.fullName ? item.fullName() : item.name} in:`, [], opts);
}

function openWearGameMenu() {
    const list = player.inventory.filter((it) => it.type === "armor");
    const opts = list.map((a, i) => ({
        label: a.fullName(),
        run: () => player.wear(i),
    }));
    openGameMenu("Wear armor", [], opts);
}

function openEatGameMenu() {
    const list = player.inventory.filter((it) => it.type === "food");
    const opts = list.map((f, i) => ({
        label: f.fullName(),
        run: () => player.eat(i),
    }));
    openGameMenu("Eat", [], opts);
}

function openReadGameMenu() {
    const list = player.inventory.filter((it) => it.type === "scroll");
    const opts = list.map((s, i) => ({
        label: s.fullName(),
        run: () => player.castScroll(i),
    }));
    openGameMenu("Read scroll", [], opts);
}

function openDropGameMenu() {
    const opts = player.inventory.map((it, i) => ({
        label: it.fullName != undefined ? it.fullName() : it.name,
        run: () => player.drop(i),
    }));
    openGameMenu("Drop item", [], opts);
}

function openThrowGameMenu() {
    const opts = player.inventory.map((it, i) => ({
        label: it.fullName != undefined ? it.fullName() : it.name,
        run: () => {
            gameState = "throwTarget";
            selectedTile = player.tile;
            selectedTile.selected = true;
            selectedItemIndex = i;
        },
    }));
    openGameMenu("Throw item", [], opts);
}

function drawAbilitiesMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 700;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    
    // Build ability lines
    const abilityLines = [];
    let displayIndex = 0;
    
    for (let i = 0; i < player.abilities.length; i++) {
        const ability = player.abilities[i];
        if (ability.name != undefined) {
            const cooldownText = ability.currentCooldown > 0 ? ` (CD: ${ability.currentCooldown})` : "";
            let toggleText = "";
            if (ability.name === "Active Dodge") {
                toggleText = player.activeDodgeEnabled ? " [ON]" : " [OFF]";
            }
            abilityLines.push({
                text: `${displayIndex + 1}) ${ability.name}${toggleText}${cooldownText}`,
                color: ability.currentCooldown > 0 ? "gray" : "white",
                originalIndex: i,
                displayIndex: displayIndex
            });
            displayIndex++;
        }
    }
    
    // Get selected ability details
    const selectedAbility = selectedAbilityIndex < player.abilities.length ? 
        player.abilities[selectedAbilityIndex] : null;
    const abilityDesc = selectedAbility ? getAbilityDescription(selectedAbility) : [];
    const actions = selectedAbility ? getAbilityActions(selectedAbility) : [];
    
    const leftColWidth = 280;
    const rightColWidth = 320;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const descMaxWidth = rightColWidth - 40;
    
    // Wrap description text
    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            ctx.font = `${bodySize}px Arial`;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }
    
    // Calculate wrapped description lines
    const wrappedDescLines = [];
    for (const line of abilityDesc) {
        const wrapped = wrapText(line.text, descMaxWidth);
        for (const wrappedLine of wrapped) {
            wrappedDescLines.push({ text: wrappedLine, color: line.color });
        }
    }
    
    // Calculate dynamic height based on content
    const contentHeight = Math.max(
        abilityLines.length * lineH,
        wrappedDescLines.length * lineH + actions.length * lineH + lineH * 3
    );
    const menuH = innerPadY * 2 + titleRowH + lineH + 10 + contentHeight + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);
    
    drawUIBox(mx, my, menuW, menuH);
    
    let y = my + innerPadY + titleSize;
    drawText("Abilities", titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;
    
    // Draw separator line
    const separatorX = mx + innerPadX + leftColWidth;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(separatorX, my + innerPadY);
    ctx.lineTo(separatorX, my + menuH - innerPadY);
    ctx.stroke();
    
    // Draw ability list
    const listX = mx + innerPadX;
    for (let i = 0; i < abilityLines.length; i++) {
        const ability = abilityLines[i];
        const color = ability.displayIndex === selectedAbilityIndex ? "yellow" : ability.color;
        drawText(ability.text, bodySize, false, y + i * lineH, color, listX);
    }
    
    // Draw selected ability details
    if (selectedAbility) {
        const descX = mx + innerPadX + leftColWidth + 30;
        let descY = my + innerPadY + titleSize + titleRowH + 10;
        
        drawText("Ability Details:", bodySize, false, descY, "violet", descX);
        descY += lineH;
        
        for (const line of wrappedDescLines) {
            drawText(line.text, bodySize, false, descY, line.color, descX);
            descY += lineH;
        }
        
        // Draw available actions
        descY += 10;
        drawText("Actions:", bodySize, false, descY, "violet", descX);
        descY += lineH;
        
        const actionText = actions.map(a => `${a.key}: ${a.action}`).join("  ");
        drawText(actionText, bodySize, false, descY, "aqua", descX);
    }
    
    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("Arrow keys: Navigate  ·  Enter: Use  ·  Escape: Close", 13, false, footY, "gray", canvas.width / 2, "center");
}

function openAbilitiesGameMenu() {
    selectedAbilityIndex = 0;
    gameState = "abilitiesMenu";
}

function openEquipmentMenu() {
    selectedEquipmentSlotIndex = 0;
    gameState = "equipmentMenu";
}

function openEquipSlotMenu(slotKey, slotName) {
    currentEquipSlotKey = slotKey;
    currentEquipSlotName = slotName;
    selectedEquipItemIndex = 0;
    gameState = "equipSlotMenu";
}

function drawEquipmentMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 1000;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    const colGap = 20;

    // Define equipment slots
    const equipmentSlots = [
        { name: "Right Hand", slot: "rightHand" },
        { name: "Left Hand", slot: "leftHand" },
        { name: "Head", slot: "headwear" },
        { name: "Chest", slot: "bodyarmor" },
        { name: "Right Ring", slot: "rightFinger" },
        { name: "Left Ring", slot: "leftFinger" },
        { name: "Gloves", slot: "gloves" },
        { name: "Legwear", slot: "legwear" },
        { name: "Boots", slot: "boots" },
        { name: "Necklace", slot: "necklace" },
        { name: "Belt", slot: "belt" }
    ];

    // Build slot lines
    const slotLines = [];
    for (let i = 0; i < equipmentSlots.length; i++) {
        const slot = equipmentSlots[i];
        const equippedItem = player && player[slot.slot] ? player[slot.slot] : null;
        let itemText = "Empty";
        let itemColor = "gray";
        
        if (equippedItem) {
            itemText = equippedItem.fullName ? equippedItem.fullName() : equippedItem.name;
            itemColor = "white";
            
            if (equippedItem.quality) {
                switch(equippedItem.quality) {
                    case "Junk": itemColor = "grey"; break;
                    case "Rusted": itemColor = "orange"; break;
                    case "Normal": itemColor = "white"; break;
                    case "Sharpened": itemColor = "aqua"; break;
                    case "Masterpiece": itemColor = "violet"; break;
                    case "Sharp": itemColor = "aqua"; break;
                }
            }
        }

        slotLines.push({
            text: `${slot.name}: ${itemText}`,
            color: itemColor,
            slotName: slot.name,
            slotKey: slot.slot,
            index: i,
            item: equippedItem
        });
    }

    // Calculate player stats
    const playerStats = calculatePlayerStats();

    // Calculate weapon stats
    let weaponAccuracy = 0;
    let weaponAttackSpeed = 0;
    let weaponHandedness = "None";
    
    if (player.rightHand && player.rightHand.type === "weapon") {
        weaponAccuracy = player.rightHand.accuracy;
        weaponAttackSpeed = player.rightHand.attackSpeed;
        weaponHandedness = player.rightHand.handedness;
    } else if (player.leftHand && player.leftHand.type === "weapon") {
        weaponAccuracy = player.leftHand.accuracy;
        weaponAttackSpeed = player.leftHand.attackSpeed;
        weaponHandedness = player.leftHand.handedness;
    }

    const col1Width = 200;
    const col2Width = 280;
    const col3Width = 280;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const menuH = innerPadY * 2 + titleRowH + Math.max(slotLines.length * lineH, 20 * lineH) + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);

    drawUIBox(mx, my, menuW, menuH);

    let y = my + innerPadY + titleSize;
    drawText("Equipment", titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;

    // Draw separator lines
    const sep1X = mx + innerPadX + col1Width;
    const sep2X = sep1X + colGap + col2Width;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sep1X, my + innerPadY);
    ctx.lineTo(sep1X, my + menuH - innerPadY);
    ctx.moveTo(sep2X, my + innerPadY);
    ctx.lineTo(sep2X, my + menuH - innerPadY);
    ctx.stroke();

    // Draw slot list in column 1
    const listX = mx + innerPadX;
    for (let i = 0; i < slotLines.length; i++) {
        const slot = slotLines[i];
        const color = slot.index === selectedEquipmentSlotIndex ? "yellow" : slot.color;
        const prefix = slot.index === selectedEquipmentSlotIndex ? "> " : "  ";
        drawText(prefix + slot.text, bodySize, false, y + i * lineH, color, listX);
    }

    // Draw selected item stats in column 2
    const itemX = sep1X + colGap;
    let itemY = my + innerPadY + titleSize + titleRowH;
    
    const selectedSlot = slotLines[selectedEquipmentSlotIndex];
    if (selectedSlot && selectedSlot.item) {
        drawText("Selected Item:", bodySize, true, itemY, "violet", itemX);
        itemY += lineH;
        
        const itemDesc = getItemDescription(selectedSlot.item);
        for (const line of itemDesc) {
            drawText(line.text, bodySize, false, itemY, line.color, itemX);
            itemY += lineH;
        }
    } else {
        drawText("Selected Item:", bodySize, true, itemY, "violet", itemX);
        itemY += lineH;
        drawText("No item selected", bodySize, false, itemY, "gray", itemX);
    }

    // Draw player stats and resistances in column 3
    const statsX = sep2X + colGap;
    let statsY = my + innerPadY + titleSize + titleRowH;
    
    drawText("Player Stats:", bodySize, true, statsY, "violet", statsX);
    statsY += lineH;
    
    drawText(`Damage: ${playerStats.damage}`, bodySize, false, statsY, "white", statsX);
    statsY += lineH;
    
    drawText(`Attack Speed: ${weaponAttackSpeed.toFixed(2)}x`, bodySize, false, statsY, "aqua", statsX);
    statsY += lineH;
    
    drawText(`Accuracy: x${weaponAccuracy.toFixed(2)}`, bodySize, false, statsY, "white", statsX);
    statsY += lineH;
    
    drawText(`Handedness: ${weaponHandedness}`, bodySize, false, statsY, "white", statsX);
    statsY += lineH;
    
    drawText(`Armor Class: ${playerStats.ac}`, bodySize, false, statsY, "white", statsX);
    statsY += lineH;
    
    drawText(`Evasion Class: ${playerStats.ec}`, bodySize, false, statsY, "white", statsX);
    statsY += lineH + 5;
    
    drawText("Resistances:", bodySize, true, statsY, "violet", statsX);
    statsY += lineH;
    
    const resistTypes = [
        {key: "slash", label: "Slash"},
        {key: "blunt", label: "Blunt"},
        {key: "pierce", label: "Pierce"},
        {key: "fire", label: "Fire"},
        {key: "cold", label: "Cold"},
        {key: "electrical", label: "Electric"},
        {key: "poison", label: "Poison"},
        {key: "arcane", label: "Arcane"},
        {key: "death", label: "Death"}
    ];
    
    for (const resist of resistTypes) {
        const value = playerStats.resistances[resist.key];
        const resistColor = value > 0 ? "aqua" : "gray";
        drawText(`${resist.label}: ${value}%`, bodySize, false, statsY, resistColor, statsX);
        statsY += lineH;
    }

    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("Arrow keys: Navigate  ·  Enter: Select slot  ·  Escape: Close", 13, false, footY, "gray", canvas.width / 2, "center");
}

function drawEquipSlotMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 800;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    const colGap = 30;

    // Filter inventory items that can be equipped in the selected slot
    const equippableItems = [];
    for (let i = 0; i < player.inventory.length; i++) {
        const item = player.inventory[i];
        let canEquip = false;
        const itemSlot = item.slot || "";

        // Check if item can be equipped in the current slot
        if (currentEquipSlotKey === "rightHand" || currentEquipSlotKey === "leftHand") {
            canEquip = true;
        } else if (currentEquipSlotKey === "headwear") {
            canEquip = item.type === "armor" && itemSlot === "headwear";
        } else if (currentEquipSlotKey === "bodyarmor") {
            canEquip = item.type === "armor" && (itemSlot === "bodyarmor" || itemSlot === "chest");
        } else if (currentEquipSlotKey === "rightFinger" || currentEquipSlotKey === "leftFinger") {
            canEquip = item.type === "armor" && (itemSlot === "rightFinger" || itemSlot === "leftFinger" || itemSlot === "ring");
        } else if (currentEquipSlotKey === "gloves") {
            canEquip = item.type === "armor" && itemSlot === "gloves";
        } else if (currentEquipSlotKey === "legwear") {
            canEquip = item.type === "armor" && itemSlot === "legwear";
        } else if (currentEquipSlotKey === "boots") {
            canEquip = item.type === "armor" && itemSlot === "boots";
        } else if (currentEquipSlotKey === "necklace") {
            canEquip = item.type === "armor" && itemSlot === "necklace";
        } else if (currentEquipSlotKey === "belt") {
            canEquip = item.type === "armor" && itemSlot === "belt";
        }

        if (canEquip) {
            equippableItems.push({
                item: item,
                originalIndex: i,
                name: item.fullName ? item.fullName() : item.name
            });
        }
    }

    // Add "Unequip" option if slot has an item
    const equippedItem = player[currentEquipSlotKey];
    const itemLines = [];
    
    if (equippedItem) {
        itemLines.push({
            text: "Unequip current item",
            color: "orange",
            isUnequip: true,
            index: -1
        });
    }

    for (let i = 0; i < equippableItems.length; i++) {
        const eqItem = equippableItems[i];
        let itemColor = "white";
        if (eqItem.item.quality) {
            switch(eqItem.item.quality) {
                case "Junk": itemColor = "grey"; break;
                case "Rusted": itemColor = "orange"; break;
                case "Normal": itemColor = "white"; break;
                case "Sharpened": itemColor = "aqua"; break;
                case "Masterpiece": itemColor = "violet"; break;
                case "Sharp": itemColor = "aqua"; break;
            }
        }
        itemLines.push({
            text: eqItem.name,
            color: itemColor,
            originalIndex: eqItem.originalIndex,
            isUnequip: false,
            index: i
        });
    }

    const leftColWidth = 280;
    const rightColWidth = 320;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const menuH = innerPadY * 2 + titleRowH + Math.max(itemLines.length * lineH, 15 * lineH) + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);

    drawUIBox(mx, my, menuW, menuH);

    let y = my + innerPadY + titleSize;
    drawText(`Equip to ${currentEquipSlotName}`, titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;

    // Draw separator line
    const separatorX = mx + innerPadX + leftColWidth;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(separatorX, my + innerPadY);
    ctx.lineTo(separatorX, my + menuH - innerPadY);
    ctx.stroke();

    if (itemLines.length === 0) {
        drawText("No equippable items", bodySize, false, y, "gray", canvas.width / 2, "center");
    } else {
        // Draw item list on left
        const listX = mx + innerPadX;
        for (let i = 0; i < itemLines.length; i++) {
            const item = itemLines[i];
            const color = item.index === selectedEquipItemIndex ? "yellow" : item.color;
            const prefix = item.index === selectedEquipItemIndex ? "> " : "  ";
            drawText(prefix + item.text, bodySize, false, y + i * lineH, color, listX);
        }

        // Draw comparison on right
        const compX = separatorX + colGap;
        let compY = my + innerPadY + titleSize + titleRowH;

        // Show currently equipped item
        if (equippedItem) {
            drawText("Currently Equipped:", bodySize, true, compY, "violet", compX);
            compY += lineH;
            
            const equippedDesc = getItemDescription(equippedItem);
            for (const line of equippedDesc) {
                drawText(line.text, bodySize, false, compY, line.color, compX);
                compY += lineH;
            }
            compY += 10;
        } else {
            drawText("Currently Equipped: None", bodySize, true, compY, "gray", compX);
            compY += lineH + 10;
        }

        // Show selected item for comparison
        const hasUnequipOption = equippedItem ? 1 : 0;
        const selectedItemIndex = selectedEquipItemIndex - hasUnequipOption;
        
        if (selectedItemIndex >= 0 && selectedItemIndex < equippableItems.length) {
            const selectedItem = equippableItems[selectedItemIndex];
            drawText("Selected Item:", bodySize, true, compY, "violet", compX);
            compY += lineH;
            
            const selectedDesc = getItemDescription(selectedItem.item);
            for (const line of selectedDesc) {
                drawText(line.text, bodySize, false, compY, line.color, compX);
                compY += lineH;
            }
            
            // Show stat differences if both items exist
            if (equippedItem && selectedItem.item.type === equippedItem.type) {
                compY += 10;
                drawText("Stat Changes:", bodySize, true, compY, "violet", compX);
                compY += lineH;
                
                if (selectedItem.item.type === "armor") {
                    const acDiff = (selectedItem.item.ac || 0) - (equippedItem.ac || 0);
                    const ecDiff = (selectedItem.item.ec || 0) - (equippedItem.ec || 0);
                    
                    if (acDiff !== 0) {
                        const acColor = acDiff > 0 ? "green" : "red";
                        const acSign = acDiff > 0 ? "+" : "";
                        drawText(`AC: ${acSign}${acDiff}`, bodySize, false, compY, acColor, compX);
                        compY += lineH;
                    }
                    if (ecDiff !== 0) {
                        const ecColor = ecDiff > 0 ? "green" : "red";
                        const ecSign = ecDiff > 0 ? "+" : "";
                        drawText(`EC: ${ecSign}${ecDiff}`, bodySize, false, compY, ecColor, compX);
                        compY += lineH;
                    }
                    
                    // Compare resistances
                    if (selectedItem.item.resistances && equippedItem.resistances) {
                        const resistTypes = ["slash", "blunt", "pierce", "fire", "cold", "electrical", "poison", "arcane", "death"];
                        for (const type of resistTypes) {
                            const newResist = selectedItem.item.resistances[type] || 0;
                            const oldResist = equippedItem.resistances[type] || 0;
                            const diff = newResist - oldResist;
                            if (diff !== 0) {
                                const resistColor = diff > 0 ? "green" : "red";
                                const resistSign = diff > 0 ? "+" : "";
                                drawText(`${type}: ${resistSign}${diff}%`, bodySize, false, compY, resistColor, compX);
                                compY += lineH;
                            }
                        }
                    }
                } else if (selectedItem.item.type === "weapon") {
                    // Compare weapon damage
                    if (selectedItem.item.damageTypes && equippedItem.damageTypes) {
                        const newDmg = selectedItem.item.damageTypes.map(d => `${d.rolls}d${d.sides}`).join(", ");
                        const oldDmg = equippedItem.damageTypes.map(d => `${d.rolls}d${d.sides}`).join(", ");
                        drawText(`Damage: ${oldDmg} → ${newDmg}`, bodySize, false, compY, "aqua", compX);
                        compY += lineH;
                    }
                    
                    const accDiff = (selectedItem.item.accuracy || 0) - (equippedItem.accuracy || 0);
                    if (accDiff !== 0) {
                        const accColor = accDiff > 0 ? "green" : "red";
                        const accSign = accDiff > 0 ? "+" : "";
                        drawText(`Accuracy: ${accSign}${accDiff.toFixed(2)}`, bodySize, false, compY, accColor, compX);
                        compY += lineH;
                    }
                    
                    const speedDiff = (selectedItem.item.attackSpeed || 0) - (equippedItem.attackSpeed || 0);
                    if (speedDiff !== 0) {
                        const speedColor = speedDiff > 0 ? "green" : "red";
                        const speedSign = speedDiff > 0 ? "+" : "";
                        drawText(`Attack Speed: ${speedSign}${speedDiff.toFixed(2)}`, bodySize, false, compY, speedColor, compX);
                        compY += lineH;
                    }
                }
            }
        }
    }

    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("Arrow keys: Navigate  ·  Enter: Equip  ·  Escape: Back", 13, false, footY, "gray", canvas.width / 2, "center");
}

function openDebugMenu() {
    selectedDebugOptionIndex = 0;
    gameState = "debugMenu";
}

function openCharacterCreation() {
    characterCreationState.phase = "race";
    characterCreationState.selectedRaceIndex = 0;
    characterCreationState.selectedDestinyIndex = 0;
    gameState = "characterCreation";
}

function drawCharacterCreationMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 1000;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    const colGap = 20;
    
    const isRacePhase = characterCreationState.phase === "race";
    const items = isRacePhase ? RACES : DESTINIES;
    const selectedIndex = isRacePhase ? characterCreationState.selectedRaceIndex : characterCreationState.selectedDestinyIndex;
    const titleText = isRacePhase ? "Choose Your Race" : "Choose Your Destiny";
    const selectedItem = items[selectedIndex];
    
    const col1Width = 200;
    const col2Width = 280;
    const col3Width = 280;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    
    // Build item lines
    const itemLines = [];
    for (let i = 0; i < items.length; i++) {
        itemLines.push({
            text: `${i + 1}) ${items[i].name}`,
            color: i === selectedIndex ? "yellow" : "white",
            index: i
        });
    }
    
    // Build description lines for selected item (column 2)
    const descLines = [];
    if (selectedItem) {
        descLines.push({text: selectedItem.description, color: "aqua"});
        descLines.push({text: "", color: "white"});
        
        // Add starting items for destinies
        if (!isRacePhase && selectedItem.startingInventory) {
            descLines.push({text: "Starting Items:", color: "violet"});
            for (const item of selectedItem.startingInventory) {
                if (item.type === "torch") {
                    descLines.push({text: "- Torch", color: "white"});
                } else if (item.type === "weapon") {
                    const weaponName = item.weaponType ? item.weaponType.charAt(0).toUpperCase() + item.weaponType.slice(1) : "Weapon";
                    descLines.push({text: `- ${weaponName}`, color: "white"});
                }
            }
            descLines.push({text: "", color: "white"});
        }
    }
    
    // Build stats/skills lines for selected item (column 3)
    const statsLines = [];
    if (selectedItem) {
        if (isRacePhase) {
            statsLines.push({text: "Stats:", color: "violet"});
            statsLines.push({text: `Strength: ${selectedItem.stats.strength}`, color: "white"});
            statsLines.push({text: `Constitution: ${selectedItem.stats.constitution}`, color: "white"});
            statsLines.push({text: `Perception: ${selectedItem.stats.perception}`, color: "white"});
            statsLines.push({text: `Agility: ${selectedItem.stats.agility}`, color: "white"});
            statsLines.push({text: `Arcane: ${selectedItem.stats.arcane}`, color: "white"});
            statsLines.push({text: `Will: ${selectedItem.stats.will}`, color: "white"});
        } else {
            statsLines.push({text: "Skills:", color: "violet"});
            statsLines.push({text: `Fighting: ${selectedItem.skills.fighting}`, color: "white"});
            statsLines.push({text: `Endurance: ${selectedItem.skills.endurance}`, color: "white"});
            statsLines.push({text: `Dodge: ${selectedItem.skills.dodge}`, color: "white"});
            statsLines.push({text: `Sword Skill: ${selectedItem.skills.swordSkill}`, color: "white"});
            statsLines.push({text: `Axe Skill: ${selectedItem.skills.axeSkill}`, color: "white"});
            statsLines.push({text: `Hammer Skill: ${selectedItem.skills.hammerSkill}`, color: "white"});
            statsLines.push({text: `Staff Skill: ${selectedItem.skills.staffSkill}`, color: "white"});
            statsLines.push({text: `Magic: ${selectedItem.skills.magic}`, color: "white"});
        }
    }
    
    // Wrap description text
    const descMaxWidth = col2Width - 40;
    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            ctx.font = `${bodySize}px Arial`;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }
    
    const wrappedDescLines = [];
    for (const line of descLines) {
        const wrapped = wrapText(line.text, descMaxWidth);
        for (const wrappedLine of wrapped) {
            wrappedDescLines.push({ text: wrappedLine, color: line.color });
        }
    }
    
    // Calculate dynamic height based on content
    const contentHeight = Math.max(
        itemLines.length * lineH,
        wrappedDescLines.length * lineH,
        statsLines.length * lineH
    );
    const menuH = innerPadY * 2 + titleRowH + lineH + 10 + contentHeight + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);
    
    drawUIBox(mx, my, menuW, menuH);
    
    let y = my + innerPadY + titleSize;
    drawText(titleText, titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;
    
    // Draw separator lines
    const sep1X = mx + innerPadX + col1Width;
    const sep2X = sep1X + colGap + col2Width;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sep1X, my + innerPadY);
    ctx.lineTo(sep1X, my + menuH - innerPadY);
    ctx.moveTo(sep2X, my + innerPadY);
    ctx.lineTo(sep2X, my + menuH - innerPadY);
    ctx.stroke();
    
    // Draw item list in column 1
    const listX = mx + innerPadX;
    for (let i = 0; i < itemLines.length; i++) {
        const item = itemLines[i];
        const prefix = item.index === selectedIndex ? "> " : "  ";
        drawText(prefix + item.text, bodySize, false, y + i * lineH, item.color, listX);
    }
    
    // Draw description in column 2
    if (selectedItem) {
        const descX = sep1X + colGap;
        let descY = my + innerPadY + titleSize + titleRowH + 10;
        
        for (const line of wrappedDescLines) {
            drawText(line.text, bodySize, false, descY, line.color, descX);
            descY += lineH;
        }
    }
    
    // Draw stats/skills in column 3
    if (selectedItem) {
        const statsX = sep2X + colGap;
        let statsY = my + innerPadY + titleSize + titleRowH + 10;
        
        for (const line of statsLines) {
            drawText(line.text, bodySize, false, statsY, line.color, statsX);
            statsY += lineH;
        }
    }
    
    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    const footerText = isRacePhase ? 
        "Arrow keys/1-3: Select race  ·  Enter: Confirm  ·  Escape: Close" :
        "Arrow keys/1-3: Select destiny  ·  Enter: Start Game  ·  Escape: Back";
    drawText(footerText, 13, false, footY, "gray", canvas.width / 2, "center");
}

function drawDebugMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 600;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;

    const debugOptions = [
        "Set HP to 99999",
        "Level Up",
        "Set Hunger to 100",
        "Set Hunger to 0",
        "Skip Level",
        "Restart Level",
        "Kill All Enemies",
        "Spawn Random Enemy Adjacent",
        "Spawn Random Item Adjacent",
        "Reveal All Tiles",
        "Light All Tiles"
    ];

    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const menuH = innerPadY * 2 + titleRowH + debugOptions.length * lineH + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);

    drawUIBox(mx, my, menuW, menuH);

    let y = my + innerPadY + titleSize;
    drawText("Debug Menu", titleSize, false, y, "yellow", canvas.width / 2, "center");
    y += titleRowH;

    for (let i = 0; i < debugOptions.length; i++) {
        const color = i === selectedDebugOptionIndex ? "yellow" : "white";
        const prefix = `${i + 1}) `;
        drawText(prefix + debugOptions[i], bodySize, false, y, color, mx + innerPadX);
        y += lineH;
    }

    const footY = my + menuH - innerPadY - 4;
    drawText("1-9: Select option  ·  Arrow keys: Navigate  ·  Escape: Close", 13, false, footY, "gray", canvas.width / 2, "center");
}

function executeDebugOption(index) {
    switch(index) {
        case 0: // Set HP to 99999
            player.hp = 99999;
            player.maxHealth = 99999;
            addMessageLog("HP set to 99999");
            addPopups("HP: 99999", "green", player);
            break;
        case 1: // Level Up
            player.levelUp();
            addMessageLog("Player leveled up!");
            return; // Don't set gameState to running, let levelUpMenu handle it
        case 2: // Set Hunger to 100
            player.hunger = 100;
            addMessageLog("Hunger set to 100");
            addPopups("Hunger: 100", "aqua", player);
            break;
        case 3: // Set Hunger to 0
            player.hunger = 0;
            addMessageLog("Hunger set to 0");
            addPopups("Hunger: 0", "red", player);
            break;
        case 4: // Skip Level
            if (level < numLevels) {
                level++;
                startLevel(player.hp, player.spells);
                addMessageLog("Skipped to level " + level);
            } else {
                addMessageLog("Already at max level");
            }
            break;
        case 5: // Restart Level
            startLevel(player.hp, player.spells);
            addMessageLog("Level restarted");
            break;
        case 6: // Kill All Enemies
            for (let i = 0; i < tiles.length; i++) {
                if (tiles[i]) {
                    for (let j = 0; j < tiles[i].length; j++) {
                        if (tiles[i][j].monster && !tiles[i][j].monster.isPlayer) {
                            tiles[i][j].monster.die(player);
                        }
                    }
                }
            }
            addMessageLog("All enemies killed");
            break;
        case 7: // Spawn Random Enemy Adjacent
            const adjacentTiles = player.tile.getAdjacentPassableNeighbours().filter(t => !t.monster);
            if (adjacentTiles.length > 0) {
                const tile = shuffle(adjacentTiles)[0];
                const monsterTypes = [Spider, Worm, Snake, Zombie, Skeleton, GreenSlime, Mouse];
                const MonsterClass = shuffle(monsterTypes)[0];
                new MonsterClass(tile);
                addMessageLog("Spawned " + MonsterClass.name);
            } else {
                addMessageLog("No adjacent space available");
            }
            break;
        case 8: // Spawn Random Item Adjacent
            const itemTiles = player.tile.getAdjacentPassableNeighbours();
            if (itemTiles.length > 0) {
                const itemTile = shuffle(itemTiles)[0];
                const itemTypes = [
                    Object.create(items.food.apple),
                    Object.create(items.food.meat),
                    Object.create(items.food.bread),
                    makeSword(),
                    makeAxe(),
                    makeHammer(),
                    makeChestplate()
                ];
                const item = shuffle(itemTypes)[0];
                item.quantity = 1;
                tryAddItemToTile(itemTile, item);
                addMessageLog("Spawned " + item.fullName());
            }
            break;
        case 9: // Reveal All Tiles
            for (let i = 0; i < tiles.length; i++) {
                if (tiles[i]) {
                    for (let j = 0; j < tiles[i].length; j++) {
                        tiles[i][j].known = true;
                    }
                }
            }
            addMessageLog("All tiles revealed");
            break;
        case 10: // Light All Tiles
            for (let i = 0; i < tiles.length; i++) {
                if (tiles[i]) {
                    for (let j = 0; j < tiles[i].length; j++) {
                        tiles[i][j].lightLevel = 1;
                    }
                }
            }
            addMessageLog("All tiles lit");
            break;
    }
    gameState = "running";
}

// Level-up menu functions
function getRandomMainStats(count = 3) {
    const mainStats = [
        { name: "Strength", key: "strength", value: player.strength },
        { name: "Constitution", key: "constitution", value: player.constitution },
        { name: "Perception", key: "perception", value: player.perception },
        { name: "Agility", key: "agility", value: player.agility },
        { name: "Arcane", key: "arcane", value: player.arcane },
        { name: "Will", key: "will", value: player.will }
    ];
    return shuffle(mainStats).slice(0, count);
}

function getRandomSkills(count = 3) {
    const skills = [
        { name: "Fighting", key: "fighting", value: player.fighting },
        { name: "Endurance", key: "endurance", value: player.endurance },
        { name: "Dodge", key: "dodge", value: player.dodge },
        { name: "Sword Skill", key: "swordSkill", value: player.swordSkill },
        { name: "Axe Skill", key: "axeSkill", value: player.axeSkill },
        { name: "Hammer Skill", key: "hammerSkill", value: player.hammerSkill },
        { name: "Staff Skill", key: "staffSkill", value: player.staffSkill },
        { name: "Magic", key: "magic", value: player.magic }
    ];
    return shuffle(skills).slice(0, count);
}

function openLevelUpMenu() {
    levelUpMenuState.isActive = true;
    levelUpMenuState.phase = "stats";
    levelUpMenuState.upgradesRemaining = 3;
    levelUpMenuState.selectedOptionIndex = 0;
    levelUpMenuState.currentOptions = getRandomMainStats(3);
    gameState = "levelUpMenu";
}

function drawLevelUpMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 600;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const menuH = innerPadY * 2 + titleRowH + lineH * 6 + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);
    
    drawUIBox(mx, my, menuW, menuH);
    
    let y = my + innerPadY + titleSize;
    drawText("Level Up!", titleSize, false, y, "yellow", canvas.width / 2, "center");
    y += titleRowH;
    
    const phaseText = levelUpMenuState.phase === "stats" ? "Main Stats" : "Skills";
    const remainingText = `Upgrades remaining: ${levelUpMenuState.upgradesRemaining}`;
    drawText(`${phaseText} - ${remainingText}`, bodySize, false, y, "violet", canvas.width / 2, "center");
    y += lineH + 10;
    
    // Draw options
    for (let i = 0; i < levelUpMenuState.currentOptions.length; i++) {
        const option = levelUpMenuState.currentOptions[i];
        const color = i === levelUpMenuState.selectedOptionIndex ? "yellow" : "white";
        const prefix = `${i + 1}) `;
        drawText(`${prefix}${option.name}: ${option.value} -> ${option.value + 1}`, bodySize, false, y, color, mx + innerPadX);
        y += lineH;
    }
    
    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("1-3: Select upgrade  ·  Enter: Confirm  ·  Escape: Cancel", 13, false, footY, "gray", canvas.width / 2, "center");
}

function handleLevelUpMenuKeydown(e) {
    if (e.key === "Escape") {
        gameState = "running";
        levelUpMenuState.isActive = false;
        e.preventDefault();
        return;
    }
    
    if (e.key >= "1" && e.key <= "3") {
        const index = parseInt(e.key, 10) - 1;
        if (index < levelUpMenuState.currentOptions.length) {
            levelUpMenuState.selectedOptionIndex = index;
            e.preventDefault();
        }
        return;
    }
    
    if (e.key === "Enter") {
        e.preventDefault();
        const selectedOption = levelUpMenuState.currentOptions[levelUpMenuState.selectedOptionIndex];
        if (selectedOption) {
            // Apply the upgrade
            player[selectedOption.key]++;
            player.updateStats();
            
            levelUpMenuState.upgradesRemaining--;
            
            if (levelUpMenuState.upgradesRemaining <= 0) {
                // Phase complete
                if (levelUpMenuState.phase === "stats") {
                    // Move to skills phase
                    levelUpMenuState.phase = "skills";
                    levelUpMenuState.upgradesRemaining = 3;
                    levelUpMenuState.currentOptions = getRandomSkills(3);
                    levelUpMenuState.selectedOptionIndex = 0;
                } else {
                    // All upgrades complete
                    addMessageLog("Level up complete!");
                    addPopups("Level Up!", "yellow", player);
                    gameState = "running";
                    levelUpMenuState.isActive = false;
                }
            } else {
                // Reroll options for current phase
                if (levelUpMenuState.phase === "stats") {
                    levelUpMenuState.currentOptions = getRandomMainStats(3);
                } else {
                    levelUpMenuState.currentOptions = getRandomSkills(3);
                }
                levelUpMenuState.selectedOptionIndex = 0;
            }
        }
        return;
    }
    
    if (e.key === "ArrowUp") {
        e.preventDefault();
        levelUpMenuState.selectedOptionIndex = Math.max(0, levelUpMenuState.selectedOptionIndex - 1);
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        levelUpMenuState.selectedOptionIndex = Math.min(levelUpMenuState.currentOptions.length - 1, levelUpMenuState.selectedOptionIndex + 1);
    }
}

function handleGameMenuKeydown(e) {
    // Handle character creation arrow keys
    if (gameState === "characterCreation") {
        const items = characterCreationState.phase === "race" ? RACES : DESTINIES;
        
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (characterCreationState.phase === "race") {
                characterCreationState.selectedRaceIndex = (characterCreationState.selectedRaceIndex - 1 + items.length) % items.length;
            } else {
                characterCreationState.selectedDestinyIndex = (characterCreationState.selectedDestinyIndex - 1 + items.length) % items.length;
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (characterCreationState.phase === "race") {
                characterCreationState.selectedRaceIndex = (characterCreationState.selectedRaceIndex + 1) % items.length;
            } else {
                characterCreationState.selectedDestinyIndex = (characterCreationState.selectedDestinyIndex + 1) % items.length;
            }
        }
        return;
    }

    // Handle Shift+N to open debug menu
    if (e.key === "N" && e.shiftKey && gameState === "running") {
        openDebugMenu();
        e.preventDefault();
        return;
    }

    if (e.key === "Escape") {
        if (gameState === "gameMenu") {
            closeGameMenu();
            e.preventDefault();
        } else if (gameState === "stats") {
            gameState = "running";
            e.preventDefault();
        } else if (gameState === "inventoryMenu") {
            gameState = "running";
            e.preventDefault();
        } else if (gameState === "abilitiesMenu") {
            gameState = "running";
            e.preventDefault();
        } else if (gameState === "equipmentMenu") {
            gameState = "running";
            e.preventDefault();
        } else if (gameState === "equipSlotMenu") {
            gameState = "equipmentMenu";
            e.preventDefault();
        } else if (gameState === "debugMenu") {
            gameState = "running";
            e.preventDefault();
        } else if (gameState === "levelUpMenu") {
            handleLevelUpMenuKeydown(e);
            return;
        }
        return;
    }
    
    if (gameState === "levelUpMenu") {
        handleLevelUpMenuKeydown(e);
        return;
    }

    if (gameState === "debugMenu") {
        const debugOptions = [
            "Set HP to 99999",
            "Level Up",
            "Set Hunger to 100",
            "Set Hunger to 0",
            "Skip Level",
            "Restart Level",
            "Kill All Enemies",
            "Spawn Random Enemy Adjacent",
            "Spawn Random Item Adjacent",
            "Reveal All Tiles",
            "Light All Tiles"
        ];

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedDebugOptionIndex = Math.max(0, selectedDebugOptionIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedDebugOptionIndex = Math.min(debugOptions.length - 1, selectedDebugOptionIndex + 1);
        } else if (e.key >= "1" && e.key <= "9") {
            e.preventDefault();
            const index = parseInt(e.key, 10) - 1;
            if (index < debugOptions.length) {
                executeDebugOption(index);
            }
        } else if (e.key === "0") {
            e.preventDefault();
            const index = 9;
            if (index < debugOptions.length) {
                executeDebugOption(index);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            executeDebugOption(selectedDebugOptionIndex);
        }
        return;
    }

    if (gameState === "inventoryMenu") {
        // Build the same combined item list that the display uses
        const allItems = [];
        const equippedSlots = ['rightHand', 'leftHand', 'headwear', 'bodyarmor', 'rightFinger', 'leftFinger', 'gloves', 'legwear', 'boots', 'necklace', 'belt'];
        
        // Add inventory items
        for (let i = 0; i < player.inventory.length; i++) {
            const item = player.inventory[i];
            allItems.push({
                item: item,
                source: 'inventory',
                index: i,
                equipped: false
            });
        }
        
        // Add equipped items
        for (const slot of equippedSlots) {
            if (player[slot]) {
                const item = player[slot];
                const alreadyInList = allItems.find(ai => ai.item === item);
                if (!alreadyInList) {
                    allItems.push({
                        item: item,
                        source: 'equipment',
                        slot: slot,
                        equipped: true
                    });
                }
            }
        }
        
        // Sort all items by category
        const sortedItems = sortInventoryByCategory(allItems.map(ai => ai.item));
        
        const selectedItemData = selectedInventoryItemIndex < sortedItems.length ? 
            allItems.find(ai => ai.item === sortedItems[selectedInventoryItemIndex]) : null;
        const item = selectedItemData ? selectedItemData.item : null;
        
        if (!item) return;
        
        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedInventoryItemIndex = Math.max(0, selectedInventoryItemIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedInventoryItemIndex = Math.min(sortedItems.length - 1, selectedInventoryItemIndex + 1);
        } else if (e.key === "d") {
            e.preventDefault();
            if (selectedItemData && selectedItemData.source === 'inventory') {
                // Drop inventory item
                player.drop(selectedItemData.index);
                if (selectedInventoryItemIndex >= sortedItems.length) {
                    selectedInventoryItemIndex = Math.max(0, sortedItems.length - 1);
                }
            } else if (selectedItemData && selectedItemData.source === 'equipment') {
                // Unequip and drop equipped item
                player.inventory.push(item);
                player[selectedItemData.slot] = undefined;
                player.rearm();
                addMessageLog(`Unequipped and dropped ${item.fullName ? item.fullName() : item.name}`);
                // Now drop the item from inventory
                const newIndex = player.inventory.indexOf(item);
                if (newIndex !== -1) {
                    player.drop(newIndex);
                }
                if (selectedInventoryItemIndex >= sortedItems.length) {
                    selectedInventoryItemIndex = Math.max(0, sortedItems.length - 1);
                }
            }
        } else if (e.key === "u") {
            e.preventDefault();
            // Unequip equipped items
            if (selectedItemData && selectedItemData.source === 'equipment') {
                player.inventory.push(item);
                player[selectedItemData.slot] = undefined;
                player.rearm();
                addMessageLog(`Unequipped ${item.fullName ? item.fullName() : item.name}`);
                if (selectedInventoryItemIndex >= sortedItems.length) {
                    selectedInventoryItemIndex = Math.max(0, sortedItems.length - 1);
                }
            }
        } else if (e.key === "e" && item.type === "food") {
            e.preventDefault();
            // Can only eat inventory items, not equipped items
            if (selectedItemData && selectedItemData.source === 'inventory') {
                player.eat(selectedItemData.index);
                if (selectedInventoryItemIndex >= sortedItems.length) {
                    selectedInventoryItemIndex = Math.max(0, sortedItems.length - 1);
                }
            }
        } else if (e.key === "w") {
            e.preventDefault();
            // Can only wield inventory items, not equipped items
            if (selectedItemData && selectedItemData.source === 'inventory') {
                if (item.handedness === "two-handed") {
                    player.wield(selectedItemData.index, "both");
                } else {
                    openHandSelectionMenu(selectedItemData.index);
                }
            }
        } else if (e.key === "W" && item.type === "armor") {
            e.preventDefault();
            // Can only wear inventory items, not equipped items
            if (selectedItemData && selectedItemData.source === 'inventory') {
                const armorIndex = player.inventory.filter((it) => it.type === "armor").indexOf(item);
                player.wear(armorIndex);
            }
        } else if (e.key === "a" && item.activate) {
            e.preventDefault();
            // Can activate both inventory and equipped items
            item.activate();
        } else if (e.key === "t") {
            e.preventDefault();
            if (selectedItemData && selectedItemData.source === 'inventory') {
                // Throw inventory item
                gameState = "throwTarget";
                selectedTile = player.tile;
                selectedTile.selected = true;
                selectedItemIndex = selectedItemData.index;
            } else if (selectedItemData && selectedItemData.source === 'equipment') {
                // Unequip and throw equipped item
                player.inventory.push(item);
                player[selectedItemData.slot] = undefined;
                player.rearm();
                addMessageLog(`Unequipped ${item.fullName ? item.fullName() : item.name}`);
                // Now throw the item from inventory
                const newIndex = player.inventory.indexOf(item);
                if (newIndex !== -1) {
                    gameState = "throwTarget";
                    selectedTile = player.tile;
                    selectedTile.selected = true;
                    selectedItemIndex = newIndex;
                }
            }
        }
        return;
    }
    
    if (gameState === "abilitiesMenu") {
        const ability = player.abilities[selectedAbilityIndex];
        if (!ability) return;
        
        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedAbilityIndex = Math.max(0, selectedAbilityIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedAbilityIndex = Math.min(player.abilities.length - 1, selectedAbilityIndex + 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (!ability.currentCooldown || ability.currentCooldown <= 0) {
                const previousState = gameState;
                player.useAbility(selectedAbilityIndex);
                // Only set to running if the ability didn't change the game state (e.g., for target-selection abilities)
                if (gameState === previousState) {
                    gameState = "running";
                }
            }
        }
        return;
    }

    if (gameState === "equipmentMenu") {
        const equipmentSlots = [
            { name: "Right Hand", slot: "rightHand" },
            { name: "Left Hand", slot: "leftHand" },
            { name: "Head", slot: "headwear" },
            { name: "Chest", slot: "bodyarmor" },
            { name: "Right Ring", slot: "rightFinger" },
            { name: "Left Ring", slot: "leftFinger" },
            { name: "Gloves", slot: "gloves" },
            { name: "Legwear", slot: "legwear" },
            { name: "Boots", slot: "boots" },
            { name: "Necklace", slot: "necklace" },
            { name: "Belt", slot: "belt" }
        ];

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedEquipmentSlotIndex = Math.max(0, selectedEquipmentSlotIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedEquipmentSlotIndex = Math.min(equipmentSlots.length - 1, selectedEquipmentSlotIndex + 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selectedSlot = equipmentSlots[selectedEquipmentSlotIndex];
            openEquipSlotMenu(selectedSlot.slot, selectedSlot.name);
        }
        return;
    }

    if (gameState === "equipSlotMenu") {
        // Filter inventory items that can be equipped in the selected slot
        const equippableItems = [];
        for (let i = 0; i < player.inventory.length; i++) {
            const item = player.inventory[i];
            let canEquip = false;
            const itemSlot = item.slot || "";

            if (currentEquipSlotKey === "rightHand" || currentEquipSlotKey === "leftHand") {
                canEquip = item.type === "weapon";
            } else if (currentEquipSlotKey === "headwear") {
                canEquip = item.type === "armor" && itemSlot === "headwear";
            } else if (currentEquipSlotKey === "bodyarmor") {
                canEquip = item.type === "armor" && (itemSlot === "bodyarmor" || itemSlot === "chest");
            } else if (currentEquipSlotKey === "rightFinger" || currentEquipSlotKey === "leftFinger") {
                canEquip = item.type === "armor" && (itemSlot === "rightFinger" || itemSlot === "leftFinger" || itemSlot === "ring");
            } else if (currentEquipSlotKey === "gloves") {
                canEquip = item.type === "armor" && itemSlot === "gloves";
            } else if (currentEquipSlotKey === "legwear") {
                canEquip = item.type === "armor" && itemSlot === "legwear";
            } else if (currentEquipSlotKey === "boots") {
                canEquip = item.type === "armor" && itemSlot === "boots";
            } else if (currentEquipSlotKey === "necklace") {
                canEquip = item.type === "armor" && itemSlot === "necklace";
            } else if (currentEquipSlotKey === "belt") {
                canEquip = item.type === "armor" && itemSlot === "belt";
            }

            if (canEquip) {
                equippableItems.push({
                    item: item,
                    originalIndex: i
                });
            }
        }

        const equippedItem = player[currentEquipSlotKey];
        const hasUnequipOption = equippedItem ? 1 : 0;
        const totalOptions = equippableItems.length + hasUnequipOption;

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedEquipItemIndex = Math.max(0, selectedEquipItemIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedEquipItemIndex = Math.min(totalOptions - 1, selectedEquipItemIndex + 1);
        } else if (e.key === "Enter" && totalOptions > 0) {
            e.preventDefault();
            
            // Check if unequip option is selected
            if (hasUnequipOption && selectedEquipItemIndex === 0) {
                // Unequip current item
                if (equippedItem) {
                    player.inventory.push(equippedItem);
                    player[currentEquipSlotKey] = undefined;
                    player.rearm();
                    addMessageLog(`Unequipped from ${currentEquipSlotName}`);
                }
            } else {
                // Equip selected item
                const itemIndex = selectedEquipItemIndex - hasUnequipOption;
                if (itemIndex >= 0 && itemIndex < equippableItems.length) {
                    const selectedItem = equippableItems[itemIndex];
                    
                    // Remove item from inventory
                    player.inventory.splice(selectedItem.originalIndex, 1);
                    
                    // If slot has an item, unequip it first
                    if (player[currentEquipSlotKey]) {
                        player.inventory.push(player[currentEquipSlotKey]);
                    }
                    
                    // Equip new item
                    player[currentEquipSlotKey] = selectedItem.item;
                    player.rearm();
                    addMessageLog(`Equipped ${selectedItem.item.fullName ? selectedItem.item.fullName() : selectedItem.item.name} to ${currentEquipSlotName}`);
                }
            }
            
            gameState = "equipmentMenu";
        }
        return;
    }
    
    if (gameState === "stats") {
        // Build stats items list to count non-header items
        const statsItems = [];
        statsItems.push({ type: "header", text: "Stats" });
        statsItems.push({ type: "stat", name: "Strength", value: player.strength });
        statsItems.push({ type: "stat", name: "Constitution", value: player.constitution });
        statsItems.push({ type: "stat", name: "Perception", value: player.perception });
        statsItems.push({ type: "stat", name: "Agility", value: player.agility });
        statsItems.push({ type: "stat", name: "Arcane", value: player.arcane });
        statsItems.push({ type: "stat", name: "Will", value: player.will });
        statsItems.push({ type: "header", text: "Skills" });
        statsItems.push({ type: "skill", name: "Fighting", value: player.fighting });
        statsItems.push({ type: "skill", name: "Endurance", value: player.endurance });
        statsItems.push({ type: "skill", name: "Dodge", value: player.dodge });
        statsItems.push({ type: "skill", name: "Sword Skill", value: player.swordSkill });
        statsItems.push({ type: "skill", name: "Axe Skill", value: player.axeSkill });
        statsItems.push({ type: "skill", name: "Hammer Skill", value: player.hammerSkill });
        statsItems.push({ type: "skill", name: "Staff Skill", value: player.staffSkill });
        statsItems.push({ type: "skill", name: "Magic", value: player.magic });
        statsItems.push({ type: "header", text: "Resistances" });
        statsItems.push({ type: "resistance", name: "Slash", value: player.resistances.slash });
        statsItems.push({ type: "resistance", name: "Blunt", value: player.resistances.blunt });
        statsItems.push({ type: "resistance", name: "Pierce", value: player.resistances.pierce });
        statsItems.push({ type: "resistance", name: "Fire", value: player.resistances.fire });
        statsItems.push({ type: "resistance", name: "Cold", value: player.resistances.cold });
        statsItems.push({ type: "resistance", name: "Electrical", value: player.resistances.electrical });
        statsItems.push({ type: "resistance", name: "Poison", value: player.resistances.poison });
        statsItems.push({ type: "resistance", name: "Arcane", value: player.resistances.arcane });
        statsItems.push({ type: "resistance", name: "Death", value: player.resistances.death });
        statsItems.push({ type: "header", text: "Character" });
        statsItems.push({ type: "race", name: "Race", value: player.race });
        statsItems.push({ type: "class", name: "Destiny", value: player.className });
        
        const selectableItems = statsItems.filter(item => item.type !== "header");
        
        if (e.key === "ArrowUp") {
            e.preventDefault();
            // Find previous selectable item
            let currentIndex = -1;
            for (let i = 0; i < statsItems.length; i++) {
                if (i === selectedStatsIndex) {
                    currentIndex = i;
                    break;
                }
            }
            
            // Find previous non-header item
            let newIndex = currentIndex - 1;
            while (newIndex >= 0 && statsItems[newIndex].type === "header") {
                newIndex--;
            }
            if (newIndex < 0) {
                // Wrap to last selectable item
                newIndex = statsItems.length - 1;
                while (newIndex >= 0 && statsItems[newIndex].type === "header") {
                    newIndex--;
                }
            }
            if (newIndex >= 0) {
                selectedStatsIndex = newIndex;
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            // Find next selectable item
            let currentIndex = -1;
            for (let i = 0; i < statsItems.length; i++) {
                if (i === selectedStatsIndex) {
                    currentIndex = i;
                    break;
                }
            }
            
            // Find next non-header item
            let newIndex = currentIndex + 1;
            while (newIndex < statsItems.length && statsItems[newIndex].type === "header") {
                newIndex++;
            }
            if (newIndex >= statsItems.length) {
                // Wrap to first selectable item
                newIndex = 0;
                while (newIndex < statsItems.length && statsItems[newIndex].type === "header") {
                    newIndex++;
                }
            }
            if (newIndex < statsItems.length) {
                selectedStatsIndex = newIndex;
            }
        }
        return;
    }
    
    if (gameState !== "gameMenu") return;
    if (e.key >= "1" && e.key <= "9") {
        const i = parseInt(e.key, 10) - 1;
        if (i < gameMenuOptions.length && gameMenuOptions[i].run) {
            e.preventDefault();
            gameMenuOptions[i].run();
            if (gameState === "gameMenu") {
                tick();
                closeGameMenu();
            }
        }
    }
}

function collectTileInteractions(player, tile) {
    const out = [];
    for (const obj of tile.objects) {
        if (typeof obj.getInteractions === "function") {
            const opts = obj.getInteractions(player, tile);
            for (const opt of opts) {
                out.push({ label: opt.label, run: opt.run });
            }
        }
    }
    if (tile.items.length > 0 && typeof tile.get === "function") {
        for (let i = 0; i < tile.items.length; i++) {
            const item = tile.items[i];
            out.push({
                label: `Pick up ${item.fullName ? item.fullName() : item.name}`,
                run: () => {
                    if (item.get()) {
                        tile.items.splice(i, 1);
                    }
                },
            });
        }
    }
    if (tile instanceof Wall) {
        out.push({
            label: "Mine wall (pickaxe)",
            run: () => {
                tile.use();
            },
        });
    }
    if (tile instanceof StairsDown) {
        out.push({
            label: "Descend stairs",
            run: () => {
                tile.moveDown(player);
            },
        });
    }
    if (tile instanceof StairsUp) {
        out.push({
            label: "Ascend stairs",
            run: () => {
                tile.moveUp(player);
            },
        });
    }
    return out;
}

function placeDoorObject(doorTile) {
    const d = Object.create(objects.door);
    d.isClosed = true;
    d.sprite = d.closedSprite;
    doorTile.passable = false;
    doorTile.blocksOpenVolume = true;
    doorTile.itemCapacity = 0;
    doorTile.objects.push(d);
}

function resizeCanvasToWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
}

function setupCanvas() {

    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    resizeCanvasToWindow();
    window.addEventListener("resize", resizeCanvasToWindow);
    ctx.imageSmoothingEnabled = false;

    let mouseX;
    let mouseY;
    let mouseOut = true;

    scaleX = 1;
    scaleY = 1;

    viewport = {
        x: 0,
        y: 0,
        zoom: 1
    };

    zoomed = false;

    popupText = [];
    messageLog = [];
    turnCounter = 0;

}

function drawSprite(sprite, x, y) {
    
    ctx.drawImage(
        spritesheet,
        (sprite-(Math.floor(sprite/50)*50))*16,
        Math.floor(sprite/50)*16,
        16,
        16,
        x*tileSize + shakeX,
        y*tileSize + shakeY,
        tileSize,
        tileSize
    )
}

function hasLineOfSight(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;

    while (true) {
        if (x === x2 && y === y2) return true;

        const tile = getTile(x, y);
        if (!tile || tile.blocksOpenVolume) {
            return false;
        }

        if (x === x2 && y === y2) return true;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

function calculateLighting() {
    // Reset all tile light levels
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            if (tiles[i] && tiles[i][j]) {
                tiles[i][j].lightLevel = 0;
            }
        }
    }

    // Add ambient light around player (very dim)
    if (player) {
        const ambientRadius = player.ambientLightRadius;
        for (let dx = -ambientRadius; dx <= ambientRadius; dx++) {
            for (let dy = -ambientRadius; dy <= ambientRadius; dy++) {
                const targetX = player.tile.x + dx;
                const targetY = player.tile.y + dy;
                const targetTile = getTile(targetX, targetY);
                
                if (targetTile) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= ambientRadius) {
                        // Very dim ambient light - lowest light level
                        const lightContribution = 0.5 * (1 - (distance / ambientRadius));
                        targetTile.lightLevel = Math.max(targetTile.lightLevel, lightContribution);
                    }
                }
            }
        }
    }

    // Find all light sources and calculate their light contribution
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            const tile = getTile(i, j);
            if (!tile) continue;

            // Check for light-emitting objects
            for (const obj of tile.objects) {
                if (obj.lightRadius) {
                    // Calculate light for tiles within radius
                    const radius = obj.lightRadius;
                    for (let dx = -radius; dx <= radius; dx++) {
                        for (let dy = -radius; dy <= radius; dy++) {
                            const targetX = i + dx;
                            const targetY = j + dy;
                            const targetTile = getTile(targetX, targetY);
                            
                            if (targetTile) {
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                if (distance <= radius) {
                                    // Check if light is blocked by walls
                                    if (hasLineOfSight(i, j, targetX, targetY)) {
                                        // Linear falloff: light level decreases with distance
                                        const lightContribution = 1 - (distance / radius);
                                        targetTile.lightLevel = Math.max(targetTile.lightLevel, lightContribution);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Check for lit torches in player's hands (torch only emits light when wielded)
    if (player) {
        const torchInHand = (player.rightHand && player.rightHand.name === "Torch" && player.rightHand.isLit) ||
                            (player.leftHand && player.leftHand.name === "Torch" && player.leftHand.isLit);
        if (torchInHand) {
            const torch = player.rightHand && player.rightHand.name === "Torch" ? player.rightHand : player.leftHand;
            const radius = torch.lightRadius;
            const playerX = player.tile.x;
            const playerY = player.tile.y;
            
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const targetX = playerX + dx;
                    const targetY = playerY + dy;
                    const targetTile = getTile(targetX, targetY);
                    
                    if (targetTile) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= radius) {
                            // Check if light is blocked by walls
                            if (hasLineOfSight(playerX, playerY, targetX, targetY)) {
                                // Linear falloff: light level decreases with distance
                                const lightContribution = 1 - (distance / radius);
                                targetTile.lightLevel = Math.max(targetTile.lightLevel, lightContribution);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check for lit lantern in player's hands or belt slot
    if (player) {
        const lanternInHand = (player.rightHand && player.rightHand.name === "Lantern" && player.rightHand.isLit) ||
                              (player.leftHand && player.leftHand.name === "Lantern" && player.leftHand.isLit);
        const lanternInBelt = (player.belt && player.belt.name === "Lantern" && player.belt.isLit);
        
        if (lanternInHand || lanternInBelt) {
            const lantern = player.rightHand && player.rightHand.name === "Lantern" ? player.rightHand :
                            player.leftHand && player.leftHand.name === "Lantern" ? player.leftHand : player.belt;
            const radius = lantern.lightRadius;
            const playerX = player.tile.x;
            const playerY = player.tile.y;
            
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const targetX = playerX + dx;
                    const targetY = playerY + dy;
                    const targetTile = getTile(targetX, targetY);
                    
                    if (targetTile) {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= radius) {
                            // Check if light is blocked by walls
                            if (hasLineOfSight(playerX, playerY, targetX, targetY)) {
                                // Linear falloff: light level decreases with distance
                                const lightContribution = 1 - (distance / radius);
                                targetTile.lightLevel = Math.max(targetTile.lightLevel, lightContribution);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check for lit torch items on tiles
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            const tile = getTile(i, j);
            if (!tile) continue;

            // Check for lit torch items on the tile
            if (tile.items) {
                for (const item of tile.items) {
                    if (item.isLit && item.lightRadius) {
                        const radius = item.lightRadius;
                        for (let dx = -radius; dx <= radius; dx++) {
                            for (let dy = -radius; dy <= radius; dy++) {
                                const targetX = i + dx;
                                const targetY = j + dy;
                                const targetTile = getTile(targetX, targetY);
                                
                                if (targetTile) {
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    if (distance <= radius) {
                                        // Check if light is blocked by walls
                                        if (hasLineOfSight(i, j, targetX, targetY)) {
                                            // Linear falloff: light level decreases with distance
                                            const lightContribution = 1 - (distance / radius);
                                            targetTile.lightLevel = Math.max(targetTile.lightLevel, lightContribution);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function draw() {
    if (!(gameState == "running" || gameState == "dead" || gameState == "stats" || gameState == "useSelect" || gameState == "viewmode" || gameState == "gameMenu" || gameState == "throwTarget" || gameState == "jumpTarget" || gameState == "inventoryMenu" || gameState == "abilitiesMenu" || gameState == "equipmentMenu" || gameState == "equipSlotMenu" || gameState == "debugMenu" || gameState == "levelUpMenu" || gameState == "characterCreation")) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Handle character creation separately (no player exists yet)
    if (gameState == "characterCreation") {
        drawCharacterCreationMenu();
        return;
    }


    translateX = -player.getDisplayX() * tileSize + (canvas.width / scaleX / 2) - (tileSize/2);
    translateY = -player.getDisplayY() * tileSize + (canvas.height / scaleY / 2) - (tileSize/2);
    
    const mapPixelW = levelWidth * tileSize;
    const mapPixelH = levelHeight * tileSize;
    const padX = 48;
    const padY = 12;
    if (canvas.width > mapPixelW) {
        translateX = Math.min(canvas.width - mapPixelW, Math.max(0, translateX));
    } else {
        const minTX = canvas.width - mapPixelW - padX;
        translateX = Math.min(padX, Math.max(minTX, translateX));
    }
    if (canvas.height > mapPixelH) {
        translateY = Math.min(canvas.height - mapPixelH, Math.max(0, translateY));
    } else {
        const minTY = canvas.height - mapPixelH - padY;
        translateY = Math.min(padY, Math.max(minTY, translateY));
    }

    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(translateX, translateY);

    screenshake();

    calculateLighting();

    seenTiles = [];

    if (player) {
        for (let i = -1; i < levelWidth + 1; i++) {
            for (let j = -1; j < levelHeight + 1; j++) {
                const target = getTile(i, j);
                const distance = (Math.max(Math.abs(target.x - player.tile.x), Math.abs(target.y - player.tile.y)))

                if (distance <= player.visionRadius) {
                    if (distance > 0) {
                        drawLine(player.tile.x, player.tile.y, target.x, target.y);
                    } else {
                        // Add player's own tile to seenTiles
                        seenTiles.push(player.tile);
                    }
                }
            }
        }
    }

    function drawLine(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const length = dx > dy ? dx : dy;
        for (let i = 0; i <= length; ++i) {
            const t = i / length;
            const x = x1 + Math.round(t * (x2 - x1));
            const y = y1 + Math.round(t * (y2 - y1));
            const tile = getTile(x, y);
            
            const isAdjacent = player && Math.abs(x - player.tile.x) <= 1 && Math.abs(y - player.tile.y) <= 1;
            
            if (tile.lightLevel > 0 || isAdjacent) {
                // Tile is lit or adjacent - show it
                seenTiles.push(tile);
            }
            
            // Only mark as known if tile has light
            if (tile.lightLevel > 0) {
                tile.known = true;
            }
            
            if (!tile.passable) {
                return;
            }
        }
    }

    for (const seenTile of seenTiles) {
        // Apply lighting effect - dim tiles based on light level
        const lightLevel = seenTile.lightLevel;
        
        seenTile.draw();
        
        // Apply darkness overlay based on light level
        if (lightLevel < 1) {
            const darkness = 1 - lightLevel;
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness * 0.95})`;
            ctx.fillRect(seenTile.x * tileSize + shakeX, seenTile.y * tileSize + shakeY, tileSize, tileSize);
        }
    }

    // Draw known but not currently visible tiles in grayscale
    for (let i = -1; i < levelWidth + 1; i++) {
        for (let j = -1; j < levelHeight + 1; j++) {
            const tile = getTile(i, j);
            if (tile.known && !seenTiles.includes(tile)) {
                // Draw in full grayscale
                ctx.filter = 'grayscale(100%)';
                tile.draw();
                ctx.filter = 'none';
                
                // Add dark overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(tile.x * tileSize + shakeX, tile.y * tileSize + shakeY, tileSize, tileSize);
            }
        }
    }

    if (monsters != undefined) {
        for (const monster of monsters) {
            if (seenTiles.includes(monster.tile)) {
                monster.draw();
                
                // Apply darkness overlay based on light level
                const lightLevel = monster.tile.lightLevel;
                if (lightLevel < 1) {
                    const darkness = 1 - lightLevel;
                    ctx.fillStyle = `rgba(0, 0, 0, ${darkness * 0.95})`;
                    ctx.fillRect(monster.getDisplayX() * tileSize + shakeX, monster.getDisplayY() * tileSize + shakeY, tileSize, tileSize);
                }
            }
        }
    }

    player.draw();
    
    // Apply darkness overlay to player based on light level
    const playerLightLevel = player.tile.lightLevel;
    if (playerLightLevel < 1) {
        const darkness = 1 - playerLightLevel;
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness * 0.95})`;
        ctx.fillRect(player.getDisplayX() * tileSize + shakeX, player.getDisplayY() * tileSize + shakeY, tileSize, tileSize);
    }

    ctx.restore();

    let centerY = canvas.height / 2;
    let centerX = canvas.width / 2;

    if (DEBUG) drawText("DEBUG", 50, false, canvas.height - 10, "red", canvas.width / 2, "center");

    // Top-Center text
    let levelName = levelPool[level-1].name;
    if (isLevelXL) {
        levelName += " XL";
    }
    drawText(levelName, 30, false, 30, "violet", canvas.width / 2, "center");
    drawText("["+level+"]", 30, false, 60, "white", canvas.width / 2, "center");


    if (typeof mouseX != 'undefined' || typeof mouseY != 'undefined') {

        if (mouseOut == false) {
            let xTile = Math.floor((mouseX)/64-translateX/tileSize);
            let yTile = Math.floor((mouseY)/64-translateY/tileSize);
        
            

            if (typeof tiles[xTile] != 'undefined') {
                if (typeof tiles[xTile][yTile] != 'undefined') {
                    let selectedTile = tiles[xTile][yTile];

                    if (seenTiles.includes(selectedTile)) {
                        let tileName = selectedTile.constructor.name;
                        let lineY = mouseY + 36;

                        if (selectedTile.items.length > 0) {
                            if (selectedTile.items[0].fullName != undefined) {
                                drawText(selectedTile.items[0].fullName(), 20, false, lineY, "white", mouseX+20);
                            } else {
                                drawText(selectedTile.items[0].name, 20, false, lineY, "white", mouseX+20);
                            }
                            lineY += 22;
                        } else if (selectedTile.objects.some((o) => o.category === "trap" && o.visible)) {
                            const tr = selectedTile.objects.find((o) => o.category === "trap" && o.visible);
                            drawText(tr.name, 20, false, lineY, "white", mouseX+20);
                            lineY += 22;
                        } else if (selectedTile.objects.length > 0) {
                            drawText(selectedTile.objects[0].name, 20, false, lineY, "white", mouseX+20);
                            lineY += 22;
                        } else {
                            drawText(tileName, 20, false, lineY, "white", mouseX+20);
                            lineY += 22;
                        }

                        drawText(`${selectedTile.temperatureC.toFixed(1)} °C`, 18, false, lineY, "orange", mouseX+20);
                        lineY += 20;
                        drawText(tileGasHoverLabel(selectedTile), 16, false, lineY, "aqua", mouseX+20);
            
                        drawSprite(SPRITES.SELECTION, xTile+translateX/tileSize, yTile+translateY/tileSize);
                    }
                }
            }
        }
    }
    
    


    

    if (gameState == "running") {


        // Show popups
        if (Array.isArray(popupText)) {
            if (popupText.length) {

                for (let popup of popupText) {
                    let drawX = popup.x+tileSize/2-(popup.startTranslateX-translateX);
                    let drawY = popup.y/*+popupText.indexOf(popup)*20*/-popup.timeout-(popup.startTranslateY-translateY);
                    drawText(popup.text, 20, false, drawY*scaleY, popup.color, drawX*scaleX, "center");
                    popup.timeout++;
                    if (popup.timeout >= 100) {
                        popupText.splice(popupText.indexOf(popup), 1);
                    }
                }
            }
        }

        drawText(`Level: ${player.level}`, 20, false, 30, 'rgba(244, 230, 62, 0.75)', canvas.width - 24, "right");
        drawText(`XP: ${player.xp}/${player.xpToLevel}`, 20, false, 50, 'rgba(237, 227, 103, 0.75)', canvas.width - 24, "right");
        if (player.pendingLevelUps > 0) {
            drawText(`LEVEL UP AVAILABLE! (${player.pendingLevelUps})`, 20, false, 70, 'yellow', canvas.width - 24, "right");
        }

        drawText(`Health: ${player.hp}`, 20, false, 30, 'rgba(255, 74, 83, 0.75)', 20);
        drawText(`Mana: ${player.mana}`, 20, false, 50, 'rgba(97, 143, 252, 0.75', 20);
        drawText(`Hunger: ${player.hunger}`, 20, false, 70, 'rgba(229, 156, 89, 0.75', 20);

        let right_hand_weapon;
        let right_hand_color = "white";
        if (player.rightHand != undefined) {
            right_hand_weapon = player.rightHand.fullName();

            if (player.rightHand.quality != undefined) {
                switch(player.rightHand.quality) {
                    case "Junk": right_hand_color = "grey"; break;
                    case "Rusted": right_hand_color = "orange"; break;
                    case "Normal": right_hand_color = "white"; break;
                    case "Sharpened": right_hand_color = "aqua"; break;
                    case "Masterpiece": right_hand_color = "violet"; break;
                }
            }

        } else {
            right_hand_weapon = "Fists";
        }

        let left_hand_weapon;
        let left_hand_color = "white";
        if (player.leftHand != undefined && player.leftHand !== player.rightHand) {
            left_hand_weapon = player.leftHand.fullName();

            if (player.leftHand.quality != undefined) {
                switch(player.leftHand.quality) {
                    case "Junk": left_hand_color = "grey"; break;
                    case "Rusted": left_hand_color = "orange"; break;
                    case "Normal": left_hand_color = "white"; break;
                    case "Sharpened": left_hand_color = "aqua"; break;
                    case "Masterpiece": left_hand_color = "violet"; break;
                }
            }

        } else {
            left_hand_weapon = "Empty";
        }

        drawText(`Right hand:`, 20, false, 100, "white", 20);
        drawText(`${right_hand_weapon}`, 20, false, 120, right_hand_color, 20);

        drawText(`Left hand:`, 20, false, 140, "white", 20);
        drawText(`${left_hand_weapon}`, 20, false, 160, left_hand_color, 20);

        if (player.rightHand != undefined) {
            const damageStr = player.rightHand.damageTypes.map(d => `${d.rolls}d${d.sides}`).join(", ");
            drawText(`Damage: ${damageStr}`, 20, false, 30, "white", 200);
        } else {
            drawText(`Damage: 1d2`, 20, false, 30, "white", 200);
        }

        drawText(`AC/DV: ${player.armorClass}/${player.evasionClass}`, 20, false, 50, "white", 200);

        drawText("Status:", 30, false, 230, "violet", 20);


        for (let i = 0; i < player.statuses.length; i++) {
            const statusText = (`${player.statuses[i].constructor.name} (${player.statuses[i].duration})`);
            drawText(statusText, 20, false, 230 + i * 30, "aqua", 20);
              
        }


        // Message Log
        const logX = 20;
        const logY = canvas.height - 240;
        const lineHeight = 18;
        const maxMessages = 12;
        const maxWidth = 800;
        
        // Collect all lines from messages (with wrapping) and track turn info
        const allLines = [];
        for (let i = 0; i < messageLog.length; i++) {
            const msg = messageLog[i];
            
            // Handle both object and string messages
            let text;
            let msgTurn;
            if (typeof msg === 'object' && msg.text) {
                text = msg.text;
                msgTurn = msg.turn || 0;
            } else if (typeof msg === 'string') {
                text = msg;
                msgTurn = 0;
            } else {
                text = String(msg);
                msgTurn = 0;
            }
            const wrappedLines = wrapText(text, maxWidth);
            wrappedLines.forEach(line => {
                allLines.push({ text: line, turn: msgTurn });
            });
        }
        
        // Limit to maxMessages lines (newest at end)
        const displayLines = allLines.slice(-maxMessages);
        
        // Draw background box for message log
        ctx.fillStyle = 'rgba(15, 15, 20, 0.85)';
        ctx.fillRect(logX - 8, logY - 18, 450, 220);
        ctx.strokeStyle = 'rgba(120, 120, 140, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(logX - 8, logY - 18, 450, 220);
        
        // Draw inner border for style
        ctx.strokeStyle = 'rgba(180, 180, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(logX - 6, logY - 16, 446, 216);
        
        // Draw messages with color coding (newest at bottom)
        ctx.font = '13px Arial';
        for (let i = 0; i < displayLines.length; i++) {
            const lineObj = displayLines[i];
            const line = lineObj.text;
            const lineTurn = lineObj.turn || 0;
            const color = getMessageColor(line);
            const y = logY + i * lineHeight;
            
            // Calculate fade based on turns ago (older = more gray)
            const turnsAgo = turnCounter - lineTurn;
            const fadeAmount = Math.min(turnsAgo * 0.15, 0.6); // Max 0.6 fade
            const alpha = 1 - fadeAmount;
            
            ctx.fillStyle = color;
            ctx.globalAlpha = Math.max(alpha, 0.4);
            
            ctx.fillText(line, logX, y);
            
            ctx.globalAlpha = 1;
        }
    }

    if (gameState == "gameMenu") {
        drawGameMenu();
    } else if (gameState == "inventoryMenu") {
        drawInventoryMenu();
    } else if (gameState == "abilitiesMenu") {
        drawAbilitiesMenu();
    } else if (gameState == "equipmentMenu") {
        drawEquipmentMenu();
    } else if (gameState == "equipSlotMenu") {
        drawEquipSlotMenu();
    } else if (gameState == "debugMenu") {
        drawDebugMenu();
    } else if (gameState == "levelUpMenu") {
        drawLevelUpMenu();
    }

    if (gameState == "stats") {
        drawStatsMenu();
    }

    if (gameState == "useSelect") {

    }

    if (gameState == "viewmode") {
        drawText(`Tile Name: ${selectedTile.constructor.name}`, 20, false, 100, "white", 20)
        drawText(`Tile X: ${selectedTile.x}`, 20, false, 120, "white", 20)
        drawText(`Tile Y: ${selectedTile.y}`, 20, false, 140, "white", 20)
        drawText(`Liquid: ${selectedTile.liquid}`, 20, false, 180, "white", 20)
        drawText(`Liquid Volume: ${selectedTile.liquidVolume}`, 20, false, 200, "white", 20)
        drawText(`Liquid Capacity: ${selectedTile.liquidVolumeCapacity}`, 20, false, 220, "white", 20)
        if (selectedTile.monster != undefined) {
            drawText(`Monster Name: ${selectedTile.monster.constructor.name}`, 20, false, 260, "white", 20)
            drawText(`Monster Level: ${selectedTile.monster.level}`, 20, false, 280, "white", 20)
            drawText(`Monster HP: ${selectedTile.monster.hp}`, 20, false, 300, "white", 20)
        }

    }

    if (gameState == "throwTarget") {
        drawText(`Throw Target: ${selectedTile.constructor.name}`, 20, false, 100, "aqua", 20)
        drawText(`Tile X: ${selectedTile.x}`, 20, false, 120, "white", 20)
        drawText(`Tile Y: ${selectedTile.y}`, 20, false, 140, "white", 20)
        drawText(`Throwing Radius: 3`, 20, false, 160, "yellow", 20)
        if (selectedTile.monster != undefined) {
            drawText(`Monster: ${selectedTile.monster.constructor.name}`, 20, false, 180, "white", 20)
        }
        const item = player.inventory[selectedItemIndex];
        if (item) {
            drawText(`Item: ${item.fullName ? item.fullName() : item.name}`, 20, false, 220, "violet", 20)
            drawText(`Damage: ${item.throwDamage || 1}`, 20, false, 240, "white", 20)
        }
        drawText("Enter/Space — throw   ·   x/Escape — cancel", 16, false, 280, "gray", 20)
    }

    if (gameState == "jumpTarget") {
        drawText(`Jump Target: ${selectedTile.constructor.name}`, 20, false, 100, "aqua", 20)
        drawText(`Tile X: ${selectedTile.x}`, 20, false, 120, "white", 20)
        drawText(`Tile Y: ${selectedTile.y}`, 20, false, 140, "white", 20)
        drawText(`Jump Radius: 3`, 20, false, 160, "yellow", 20)
        drawText(`Cost: 10 hunger (or 1 HP if insufficient)`, 20, false, 180, "orange", 20)
        if (selectedTile.monster != undefined) {
            drawText(`Monster: ${selectedTile.monster.constructor.name}`, 20, false, 200, "white", 20)
        }
        drawText("Enter/Space — jump   ·   x/Escape — cancel", 16, false, 240, "gray", 20)
    }
}

function addPopups(txt, clr, target) {

    let textPopup = { 
        text: txt,
        color: clr,
        timeout: 0,
        x: target.tile.x * tileSize + translateX,
        y: target.tile.y * tileSize + translateY + popupText.length*20,
        startTranslateX: translateX,
        startTranslateY: translateY
    };

    if (target.constructor.name == "Player") {
        textPopup.color = "grey"
    }
    
    if (player && target.tile.dist(player.tile) < 6) {
        popupText.push(textPopup);
    }
}

function addMessageLog(txt) {
    messageLog.push({ text: txt, turn: turnCounter });

    if (messageLog.length > 15) {
        messageLog.shift();
    }
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function getMessageColor(msg) {
    const lowerMsg = msg.toLowerCase();
    
    // Turn separator
    if (msg.includes("turn") && msg.includes("ago")) {
        return "#8888aa"; // Bluish-gray for turn separator
    }
    
    // Combat - damage taken (check first to override other patterns)
    if (lowerMsg.includes("hit you") || lowerMsg.includes("damaged you")) {
        return "#ff4757"; // Darker red for damage taken
    }
    
    // Combat - damage dealt (make white)
    if (lowerMsg.includes("you hit")) {
        return "#ffffff"; // White for attack messages
    }
    
    // Misses/dodges
    if (lowerMsg.includes("missed") || lowerMsg.includes("dodged")) {
        return "#ffd93d"; // Yellow for misses/dodges
    }
    
    // Healing
    if (lowerMsg.includes("heal") || lowerMsg.includes("rest") || lowerMsg.includes("health")) {
        return "#6bff6b"; // Green for healing
    }
    
    // Death
    if (lowerMsg.includes("died") || lowerMsg.includes("killed")) {
        return "#ff0000"; // Bright red for death
    }
    
    // Level up / positive events
    if (lowerMsg.includes("level up") || lowerMsg.includes("leveled") || lowerMsg.includes("spawned")) {
        return "#ffd700"; // Gold for level up
    }
    
    // Items
    if (lowerMsg.includes("picked up") || lowerMsg.includes("found") || lowerMsg.includes("item")) {
        return "#74b9ff"; // Blue for items
    }
    
    // Hunger
    if (lowerMsg.includes("hungry") || lowerMsg.includes("starving")) {
        return "#ff9f43"; // Orange for hunger
    }
    
    // Default - white for most recent, gray for older
    return "#ffffff";
}

function mouseCoords(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function mouseEnter(event) {
    mouseOut = false;
}

function mouseLeave(event) {
    mouseOut = true;
}

function drawMainStats(target, x, y) {
    drawText("Main Stats:", 30, false, y, "violet", x);

    drawText(`Strength: ${target.strength}`, 20, false, y + 30, "white", x)
    drawText(`Constitution: ${target.constitution}`, 20, false, y + 50, "white", x)
    drawText(`Perception: ${target.perception}`, 20, false, y + 70, "white", x)
    drawText(`Agility: ${target.agility}`, 20, false, y + 90, "white", x)
    drawText(`Arcane: ${target.arcane}`, 20, false, y + 110, "white", x)
    drawText(`Will: ${target.will}`, 20, false, y + 130, "white", x)
}

function drawSkillStats(target, x, y) {
    drawText("Skills:", 30, false, y, "violet", x);

    drawText(`Fighting: ${target.fighting}`, 20, false, y + 30, "white", x)
    drawText(`Endurance: ${target.endurance}`, 20, false, y + 50, "white", x)
    drawText(`Dodge: ${target.dodge}`, 20, false, y + 70, "white", x)
    drawText(`Sword Skill: ${target.swordSkill}`, 20, false, y + 90, "white", x)
    drawText(`Axe Skill: ${target.axeSkill}`, 20, false, y + 110, "white", x)
    drawText(`Hammer Skill: ${target.hammerSkill}`, 20, false, y + 130, "white", x)
    drawText(`Staff Skill: ${target.staffSkill}`, 20, false, y + 150, "white", x)
    drawText(`Magic: ${target.magic}`, 20, false, y + 170, "white", x)
}

function getStatDescription(statName) {
    const descriptions = {
        "Strength": "Physical power and melee damage capability",
        "Constitution": "Health and stamina, affects maximum HP",
        "Perception": "Ability to notice details and detect hidden things",
        "Agility": "Speed and evasion, affects dodge chance",
        "Arcane": "Magical aptitude and spell power",
        "Will": "Mental resistance and focus"
    };
    return descriptions[statName] || "";
}

function getSkillDescription(skillName) {
    const descriptions = {
        "Fighting": "Combat proficiency with melee weapons",
        "Endurance": "Ability to sustain physical activity and resist fatigue",
        "Dodge": "Evasion skill to avoid attacks",
        "Sword Skill": "Proficiency with swords, increases accuracy and attack speed",
        "Axe Skill": "Proficiency with axes, increases accuracy and attack speed",
        "Hammer Skill": "Proficiency with hammers, increases accuracy and attack speed",
        "Staff Skill": "Proficiency with staves, increases accuracy and attack speed",
        "Magic": "Spellcasting ability and magical knowledge"
    };
    return descriptions[skillName] || "";
}

function getResistanceDescription(resistanceName) {
    const descriptions = {
        "Slash": "Reduces damage from cutting attacks like swords and axes",
        "Blunt": "Reduces damage from crushing attacks like hammers and staves",
        "Pierce": "Reduces damage from piercing attacks like spears and arrows",
        "Fire": "Reduces damage from fire and heat-based attacks",
        "Cold": "Reduces damage from ice and cold-based attacks",
        "Electrical": "Reduces damage from lightning and electrical attacks",
        "Poison": "Reduces damage from toxic and venomous attacks",
        "Arcane": "Reduces damage from general magical attacks",
        "Death": "Reduces damage from necrotic and death magic"
    };
    return descriptions[resistanceName] || "";
}

function drawStatsMenu() {
    const lineH = 19;
    const titleSize = 19;
    const bodySize = 14;
    const menuMaxW = 700;
    const innerPadX = 12;
    const innerPadY = 10;
    const footerH = 40;
    const titleRowH = 22;
    
    // Build stats items list
    const statsItems = [];
    
    // Add stats
    statsItems.push({ type: "header", text: "Stats" });
    statsItems.push({ type: "stat", name: "Strength", value: player.strength });
    statsItems.push({ type: "stat", name: "Constitution", value: player.constitution });
    statsItems.push({ type: "stat", name: "Perception", value: player.perception });
    statsItems.push({ type: "stat", name: "Agility", value: player.agility });
    statsItems.push({ type: "stat", name: "Arcane", value: player.arcane });
    statsItems.push({ type: "stat", name: "Will", value: player.will });
    
    // Add skills
    statsItems.push({ type: "header", text: "Skills" });
    statsItems.push({ type: "skill", name: "Fighting", value: player.fighting });
    statsItems.push({ type: "skill", name: "Endurance", value: player.endurance });
    statsItems.push({ type: "skill", name: "Dodge", value: player.dodge });
    statsItems.push({ type: "skill", name: "Sword Skill", value: player.swordSkill });
    statsItems.push({ type: "skill", name: "Axe Skill", value: player.axeSkill });
    statsItems.push({ type: "skill", name: "Hammer Skill", value: player.hammerSkill });
    statsItems.push({ type: "skill", name: "Staff Skill", value: player.staffSkill });
    statsItems.push({ type: "skill", name: "Magic", value: player.magic });
    
    // Add resistances
    statsItems.push({ type: "header", text: "Resistances" });
    statsItems.push({ type: "resistance", name: "Slash", value: player.resistances.slash });
    statsItems.push({ type: "resistance", name: "Blunt", value: player.resistances.blunt });
    statsItems.push({ type: "resistance", name: "Pierce", value: player.resistances.pierce });
    statsItems.push({ type: "resistance", name: "Fire", value: player.resistances.fire });
    statsItems.push({ type: "resistance", name: "Cold", value: player.resistances.cold });
    statsItems.push({ type: "resistance", name: "Electrical", value: player.resistances.electrical });
    statsItems.push({ type: "resistance", name: "Poison", value: player.resistances.poison });
    statsItems.push({ type: "resistance", name: "Arcane", value: player.resistances.arcane });
    statsItems.push({ type: "resistance", name: "Death", value: player.resistances.death });
    
    // Add race and class
    statsItems.push({ type: "header", text: "Character" });
    statsItems.push({ type: "race", name: "Race", value: player.race });
    statsItems.push({ type: "class", name: "Destiny", value: player.className });
    
    // Get selected item details
    const selectedItem = statsItems[selectedStatsIndex];
    let description = "";
    if (selectedItem) {
        if (selectedItem.type === "stat") {
            description = getStatDescription(selectedItem.name);
        } else if (selectedItem.type === "skill") {
            description = getSkillDescription(selectedItem.name);
        } else if (selectedItem.type === "resistance") {
            description = getResistanceDescription(selectedItem.name);
        } else if (selectedItem.type === "race") {
            description = player.race === "Human" ? "Versatile and adaptable race with no special bonuses or penalties" : "";
        } else if (selectedItem.type === "class") {
            if (player.className === "Warrior") {
                description = "Masters of melee combat with high fighting and endurance skills";
            } else if (player.className === "Mage") {
                description = "Wielders of arcane magic with high arcane and magic skills";
            }
        }
    }
    
    const leftColWidth = 280;
    const rightColWidth = 320;
    const menuW = Math.min(menuMaxW, canvas.width - 28);
    const descMaxWidth = rightColWidth - 40;
    
    // Wrap description text
    function wrapText(text, maxWidth) {
        if (!text) return [];
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            ctx.font = `${bodySize}px Arial`;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }
    
    // Calculate wrapped description lines
    const wrappedDescLines = wrapText(description, descMaxWidth);
    
    // Calculate dynamic height based on content
    const contentHeight = Math.max(
        statsItems.length * lineH,
        wrappedDescLines.length * lineH + lineH * 3
    );
    const menuH = innerPadY * 2 + titleRowH + lineH + 10 + contentHeight + footerH;
    const mx = (canvas.width - menuW) / 2;
    const my = Math.max(6, (canvas.height - menuH) / 2);
    
    drawUIBox(mx, my, menuW, menuH);
    
    let y = my + innerPadY + titleSize;
    drawText("Character Stats", titleSize, false, y, "violet", canvas.width / 2, "center");
    y += titleRowH;
    
    // Draw separator line
    const separatorX = mx + innerPadX + leftColWidth;
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(separatorX, my + innerPadY);
    ctx.lineTo(separatorX, my + menuH - innerPadY);
    ctx.stroke();
    
    // Draw stats items list
    const listX = mx + innerPadX;
    for (let i = 0; i < statsItems.length; i++) {
        const item = statsItems[i];
        if (item.type === "header") {
            drawText(item.text, bodySize, true, y + i * lineH, "aqua", listX);
        } else {
            const color = i === selectedStatsIndex ? "yellow" : "white";
            const text = `${item.name}: ${item.value}`;
            drawText(text, bodySize, false, y + i * lineH, color, listX);
        }
    }
    
    // Draw selected item details
    if (selectedItem && selectedItem.type !== "header") {
        const descX = mx + innerPadX + leftColWidth + 30;
        let descY = my + innerPadY + titleSize + titleRowH + 10;
        
        drawText(`${selectedItem.name}: ${selectedItem.value}`, bodySize, false, descY, "violet", descX);
        descY += lineH;
        
        for (const line of wrappedDescLines) {
            drawText(line, bodySize, false, descY, "white", descX);
            descY += lineH;
        }
    }
    
    // Draw footer
    const footY = my + menuH - innerPadY - 4;
    drawText("Arrow keys: Navigate  ·  Escape: Close", 13, false, footY, "gray", canvas.width / 2, "center");
}

function drawUIBox(x, y, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.75)';
    ctx.fillRect(x+10, y, width, 10);
    ctx.fillRect(x, y+height, width, 10);
    ctx.fillRect(x, y, 10, height);
    ctx.fillRect(x+width, y+10, 10, height);
}

function check_dead() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (monsters[k].dead) {
            // Xp gain - only if killed by player
            if (monsters[k].killedByPlayer && monsters[k].level >= player.level) {
                player.xp = monsters[k].rare ? player.xp + monsters[k].xpPoints : player.xp + monsters[k].xpPoints + randomRange(0, 3);
                if (player.xp >= player.xpToLevel) {
                    player.levelUp();
                    player.xp = 0;
                    player.xpToLevel = Math.floor(player.xpToLevel*1.25);
                }
            }

            if (randomRange(1, 100) > 75) {
                dropItems(monsters[k]);
            }

            monsters.splice(k, 1);


        }
    }
}

function dropItems(monster) {
    tryAddItemToTile(monster.tile, items.food.carcass);
}

function check_for_tick() {    
    tick();
}

function tick() {
    turnCounter++;

    const messageLogLengthBefore = messageLog.length;

    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            if (tiles[i][j] != undefined) {
                if (tiles[i][j].liquid == "Blood") {
                    if (tiles[i][j].liquidVolume > tiles[i][j].liquidVolumeCapacity-100) {

                        if (roll(1, 100) > 50) {
                            let bloodToFlow = randomRange(Math.floor((tiles[i][j].liquidVolume - (tiles[i][j].liquidVolumeCapacity-100))/2), tiles[i][j].liquidVolume - (tiles[i][j].liquidVolumeCapacity-100));
                            let neigbours = shuffle(tiles[i][j].getAdjacentPassableNeighbours());
                            neigbours[0].liquid = tiles[i][j].liquid;
                            tiles[i][j].liquidVolume -= bloodToFlow;
                            neigbours[0].liquidVolume += bloodToFlow;
                        }

                    }
                }
            }
        }
    }

    if (monsters != undefined) {
        for (let k = monsters.length - 1; k >= 0; k--) {
            if (monsters[k].dead) {
                monsters.splice(k, 1);
            } else {
                monsters[k].update();
            }
        }
    }

    player.update();

    if (player.dead) {
        addScore(score, false);
        gameState = "dead";
    }

    // Decrease ability cooldowns
    for (const ability of player.abilities) {
        if (ability.currentCooldown > 0) {
            ability.currentCooldown--;
        }
    }

    if (player.cursed) {
        spawnCounter--;
        if (spawnCounter <= 0) {
            spawnMonster();
            spawnCounter = spawnRate;
            spawnRate--;
        }
    }

    // Add turn separator only if messages were added during the turn
    if (messageLog.length > messageLogLengthBefore) {
        addMessageLog("---");
    }
}

function showTitle() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameState = "title";

    drawText("Press Enter to begin", 30, true, canvas.height / 2 - 200, "white");
    drawText("PROJECT", 40, true, canvas.height / 2 - 110, "white");
    drawText("HYPERION", 70, true, canvas.height / 2 - 50, "white");

    drawScores();
}

function startGame() {
    gameStarted = false;
    level = 1;
    score = 0;
    numSpells = 1;

    levelPool = [];
    levelTiles = [];
    levelMonsters = [];
    initLevelPool();
    startLevel(startingHp);
    gameStarted = true;

    gameState = "running";
}

// Store selected race and destiny for application after player creation
let selectedRaceForGame = null;
let selectedDestinyForGame = null;
let hasReceivedStartingItems = false;
let turnCounter = 0;

function startGameWithCharacterCreation() {
    selectedRaceForGame = RACES[characterCreationState.selectedRaceIndex];
    selectedDestinyForGame = DESTINIES[characterCreationState.selectedDestinyIndex];
    
    gameStarted = false;
    level = 1;
    score = 0;
    numSpells = 1;

    levelPool = [];
    levelTiles = [];
    levelMonsters = [];
    initLevelPool();
    
    startLevel(startingHp);
    gameStarted = true;

    gameState = "running";
}

function initLevelPool() {
    if (randomRange(1, 2) == 1) {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.underground);
        }
    } else {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.chasm);
        }
    }

    if (randomRange(1, 2) == 1) {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.caves);
        }
    } else {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.tunnel);
        }
    }

    if (randomRange(1, 2) == 1) {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.dungeon);
        }
    } else {
        for (let i = 0; i < randomRange(3, 6); i++) {
            levelPool.push(BIOMES.maze);
        }
    }

}

function startLevel(playerHp, playerSpells, randomUpStairs, upOrDown) {
    if (gameStarted) {
        // Save player stats
        savePlayer();
    }

    let levelType = 0;
    if (level <= 5) {
        levelType = 0;
    } else if (level <= 10) {
        levelType = 4;
    } else {
        levelType = 2;
    }

    if (gameStarted) {
    }

    if(gameStarted) {
        if(levelTiles[level-1]) {
            levelMonsters[level-1+upOrDown] = monsters;
            loadLevel();
            monsters = levelMonsters[level-1];
            if (!placePlayer(upOrDown)) {
                gameState = "gameMenu";
                return;
            }
        } else {
            levelMonsters[level-1+upOrDown] = monsters;
            generateLevel(levelType);
            if (!placePlayer()) {
                gameState = "gameMenu";
                return;
            }
            placeStairs();
            placeDoors();
        }
    } else {
        generateLevel(levelType);
        if (!placePlayer()) {
            gameState = "gameMenu";
            return;
        }
        placeStairs();
        placeDoors();
    }
 

    function placeDoors() {
        let doorsNumber = randomRange(0, 5);
        let possibleTiles = [];
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                if (!tiles[i][j].getNeighbour(1, 0).passable && !tiles[i][j].getNeighbour(-1, 0).passable) {
                    if (tiles[i][j].getNeighbour(0, 1).passable && tiles[i][j].getNeighbour(0, -1).passable) {
                        possibleTiles.push(tiles[i][j]);
                    }
                } else if (!tiles[i][j].getNeighbour(0, 1).passable && !tiles[i][j].getNeighbour(0, -1).passable) {
                    if (tiles[i][j].getNeighbour(1, 0).passable && tiles[i][j].getNeighbour(-1, 0).passable) {
                        possibleTiles.push(tiles[i][j]);
                    }
                }
            }
        }
        
        //let doorTile = randomPassableTile();
        
        shuffle(possibleTiles);
        for (let i = 0; i < doorsNumber && possibleTiles.length; i++) {
            const idx = possibleTiles.findIndex(
                (t) =>
                    t &&
                    t.constructor.name === "Floor" &&
                    !t.monster &&
                    !t.objects.some((o) => o.isDoor)
            );
            if (idx < 0) {
                break;
            }
            const doorTile = possibleTiles[idx];
            placeDoorObject(doorTile);
            possibleTiles.splice(idx, 1);
        }
    }

    function placePlayer(upOrDown) {
        let playerRandomTile;


        if (upOrDown == 1) {
            for (let i = 0; i < levelTiles[level-1].length; i++) {
                for (let j = 0; j < levelTiles[level-1][i].length; j++) {
                    if (levelTiles[level-1][i][j] && levelTiles[level-1][i][j].constructor.name == "StairsDown") {
                        playerRandomTile = levelTiles[level-1][i][j];
                    }
                }
            }
        }

        if (upOrDown == -1) {
            for (let i = 0; i < levelTiles[level-1].length; i++) {
                for (let j = 0; j < levelTiles[level-1][i].length; j++) {
                    if (levelTiles[level-1][i][j] && levelTiles[level-1][i][j].constructor.name == "StairsUp") {
                        playerRandomTile = levelTiles[level-1][i][j];
                    }
                }
            }
        }

        if (upOrDown == undefined || playerRandomTile == undefined) {
            try {
                playerRandomTile = randomPassableTile();
            } catch (e) {
                console.error("Failed to find passable tile for player:", e);
                addMessageLog("Error: Could not place player - level generation failed");
                return false;
            }
        }
        
        if (!playerRandomTile) {
            console.error("playerRandomTile is undefined after placement attempt");
            addMessageLog("Error: Could not place player - no valid tile found");
            return false;
        }

        try {
            player = new Player(playerRandomTile, playerClass);
            playerRandomTile.monster = player;
            player.move(playerRandomTile);
        } catch (e) {
            console.error("Failed to create player:", e);
            addMessageLog("Error: Could not create player");
            return false;
        }

        if (gameStarted) {
            // Restore player stats
            restorePlayer();
        }
    
        if (playerSpells) {
            player.spells = playerSpells;
        }

        // Apply race and destiny bonuses if coming from character creation
        if (selectedRaceForGame && selectedDestinyForGame) {
            player.initMainStats(
                selectedRaceForGame.stats.strength,
                selectedRaceForGame.stats.constitution,
                selectedRaceForGame.stats.perception,
                selectedRaceForGame.stats.agility,
                selectedRaceForGame.stats.arcane,
                selectedRaceForGame.stats.will
            );
            
            player.initSkills(
                selectedDestinyForGame.skills.fighting,
                selectedDestinyForGame.skills.endurance,
                selectedDestinyForGame.skills.dodge,
                selectedDestinyForGame.skills.swordSkill,
                selectedDestinyForGame.skills.axeSkill,
                selectedDestinyForGame.skills.hammerSkill,
                selectedDestinyForGame.skills.staffSkill,
                selectedDestinyForGame.skills.magic
            );
            
            player.updateStats();
            
            // Apply starting inventory if destiny has one and hasn't been given yet
            if (selectedDestinyForGame.startingInventory && !hasReceivedStartingItems) {
                for (const itemData of selectedDestinyForGame.startingInventory) {
                    if (itemData.type === "torch") {
                        const torch = makeTorch();
                        torch.quantity = 1;
                        torch.isLit = true;
                        torch.sprite = SPRITES.TORCH_LIT;
                        torch.lightRadius = 3;
                        player.inventory.push(torch);
                        // Equip torch in left hand
                        player.wield(player.inventory.length - 1, "left");
                    } else if (itemData.type === "weapon") {
                        let weapon;
                        if (itemData.weaponType === "sword") {
                            weapon = makeSword(itemData.material, itemData.quality);
                        }
                        if (weapon) {
                            weapon.quantity = 1;
                            player.inventory.push(weapon);
                            // Equip sword in right hand
                            player.wield(player.inventory.length - 1, "right");
                        }
                    }
                }
                hasReceivedStartingItems = true;
            }
            
            // Don't clear selections so they persist for level transitions
        }
        
        return true;
    }

    function placeStairs() {
        // place stairs
        if (randomUpStairs) {
            randomPassableTile().replace(StairsUp);
        } else if (player) {
            let newTile = player.tile.replace(StairsUp);;
            newTile.monster = player;
            player.move(newTile);
        }

        tryTo('place stairs down', () => {
            let randomTile = randomPassableTile();
            if (randomTile.constructor.name == "StairsUp") {
                randomTile = randomPassableTile();
                if (randomTile.constructor.name == "StairsUp") {
                    randomTile = randomPassableTile();
                    if (randomTile.constructor.name == "StairsUp") {
                        return false
                    } else { randomTile.replace(StairsDown); return true; }
                } else { randomTile.replace(StairsDown); return true;}
            } else { randomTile.replace(StairsDown); return true; }
        })

    }
}

function savePlayer() {
    playerMaxHealth = player.maxHealth;
    playerHp = player.hp;
    playerLevel = player.level;
    playerXp = player.xp;
    playerXpToLevel = player.xpToLevel;
    playerAttack = player.attack;
    playerDefense = player.defense;

    // main stats
    playerStrength = player.strength;
    playerConstitution = player.constitution;
    playerPerception = player.perception;
    playerAgility = player.agiity;
    playerArcane = player.arcane;
    playerWill = player.will;

    playerEvasion = player.evasion;

    playerStatuses = player.statuses;

    playerWeapon = player.weapon;
    playerRightHand = player.rightHand;
    playerLeftHand = player.leftHand;
    playerArmor = player.bodyarmor;
    playerBelt = player.belt;

    playerInventory = player.inventory;
    playerHunger = player.hunger;
    playerAbilities = player.abilities;

    playerPendingLevelUps = player.pendingLevelUps;

    hasReceivedStartingItemsSaved = hasReceivedStartingItems;

}

function restorePlayer() {
    player.maxHealth = playerMaxHealth;
    player.hp = playerHp;
    player.level = playerLevel;
    player.xp = playerXp;
    player.xpToLevel = playerXpToLevel;
    player.attack = playerAttack;
    player.defense = playerDefense;

    // main stats
    player.strength = playerStrength;
    player.constitution = playerConstitution;
    player.perception = playerPerception;
    player.agiity = playerAgility;
    player.arcane = playerArcane;
    player.will = playerWill;
    
    player.evasion = playerEvasion;

    playerStatuses = player.statuses;

    player.weapon = playerWeapon;
    player.rightHand = playerRightHand;
    player.leftHand = playerLeftHand;
    player.bodyarmor = playerArmor;
    player.belt = playerBelt;
    player.rearm();

    player.inventory = playerInventory;
    player.hunger = playerHunger;
    player.abilities = playerAbilities;

    player.pendingLevelUps = playerPendingLevelUps;

    if (hasReceivedStartingItemsSaved !== undefined) {
        hasReceivedStartingItems = hasReceivedStartingItemsSaved;
    }
    
}

function drawText(text, size, centered, textY, color, textX, align) {
    ctx.fillStyle = color;
    ctx.font = `${size}px monospace`;
    if (textX === undefined || textX === null) {
        textX = centered ? (canvas.width-ctx.measureText(text).width)/2 : canvas.width - uiWidth * tileSize + 25;
    }

    if (align == "center") {
        ctx.textAlign = "center";
    } else if (align == "right") {
        ctx.textAlign = "right";
    }

    ctx.fillText(text, textX, textY);
    ctx.textAlign = "left";
}

function screenshake() {

    if (shakeAmount) {
        shakeAmount--;
    }

    const shakeAngle = Math.random() * Math.PI*2;
    shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
    shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

/* ///////////////////
// score.js
*/ ///////////////////

function getScores() {
    return localStorage.scores ? JSON.parse(localStorage.scores) : [];
}

function addScore(score, won) {
    const scores = getScores();
    const scoreObject = {score, run: 1, totalScore: score, active: won};
    const lastScore = scores.pop();

    if (lastScore) {
        if (lastScore.active) {
            scoreObject.run = lastScore.run + 1;
            scoreObject.totalScore += lastScore.totalScore;
        } else {
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);

    localStorage.scores = JSON.stringify(scores);
}

function drawScores() {
    const scores = getScores();
    if (!scores.length) {
        return;
    }
    drawText(
        rightPad(["RUN", "SCORE", "TOTAL"]),
        18,
        true,
        canvas.height / 2,
        "white"
    );

    const newestScore = scores.pop();
    scores.sort((a, b) => b.totalScore - a.totalScore);
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
        const scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
        drawText(
            scoreText,
            18,
            true,
            canvas.height / 2 + 24 + i * 24,
            i == 0 ? "aqua" : "violet"
        );
    }
}

/* ///////////////////
// sound.js
*/ ///////////////////

function initSounds() {
    sounds = {
        hit1: new Audio('sounds/hit1.wav'),
        hit2: new Audio('sounds/hit2.wav'),
        treasure: new Audio('sounds/treasure.wav'),
        newLevel: new Audio('sounds/newLevel.wav'),
        spell: new Audio('sounds/spell.wav'),
        trap: new Audio('sounds/trap.wav'),
        trapdoor: new Audio('sounds/trapdoor.wav'),
        healthUp: new Audio('sounds/healthUp.wav'),
        move: new Audio('sounds/move.wav'),
        firebolt: new Audio('sounds/firebolt.wav'),
    }
    sounds.hit1.volume = 0.1;
    sounds.hit2.volume = 0.1;
    sounds.treasure.volume = 0.1;
    sounds.newLevel.volume = 0.1;
    sounds.spell.volume = 0.1;
    sounds.trap.volume = 0.1;
    sounds.trapdoor.volume = 0.1;
    sounds.healthUp.volume = 0.1;
    sounds.move.volume = 0.1;
    sounds.firebolt.volume = 0.1;
}

function playSound(soundName) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
}