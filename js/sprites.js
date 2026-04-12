// Sprite registry - maps meaningful names to spritesheet indices
// Spritesheet is 50 sprites wide, each sprite is 16x16 pixels
// Index = row * 50 + col

const SPRITES = {
    // Monsters
    DESERT_KNIGHT_HUMAN: 25,
    DISCIPLE_HUMAN: 23,
    WASTE_OF_SKIN_HUMAN: 21,

    DESERT_KNIGHT_ELF: 17,
    DISCIPLE_ELF: 22,
    WASTE_OF_SKIN_ELF: 24,

    DESERT_KNIGHT_DWARF: 7,
    DISCIPLE_DWARF: 7,
    WASTE_OF_SKIN_DWARF: 7,
    CORPSE: 1,
    SPIDER: 2,
    SPIDERLING: 19,
    POISON_SPIDER: 20,
    WORM: 3,
    SNAKE: 4,
    ZOMBIE: 5,
    SKELETON_ANGRY: 6,
    RED_DRAGON_BABY: 8,
    GREEN_SLIME: 9,
    SKELETON: 10,
    STONE_GOLEM: 11,
    MOUSE: 12,
    GOBLIN_SPEAR: 13,
    GOBLIN_RANGER: 14,
    GOBLIN_SWORDSMAN: 15,

    // Tile terrain - Underground style
    FLOOR_UNDERGROUND: 2,
    WALL_UNDERGROUND: 3,

    // Tile terrain - Chasm style
    FLOOR_CHASM: 32,
    WALL_CHASM: 33,

    // Tile terrain - Cave style
    FLOOR_CAVE: 34,
    WALL_CAVE: 35,

    // Tile terrain - Dungeon style (set 1)
    FLOOR_DUNGEON_1: 201,
    WALL_DUNGEON_1: 151,

    // Tile terrain - Dungeon style (set 2)
    FLOOR_DUNGEON_2: 202,
    WALL_DUNGEON_2: 152,

    // Tile terrain - Dungeon style (set 3)
    FLOOR_DUNGEON_3: 203,
    WALL_DUNGEON_3: 153,

    // Special tiles
    STAIRS_DOWN: 250,
    STAIRS_UP: 251,
    HOLE: 255,

    // Doors
    DOOR_CLOSED: 253,
    DOOR_OPEN: 254,

    // Traps
    TRAPDOOR: 252,
    TRAP_ACTIVE: 28,
    TRAP_DISABLED: 29,

    // Trap objects
    SPIKETRAP_LOADED: 1100,
    SPIKETRAP_UNLOADED: 1101,
    TRIPWIRE: 1102,
    BEARTRAP: 1103,
    COBWEB: 1104,
    PRESSURE_PLATE: 1105,

    // Items - Food
    FOOD_CARCASS: 650,
    FOOD_APPLE: 651,
    FOOD_BREAD: 652,
    FOOD_MEAT: 653,
    POTATO: 654,

    // Items - Weapons (Axes)
    AXE_COPPER: 600,
    AXE_BRONZE: 601,
    AXE_IRON: 602,
    AXE_SILVER: 603,
    AXE_GOLD: 604,
    AXE_STEEL: 605,

    // Items - Weapons (Swords)
    SWORD_COPPER: 606,
    SWORD_BRONZE: 607,
    SWORD_IRON: 608,
    SWORD_SILVER: 609,
    SWORD_GOLD: 610,
    SWORD_STEEL: 611,

    // Items - Weapons (Hammers)
    HAMMER_COPPER: 612,
    HAMMER_BRONZE: 613,
    HAMMER_IRON: 614,
    HAMMER_SILVER: 615,
    HAMMER_GOLD: 616,
    HAMMER_STEEL: 617,

    // Items - Weapons (Staves & Other)
    STAFF_WOODEN: 618,
    PICKAXE: 619,
    STAFF_COPPER: 52,
    STAFF_SILVER: 54,
    STAFF_GOLD: 43,
    STAFF_BRONZE: 77,

    // Items - Armor (Breastplates)
    BREASTPLATE_COPPER: 900,
    BREASTPLATE_BRONZE: 901,
    BREASTPLATE_IRON: 902,
    BREASTPLATE_SILVER: 903,
    BREASTPLATE_GOLD: 904,
    BREASTPLATE_STEEL: 905,

    // Items - Rings
    RING_GOLD: 907,
    RING_SILVER: 908,

    // Items - Leather Gear
    LEATHER_CAP: 909,
    LEATHER_BOOTS: 910,
    LEATHER_TROUSERS: 911,
    LEATHER_GLOVES: 912,
    LEATHER_TUNIC: 913,

    // Items - Tools
    TOOL_BEARTRAP: 853,
    TORCH: 621,
    TORCH_LIT: 620,
    LANTERN: 622,
    LANTERN_LIT: 623,

    // Items - Books & Potions
    MAGIC_BOOK: 750,
    POTION_EMPTY: 751,
    POTION_RED: 752,
    POTION_BLUE: 753,
    POTION_PURPLE: 754,
    POTION_GREEN: 755,
    POTION_GOLD: 756,
    POTION_SILVER: 757,
    POTION_FIERY: 758,

    // Objects
    DECOR_SKULL: 850,
    DECOR_BONE: 851,
    DECOR_WOODSCRAPS: 1150,
    DECOR_GRAVEL: 93,

    // Objects - Usable/Interactive
    CAMPFIRE: 1200,
    CAMPFIRE_LIT: 1201,
    BARREL: 1202,
    SPIDER_COCOON: 1203,
    COFFIN: 1204,
    BOOKSHELF: 1205,
    FOUNTAIN_EMPTY: 1206,
    FOUNTAIN: 1207,
    BIG_ROCK: 1208,
    STANDING_TORCH_LIT: 1209,
    STANDING_TORCH: 1210,
    WEAPON_STAND: 1211,
    WEAPON_STAND_EMPTY: 1212,

    // Effects
    TELEPORT: 500,
    STUN: 451,
    SELECTION: 102,

    // Tile features
    SCROLL: 800,
    TREASURE: 700,

    // Blood
    BLOOD_1: 550,  // Small
    BLOOD_2: 551,  // Medium
    BLOOD_3: 552,  // Large
    BLOOD_4: 553,  // Pool
    WALL_BLOOD: 554,
};

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPRITES;
}
