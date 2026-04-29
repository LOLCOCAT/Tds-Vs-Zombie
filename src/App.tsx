/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, TrendingUp, Shield, Trash2, X, Zap } from 'lucide-react';

// --- Constants & Types ---

const ROWS = 5;
const COLS = 9;
const CELL_SIZE = 100;
const TICK_RATE = 1000 / 60; // 60 FPS logic

type EntityType = 'scout' | 'sniper' | 'farm' | 'paintballer' | 'demoman' | 'soldier' | 'shotgunner' | 'freezer' | 'assassin' | 'militant' | 'zombie';
type UnitType = 'scout' | 'sniper' | 'farm' | 'paintballer' | 'demoman' | 'soldier' | 'shotgunner' | 'freezer' | 'assassin' | 'militant';
type Difficulty = 'Very Easy' | 'Easy' | 'Normal' | 'Hard' | 'Insane' | 'Infinite';
type Language = 'en' | 'it' | 'de' | 'meme' | 'gamer' | 'pirate' | 'lolcat' | 'briish';

function getLevels(type: UnitType) {
  switch (type) {
    case 'farm': return FARM_LEVELS;
    case 'scout': return SCOUT_LEVELS;
    case 'sniper': return SNIPER_LEVELS;
    case 'paintballer': return PAINTBALLER_LEVELS;
    case 'demoman': return DEMOMAN_LEVELS;
    case 'soldier': return SOLDIER_LEVELS;
    case 'shotgunner': return SHOTGUNNER_LEVELS;
    case 'freezer': return FREEZER_LEVELS;
    case 'assassin': return ASSASSIN_LEVELS;
    case 'militant': return MILITANT_LEVELS;
    default: return SCOUT_LEVELS;
  }
}

const ALL_UNIT_TYPES: { type: UnitType; nameKey: string; icon: string }[] = [
  { type: 'scout', nameKey: 'scoutName', icon: '/Scout/Appearance/LO_Scout_0.webp' },
  { type: 'sniper', nameKey: 'sniperName', icon: '/Sniper/Appearance/DHDefaultSniper0.webp' },
  { type: 'demoman', nameKey: 'demomanName', icon: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman0.webp' },
  { type: 'farm', nameKey: 'farmName', icon: '/Farm/Appearance/Farm0.webp' },
  { type: 'paintballer', nameKey: 'paintballerName', icon: '/PaintBALLER/Apareance/DHDefaultPaintballer0.webp' },
  { type: 'soldier', nameKey: 'soldierName', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_0.webp' },
  { type: 'shotgunner', nameKey: 'shotgunnerName', icon: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl0.webp' },
  { type: 'freezer', nameKey: 'freezerName', icon: '/Freezer/Apareance/KRFreezer0.webp' },
  { type: 'assassin', nameKey: 'assassinName', icon: '/Assassin/Aspect/AssassinLevel0.webp' },
  { type: 'militant', nameKey: 'militantName', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel0.webp' },
];

const DEMOMAN_LEVELS = [
  { level: 0, cost: 550, upgradeCost: 225, hp: 100, damage: 6, interval: 2425, sellPrice: 183, splashRange: 0.83, hasHiddenDetection: false, hasLeadDetection: true, name: 'Demoman', appearance: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman0.webp', icon: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman0.webp', description: 'Splash: 0.83 | Interval: 2.425s | Lead Detection' },
  { level: 1, cost: 0, upgradeCost: 800, hp: 100, damage: 6, interval: 1775, sellPrice: 258, splashRange: 0.83, hasHiddenDetection: false, hasLeadDetection: true, name: 'Faster Throwing', appearance: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman1.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Demoman_Upgrade_1_New.webp', description: 'Interval: 1.775s (-0.65s)' },
  { level: 2, cost: 0, upgradeCost: 2325, hp: 100, damage: 12, interval: 1775, sellPrice: 525, splashRange: 0.875, hasHiddenDetection: false, hasLeadDetection: true, name: 'Ullapool Caber', appearance: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman2.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Demoman_Upgrade_2.webp', description: 'Damage: 12 (+6) | Splash: 0.875' },
  { level: 3, cost: 0, upgradeCost: 5750, hp: 100, damage: 25, interval: 1525, sellPrice: 1300, splashRange: 0.875, hasHiddenDetection: true, hasLeadDetection: true, name: 'Loch-n-Load', appearance: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman3.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Demoman_Upgrade_3.webp', description: 'Damage: 25 (+13) | Interval: 1.525s | +Hidden Detection' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 50, interval: 1325, sellPrice: 3216, splashRange: 1.0, hasHiddenDetection: true, hasLeadDetection: true, name: "Expert's Ordnance", appearance: '/Sniper/Sound/Demoman/Appearance/M23DefaultDemoman4.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/NewDemomanLevel4.webp', description: 'Damage: 50 (+25) | Interval: 1.325s | Splash: 1.0' },
];

const SOLDIER_LEVELS = [
  { level: 0, cost: 400, upgradeCost: 50, hp: 100, damage: 1, interval: 175, burstCount: 3, cooldown: 550, sellPrice: 133, name: 'Soldier', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_0.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_0.webp', description: 'Burst: 3 shots | 1 Damage', hasHiddenDetection: false, hasFlyingDetection: false },
  { level: 1, cost: 0, upgradeCost: 650, hp: 100, damage: 1, interval: 150, burstCount: 3, cooldown: 550, sellPrice: 150, name: 'Barracks Training', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_1.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Upgrade icon/Soldier_Upgrade_1_New.webp', description: 'Firerate: 0.175s > 0.15s', hasHiddenDetection: false, hasFlyingDetection: false },
  { level: 2, cost: 0, upgradeCost: 1350, hp: 100, damage: 2, interval: 150, burstCount: 4, cooldown: 550, sellPrice: 366, name: 'Better Aiming', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_2.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Upgrade icon/Soldier_Upgrade_2_New.webp', description: '+1 Damage | Burst: 4 | +Hidden', hasHiddenDetection: true, hasFlyingDetection: false },
  { level: 3, cost: 0, upgradeCost: 5000, hp: 100, damage: 3, interval: 150, burstCount: 8, cooldown: 400, sellPrice: 783, name: 'Equipment Upgrades', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_3.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Upgrade icon/Soldier_Upgrade_4_New.webp', description: '+1 Damage | Burst: 8 | Cooldown: 0.4s', hasHiddenDetection: true, hasFlyingDetection: false },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 8, interval: 150, burstCount: 12, cooldown: 400, sellPrice: 2450, name: 'Deadliest Soldier', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Appearance/KR_Soldier_4.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Upgrade icon/Soldier_Upgrade_5_New.webp', description: '+5 Damage | Burst: 12 | +Flying Detection', hasHiddenDetection: true, hasFlyingDetection: true },
];

const MILITANT_LEVELS = [
  { level: 0, cost: 600, upgradeCost: 300, hp: 100, damage: 1, interval: 225, sellPrice: 200, name: 'Militant', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel0.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel0.webp', description: 'Single Damage: 1 | Interval: 0.225s', hasHiddenDetection: false, hasFlyingDetection: false },
  { level: 1, cost: 0, upgradeCost: 850, hp: 100, damage: 1, interval: 175, sellPrice: 300, name: 'Radio Comms', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel1.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel1.webp', description: 'Interval: 0.175s | +Hidden/Flying', hasHiddenDetection: true, hasFlyingDetection: true },
  { level: 2, cost: 0, upgradeCost: 2750, hp: 100, damage: 2, interval: 175, sellPrice: 583, name: 'Field Ops', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel2.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel2.webp', description: 'Damage: 2 (+1)', hasHiddenDetection: true, hasFlyingDetection: true },
  { level: 3, cost: 0, upgradeCost: 8000, hp: 100, damage: 5, interval: 175, sellPrice: 1500, name: 'Guerrilla Tactics', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel3.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel3.webp', description: 'Damage: 5 (+3)', hasHiddenDetection: true, hasFlyingDetection: true },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 12, interval: 175, sellPrice: 4166, name: 'Stealth Mercenary', appearance: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel4.webp', icon: '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/Militant/MilitantLevel4.webp', description: 'Damage: 12 (+7)', hasHiddenDetection: true, hasFlyingDetection: true },
];

const SNIPER_LEVELS = [
  { level: 0, cost: 450, upgradeCost: 200, hp: 100, damage: 10, interval: 5008, sellPrice: 150, hasHiddenDetection: false, hasLeadDetection: false, hasFlyingDetection: true, name: 'Sniper', appearance: '/Sniper/Appearance/DHDefaultSniper0.webp', icon: '/Sniper/Appearance/DHDefaultSniper0.webp', description: 'Attack: 10 | Interval: 5.0s | High range' },
  { level: 1, cost: 0, upgradeCost: 750, hp: 100, damage: 12, interval: 4008, sellPrice: 216, hasHiddenDetection: false, hasLeadDetection: false, hasFlyingDetection: true, name: 'Faster Reloading', appearance: '/Sniper/Appearance/DHDefaultSniper1.webp', icon: '/Sniper/Upgrade icon/Common1Image.webp', description: 'Attack: 12 (+2) | Interval: 4.0s' },
  { level: 2, cost: 0, upgradeCost: 2250, hp: 100, damage: 25, interval: 4008, sellPrice: 466, hasHiddenDetection: true, hasLeadDetection: false, hasFlyingDetection: true, name: 'Geared Up', appearance: '/Sniper/Appearance/DHDefaultSniper2.webp', icon: '/Sniper/Upgrade icon/Sniper2.webp', description: 'Attack: 25 (+13) | +Hidden Detection' },
  { level: 3, cost: 0, upgradeCost: 4500, hp: 100, damage: 60, interval: 4008, sellPrice: 1216, hasHiddenDetection: true, hasLeadDetection: true, hasFlyingDetection: true, name: 'Frontlines Sniping', appearance: '/Sniper/Appearance/DHDefaultSniper3.webp', icon: '/Sniper/Upgrade icon/Sniper3.webp', description: 'Attack: 60 (+35) | +Lead Detection' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 100, interval: 3508, sellPrice: 2716, hasHiddenDetection: true, hasLeadDetection: true, hasFlyingDetection: true, name: 'Spec Ops', appearance: '/Sniper/Appearance/DHDefaultSniper4.webp', icon: '/Sniper/Upgrade icon/Sniper4.webp', description: 'Attack: 100 (+40) | Interval: 3.5s' },
];

const PAINTBALLER_LEVELS = [
  { level: 0, cost: 100, upgradeCost: 25, hp: 100, damage: 1, interval: 1725, sellPrice: 33, splashRange: 0.5, hasHiddenDetection: false, name: 'Paintballer', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer0.webp', icon: '/PaintBALLER/Apareance/DHDefaultPaintballer0.webp', description: 'Splash: 0.5 | Interval: 1.725s' },
  { level: 1, cost: 0, upgradeCost: 150, hp: 100, damage: 1, interval: 1725, sellPrice: 41, splashRange: 0.58, hasHiddenDetection: true, name: 'Paintball Gear', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer1.webp', icon: '/PaintBALLER/Upgrade/Common1Image.webp', description: 'Splash: 0.58 | +Hidden Detection' },
  { level: 2, cost: 0, upgradeCost: 600, hp: 100, damage: 2, interval: 1425, sellPrice: 91, splashRange: 0.67, hasHiddenDetection: true, name: 'Shoulder Pads', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer2.webp', icon: '/PaintBALLER/Upgrade/Paintballer2.webp', description: 'Damage: 2 | Interval: 1.425s | Splash: 0.67' },
  { level: 3, cost: 0, upgradeCost: 1500, hp: 100, damage: 3, interval: 725, sellPrice: 291, splashRange: 0.67, hasHiddenDetection: true, name: 'Double Barrel Gun', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer3.webp', icon: '/PaintBALLER/Upgrade/Paintballer3.webp', description: 'Damage: 3 | Interval: 0.725s' },
  { level: 4, cost: 0, upgradeCost: 3600, hp: 100, damage: 8, interval: 725, sellPrice: 791, splashRange: 0.75, hasHiddenDetection: true, name: 'Competitive Gear', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer4.webp', icon: '/PaintBALLER/Upgrade/Paintballer4.webp', description: 'Damage: 8 (+5) | Splash: 0.75' },
  { level: 5, cost: 0, upgradeCost: 0, hp: 100, damage: 20, interval: 725, sellPrice: 1991, splashRange: 0.83, hasHiddenDetection: true, name: 'Paintball Champion', appearance: '/PaintBALLER/Apareance/DHDefaultPaintballer5.webp', icon: '/PaintBALLER/Upgrade/Paintballer5.webp', description: 'Damage: 20 (+12) | Splash: 0.83' },
];

const TRANSLATIONS: Record<Language, any> = {
    en: {
    title: 'TDS Vs ZombieSSS',
    subtitle: 'Select Difficulty to Start Simulation',
    veryeasy: 'Very Easy',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    insane: 'Insane',
    relaxed: 'Relaxed Mode',
    ultimate: 'Ultimate Challenge',
    standard: 'Standard Game',
    starting: 'Starting',
    attrBoss: 'Boss',
    attrBossDesc: 'Only appears once per game! Immune to most status effects and can move while stunned.',
    attrBloated: 'Bloated',
    attrBloatedDesc: 'Double HP, larger size, slightly slower.',
    attrTank: 'Tanky',
    attrTankDesc: 'Reduces all damage to 1 HP unless the attacker has Lead Detection.',
    attrNimble: 'Nimble',
    attrNimbleDesc: 'Zombies move 200% faster when this attribute is active.',
    attrRegen: 'Regeneration',
    attrRegenDesc: 'Zombies heal 2% of their HP every 2 seconds.',
    openAlmanac: '📖 Open Almanac',
    version: 'Simulation v2.5.0',
    money: 'Money',
    lives: 'Base Health',
    zombieName: 'Zombie Name',
    menu: 'Menu',
    pause: 'PAUSE',
    music: 'Music',
    sfx: 'SFX',
    resume: 'Resume',
    restart: 'Restart',
    mainMenu: 'Main Menu',
    zombieBook: 'Zombie Book',
    almanacTitle: "The Zombie Almanac",
    closeBook: "Close Book",
    unitsTab: "Units",
    zombiesTab: "Zombies",
    attributesTab: "Attributes",
    scoutName: "Scout",
    scoutDesc: "Quick unit for early game defense.",
    soldierName: "Soldier",
    soldierDesc: "Fires in bursts. Versatile with good upgrades.",
    farmName: "Farm",
    farmDesc: "Produces gold to buy more units.",
    sniperName: "Sniper",
    sniperDesc: "Long-range unit that can hit any lane.",
    paintballerName: "Paintballer",
    paintballerDesc: "Area damage unit using paintballs.",
    demomanName: "Demoman",
    demomanDesc: "Explosive expert dealing massive area damage.",
    selectLoadout: "Choose Your Loadout",
    maxUnits: "(Max 5 Units)",
    confirmLoadout: "Confirm Loadout",
    gameOver: 'Game Over',
    reachedFarm: 'The zombies reached your farm!',
    finalWealth: 'Final Wealth',
    restartSim: 'Restart Simulation',
    finalWave: '🚨 FINAL WAVE APPROACHING! 🚨',
    wave: 'Wave',
    modConsole: 'Mod Console',
    infiniteMoney: 'Infinite Money',
    clearZombies: 'Clear All Zombies',
    upgradeAll: 'Upgrade All Units',
    stunAll: 'Stun/Unstun All Zombies',
    freezeUnits: 'Freeze Units',
    unfreezeUnits: 'Unfreeze Units',
    freezeZombies: 'Freeze Zombies',
    unfreezeZombies: 'Unfreeze Zombies',
    revive: 'Revive',
    sell: 'Sell for parts',
    max: 'MAX',
    peak: 'Peak Efficiency',
    prod: 'PROD.',
    next: 'NEXT',
    upgrade: 'UPGRADE',
    upgradeTo: 'Upgrade to',
    gameOverVictory: 'VICTORY!',
    gameOverDefeat: 'GAME OVER',
    zombiesWin: 'The zombies took over!',
    upgradeEffect: 'Upgrade Effect',
    damage: 'Damage',
    firerate: 'Firerate',
    reward: 'Reward',
    health: 'Health',
    infinite: 'Infinite Mode',
    farwest: 'Badlands Outpost',
    level: 'LEVEL',
    production: 'Production',
    victims: 'Victims',
    back: 'Back',
    zombieNormalName: 'Normal Zombie',
    zombieNormalDesc: 'Your average walker. Slow but steady.',
    militantName: 'Militant',
    militantDesc: 'Fast-firing military unit with versatile detection.',
    zombieSpeedyName: 'Speedy Zombie',
    zombieSpeedyDesc: 'Fast and tricky. Don\'t let them get close.',
    zombieSlowName: 'Slow Zombie',
    zombieSlowDesc: 'A massive tanky zombie. Hard to take down.',
    shotgunnerName: 'Shotgunner',
    shotgunnerDesc: 'Powerful close-range unit with wide birdshot spread.',
    freezerName: 'Freezer',
    freezerDesc: 'Slows and freezes enemies with icy shots.',
    zombieHiddenName: 'Hidden',
    zombieHiddenDesc: 'Tricky invisible zombie. Above average speed.',
    zombieBossName: 'Normal Boss',
    zombieBossDesc: 'An absolute unit. Immune to most status effects and heavily armored.',
    zombieBreaker2Name: 'Breaker2',
    zombieBreaker2Desc: 'Spawns a Breaker on death.',
    zombieBreakerName: 'Breaker',
    zombieBreakerDesc: 'Very fast enemy.',
    assassinName: 'Assassin',
    assassinDesc: 'Silent but deadly melee specialist.',
    jumpWave: 'Jump to Wave',
    spawnZombie: 'Spawn Zombie',
    lane: 'Lane',
    range: 'Range',
  },
  it: {
    title: 'TDS Vs ZombieSSS',
    subtitle: 'Seleziona Difficoltà per Iniziare',
    veryeasy: 'Molto Facile',
    easy: 'Facile',
    normal: 'Normale',
    hard: 'Difficile',
    insane: 'Folle',
    relaxed: 'Modalità Relax',
    ultimate: 'Sfida Estrema',
    standard: 'Gioco Standard',
    starting: 'Iniziale',
    openAlmanac: '📖 Apri l\'Almanacco',
    version: 'Simulazione v2.5.0',
    money: 'Soldi',
    lives: 'Vita Base',
    zombieName: 'Nome Zombie',
    menu: 'Menu',
    pause: 'PAUSA',
    music: 'Musica',
    sfx: 'Effetti Sonori',
    resume: 'Riprendi',
    restart: 'Riavvia',
    mainMenu: 'Menu Principale',
    zombieBook: 'Libro Zombie',
    almanacTitle: "L'Almanacco degli Zombie",
    closeBook: "Chiudi Libro",
    unitsTab: "Unità",
    zombiesTab: "Zombie",
    attributesTab: "Attributi",
    scoutName: "Scout",
    scoutDesc: "Unità rapida per la difesa iniziale.",
    soldierName: "Soldier",
    soldierDesc: "Spara a raffiche. Versatile con ottimi potenziamenti.",
    farmName: "Farm",
    farmDesc: "Produce oro per comprare altre unità.",
    sniperName: "Sniper",
    sniperDesc: "Unità a lungo raggio che può colpire ogni lane.",
    paintballerName: "Paintballer",
    paintballerDesc: "Unità a danno d'area che usa paintball.",
    demomanName: "Demoman",
    demomanDesc: "Esperto di esplosivi che infligge ingenti danni ad area.",
    selectLoadout: "Scegli il tuo Equipaggiamento",
    maxUnits: "(Max 5 Unità)",
    confirmLoadout: "Conferma Equipaggiamento",
    gameOver: 'Fine Giochi',
    reachedFarm: 'Gli zombie hanno invaso la fattoria!',
    finalWealth: 'Ricchezza finale',
    restartSim: 'Riavvia Simulazione',
    finalWave: '🚨 ONDATA FINALE IN ARRIVO! 🚨',
    wave: 'Ondata',
    modConsole: 'Console Mod',
    infiniteMoney: 'Soldi Infiniti',
    clearZombies: 'Elimina Zombie',
    upgradeAll: 'Potenzia Tutto',
    stunAll: 'Stordisci Tutti',
    freezeUnits: 'Congela Unità',
    unfreezeUnits: 'Scongela Unità',
    freezeZombies: 'Congela Zombie',
    unfreezeZombies: 'Scongela Zombie',
    revive: 'Rianima',
    sell: 'Vendi pezzi',
    max: 'MAX',
    peak: 'Efficienza Massima',
    prod: 'PROD.',
    jumpWave: 'Salta a Ondata',
    spawnZombie: 'Genera Zombie',
    lane: 'Lane',
    next: 'PROSSIMO',
    upgrade: 'POTENZIA',
    upgradeTo: 'Potenzia a',
    gameOverVictory: 'VITTORIA!',
    gameOverDefeat: 'PARTITA FINITA',
    zombiesWin: 'Gli zombie hanno vinto!',
    upgradeEffect: 'Effetto Upgrade',
    damage: 'Danni',
    firerate: 'Cadenza',
    range: 'Raggio',
    reward: 'Premio',
    health: 'Salute',
    splash: 'Splash',
    infinite: 'Modalità Infinita',
    farwest: 'Avamposto Badlands',
    level: 'LIVELLO',
    production: 'Produzione',
    victims: 'Vittime',
    back: 'Indietro',
    zombieNormalName: 'Zombie Normale',
    zombieNormalDesc: 'Lo zombie medio. Lento ma costante.',
    zombieBreaker2Name: 'Breaker 2',
    zombieBreaker2Desc: 'Genera un Breaker alla morte.',
    zombieBreakerName: 'Breaker',
    zombieBreakerDesc: 'Molto veloce.',
    militantName: 'Militante',
    militantDesc: 'Unità militare a fuoco rapido con rilevamento versatile.',
    zombieSpeedyName: 'Zombie Veloce',
    zombieSpeedyDesc: 'Veloce e scattante. Non farlo avvicinare.',
    zombieSlowName: 'Zombie Lento',
    zombieSlowDesc: 'Un enorme zombie corazzato. Difficile da abbattere.',
    zombieHiddenName: 'Nascosto',
    zombieHiddenDesc: 'Zombie invisibile e scattante. Velocità sopra la media.',
    zombieBossName: 'Boss Normale',
    zombieBossDesc: 'Un titano enorme con immunità assolute. Terrificante.',
    shotgunnerName: 'Fuciliere',
    shotgunnerDesc: 'Spara a corto raggio con un ampio raggio d\'azione.',
    attrBloated: 'Gonfio',
    attrBloatedDesc: 'Raddoppia la salute dello zombie. Lo rende più grande e lento.',
    attrTank: 'Corazzato',
    attrTankDesc: 'Riduce tutti i danni a 1 HP, tranne se l\'attaccante ha Lead Detection.',
    attrNimble: 'Scattante',
    attrNimbleDesc: 'Rende lo zombie due volte più veloce.',
    attrRegen: 'Rigenerazione',
    attrRegenDesc: 'Rigenera il 2% della salute ogni 2 secondi.',
    attrBoss: 'Boss',
    attrBossDesc: 'Appare solo una volta! Immune a quasi tutti gli stati negativi e si muove anche se stordito.',
    freezerName: 'Congelatore',
    freezerDesc: 'Rallenta e congela i nemici con colpi ghiacciati.',
    assassinName: 'Assassino',
    assassinDesc: 'Unità corpo a corpo furtiva con danni elevati.',
  },
  de: {
    title: 'TDS Vs ZombieSSS',
    subtitle: 'Schwierigkeit wählen',
    veryeasy: 'Sehr Einfach',
    easy: 'Einfach',
    normal: 'Normal',
    hard: 'Schwer',
    insane: 'Wahnsinnig',
    relaxed: 'Entspannter Modus',
    ultimate: 'Ultimative Herausforderung',
    standard: 'Standardspiel',
    starting: 'Startkapital',
    openAlmanac: '📖 Almanach öffnen',
    version: 'Simulation v2.5.0',
    money: 'Geld',
    lives: 'Basis Leben',
    zombieName: 'Zombie-Name',
    menu: 'Menü',
    pause: 'PAUSE',
    music: 'Musik',
    sfx: 'SFX',
    resume: 'Fortsetzen',
    restart: 'Neustart',
    mainMenu: 'Hauptmenü',
    zombieBook: 'Zombie-Buch',
    almanacTitle: "Der Zombie-Almanach",
    closeBook: "Buch schließen",
    unitsTab: "Einheiten",
    zombiesTab: "Zombies",
    attributesTab: "Attribute",
    scoutName: "Späher",
    scoutDesc: "Schnelle Einheit für die frühe Verteidigung.",
    soldierName: "Soldat",
    soldierDesc: "Schießt in Salven. Vielseitig mit guten Upgrades.",
    farmName: "Farm",
    farmDesc: "Produziert Gold, um mehr Einheiten zu kaufen.",
    sniperName: "Scharfschütze",
    sniperDesc: "Einheit mit großer Reichweite.",
    paintballerName: "Paintballer",
    paintballerDesc: "Einheit mit Flächenschaden.",
    demomanName: "Demoman",
    demomanDesc: "Spezialist für Sprengstoffe mit hohem Flächenschaden.",
    selectLoadout: "Ausrüstung wählen",
    maxUnits: "(Max. 5 Einheiten)",
    confirmLoadout: "Ausrüstung bestätigen",
    gameOver: 'Game Over',
    reachedFarm: 'Die Zombies haben den Hof erreicht!',
    finalWealth: 'Endvermögen',
    restartSim: 'Simulation neu starten',
    finalWave: '🚨 FINALE WELLE NAHT! 🚨',
    wave: 'Welle',
    modConsole: 'Mod-Konsole',
    infiniteMoney: 'Unendlich Geld',
    clearZombies: 'Alle Zombies löschen',
    upgradeAll: 'Alle Einheiten verbessern',
    stunAll: 'Alle Zombies betäuben',
    freezeUnits: 'Einheiten einfrieren',
    unfreezeUnits: 'Einheiten auftauen',
    freezeZombies: 'Zombies einfrieren',
    unfreezeZombies: 'Zombies auftauen',
    revive: 'Wiederbeleben',
    sell: 'Verkaufen',
    max: 'MAX',
    peak: 'Maximale Effizienz',
    prod: 'PROD.',
    next: 'NÄCHSTE',
    upgrade: 'VERBESSERN',
    upgradeTo: 'Verbessern zu',
    gameOverVictory: 'SIEG!',
    gameOverDefeat: 'SPIEL VORBEI',
    zombiesWin: 'Die Zombies haben gewonnen!',
    upgradeEffect: 'Effekt',
    damage: 'Schaden',
    firerate: 'Feuerrate',
    reward: 'Belohnung',
    health: 'Gesundheit',
    infinite: 'Endlosmodus',
    farwest: 'Badlands-Außenposten',
    level: 'LEVEL',
    production: 'Produktion',
    victims: 'Opfer',
    back: 'Zurück',
    zombieNormalName: 'Normaler Zombie',
    zombieNormalDesc: 'Dein durchschnittlicher Läufer. Langsam aber stetig.',
    zombieSpeedyName: 'Schneller Zombie',
    zombieSpeedyDesc: 'Schnell und trickreich. Lass sie nicht zu nah kommen.',
    zombieSlowName: 'Langsamer Zombie',
    zombieSlowDesc: 'Ein riesiger, gepanzerter Zombie. Schwer zu besiegen.',
    zombieBreaker2Name: 'Breaker2',
    zombieBreaker2Desc: 'Erschafft einen Breaker beim Tod.',
    zombieBreakerName: 'Breaker',
    zombieBreakerDesc: 'Sehr schneller Feind.',
    militantName: 'Militant',
    militantDesc: 'Schnell feuernde Militäreinheit mit vielseitiger Erkennung.',
    zombieHiddenName: 'Versteckt',
    zombieHiddenDesc: 'Tückischer unsichtbarer Zombie. Überdurchschnittliche Geschwindigkeit.',
    zombieBossName: 'Normaler Boss',
    zombieBossDesc: 'Ein gewaltiger Titan mit absoluter Immunität. Furchterregend.',
    attrBloated: 'Aufgebläht',
    attrBloatedDesc: 'Verdoppelt die Gesundheit. Macht den Zombie größer und langsamer.',
    attrTank: 'Gepanzerert',
    attrTankDesc: 'Reduziert Schaden auf 1 HP, außer bei Lead Detection.',
    attrNimble: 'Flink',
    attrNimbleDesc: 'Macht den Zombie doppelt so schnell.',
    attrRegen: 'Heilung',
    attrRegenDesc: 'Regeneriert alle 2 Sekunden 2% Gesundheit.',
    attrBoss: 'Boss',
    attrBossDesc: 'Erscheint nur einmal pro Spiel! Immun gegen fast alle Statuseffekte und bewegt sich auch im betäubten Zustand.',
    shotgunnerName: 'Schrotflintenschütze',
    shotgunnerDesc: 'Sprüht Kugeln über mehrere Bahnen.',
    freezerName: 'Freezer',
    freezerDesc: 'Verlangsamt und friert Feinde mit Eisgeschossen ein.',
    assassinName: 'Assassine',
    assassinDesc: 'Heimliche Nahkampfeinheit mit hohem Schaden.',
  },
  meme: {
    title: 'TDS Vs ZombieSSS',
    subtitle: 'Pick ur poison boi',
    veryeasy: 'Baby Mode',
    easy: 'Ez Clap',
    normal: 'Understandable',
    hard: 'Big Brain',
    insane: 'EMOTIONAL DAMAGE',
    relaxed: 'Chill Vibes',
    ultimate: 'U Ded M8',
    standard: 'Average Enjoyer',
    starting: 'Starter Pack',
    openAlmanac: '📖 Read Lore',
    version: 'Meme Edition v6.9',
    money: 'Stonks',
    lives: 'Health Bar',
    zombieName: 'Zombie Boi',
    menu: 'Pause Room',
    pause: 'WAIT PLS',
    music: 'Vibes',
    sfx: 'Noise',
    resume: 'Keep Going',
    restart: 'Skill Issue?',
    mainMenu: 'Go Home',
    zombieBook: 'Dex',
    almanacTitle: "Zombie Wiki",
    closeBook: "Done Reading",
    unitsTab: "Bros",
    zombiesTab: "Meanies",
    attributesTab: "Buffs",
    scoutName: "Speedy Boy",
    scoutDesc: "Run fast, hit fast.",
    farmName: "Monis",
    farmDesc: "Stonks machine.",
    sniperName: "Long Boi",
    sniperDesc: "Sniping from Africa.",
    paintballerName: "Color Boi",
    paintballerDesc: "Painting is my passion.",
    soldierName: "Shooty Boi",
    soldierDesc: "Fires in bursts. Much shoot.",
    demomanName: "Boom Boi",
    demomanDesc: "Big explosions lol.",
    assassinName: "Edge Lord",
    assassinDesc: "Studied the blade while u were partying.",
    selectLoadout: "Pick ur Squad",
    maxUnits: "(Max 5 Bros)",
    confirmLoadout: "Squad Ready",
    gameOver: 'L + RATIO',
    reachedFarm: 'Zombies go brrr inside ur house!',
    finalWealth: 'Net Worth',
    restartSim: 'One More Time',
    finalWave: '🚨 THE FINAL BOSS IS HERE! 🚨',
    wave: 'Round',
    modConsole: 'Hacker Man',
    infiniteMoney: 'Infinite Stonks',
    clearZombies: 'Yeet Zombies',
    upgradeAll: 'God Mode Units',
    stunAll: 'Bonk Zombies',
    freezeUnits: 'Don\'t Move!',
    unfreezeUnits: 'Gotta go fast',
    freezeZombies: 'Ice Ice Baby',
    unfreezeZombies: 'Thaw out',
    revive: 'Respawn',
    sell: 'Scrap it',
    max: 'ULTIMATE',
    peak: 'Big Gains',
    prod: 'CASH',
    next: 'LVL UP',
    upgrade: 'MAKE BETTER',
    upgradeTo: 'Evolve into',
    gameOverVictory: 'VICTORY ROYALE!',
    gameOverDefeat: 'L + RATIO',
    zombiesWin: 'Skibidi Toilet took ur farm!',
    upgradeEffect: 'Buffs',
    damage: 'Ouch',
    firerate: 'Brrr',
    reward: 'Loot',
    health: 'HP',
    infinite: 'Endless Grind',
    farwest: 'Yeehaw Badlands',
    level: 'LEVEL',
    production: 'Money Print',
    victims: 'Noobs',
    back: 'U-Turn',
    zombieNormalName: 'Normal Boi',
    zombieNormalDesc: 'Just a regular dude looking for a snack.',
    zombieSpeedyName: 'Speedy Boi',
    zombieSpeedyDesc: 'He fast af boi.',
    zombieSlowName: 'Chonky Boi',
    zombieSlowDesc: 'O lawd he comin.',
    zombieBreaker2Name: 'Breaker2',
    zombieBreaker2Desc: 'Spawns a Breaker on death lol.',
    zombieBreakerName: 'Breaker',
    zombieBreakerDesc: 'Fast af boi.',
    zombieHiddenName: 'JOHN CENA',
    zombieHiddenDesc: "U CAN'T SEE HIM",
    zombieBossName: 'BIG CHUNGUS',
    zombieBossDesc: 'Absolute unit. Refuses to elaborate. Leaves (ur farm in ruins).',
    shotgunnerName: 'Shooty Dude',
    shotgunnerDesc: 'Does a big blast. Much damage.',
    militantName: 'Militant',
    militantDesc: 'Fast-firing military unit with versatile detection.',
    attrBloated: 'Thicc',
    attrBloatedDesc: 'More HP, much size. Big chonk.',
    attrTank: 'Vibe Check',
    attrTankDesc: 'No damage allowed. You lack the drip (detection).',
    attrNimble: 'I Am Speed',
    attrNimbleDesc: 'Kerchoo! Twice as fast.',
    attrRegen: 'Main Character Energy',
    attrRegenDesc: 'Heals himself because plot armor.',
    freezerName: 'Frosty Boi',
    freezerDesc: 'Chill out man! Freeze dem meanies in place.',
  },
  gamer: {
    title: 'TDS Vs ZombieSSS',
    subtitle: 'Queue for Match',
    veryeasy: 'Tutorial',
    easy: 'Noob friendly',
    normal: 'Ranked',
    hard: 'Pro Lobby',
    insane: 'eSports Final',
    relaxed: 'Casual Play',
    ultimate: 'Hardcore',
    standard: 'Competitive',
    starting: 'Loot',
    openAlmanac: '📖 Intel',
    version: 'Patch 2.5',
    money: 'Gold',
    lives: 'HP',
    zombieName: 'Mob Type',
    menu: 'Esc',
    pause: 'PAUSED',
    music: 'BGM',
    sfx: 'Audio',
    resume: 'Unpause',
    restart: 'Retry',
    mainMenu: 'Quit to Hub',
    zombieBook: 'Bestiary',
    almanacTitle: "Elite Bestiary",
    closeBook: "Exit Intel",
    unitsTab: "Classes",
    zombiesTab: "Mobs",
    attributesTab: "Passives",
    scoutName: 'Scout',
    scoutDesc: 'Early game carry.',
    farmName: 'Eco',
    farmDesc: 'Farm gold for better gear.',
    sniperName: 'Marksman',
    sniperDesc: 'Long range high DPS.',
    paintballerName: 'Mage',
    paintballerDesc: 'AoE crowd control.',
    soldierName: 'Infantry',
    soldierDesc: 'Burst DPS.',
    demomanName: 'Demolition',
    demomanDesc: 'Explosive AoE.',
    assassinName: 'Phantom',
    assassinDesc: 'High burst melee carry.',
    freezerName: 'Cryo-Mage',
    freezerDesc: 'CC and slowing effects.',
    shotgunnerName: 'Vanguard',
    shotgunnerDesc: 'Short range AoE burst.',
    selectLoadout: "Select Classes",
    maxUnits: "(Max 5 Slots)",
    confirmLoadout: "Ready Up",
    gameOver: 'DEFEAT',
    reachedFarm: 'Base Infiltrated! Mission Failed.',
    finalWealth: 'Total Score',
    restartSim: 'Reset Lobby',
    finalWave: '🚨 FINAL BOSS WAVE! 🚨',
    wave: 'Level',
    modConsole: 'Dev Mode',
    infiniteMoney: 'Infinite Gold',
    clearZombies: 'Wipe Server',
    upgradeAll: 'Max Stats for All',
    stunAll: 'CC All Mobs',
    freezeUnits: 'Lag Units',
    unfreezeUnits: 'Fix Ping',
    freezeZombies: 'Lag Mobs',
    unfreezeZombies: 'Resume AI',
    revive: 'Quick Revive',
    sell: 'Dismantle',
    max: 'PRESTIGE',
    peak: 'Meta Tier',
    prod: 'DPS',
    next: 'NEXT TIER',
    upgrade: 'LVL UP',
    upgradeTo: 'Craft',
    gameOverVictory: 'VICTORY!',
    gameOverDefeat: 'GAME OVER',
    zombiesWin: 'The mobs won!',
    upgradeEffect: 'Stat Boost',
    damage: 'DMG',
    firerate: 'Speed',
    reward: 'Loot',
    health: 'HP',
    infinite: 'Survival Mode',
    farwest: 'Badlands Outpost',
    level: 'LEVEL',
    production: 'Economy',
    victims: 'Frags',
    back: 'ESC',
    zombieNormalName: 'Basic Mob',
    zombieNormalDesc: 'Tier 1 enemy. Easy XP.',
    zombieSpeedyName: 'Sprinter',
    zombieSpeedyDesc: 'High movement speed. Clear them fast.',
    zombieSlowName: 'Elite Tank',
    zombieSlowDesc: 'High HP pool. Focus fire.',
    zombieBossName: 'Raid Boss',
    zombieBossDesc: 'Legendary enemy detected. Gear up.',
    zombieHiddenName: 'Phantom',
    zombieHiddenDesc: 'Invisible mob. Focus detection.',
    zombieBreaker2Name: 'Breaker2',
    zombieBreaker2Desc: 'Spawns a Breaker on death.',
    zombieBreakerName: 'Breaker',
    zombieBreakerDesc: 'High speed entry.',
    militantName: 'Militant',
    militantDesc: 'Fast-firing military unit with versatile detection.',
    attrBloated: 'Overbuffed',
    attrBloatedDesc: 'Double HP multiplier. Large hit box.',
    attrTank: 'Armor Plate',
    attrTankDesc: 'Damage reduction applied. Use armor pierce.',
    attrNimble: 'Sweaty',
    attrNimbleDesc: 'Movement speed buffed 200%.',
    attrRegen: 'Health Pack',
    attrRegenDesc: 'Auto-heal passive enabled.',
  },
  pirate: {
    title: 'TDS Vs Sea Lubbers',
    subtitle: 'Choose yer Captain\'s Difficulty',
    veryeasy: 'Landlubber',
    easy: 'Swab',
    normal: 'Sailor',
    hard: 'First Mate',
    insane: 'Pirate Lord',
    relaxed: 'Calm Seas',
    ultimate: 'Kraken\'s Wake',
    standard: 'Classic Voyage',
    starting: 'Stashed Booty',
    openAlmanac: '📖 Read the Captain\'s Log',
    version: 'Voyage v2.5',
    money: 'Doubloons',
    lives: 'Hull Integrity',
    zombieName: 'Sea Monster',
    menu: 'Map Room',
    pause: 'DROP ANCHOR',
    music: 'Sea Shanty',
    sfx: 'Cannon Fire',
    resume: 'Set Sail',
    restart: 'Mutiny!',
    mainMenu: 'Back to Port',
    zombieBook: 'Bounty List',
    almanacTitle: "The Sea Monster Bestiary",
    closeBook: "Close Log",
    unitsTab: "Crew",
    zombiesTab: "Monsters",
    attributesTab: "Curses",
    scoutName: "Lookout",
    scoutDesc: "Quick eyes fer early sightings.",
    farmName: "Treasure Map",
    farmDesc: "Digs up doubloons fer the crew.",
    sniperName: "Deadeye",
    sniperDesc: "Long shots from the crow's nest.",
    paintballerName: "Ink Slinger",
    paintballerDesc: "Throws kraken ink at the horde.",
    soldierName: "Mariner",
    soldierDesc: "Fires rapid salvos at sea dogs.",
    demomanName: "Powder Monkey",
    demomanDesc: "Exploding barrels fer everyone!",
    selectLoadout: "Pick yer Crew",
    maxUnits: "(Max 5 Mates)",
    confirmLoadout: "All Hands on Deck",
    gameOver: 'SHIPWRECKED',
    reachedFarm: 'The monsters boarded the ship!',
    finalWealth: 'Plunder Total',
    restartSim: 'New Voyage',
    finalWave: '🚨 THE KRAKEN DRAWS NEAR! 🚨',
    wave: 'Tide',
    modConsole: 'Captain\'s Cheat Sheet',
    infiniteMoney: 'Infinite Doubloons',
    clearZombies: 'Scuttle Monsters',
    upgradeAll: 'Grog fer Everyone',
    stunAll: 'Daze the Lubbers',
    freezeUnits: 'Freeze Crew',
    unfreezeUnits: 'Thaw Crew',
    freezeZombies: 'Freeze Sea Monsters',
    unfreezeZombies: 'Thaw Sea Monsters',
    revive: 'Back from Davy Jones',
    sell: 'Walk the Plank',
    max: 'LEGENDARY',
    peak: 'Master Pirate',
    prod: 'LOOT',
    next: 'LEVEL UP',
    upgrade: 'HARDEN HULL',
    upgradeTo: 'Promote to',
    gameOverVictory: 'VICTORY!',
    gameOverDefeat: 'GAME OVER',
    zombiesWin: 'The monsters took yer booty!',
    upgradeEffect: 'Enhancement',
    damage: 'Force',
    firerate: 'Reload Speed',
    reward: 'Bounty',
    health: 'Life',
    infinite: 'Endless Horizon',
    farwest: 'Tortuga Outpost',
    level: 'RANK',
    production: 'Income',
    victims: 'Kill Count',
    back: 'Retreat',
    zombieNormalName: 'Drowned Soul',
    zombieNormalDesc: 'Just a regular wet walker.',
    zombieSpeedyName: 'Ghost Runner',
    zombieSpeedyDesc: 'Fast as the wind.',
    zombieSlowName: 'Barnacle Brute',
    zombieSlowDesc: 'Thick shell, hard to crack.',
    attrBloated: 'Waterlogged',
    attrBloatedDesc: 'Heavy with sea water. More health.',
    attrTank: 'Ironclad',
    attrTankDesc: 'Only strong shots can pierce this hull.',
    attrNimble: 'Quick Fins',
    attrNimbleDesc: 'Fastest in the seven seas.',
    attrRegen: 'Siren\'s Song',
    attrRegenDesc: 'Heals wounds over time.',
    shotgunnerName: 'Blunderbuss Lad',
    shotgunnerDesc: 'Does a big blast of grape shot across the deck.',
    freezerName: 'Frosty Mate',
    freezerDesc: 'Chills the sea monsters with icy shots from the deep.',
    zombieHiddenName: 'Ghostly Swashbuckler',
    zombieHiddenDesc: 'A spectral pirate ye can barely see, moving with the tide.',
    zombieBossName: 'Sea King Boss',
    zombieBossDesc: 'An absolute beast of the deep. Terrifying!',
    zombieBreaker2Name: 'Hull Breaker 2',
    zombieBreaker2Desc: 'Releases a smaller breaker when destroyed.',
    zombieBreakerName: 'Hull Breaker',
    zombieBreakerDesc: 'Fast as a shark!',
    militantName: 'Privateer',
    militantDesc: 'Rapid fire crewmate with sharp eyes.',
    assassinName: 'Shadow Knight',
    assassinDesc: 'Melee specialist with deadly precision.',
  },
  lolcat: {
    title: 'TDS Vs ZOMBEES',
    subtitle: 'Pick ur Difuculty kthxbai',
    veryeasy: 'Babee Mode',
    easy: 'Ez Pz',
    normal: 'SrSLY?',
    hard: 'Big Brain Cat',
    insane: 'I CAN HAZ DEATH',
    relaxed: 'Chill Cat',
    ultimate: 'Game Over Mane',
    standard: 'Kitten Play',
    starting: 'Initial Monies',
    openAlmanac: '📖 Read Da Book',
    version: 'Minecraft v2.5 mod',
    money: 'Shiny Coins',
    lives: 'Kat Lifes',
    zombieName: 'Bad Guy',
    menu: 'Meow Menu',
    pause: 'PAWS',
    music: 'Meowsic',
    sfx: 'Noise Maker',
    resume: 'Keep Goin',
    restart: 'Try Again Meow',
    mainMenu: 'Go Home',
    zombieBook: 'Moar Intel',
    almanacTitle: "ZOMBEES INFO",
    closeBook: "Bai Bai",
    unitsTab: "Bros",
    zombiesTab: "Enemees",
    attributesTab: "Shiny Tingz",
    scoutName: "Fast Katt",
    scoutDesc: "Run fast, scratch hard.",
    soldierName: "Soldier Katt",
    soldierDesc: "Burst fire pew pew kitteh.",
    farmName: "Gold Mine",
    farmDesc: "Makes shiny coins for kats.",
    sniperName: "Long Pew Pew",
    sniperDesc: "Snipe from far away.",
    paintballerName: "Color Katt",
    paintballerDesc: "Paint da whole world.",
    demomanName: "Boom Katt",
    demomanDesc: "I CAN HAZ EXPLOSIONS!",
    selectLoadout: "Pick ur Kat Squad",
    maxUnits: "(Max 5 Kats)",
    confirmLoadout: "Ready Meow",
    gameOver: 'UR DED',
    reachedFarm: 'Zombees in ur base!',
    finalWealth: 'Shiny Total',
    restartSim: 'Reset pls',
    finalWave: '🚨 DA BOSS IS COMIN! 🚨',
    wave: 'Level',
    modConsole: 'Haxor Mode',
    infiniteMoney: 'Infinite Shiny',
    clearZombies: 'Delete Zombees',
    upgradeAll: 'Max Kats',
    stunAll: 'Bonk Zombees',
    freezeUnits: 'Freeze Kats',
    unfreezeUnits: 'Unfreeze Kats',
    freezeZombies: 'Freeze Zombees',
    unfreezeZombies: 'Unfreeze Zombees',
    revive: 'Respawn Meow',
    sell: 'Throw Away',
    max: 'MAXED OUT',
    peak: 'Alpha Cat',
    prod: 'COINS',
    next: 'MOAR LEVEL',
    upgrade: 'MAKE STRONGER',
    upgradeTo: 'Evolve into',
    gameOverVictory: 'VICTORY!',
    gameOverDefeat: 'FAIL',
    zombiesWin: 'U lost ur cheeseburger!',
    upgradeEffect: 'New Skillz',
    damage: 'Dmg',
    firerate: 'Attak Speed',
    reward: 'Lootz',
    health: 'Hp',
    infinite: 'Forever mode',
    level: 'LVL',
    production: 'Money Print',
    victims: 'Got Em',
    back: 'Go bak',
    zombieNormalName: 'Normal Zombee',
    zombieNormalDesc: 'Just a regular hungry guy.',
    zombieSpeedyName: 'Fast Zombee',
    zombieSpeedyDesc: 'He zoomin.',
    zombieSlowName: 'Fat Zombee',
    zombieSlowDesc: 'Olawd he bloated.',
    zombieBossName: 'Final Boss Man',
    zombieBossDesc: 'Too scarry 4 me.',
    zombieBreaker2Name: 'Breaker Katt 2',
    zombieBreaker2Desc: 'Summons a tiny breaker kitteh when ded.',
    zombieBreakerName: 'Breaker Katt',
    zombieBreakerDesc: 'Zoomin fast!',
    militantName: 'Militant Katt',
    militantDesc: 'Fast pew pew kitteh with radar eyes.',
    shotgunnerName: 'Shotgun Boi',
    shotgunnerDesc: 'Big boom in ur face.',
    attrBloated: 'Chonky',
    attrBloatedDesc: 'Double health. Much size.',
    attrTank: 'Metal Skin',
    attrTankDesc: 'Armor plating. Needs big guns.',
    attrNimble: 'Super Zoomies',
    attrNimbleDesc: 'Fastest zombee ever.',
    attrRegen: 'Auto Heal',
    attrRegenDesc: 'Healin himself lol.',
    freezerName: 'Icy Katt',
    freezerDesc: 'Make zombees cold and slow lol.',
    assassinName: 'Nin-ja Katt',
    assassinDesc: 'Vry fast sword kitteh.',
  },
  briish: {
    title: 'TDS Vs Unruly Gentry',
    subtitle: 'Select your Difficulty, Governor',
    veryeasy: 'Absolute Doddle',
    easy: 'Piece of Cake',
    normal: 'Proper Match',
    hard: 'Right Tough',
    insane: 'Complete Nightmare',
    relaxed: 'Afternoon Tea',
    ultimate: 'Bloody Impossible',
    standard: 'Right Proper Game',
    starting: 'Initial Funds',
    openAlmanac: '📖 Consult the Journal',
    version: 'Empire Edition v2.5',
    money: 'Proper Wealth',
    lives: 'BOHOOWHOHA',
    zombieName: 'Nuisance Type',
    menu: 'Options Menu',
    pause: 'HAVE A BREAK',
    music: 'Orchestra',
    sfx: 'Audio Effects',
    resume: 'Go on then',
    restart: 'Fresh Start, innit?',
    mainMenu: 'Back to London',
    zombieBook: 'Rogue Gallery',
    almanacTitle: "The Victorian Bestiary",
    closeBook: "Close Journal",
    unitsTab: "Gentlemen",
    zombiesTab: "Scallywags",
    attributesTab: "Traits",
    scoutName: "Runner",
    scoutDesc: "A quick lad for scouting duties.",
    soldierName: "Soldier Chap",
    soldierDesc: "Fires in bursts, a proper warrior.",
    farmName: "Tea Plantation",
    farmDesc: "Harvests leaves for more funds.",
    sniperName: "Marksman",
    sniperDesc: "A proper shot from a distance, what?",
    paintballerName: "Artist",
    paintballerDesc: "Spreads colour across the field.",
    shotgunnerName: "Shotgunner Lad",
    shotgunnerDesc: "Crowd control with a wide spread.",
    demomanName: "Grenadier",
    demomanDesc: "Specialises in proper explosions.",
    selectLoadout: "Select your Gentlemen",
    maxUnits: "(Max 5 Chaps)",
    confirmLoadout: "Ready for Action",
    gameOver: 'TA-TA',
    reachedFarm: 'The scallywags ruined the tea party!',
    finalWealth: 'Total Fortune',
    restartSim: 'Try again, mate',
    finalWave: '🚨 THE FINAL CONFRONTATION! 🚨',
    wave: 'Onslaught',
    modConsole: 'Gentleman\'s Cheats',
    infiniteMoney: 'Infinite Pounds',
    clearZombies: 'Clear the Rabble',
    upgradeAll: 'Polished to Perfection',
    stunAll: 'Properly Dazed',
    freezeUnits: 'Freeze Chaps',
    unfreezeUnits: 'Unfreeze Chaps',
    freezeZombies: 'Freeze Scallywags',
    unfreezeZombies: 'Unfreeze Scallywags',
    revive: 'Second Life',
    sell: 'Redundant',
    max: 'PREMIER',
    peak: 'Top Tier Chap',
    prod: 'FUNDS',
    next: 'NEXT RANK',
    upgrade: 'IMPROVE',
    upgradeTo: 'Promote to',
    gameOverVictory: 'SMASHING!',
    gameOverDefeat: 'BIT OF A SHAME',
    zombiesWin: 'The rabble won, what a pity!',
    upgradeEffect: 'Improvement',
    damage: 'Punch',
    firerate: 'Pace',
    reward: 'Payment',
    health: 'Vigour',
    infinite: 'Endless Evening',
    farwest: 'Outpost',
    level: 'RANK',
    production: 'Revenue',
    victims: 'Arrests',
    back: 'Toodle-oo',
    zombieNormalName: 'Common Drifter',
    zombieNormalDesc: 'Just an ordinary nuisance.',
    zombieSpeedyName: 'Quick Scoundrel',
    zombieSpeedyDesc: 'Wait for no man, this one.',
    zombieSlowName: 'Bulky Brute',
    zombieSlowDesc: 'A right tank, he is.',
    zombieHiddenName: 'Stealthy Fellow',
    zombieHiddenDesc: 'A right tricky invisible chap with a brisk pace.',
    zombieBossName: 'Royal Boss',
    zombieBossDesc: 'A proper giant of a machine, it is. Right scary!',
    zombieBreaker2Name: 'Breaker Chap 2',
    zombieBreaker2Desc: 'Releases a smaller scallywag upon defeat.',
    zombieBreakerName: 'Breaker Chap',
    zombieBreakerDesc: 'Right quick fellow.',
    militantName: 'Militant Gentleman',
    militantDesc: 'Fast-firing soldier with brilliant detection.',
    attrBloated: 'Portly',
    attrBloatedDesc: 'A bit top heavy. More health.',
    attrTank: 'Tweed Armor',
    attrTankDesc: 'Quite resilient, needs special attention.',
    attrNimble: 'Sprightly',
    attrNimbleDesc: 'Quick as a greyhound.',
    attrRegen: 'Stiff Upper Lip',
    attrRegenDesc: 'Recovers from setbacks quickly.',
    freezerName: 'Icy Chap',
    freezerDesc: 'Chills the scallywags to the bone with freezing pellets.',
    assassinName: 'Shadow Knight',
    assassinDesc: 'Melee specialist with deadly precision.',
  }
};

interface DifficultySettings {
  startingMoney: number;
  spawnRateMult: number;
  background: string;
  moneyMult: number;
  maxWaves: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultySettings> = {
  'Very Easy': {
    startingMoney: 1200,
    spawnRateMult: 1.6,
    background: 'bg-[#FFD54F]',
    moneyMult: 1.5,
    maxWaves: 20
  },
  'Easy': {
    startingMoney: 800,
    spawnRateMult: 1.3,
    background: 'bg-[#5D4636] shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]',
    moneyMult: 1.25,
    maxWaves: 30
  },
  'Normal': {
    startingMoney: 600,
    spawnRateMult: 1.0,
    background: 'bg-[#333333] border-[#1a1a1a] shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]',
    moneyMult: 1.0,
    maxWaves: 35
  },
  'Hard': {
    startingMoney: 500,
    spawnRateMult: 0.85,
    background: 'bg-gradient-to-b from-[#b07d5b] via-[#4d4d4d] to-[#1a1a1a] shadow-[inset_0_0_200px_rgba(0,0,0,1)]',
    moneyMult: 0.9,
    maxWaves: 40
  },
  'Insane': {
    startingMoney: 450,
    spawnRateMult: 0.6,
    background: 'bg-gradient-to-b from-[#2a0c0c] via-[#4d1a1a] to-[#2a0c0c] shadow-[inset_0_0_200px_rgba(255,69,0,0.4)]',
    moneyMult: 0.75,
    maxWaves: 50
  },
  'Infinite': {
    startingMoney: 600,
    spawnRateMult: 1.0,
    background: 'bg-[#d2b48c] shadow-[inset_0_0_200px_rgba(139,69,19,0.5)]',
    moneyMult: 1.0,
    maxWaves: 999999
  }
};

interface Position {
  x: number;
  y: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: 'bullet' | 'dart' | 'sniper-bullet' | 'paintball' | 'knife' | 'grenade';
  color: string;
  rotation: number;
  duration?: number;
}

interface Hit {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  color: string;
  type?: 'default' | 'whirlwind';
}

interface BaseEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  row: number;
}

interface Unit extends BaseEntity {
  unitType: UnitType;
  level: number;
  lastProductionTime?: number;
  lastAttackTime?: number;
  isStunImmune: boolean;
  targetId?: string;
  totalDamageDealt: number;
  burstRemaining?: number;
  abilityCooldowns?: Record<string, number>;
  slashCount?: number;
  damageSinceLastFan?: number;
}

interface Zombie extends BaseEntity {
  name: string;
  zombieType: 'NORMAL' | 'SPEEDY' | 'SLOW' | 'NORMAL_BOSS' | 'HIDDEN' | 'BREAKER2' | 'BREAKER';
  speed: number;
  damage: number;
  isEating: boolean;
  isBloated: boolean;
  isTank: boolean;
  isNimble: boolean;
  isRegen: boolean;
  isBoss: boolean;
  hasBossAttribute?: boolean;
  lastRegenTime?: number;
  baseMaxHp: number; // Max HP before bloated multiplier for regen calc
  isLead?: boolean;
  isFlying?: boolean;
  reward: number;
  variant: number;
  isStunned: boolean;
  isHidden?: boolean;
  chillAmount: number;
  isFrozen: boolean;
  frozenUntil: number;
  defenseReduc?: number;
}

const ZOMBIE_TYPES = {
  NORMAL: {
    name: 'zombieNormalName',
    description: 'zombieNormalDesc',
    baseHp: 6,
    speedPerGrid: 4.7, // seconds per grid
    reward: 5,
    damage: 0.5,
  },
  SPEEDY: {
    name: 'zombieSpeedyName',
    description: 'zombieSpeedyDesc',
    baseHp: 4,
    speedPerGrid: 1.8,
    reward: 8,
    damage: 0.4,
  },
  SLOW: {
    name: 'zombieSlowName',
    description: 'zombieSlowDesc',
    baseHp: 30,
    speedPerGrid: 5.1,
    reward: 10,
    damage: 1.0,
  },
  HIDDEN: {
    name: 'zombieHiddenName',
    description: 'zombieHiddenDesc',
    baseHp: 35,
    speedPerGrid: 1.49,
    reward: 20,
    damage: 1.0,
  },
  NORMAL_BOSS: {
    name: 'zombieBossName',
    description: 'zombieBossDesc',
    baseHp: 200,
    speedPerGrid: 5.4,
    reward: 150,
    damage: 5.0,
  },
  BREAKER2: {
    name: 'zombieBreaker2Name',
    description: 'zombieBreaker2Desc',
    baseHp: 80,
    speedPerGrid: 1.33,
    reward: 25,
    damage: 1.0,
    image: '/Enemys/Normal/Breakers/Breaker2/Breaker2Fallen.webp'
  },
  BREAKER: {
    name: 'zombieBreakerName',
    description: 'zombieBreakerDesc',
    baseHp: 50,
    speedPerGrid: 0.42,
    reward: 5,
    damage: 0.8,
    image: '/Enemys/Normal/Breakers/Breaker/BreakerFallen.webp'
  },
};

interface Lawnmower {
  id: string;
  row: number;
  x: number;
  isTriggered: boolean;
  isDone: boolean;
}

const SCOUT_LEVELS = [
  { level: 0, cost: 125, upgradeCost: 50, hp: 100, damage: 1, interval: 1025, sellPrice: 41, hasHiddenDetection: false, hasLeadDetection: false, name: 'Scout', appearance: '/Scout/Appearance/LO_Scout_0.webp', icon: '/Scout/Appearance/LO_Scout_0.webp', description: 'Unità rapida di ricognizione.' },
  { level: 1, cost: 0, upgradeCost: 375, hp: 100, damage: 1, interval: 775, sellPrice: 58, hasHiddenDetection: false, hasLeadDetection: false, name: 'Faster Reloading', appearance: '/Scout/Appearance/LO_Scout_1.webp', icon: '/Scout/Upgrade/Scout1.webp', description: 'Firerate: 1.025 > 0.775' },
  { level: 2, cost: 0, upgradeCost: 1350, hp: 100, damage: 3, interval: 775, sellPrice: 183, hasHiddenDetection: true, hasLeadDetection: false, name: 'Precise Aiming', appearance: '/Scout/Appearance/LO_Scout_2.webp', icon: '/Scout/Upgrade/Scout2.webp', description: 'Sblocca Hidden Detection (+2 Damage)' },
  { level: 3, cost: 0, upgradeCost: 2200, hp: 100, damage: 8, interval: 625, sellPrice: 633, hasHiddenDetection: true, hasLeadDetection: false, name: 'Stronger Equipment', appearance: '/Scout/Appearance/LO_Scout_3.webp', icon: '/Scout/Upgrade/Scout4.webp', description: 'Firerate: 0.775 > 0.625 (+5 Damage)' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 8, interval: 325, sellPrice: 1366, hasHiddenDetection: true, hasLeadDetection: false, name: 'Akimbo Handguns', appearance: '/Scout/Appearance/LO_Scout_4.webp', icon: '/Scout/Upgrade/Scout5.webp', description: 'Firerate: 0.625 > 0.325' },
];

const SHOTGUNNER_LEVELS = [
  { level: 0, cost: 800, upgradeCost: 300, hp: 100, damage: 2, bullets: 6, interval: 1025, range: 300, spread: 40, sellPrice: 266, hasHiddenDetection: false, hasLeadDetection: false, name: 'Shotgunner', appearance: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl0.webp', icon: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl0.webp', description: 'Bullets: 6 | Range: 3 | Spread: 40' },
  { level: 1, cost: 0, upgradeCost: 1200, hp: 100, damage: 3, bullets: 6, interval: 1025, range: 300, spread: 40, sellPrice: 366, hasHiddenDetection: false, hasLeadDetection: false, name: 'Heavier Shells', appearance: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl1.webp', icon: '/Farm/Appearance/Shotgunner/Upgrade icon/Level1.webp', description: '+1 Damage' },
  { level: 2, cost: 0, upgradeCost: 3400, hp: 100, damage: 3, bullets: 8, interval: 1025, range: 300, spread: 35, sellPrice: 766, hasHiddenDetection: true, hasLeadDetection: true, name: 'Shotgun Knowledge', appearance: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl2.webp', icon: '/Farm/Appearance/Shotgunner/Upgrade icon/ShotgunnerLevel2.webp', description: 'Bullets: 8 | Spread: 35 | +Hidden & Lead' },
  { level: 3, cost: 0, upgradeCost: 9500, hp: 100, damage: 5, bullets: 8, interval: 825, range: 367, spread: 30, sellPrice: 1900, hasHiddenDetection: true, hasLeadDetection: true, name: 'Slug Madness', appearance: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl3.webp', icon: '/Farm/Appearance/Shotgunner/Upgrade icon/ShotgunnerLevel3.webp', description: '+2 Damage | Interval: 0.825s | Range: 3.67' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 10, bullets: 9, interval: 825, range: 367, spread: 30, sellPrice: 5066, hasHiddenDetection: true, hasLeadDetection: true, name: 'Tactical Blowback', appearance: '/Farm/Appearance/Shotgunner/Appearance/EasterShotgunner_Lvl4.webp', icon: '/Farm/Appearance/Shotgunner/Upgrade icon/ShotgunnerLevel4.webp', description: '+5 Damage | Bullets: 9 | Spread: 30 | Range: 3.67' },
];

const ASSASSIN_LEVELS = [
  { level: 0, cost: 300, upgradeCost: 450, hp: 100, damage: 3, interval: 625, sellPrice: 100, name: 'Assassin', appearance: '/Assassin/Aspect/AssassinLevel0.webp', icon: '/Assassin/Aspect/AssassinLevel0.webp', description: 'Quick unit with high damage attacks.', range: 5, hasHiddenDetection: false, hasLeadDetection: false },
  { level: 1, cost: 0, upgradeCost: 750, hp: 100, damage: 6, interval: 525, sellPrice: 250, name: 'CQC Training', appearance: '/Assassin/Aspect/AssassinLevel1.webp', icon: '/Assassin/Upgrade icon/AssassinUpgrade1.webp', description: 'Damage: 6 (+3) | Interval: 0.525s', range: 5, hasHiddenDetection: false, hasLeadDetection: false },
  { level: 2, cost: 0, upgradeCost: 2378, hp: 100, damage: 6, interval: 525, sellPrice: 500, name: 'Umbral Tempest', appearance: '/Assassin/Aspect/AssassinLevel2.webp', icon: '/Assassin/Upgrade icon/AssassinUpgrade2.webp', description: '+Hidden Detection | Whirlwind: Every 3rd hit, 12 DMG AoE (3 tiles)', range: 5, hasHiddenDetection: true, hasLeadDetection: false, hasWhirlwind: true, whirlwindDamage: 12, whirlwindRange: 3 },
  { level: 3, cost: 0, upgradeCost: 5500, hp: 100, damage: 14, interval: 525, sellPrice: 1500, name: 'Ascended Shadows', appearance: '/Assassin/Aspect/AssassinLevel3.webp', icon: '/Assassin/Upgrade icon/AssassinUpgrade3.webp', description: 'Damage: 14 (+8) | Whirlwind +15 DMG', range: 5, hasHiddenDetection: true, hasLeadDetection: false, hasWhirlwind: true, whirlwindDamage: 27, whirlwindRange: 3 },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 35, interval: 525, sellPrice: 3500, name: 'Master Assassin', appearance: '/Assassin/Aspect/AssassinLevel4.webp', icon: '/Assassin/Upgrade icon/AssassinUpgrade4.webp', description: 'Damage: 35 (+21) | Fan of Knives (Range: 5)', range: 5, hasHiddenDetection: true, hasLeadDetection: false, hasWhirlwind: true, whirlwindDamage: 41, whirlwindRange: 3, hasFan: true, fanDamage: 60, fanThreshold: 500, fanRange: 5 },
];

const FREEZER_LEVELS = [
  { level: 0, cost: 425, upgradeCost: 225, hp: 100, damage: 1, interval: 525, sellPrice: 141, maxSlow: 0.5, slowPerShot: 0.1, name: 'Freezer', appearance: '/Freezer/Apareance/KRFreezer0.webp', icon: '/Freezer/Apareance/KRFreezer0.webp', description: 'Slows down enemies. Max 50%.', hasHiddenDetection: false, hasLeadDetection: false },
  { level: 1, cost: 0, upgradeCost: 650, hp: 100, damage: 2, interval: 525, sellPrice: 216, maxSlow: 0.6, slowPerShot: 0.15, name: 'Expedition Gear', appearance: '/Freezer/Apareance/KRFreezer1.webp', icon: '/Freezer/Upgrade/Freezer_Upgrade_1.webp', description: '+1 Damage | 60% Max Slow | 15% Shot Slow', hasHiddenDetection: false, hasLeadDetection: false },
  { level: 2, cost: 0, upgradeCost: 2000, hp: 100, damage: 2, interval: 525, sellPrice: 433, maxSlow: 0.6, slowPerShot: 0.2, freezeDuration: 2000, name: 'Bundled Up!', appearance: '/Freezer/Apareance/KRFreezer2.webp', icon: '/Freezer/Upgrade/Freezer_Upgrade_2.webp', description: '+Hidden Detection | Freezes at max chill (2s)', hasHiddenDetection: true, hasLeadDetection: false },
  { level: 3, cost: 0, upgradeCost: 4500, hp: 100, damage: 3, interval: 175, burstCount: 4, cooldown: 750, sellPrice: 2766, maxSlow: 0.75, slowPerShot: 0.25, freezeDuration: 2500, defenseReduction: 0.1, name: 'Arctic Soldier', appearance: '/Freezer/Apareance/KRFreezer3.webp', icon: '/Freezer/Upgrade/Freezer_Upgrade_3.webp', description: 'Burst: 4 | 75% Max Slow | 10% Def Shred | 2.5s Freeze', hasHiddenDetection: true, hasLeadDetection: false },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 5, interval: 175, burstCount: 7, cooldown: 750, sellPrice: 4500, maxSlow: 0.75, slowPerShot: 0.25, freezeDuration: 3000, defenseReduction: 0.1, hasAbility: true, name: "Arctic Master", appearance: '/Freezer/Apareance/KRFreezer4.webp', icon: '/Freezer/Upgrade/Freezer_Upgrade_4.webp', description: '+2 Damage | Burst: 7 | 3s Freeze | Frost Grenade', hasHiddenDetection: true, hasLeadDetection: false },
];

const FARM_LEVELS = [
  { level: 0, cost: 300, upgradeCost: 200, hp: 100, production: 60, interval: 7500, sellPrice: 100, appearance: '/Farm/Appearance/Farm0.webp', icon: '/Farm/Appearance/Farm0.webp', name: 'Farm' },
  { level: 1, cost: 0, upgradeCost: 600, hp: 100, production: 100, interval: 7500, sellPrice: 166, appearance: '/Farm/Appearance/NDFarm1.webp', icon: '/Farm/Upgrade/Farm1.webp', name: 'Carrot Farm' },
  { level: 2, cost: 0, upgradeCost: 1250, hp: 100, production: 225, interval: 7500, sellPrice: 366, appearance: '/Farm/Appearance/NDFarm2.webp', icon: '/Farm/Upgrade/Farm2.webp', name: 'Wheat Farm' },
  { level: 3, cost: 0, upgradeCost: 2500, hp: 100, production: 500, interval: 7500, sellPrice: 783, appearance: '/Farm/Appearance/NDFarm3.webp', icon: '/Farm/Upgrade/Farm3.webp', name: 'Tree Farm' },
  { level: 4, cost: 0, upgradeCost: 4500, hp: 100, production: 900, interval: 7500, sellPrice: 1616, appearance: '/Farm/Appearance/NDFarm4.webp', icon: '/Farm/Upgrade/Farm4.webp', name: 'Apple Farm' },
  { level: 5, cost: 0, upgradeCost: 0, hp: 100, production: 1500, interval: 7500, sellPrice: 3116, appearance: '/Farm/Appearance/NDFarm5.webp', icon: '/Farm/Upgrade/Farm5.webp', name: 'Space Fruit Farm' },
];

// --- Components ---

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'loadout' | 'playing' | 'gameOver'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [language, setLanguage] = useState<Language>('en');
  const [money, setMoney] = useState(600);
  const [units, setUnits] = useState<Unit[]>([]);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showModConsole, setShowModConsole] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const [isInfiniteMoney, setIsInfiniteMoney] = useState(false);
  const [modWaveInput, setModWaveInput] = useState('1');
  const [modSpawnType, setModSpawnType] = useState<keyof typeof ZOMBIE_TYPES>('NORMAL');
  const [modSpawnLane, setModSpawnLane] = useState(0);
  const [isPausedUnits, setIsPausedUnits] = useState(false);
  const [isPausedZombies, setIsPausedZombies] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [almanacTab, setAlmanacTab] = useState<'zombies' | 'units' | 'attributes'>('units');
  const [bossesIntroduced, setBossesIntroduced] = useState<Record<string, boolean>>({});
  const introducedTypesRef = useRef<Set<string>>(new Set());
  const [moneyParticles, setMoneyParticles] = useState<{ id: string; x: number; y: number; amount: number }[]>([]);
  const [skyMoney, setSkyMoney] = useState<{ id: string; x: number; y: number; targetY: number; collected: boolean; createdAt: number }[]>([]);
  const [lives, setLives] = useState(100);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const [lawnmowers, setLawnmowers] = useState<Lawnmower[]>([]);
  const [showAlmanac, setShowAlmanac] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [wave, setWave] = useState(1);
  const [zombiesToSpawn, setZombiesToSpawn] = useState(0);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [showFinalWave, setShowFinalWave] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [gameSpeed, setGameSpeed] = useState(1.0);
  const gameTimeRef = useRef(Date.now());
  const [selectedLoadout, setSelectedLoadout] = useState<UnitType[]>([]);
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const playSFX = useCallback((path: string) => {
    if (sfxVolume <= 0) return;
    try {
      const isBossPresent = zombies.some(z => z.hasBossAttribute);
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      const audio = new Audio(fullPath);
      audio.volume = (sfxVolume / 100) * (isBossPresent ? 0.3 : 1.0);
      // Ensure the audio object isn't immediately garbage collected
      (window as any)[`audio_${Date.now()}_${Math.random()}`] = audio;
      audio.onended = () => {
        // Clean up
        Object.keys(window).forEach(key => {
          if (key.startsWith('audio_') && (window as any)[key] === audio) {
            delete (window as any)[key];
          }
        });
      };
      audio.play().catch(() => {});
    } catch (e) {}
  }, [sfxVolume]);

  useEffect(() => {
    // Background Music Setup
    if (!musicRef.current) {
      // Using a more "serious" / tense atmospheric track
      musicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'); 
      musicRef.current.loop = true;
    }
    
    if (gameState === 'playing' && !isPaused && musicVolume > 0) {
      musicRef.current.play().catch(() => {});
    } else {
      musicRef.current.pause();
    }
    
    const isBossPresent = zombies.some(z => z.hasBossAttribute);
    musicRef.current.volume = (musicVolume / 100) * (isBossPresent ? 0.5 : 1.0);
  }, [gameState, isPaused, musicVolume, zombies]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing' && !gameOver) {
          setIsPaused(prev => !prev);
        } else if (gameState === 'loadout') {
          setGameState('menu');
        } else if (showAlmanac) {
          setShowAlmanac(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, gameOver, showAlmanac]);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const spawnTimerRef = useRef<number>(0);

  // --- Game Logic ---

  useEffect(() => {
    if (!isPaused && !showModConsole) {
      lastTickRef.current = Date.now();
    }
  }, [isPaused, showModConsole]);

  const lastSkyMoneyTimeRef = useRef<number>(Date.now());

  const getZombieData = useCallback((forcedType?: keyof typeof ZOMBIE_TYPES, forcedRow?: number) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const row = forcedRow !== undefined ? forcedRow : Math.floor(Math.random() * ROWS);
    
    // Pick random type (Normal 60%, Speedy 25%, Slow 15% after wave 5, Hidden after wave 15)
    let typeKey: keyof typeof ZOMBIE_TYPES = forcedType || 'NORMAL';
    if (!forcedType) {
      if (wave >= 10 && Math.random() < 0.05 + (wave * 0.002)) {
        typeKey = 'NORMAL_BOSS';
      } else if (wave >= 20 && Math.random() > 0.8) { // Breaker2 starts at wave 20
        typeKey = 'BREAKER2';
      } else if (wave >= 15 && Math.random() > 0.8) {
        typeKey = 'HIDDEN';
      } else if (wave >= 5 && Math.random() > 0.85) {
        typeKey = 'SLOW';
      } else if (wave >= 3 && Math.random() > 0.7) {
        typeKey = 'SPEEDY';
      }
    }
    
    const zombieType = ZOMBIE_TYPES[typeKey];
    const baseHp = zombieType.baseHp; 
    
    // speed is in pixels per ms: grid_size / (seconds * 1000)
    let baseSpeed = (CELL_SIZE / (zombieType.speedPerGrid * 1000)); 
    if (typeKey !== 'NORMAL_BOSS') {
      // Small speed increase can remain or be disabled too?
      // The user specifically said HP should stay same. 
      // I'll disable speed scaling too to be safe/consistent.
    }

    const baseReward = zombieType.reward;
    
    // attributes logic
    let isTank = false;
    let isBloated = false;
    let isNimble = false;
    let isRegen = false;
    let isBoss = typeKey === 'NORMAL_BOSS';
    let hasBossAttribute = false;
    
    if (isBoss && !introducedTypesRef.current.has(typeKey)) {
      hasBossAttribute = true;
      introducedTypesRef.current.add(typeKey);
    }

    if (typeKey === 'SPEEDY') {
      isTank = Math.random() > 0.5 && wave >= 15;
      isBloated = !isTank && wave >= 12 && Math.random() > 0.8;
    } else if (typeKey === 'SLOW') {
      isTank = wave >= 12 && Math.random() > 0.4;
      isBloated = wave >= 12 && Math.random() > 0.4;
      isNimble = wave >= 12 && Math.random() > 0.3;
      isRegen = wave >= 12 && Math.random() > 0.3;
    } else if (typeKey === 'HIDDEN') {
      isBloated = Math.random() > 0.6;
      isNimble = Math.random() > 0.6;
    } else if (typeKey === 'NORMAL_BOSS') {
      isBloated = Math.random() > 0.5;
      isNimble = Math.random() > 0.5;
    } else if (typeKey === 'BREAKER2') {
       isBloated = Math.random() > 0.4;
       isNimble = Math.random() > 0.4;
    } else if (typeKey === 'BREAKER') {
       // No attributes for small breaker
    } else {
      isBloated = wave >= 12 && Math.random() > 0.8;
    }

    const isLead = !isBoss && !['HIDDEN', 'BREAKER', 'BREAKER2'].includes(typeKey) && wave >= 20 && Math.random() > 0.7; // Lead property
    const isHidden = typeKey === 'HIDDEN' || (!isBoss && wave >= 25 && Math.random() > 0.8);

    let finalHp = isBloated ? baseHp * 2 : baseHp;
    if (isTank) finalHp *= 2.0; 
    
    if (isNimble) baseSpeed *= 2.0;

    const newZombie: Zombie = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'zombie',
      name: zombieType.name,
      zombieType: typeKey,
      x: COLS * CELL_SIZE,
      y: row * CELL_SIZE,
      row,
      hp: finalHp,
      maxHp: finalHp,
      baseMaxHp: baseHp, // for regen calc
      speed: isTank ? baseSpeed * 0.6 : baseSpeed,
      damage: zombieType.damage,
      isEating: false,
      isBloated,
      isTank,
      isNimble,
      isRegen,
      isBoss,
      hasBossAttribute,
      isLead,
      isHidden,
      reward: isBloated ? Math.floor(baseReward * 1.5) : baseReward,
      variant: Math.floor(Math.random() * 3),
      isStunned: false,
      chillAmount: 0,
      isFrozen: false,
      frozenUntil: 0,
    };
    return newZombie;
  }, [difficulty, wave]);

  const startWave = useCallback((waveNum: number) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!isInfiniteMode && waveNum > config.maxWaves) {
      setGameState('gameOver');
      return;
    }
    setWave(waveNum);
    const baseCount = 5 + waveNum * 3;
    const finalCount = isInfiniteMode && waveNum > 50 ? baseCount + (waveNum - 50) * 5 : baseCount;
    setZombiesToSpawn(finalCount);
    setIsWaveActive(true);
    if (waveNum === 10 || (isInfiniteMode && waveNum % 10 === 0)) {
      setShowFinalWave(true);
      setTimeout(() => setShowFinalWave(false), 5000);
    }
  }, [difficulty, isInfiniteMode]);

  const updateGame = useCallback(() => {
    const realNow = Date.now();
    const realDelta = realNow - lastTickRef.current;
    lastTickRef.current = realNow;
    
    // Scale delta by game speed
    const scaledDelta = realDelta * gameSpeed;
    gameTimeRef.current += scaledDelta;
    const now = gameTimeRef.current;

    if (isPaused || showModConsole || gameOver || gameState !== 'playing') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }

    // 0. Sky Money Logic (Every 10 seconds)
    if (now - lastSkyMoneyTimeRef.current > 10000) {
      const id = Math.random().toString(36).substr(2, 9);
      const col = Math.floor(Math.random() * (COLS - 2)) + 1;
      const row = Math.floor(Math.random() * ROWS);
      setSkyMoney(prev => [...prev, {
        id,
        x: col * CELL_SIZE + 20,
        y: -100,
        targetY: row * CELL_SIZE + 20,
        collected: false,
        createdAt: now
      }]);
      lastSkyMoneyTimeRef.current = now;
    }

    setSkyMoney(prev => prev.filter(m => !m.collected && now - m.createdAt < 15000).map(m => {
      if (m.y < m.targetY) {
        return { ...m, y: Math.min(m.targetY, m.y + 10) }; // Fall slightly faster
      }
      return m;
    }));

    // --- State Calculation ---
    let nextUnits = [...units];
    let nextZombies = [...zombies];
    let nextLawnmowers = [...lawnmowers];
    let totalMoneyDelta = 0;
    
    // 1. Money Production
    if (!isPausedUnits) {
      const configDifficulty = DIFFICULTY_CONFIG[difficulty];
      let spawnSound = false;
      
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'farm') {
          const config = FARM_LEVELS[unit.level];
          if (now - (unit.lastProductionTime || 0) >= config.interval) {
            const amount = Math.floor(config.production * configDifficulty.moneyMult);
            totalMoneyDelta += amount;
            
            const particleId = Math.random().toString(36).substr(2, 9);
            setMoneyParticles(prev => [...prev, { id: particleId, x: unit.x, y: unit.y, amount }]);
            spawnSound = true;
            return { ...unit, lastProductionTime: now };
          }
        }
        return unit;
      });

      // 1.1 Scout Combat
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'scout') {
          const config = SCOUT_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            // Find leftmost zombie (closest to farm) in row
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || config.hasHiddenDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              // Removed decimals when taking damage as per requirement
              const currentHp = Math.floor(target.hp);
              const damage = (target.isTank && !config.hasLeadDetection) ? 1 : config.damage;
              target.hp = currentHp - damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;
              
              // Spawning projectile visual
              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 30;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;
              
              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'dart',
                color: '#2ecc71',
                rotation: angle
              }]);

              // Spawning hit visual
              const hitId = Math.random().toString(36).substr(2, 9);
              setHits(prev => [...prev, {
                id: hitId,
                x: target.x + 20 + (Math.random() * 40),
                y: target.y + 20 + (Math.random() * 40),
                createdAt: now,
                color: '#e74c3c'
              }]);

              // Scout weapons sound
              const fireSound = unit.level <= 2 ? '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/SoldierFire0.ogg' : '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/SoldierFire1.ogg';
              playSFX(fireSound);
              setTimeout(() => playSFX(fireSound), 50);

              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }
        return unit;
      });

      // 1.2 Sniper Combat
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'sniper') {
          const config = SNIPER_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            // Priority: Closest to house (leftmost) - No locking as per user request
            const target = nextZombies
                .filter(z => z.hp > 0 && (!z.isHidden || config.hasHiddenDetection))
                .sort((a,b) => a.x - b.x)[0];

            if (target) {
              // Removed decimals when taking damage
              const currentHp = Math.floor(target.hp);
              const damage = (target.isTank && !config.hasLeadDetection) ? 1 : config.damage;
              target.hp = currentHp - damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;

              // Spawning projectile visual
              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 20;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'sniper-bullet',
                color: '#f1c40f',
                rotation: angle
              }]);

              // Spawning hit visual
              const hitId = Math.random().toString(36).substr(2, 9);
              setHits(prev => [...prev, {
                id: hitId,
                x: target.x + 20 + (Math.random() * 40),
                y: target.y + 20 + (Math.random() * 40),
                createdAt: now,
                color: '#f39c12'
              }]);
              
              // Sniper sound mapping
              const shootSound = unit.level <= 2 ? '/Sniper/Sound/Sniper_0.ogg' : 
                                 unit.level === 3 ? '/Sniper/Sound/Sniper_1.ogg' : 
                                 '/Sniper/Sound/Sniper_2.ogg';
              playSFX(shootSound);
              
              // Play reload sound after a short delay (e.g., 750ms)
              setTimeout(() => {
                playSFX('/Sniper/Sound/Sniper_Reload.ogg');
              }, 750);

              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }
        return unit;
      });

      // 1.3 Paintballer Combat
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'paintballer') {
          const config = PAINTBALLER_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || (config as any).hasHiddenDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              const splashRangePx = (config as any).splashRange * CELL_SIZE;
              // Splash damage to all zombies in range on same row
              nextZombies.forEach(z => {
                if (z.row === target!.row && Math.abs(z.x - target!.x) <= splashRangePx && z.hp > 0 && (!z.isHidden || (config as any).hasHiddenDetection)) {
                  const damage = (z.isTank && !(config as any).hasLeadDetection) ? 1 : config.damage;
                  z.hp = Math.floor(z.hp) - damage;
                  unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;
                }
              });

              // Spawning projectile visual
              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 30;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'paintball',
                color: '#e74c3c',
                rotation: angle
              }]);

              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target!.x + 20,
                y: target!.y + 20,
                createdAt: now,
                color: '#e74c3c'
              }]);

              playSFX('/PaintBALLER/Sound/PaintballerFire.ogg');
              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }
        return unit;
      });

      // 1.4 Demoman Combat
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'demoman') {
          const config = DEMOMAN_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || (config as any).hasHiddenDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              const splashRangePx = (config as any).splashRange * CELL_SIZE;
              // Splash damage
              nextZombies.forEach(z => {
                if (z.row === target!.row && Math.abs(z.x - target!.x) <= splashRangePx && z.hp > 0 && (!z.isHidden || (config as any).hasHiddenDetection)) {
                  const damage = (z.isTank && !(config as any).hasLeadDetection) ? 1 : config.damage;
                  z.hp = Math.floor(z.hp) - damage;
                  unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;
                }
              });

              // Projectile
              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 30;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'paintball',
                color: '#000000',
                rotation: angle,
                duration: config.level >= 3 ? 0.15 : 0.25 // Faster Projectile at level 3+
              }]);

              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target!.x + 20,
                y: target!.y + 20,
                createdAt: now,
                color: '#ff4d00'
              }]);

              const fireSound = unit.level <= 2 ? '/Sniper/Sound/Demoman/Sound/DemomanFire0.ogg' : '/Sniper/Sound/Demoman/Sound/DemomanFire1.ogg';
              playSFX(fireSound);
              // Adding "echo" by playing again with slight delay for level 3-4 (index 3 and 4)
              if (unit.level >= 3) {
                setTimeout(() => playSFX(fireSound), 60);
              }
              if (unit.level >= 3) {
                setTimeout(() => playSFX('/Sniper/Sound/Demoman/Sound/DemomanFireReload.ogg'), 600);
              }
              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }
        return unit;
      });

      // 1.5 Soldier Combat
      nextUnits = nextUnits.map(unit => {
        if (unit.unitType === 'soldier') {
          const config = SOLDIER_LEVELS[unit.level];
          const isBursting = (unit.burstRemaining || 0) > 0;
          const currentInterval = isBursting ? config.interval : config.cooldown;
          
          if (now - (unit.lastAttackTime || 0) >= currentInterval) {
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || config.hasHiddenDetection) &&
                (!z.isFlying || config.hasFlyingDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              const damage = (target.isTank) ? 1 : config.damage;
              target.hp -= damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;

              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 30;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'bullet',
                color: '#f1c40f',
                rotation: angle
              }]);

              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target!.x + 20,
                y: target!.y + 20,
                createdAt: now,
                color: '#f1c40f'
              }]);

              const shootSound = unit.level <= 2 ? '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/SoldierFire0.ogg' : 
                                 '/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/SoldierFire1.ogg';
              playSFX(shootSound);
              // Echo for soldier too
              setTimeout(() => playSFX(shootSound), 40);
              
              let nextBurstCount = unit.burstRemaining || 0;
              if (nextBurstCount === 0) {
                nextBurstCount = config.burstCount - 1;
              } else {
                nextBurstCount -= 1;
              }

              return { 
                ...unit, 
                lastAttackTime: now, 
                targetId: target.id, 
                burstRemaining: nextBurstCount 
              };
            }
          }
        }

        // 1.6 Shotgunner Combat
        if (unit.unitType === 'shotgunner') {
          const config = SHOTGUNNER_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            const primaryTarget = nextZombies.find(z => 
              z.hp > 0 && 
              z.row === unit.row &&
              z.x > unit.x &&
              z.x < unit.x + config.range &&
              (!z.isHidden || config.hasHiddenDetection)
            );

            if (primaryTarget) {
              const unitCenterX = unit.x + 50;
              const unitCenterY = unit.y + 50;
              const spreadRad = (config.spread * Math.PI) / 180;
              
              // Simulate pellets
              for (let i = 0; i < config.bullets; i++) {
                const offAngle = (Math.random() - 0.5) * spreadRad;
                
                nextZombies = nextZombies.map(zombie => {
                  if (zombie.hp <= 0) return zombie;
                  
                  const zX = zombie.x + 50;
                  const zY = zombie.y + 50;
                  const dx = zX - unitCenterX;
                  const dy = zY - unitCenterY;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  
                  const rangeMult = 0.7 + 0.3 * Math.cos(offAngle * (Math.PI / spreadRad));
                  if (dist > config.range * rangeMult) return zombie;

                  const zAngle = Math.atan2(dy, dx);
                  let diff = zAngle - 0; // Standard right direction
                  while (diff > Math.PI) diff -= Math.PI * 2;
                  while (diff < -Math.PI) diff += Math.PI * 2;

                  // Projectile collision simulation
                  const crossProd = Math.abs(dx * Math.sin(offAngle) - dy * Math.cos(offAngle));
                  if (crossProd < 45 && dx > 0) {
                     // Rules: 
                     // 1. Lead needs detection always.
                     // 2. Hidden/Flying can be hit indirectly (if not primary target) or if detected.
                     const detectionMatch = (!zombie.isLead || config.hasLeadDetection) &&
                                            (!zombie.isHidden || config.hasHiddenDetection);
                     
                     const isIndirectHit = zombie.id !== primaryTarget.id;
                     const canHitIndirectly = !zombie.isLead || config.hasLeadDetection; // Can't skip lead even if indirect

                     if (detectionMatch || (isIndirectHit && canHitIndirectly)) {
                        const dmg = (zombie.isTank) ? 1 : config.damage;
                        zombie.hp -= dmg;
                        unit.totalDamageDealt = (unit.totalDamageDealt || 0) + dmg;
                     }
                  }
                  return zombie;
                });

                setProjectiles(prev => [...prev, {
                  id: Math.random().toString(36).substr(2, 9),
                  x: unitCenterX,
                  y: unitCenterY,
                  targetX: unitCenterX + config.range * Math.cos(offAngle),
                  targetY: unitCenterY + config.range * Math.sin(offAngle),
                  type: 'bullet',
                  color: '#FFD700',
                  rotation: offAngle * 180 / Math.PI,
                  duration: 0.15
                }]);
              }

              playSFX('/Sniper/Sound/Demoman/Sound/DemomanFire0.ogg');
              return { ...unit, lastAttackTime: now };
            }
          }
        }

        // 1.7 Freezer Combat
        if (unit.unitType === 'freezer') {
          const config = FREEZER_LEVELS[unit.level];
          const isBursting = (unit.burstRemaining || 0) > 0;
          const currentInterval = isBursting ? config.interval : (config.cooldown || config.interval);
          
          if (now - (unit.lastAttackTime || 0) >= currentInterval) {
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || config.hasHiddenDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              const damage = (target.isTank) ? 1 : config.damage;
              target.hp -= damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;
              
              target.chillAmount = Math.min(1, (target.chillAmount || 0) + (config.slowPerShot || 0.1));
              (target as any).slowCap = config.maxSlow;
              
              if ((config as any).freezeDuration && target.chillAmount >= 1 && !target.isFrozen) {
                 target.isFrozen = true;
                 target.frozenUntil = now + (config as any).freezeDuration;
              }
              
              if ((config as any).defenseReduction) {
                 target.defenseReduc = (config as any).defenseReduction;
              }

              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 50;
              const projY = unit.y + 30;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'dart',
                color: '#3498db',
                rotation: angle
              }]);

              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target!.x + 20,
                y: target!.y + 20,
                createdAt: now,
                color: '#3498db'
              }]);

              playSFX('/PaintBALLER/Sound/PaintballerFire.ogg');
              
              let nextBurstCount = unit.burstRemaining || 0;
              if (config.burstCount) {
                if (nextBurstCount === 0) {
                  nextBurstCount = config.burstCount - 1;
                } else {
                  nextBurstCount -= 1;
                }
              }

              return { 
                ...unit, 
                lastAttackTime: now, 
                targetId: target.id, 
                burstRemaining: nextBurstCount 
              };
            }
          }
        }

        // 1.8 Assassin Combat
        if (unit.unitType === 'assassin') {
          const config = ASSASSIN_LEVELS[unit.level] as any;
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            const rangePx = (config.range || 5) * CELL_SIZE;
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.x < unit.x + rangePx && 
                z.hp > 0 && 
                (!z.isHidden || config.hasHiddenDetection)
              )
              .sort((a,b) => a.x - b.x)[0];
              
            if (target) {
              const damage = (target.isTank && !config.hasLeadDetection) ? 1 : config.damage;
              target.hp -= damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;
              unit.damageSinceLastFan = (unit.damageSinceLastFan || 0) + damage;
              unit.slashCount = (unit.slashCount || 0) + 1;
              
              // Spawning hit visual
              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target.x + 20,
                y: target.y + 20,
                createdAt: now,
                color: '#e74c3c'
              }]);
              
              // Assassin sound (Metallic click/slash)
              playSFX('/Sniper/Sound/Sniper_Reload.ogg'); 
              
              // Whirlwind logic
              if (config.hasWhirlwind && unit.slashCount % 3 === 0) {
                 playSFX('/Sniper/Sound/Demoman/Sound/DemomanFire1.ogg'); // High impact Area sound
                 const whirangePx = config.whirlwindRange * CELL_SIZE;
                 nextZombies.forEach(z => {
                   const dx = z.x - unit.x;
                   const dy = z.y - unit.y;
                   const dist = Math.sqrt(dx * dx + dy * dy);
                   if (dist <= whirangePx && z.hp > 0 && (!z.isHidden || config.hasHiddenDetection)) {
                      const wDmg = (z.isTank && !config.hasLeadDetection) ? 1 : config.whirlwindDamage;
                      z.hp -= wDmg;
                      unit.totalDamageDealt += wDmg;
                      unit.damageSinceLastFan! += wDmg;
                   }
                 });
                 // ADD GREEN CIRCLE ANIMATION
                 const hitId = Math.random().toString(36).substr(2, 9);
                 setHits(prev => [...prev, {
                   id: hitId,
                   x: unit.x + 50,
                   y: unit.y + 50,
                   createdAt: now,
                   color: '#2ecc71',
                   type: 'whirlwind'
                 }]);
              }
              
              // Fan of Knives logic
              if (config.hasFan && (unit.damageSinceLastFan || 0) >= config.fanThreshold) {
                 unit.damageSinceLastFan = 0;
                 const fanTargets = nextZombies
                    .filter(z => z.hp > 0 && z.x > unit.x && z.x < unit.x + config.fanRange * CELL_SIZE && (!z.isHidden || config.hasHiddenDetection))
                    .sort((a,b) => a.x - b.x)
                    .slice(0, 5); // Target up to 5 zombies
                 
                 fanTargets.forEach((z, idx) => {
                    const fDmg = (z.isTank && !config.hasLeadDetection) ? 1 : config.fanDamage;
                    z.hp -= fDmg;
                    unit.totalDamageDealt += fDmg;

                    // ADD KNIFE PROJECTILE ANIMATION
                    if (idx === 0) playSFX('/PaintBALLER/Sound/PaintballerFire.ogg');
                    const dx = z.x - unit.x;
                    const dy = z.y - unit.y;
                    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

                    setProjectiles(prev => [...prev, {
                       id: Math.random().toString(36).substr(2, 9),
                       x: unit.x + 50,
                       y: unit.y + 50,
                       targetX: z.x + 30,
                       targetY: z.y + 40,
                       type: 'knife',
                       color: '#bdc3c7',
                       rotation: rotation,
                       duration: 0.3 + (idx * 0.05) // Staggered knives
                    }]);
                 });
              }

              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }

        // 1.9 Militant Combat
        if (unit.unitType === 'militant') {
          const config = MILITANT_LEVELS[unit.level];
          if (now - (unit.lastAttackTime || 0) >= config.interval) {
            const target = nextZombies
              .filter(z => 
                z.row === unit.row && 
                z.x > unit.x && 
                z.hp > 0 && 
                (!z.isHidden || config.hasHiddenDetection) &&
                (!z.isFlying || config.hasFlyingDetection)
              )
              .sort((a, b) => a.x - b.x)[0];

            if (target) {
              const damage = (target.isTank) ? 1 : config.damage;
              target.hp -= damage;
              unit.totalDamageDealt = (unit.totalDamageDealt || 0) + damage;

              const projId = Math.random().toString(36).substr(2, 9);
              const projX = unit.x + 70; // Weapon muzzle offset
              const projY = unit.y + 40;
              const angle = Math.atan2((target.y + 40) - projY, target.x - projX) * 180 / Math.PI;

              setProjectiles(prev => [...prev, {
                id: projId,
                x: projX,
                y: projY,
                targetX: target.x,
                targetY: target.y + 40,
                type: 'bullet',
                color: '#f1c40f',
                rotation: angle,
                duration: 0.2
              }]);

              setHits(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: target.x + 20,
                y: target.y + 20,
                createdAt: now,
                color: '#f1c40f'
              }]);

              return { ...unit, lastAttackTime: now, targetId: target.id };
            }
          }
        }

        return unit;
      });

      if (spawnSound) playSFX('/Farm/Upgrade/Sounds/FarmCash.ogg');

      // Cleanup effects
      setHits(prev => prev.filter(h => now - h.createdAt < 600));
    }

    // 1.5 Lawnmower Movement
    nextLawnmowers = nextLawnmowers.map(mower => {
      if (mower.isTriggered && !mower.isDone) {
        const nextX = mower.x + 12; // Mower speed
        if (nextX > COLS * CELL_SIZE) return { ...mower, x: nextX, isDone: true };
        
        // Kill zombies in path (mutating local nextZombies)
        nextZombies = nextZombies.map(z => {
          if (z.row === mower.row && Math.abs(z.x - mower.x) < CELL_SIZE) {
            return { ...z, hp: 0 };
          }
          return z;
        });
        
        return { ...mower, x: nextX };
      }
      return mower;
    });

      // 2. Zombie Movement & Combat
      if (!isPausedZombies) {
        const unitDamageMap = new Map<string, number>();
        const processedZombies: Zombie[] = [];

        nextZombies.forEach(zombie => {
          // Handle rewards for dead zombies
          if (zombie.hp <= 0) {
            const configDifficulty = DIFFICULTY_CONFIG[difficulty];
            totalMoneyDelta += Math.floor(zombie.reward * configDifficulty.moneyMult);

            if (zombie.zombieType === 'BREAKER2') {
               const breaker = getZombieData('BREAKER', zombie.row);
               breaker.x = zombie.x;
               processedZombies.push(breaker);
            }
            return;
          }

          // Handle Health Regen
          let updatedHp = zombie.hp;
          let lastRegenTime = zombie.lastRegenTime || now;
          if (zombie.isRegen && now - lastRegenTime >= 2000) {
            const regenAmount = zombie.baseMaxHp * 0.02;
            updatedHp = Math.min(zombie.maxHp, updatedHp + regenAmount);
            lastRegenTime = now;
          }

          let isBlocked = false;
          let targetUnitId: string | null = null;

        // Collision check
        if (!zombie.isStunned) {
          for (const unit of nextUnits) {
            if (unit.row === zombie.row) {
              const dist = Math.abs(zombie.x - unit.x);
              if (dist < CELL_SIZE * 0.75) {
                isBlocked = true;
                targetUnitId = unit.id;
                break;
              }
            }
          }
        }

        if (isBlocked && targetUnitId) {
          if (!isPausedUnits) {
            unitDamageMap.set(targetUnitId, (unitDamageMap.get(targetUnitId) || 0) + zombie.damage);
          }
          processedZombies.push({ ...zombie, hp: updatedHp, lastRegenTime, isEating: true });
        } else {
          // Slow/Freeze Logic
          let moveSpeedMult = 1.0;
          if (zombie.isFrozen && now < zombie.frozenUntil) {
            moveSpeedMult = 0;
          } else {
            if (zombie.isFrozen) {
              zombie.isFrozen = false;
              zombie.chillAmount = 0;
            }
            if (zombie.chillAmount > 0) {
              const sc = (zombie as any).slowCap || 0.5;
              moveSpeedMult = (1 - (zombie.chillAmount * sc));
            }
          }

          if (!zombie.isStunned || zombie.hasBossAttribute) {
            const movement = (zombie.isStunned && zombie.hasBossAttribute) 
              ? (zombie.speed * moveSpeedMult * scaledDelta * 0.3) 
              : (zombie.speed * moveSpeedMult * scaledDelta);
            const nextX = zombie.x - movement;
            
            const mower = nextLawnmowers.find(m => m.row === zombie.row && !m.isTriggered && !m.isDone);
            if (nextX < 20 && mower) {
              nextLawnmowers = nextLawnmowers.map(m => m.id === mower.id ? { ...m, isTriggered: true } : m);
              processedZombies.push({ ...zombie, hp: updatedHp, lastRegenTime, x: nextX });
              return;
            }

            if (nextX < -50) {
              setLives(prev => {
                const damageTaken = Math.ceil(updatedHp);
                const nextLives = prev - damageTaken;
                if (nextLives <= 0) setGameOver(true);
                setScreenShake(10);
                setTimeout(() => setScreenShake(0), 500);
                return Math.max(0, nextLives);
              });
              return;
            }
            processedZombies.push({ ...zombie, hp: updatedHp, lastRegenTime, x: nextX, isEating: false });
          } else {
            processedZombies.push({ ...zombie, hp: updatedHp, lastRegenTime, isEating: false });
          }
        }
      });

      nextZombies = processedZombies;

      // Apply Damage to Units locally
      if (unitDamageMap.size > 0 && !isPausedUnits) {
        nextUnits = nextUnits.map(u => {
          if (unitDamageMap.has(u.id)) {
            const damage = unitDamageMap.get(u.id)!;
            return { ...u, hp: u.hp - damage };
          }
          return u;
        }).filter(u => u.hp > 0);
      }
    }

    // 3. Spawning & Wave Logic
    if (!isPausedZombies) {
      const config = DIFFICULTY_CONFIG[difficulty];
      
      if (zombiesToSpawn > 0) {
        spawnTimerRef.current += scaledDelta;
        if (spawnTimerRef.current > (5000 / wave) * config.spawnRateMult) { 
          const newZ = getZombieData();
          nextZombies.push(newZ);
          setZombiesToSpawn(prev => prev - 1);
          spawnTimerRef.current = 0;
        }
      } else if (nextZombies.length === 0 && isWaveActive) {
        setIsWaveActive(false);
        if (isInfiniteMode || wave < config.maxWaves) {
          setTimeout(() => startWave(wave + 1), 3000);
        } else {
          setGameState('gameOver');
        }
      }
    }

    // --- State Commit ---
    setUnits(nextUnits);
    setZombies(nextZombies);
    setLawnmowers(nextLawnmowers);
    if (totalMoneyDelta > 0 && !isInfiniteMoney) {
      setMoney(m => m + totalMoneyDelta);
    }

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [units, zombies, zombiesToSpawn, isWaveActive, wave, getZombieData, isPausedUnits, isPausedZombies, isInfiniteMoney, isPaused, showModConsole, gameOver, difficulty, startWave, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = (keySequence + e.key).slice(-4);
      setKeySequence(newSequence);
      if (newSequence === '2317') {
        setShowModConsole(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);

  useEffect(() => {
    if (!gameOver) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [updateGame, gameOver]);

  // --- Actions ---

  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return;

    const existingUnit = units.find(u => u.row === row && Math.floor(u.x / CELL_SIZE) === col);
    
    if (existingUnit) {
      setSelectedUnitId(existingUnit.id);
      setSelectedSeed(null);
      return;
    }

    if (!selectedSeed) return;

    const ut = selectedSeed as UnitType;
    const levels = getLevels(ut);
    
    const cost = Math.floor(levels[0].cost);
    if (isInfiniteMoney || money >= cost) {
      const newUnit: Unit = {
        id: Math.random().toString(36).substr(2, 9),
        type: ut, // matched UnitType to EntityType in BaseEntity correctly
        unitType: ut,
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
        row,
        hp: levels[0].hp,
        maxHp: levels[0].hp,
        level: 0,
        lastAttackTime: Date.now(),
        lastProductionTime: ut === 'farm' ? Date.now() : undefined,
        isStunImmune: ut === 'sniper' || ut === 'farm' || ut === 'demoman',
        totalDamageDealt: 0,
        burstRemaining: 0
      };
      setUnits(prev => [...prev, newUnit]);
      if (!isInfiniteMoney) setMoney(prev => Math.max(0, prev - cost));
      setSelectedSeed(null);
    }
    setSelectedUnitId(null);
  };

  const handleUpgrade = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    const levels = getLevels(unit.unitType);
    
    if (unit.level >= levels.length - 1) return;

    const currentConfig = levels[unit.level];
    const upgradeCost = Math.floor(currentConfig.upgradeCost);

    if (isInfiniteMoney || money >= upgradeCost) {
      if (!isInfiniteMoney) setMoney(prev => Math.max(0, prev - upgradeCost));
      setUnits(prev => prev.map(u => {
        if (u.id === unitId) {
          const nextConfig = levels[u.level + 1];
          return {
            ...u,
            level: u.level + 1,
            hp: nextConfig.hp,
            maxHp: nextConfig.hp,
            isStunImmune: u.isStunImmune || (u.unitType === 'freezer' && u.level + 1 >= 3), // Example immunity
          };
        }
        return u;
      }));
      setSelectedUnitId(null);
    }
  };

  const handleSell = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      const levels = getLevels(unit.unitType);
      const sellPrice = Math.floor(levels[unit.level].sellPrice);
      setMoney(prev => prev + sellPrice);
      setUnits(prev => prev.filter(u => u.id !== unitId));
    }
    setSelectedUnitId(null);
  };

  const startGame = (diff: Difficulty) => {
    // Resume audio context if the browser suspended it
    if (typeof window !== 'undefined' && (window as any).AudioContext) {
      const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    }
    setDifficulty(diff);
    setTempDifficulty(diff);
    setIsInfiniteMode(diff === 'Infinite');
    setGameState('loadout');
  };

  const confirmLoadout = () => {
    if (!tempDifficulty) return;
    const diff = tempDifficulty;
    setGameState('playing');
    setMoney(DIFFICULTY_CONFIG[diff].startingMoney);
    setUnits([]);
    setZombies([]);
    setLives(100);
    setGameOver(false);
    setIsPaused(false);
    setSelectedSeed(null);
    setSelectedUnitId(null);
    setWave(1);
    setZombiesToSpawn(0);
    setIsWaveActive(false);
    setShowFinalWave(false);
    setSkyMoney([]);
    lastSkyMoneyTimeRef.current = Date.now();
    setGameStartTime(Date.now());
    
    const mowers: Lawnmower[] = Array.from({ length: ROWS }).map((_, i) => ({
      id: `mower-${i}`,
      row: i,
      x: -40,
      isTriggered: false,
      isDone: false
    }));
    setLawnmowers(mowers);
    setTimeout(() => startWave(1), 1000);
  };

  const toggleUnitInLoadout = (ut: UnitType) => {
    setSelectedLoadout(prev => {
      if (prev.includes(ut)) {
        return prev.filter(u => u !== ut);
      }
      if (prev.length >= 5) return prev;
      return [...prev, ut];
    });
  };

  const resetGame = () => {
    setGameState('menu');
    setUnits([]);
    setZombies([]);
    setLawnmowers([]);
    setLives(100);
    setGameOver(false);
    setIsPaused(false);
    setSelectedSeed(null);
    setSelectedUnitId(null);
    spawnTimerRef.current = 0;
  };

  const useAbility = (unitId: string, abilityName: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    const now = gameTimeRef.current;
    const cooldowns = unit.abilityCooldowns || {};
    if (cooldowns[abilityName] && now < cooldowns[abilityName]) return;

    if (abilityName === 'Frost Grenade') {
      const targetZombies = zombies
        .filter(z => z.hp > 0 && z.row === unit.row)
        .sort((a, b) => a.x - b.x)
        .slice(0, 5);

      if (targetZombies.length === 0) return;

      setUnits(prev => prev.map(u => u.id === unitId ? {
        ...u,
        abilityCooldowns: { ...cooldowns, [abilityName]: now + 15000 }
      } : u));
      
      playSFX('/PaintBALLER/Sound/PaintballerFire.ogg');
      
      // Spawn Grenade Projectile
      const targetX = targetZombies[0].x;
      const targetY = targetZombies[0].y + 40;
      
      setProjectiles(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        x: unit.x + 50,
        y: unit.y + 30,
        targetX: targetX,
        targetY: targetY,
        type: 'grenade',
        color: '#3498db',
        rotation: 0,
        duration: 0.8
      }]);

      // Delay hit to match projectile arrival
      setTimeout(() => {
        setHits(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          x: targetX,
          y: targetY,
          createdAt: gameTimeRef.current,
          color: '#3498db'
        }]);

        setZombies(prev => {
          return prev.map(z => {
            const isTarget = targetZombies.some(tz => tz.id === z.id);
            if (isTarget) {
              return {
                ...z,
                isFrozen: true,
                frozenUntil: gameTimeRef.current + 6000,
                chillAmount: 1
              };
            }
            return z;
          });
        });
      }, 800);
      
      playSFX('/Sniper/Sound/Demoman/Sound/DemomanFire1.ogg');
    }
  };

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  return (
    <div className={`min-h-screen flex items-center justify-center p-0 overflow-hidden transition-colors duration-500 ${
      difficulty === 'Insane' ? 'bg-[#1a0505]' : 
      difficulty === 'Hard' ? 'bg-[#1a1a1a]' : 
      'bg-[#050505]'
    }`}>
      <motion.div 
        animate={screenShake > 0 ? {
          x: [0, -screenShake, screenShake, -screenShake, 0],
          y: [0, screenShake, -screenShake, screenShake, 0],
          scale: typeof window !== 'undefined' ? Math.max(0.2, Math.min(window.innerWidth / 1100, window.innerHeight / 850)) : 1
        } : {
          scale: typeof window !== 'undefined' ? Math.max(0.2, Math.min(window.innerWidth / 1100, window.innerHeight / 850)) : 1
        }}
        transition={{ duration: 0.1, repeat: screenShake > 0 ? 5 : 0 }}
        className={`w-[1100px] h-[850px] relative border-8 border-ui-border shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden origin-center ${
          DIFFICULTY_CONFIG[difficulty].background
        }`}
      >
        {gameState === 'menu' && (
          <div className="absolute inset-0 z-[5000] flex items-center justify-center">
            {/* Dark background for menu */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a1a] border-8 border-ui-border rounded-[40px] p-8 max-w-xl w-full shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-10 relative overflow-y-auto max-h-[95%]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-accent-yellow" />
              
              <h1 className="text-6xl font-black text-white mb-2 text-center uppercase tracking-tighter italic drop-shadow-[0_4px_0_rgba(255,193,7,0.5)]">
                {t('title')}
              </h1>
              <p className="text-white/40 text-center font-bold uppercase tracking-[4px] text-xs mb-6">{t('subtitle')}</p>
              
              <div className="flex justify-center gap-2 mb-8 bg-black/20 p-2 rounded-2xl">
                {(Object.keys(TRANSLATIONS) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${
                      language === lang ? 'bg-accent-yellow text-black' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
                  const diffKey = diff.toLowerCase().replace(' ', '') as keyof typeof TRANSLATIONS.en;
                  return (
                    <button
                      key={diff}
                      onClick={() => startGame(diff)}
                      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-between border-4 ${
                        diff === 'Very Easy' ? 'bg-[#9C27B0]/20 border-[#9C27B0] text-[#E1BEE7]' :
                        diff === 'Easy' ? 'bg-[#4CAF50]/20 border-[#4CAF50] text-[#C8E6C9]' :
                        diff === 'Normal' ? 'bg-[#2196F3]/20 border-[#2196F3] text-[#BBDEFB]' :
                        diff === 'Hard' ? 'bg-[#FF9800]/20 border-[#FF9800] text-[#FFE0B2]' :
                        diff === 'Infinite' ? 'bg-[#795548]/30 border-[#5D4037] text-[#D7CCC8]' :
                        'bg-[#F44336]/20 border-[#F44336] text-[#FFCDD2]'
                      }`}
                    >
                      <div className="flex flex-col items-start relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black uppercase tracking-tight italic">{t(diffKey as string)}</span>
                        </div>
                        <span className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                          {diff === 'Very Easy' ? t('relaxed') : diff === 'Insane' ? t('ultimate') : diff === 'Infinite' ? t('farwest') : t('standard')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black opacity-40 uppercase">{t('starting')}</span>
                          <span className="text-xl font-black italic tracking-tighter">${DIFFICULTY_CONFIG[diff].startingMoney}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <TrendingUp size={24} />
                        </div>
                      </div>

                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowAlmanac(true)}
                className="w-full mt-6 bg-[#816b1e] text-white py-4 rounded-3xl font-black text-xl uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0_6px_0_#5D4636] border-2 border-white/10"
              >
                {t('openAlmanac')}
              </button>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[5px]">{t('version')}</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Loadout Selection Screen */}
        {gameState === 'loadout' && (
          <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-sm z-[5000] flex items-center justify-center p-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border-8 border-ui-border rounded-[40px] p-8 max-w-4xl w-full shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-10 relative overflow-y-auto max-h-[95%]"
            >
              <div className="text-center mb-8">
                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 italic drop-shadow-[0_4px_0_rgba(255,193,7,0.5)]">{t('selectLoadout')}</h2>
                <p className="text-white/40 font-bold uppercase tracking-[4px] text-xs">{t('maxUnits')}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {ALL_UNIT_TYPES.map((unit) => {
                  const isSelected = selectedLoadout.includes(unit.type);
                  return (
                    <button
                      key={unit.type}
                      onClick={() => toggleUnitInLoadout(unit.type)}
                      className={`group relative p-6 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
                        isSelected 
                          ? 'bg-accent-yellow/20 border-accent-yellow scale-105 shadow-[0_0_30px_rgba(241,196,15,0.4)]' 
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-24 h-24 bg-black/40 rounded-2xl mb-3 flex items-center justify-center p-3">
                        <img 
                          src={unit.icon} 
                          alt={unit.type} 
                          className={`w-full h-full object-contain transition-all duration-300 ${isSelected ? 'scale-110 rotate-3' : 'opacity-40 grayscale group-hover:opacity-60'} ${unit.type === 'freezer' ? 'scale-x-[-1]' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className={`text-base font-black uppercase italic tracking-tighter text-center ${isSelected ? 'text-white' : 'text-white/30'}`}>
                        {t(unit.nameKey)}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center shadow-lg border-4 border-[#1a1a1a]">
                          <Shield size={16} className="text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setGameState('menu')}
                  className="flex-1 bg-white/5 text-white/50 py-4 rounded-3xl font-black text-xl uppercase italic tracking-tighter border-4 border-white/5 hover:bg-white/10"
                >
                  {t('back')}
                </button>
                <button 
                  onClick={confirmLoadout}
                  disabled={selectedLoadout.length === 0}
                  className={`flex-[2] py-4 rounded-3xl font-black text-2xl uppercase italic tracking-tighter transition-all shadow-[0_8px_0_#27ae60] border-4 border-white/10 ${
                    selectedLoadout.length > 0 
                      ? 'bg-[#2ecc71] text-white hover:scale-[1.02] active:shadow-none translate-y-[-2px]' 
                      : 'bg-gray-500 text-white/50 cursor-not-allowed opacity-50 shadow-none'
                  }`}
                >
                  {t('confirmLoadout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Game UI - Only during playing */}
        {gameState === 'playing' && (
          <>
            {/* Top Bar - Multi-element panels */}
            <div className="absolute top-5 left-5 right-5 flex items-center gap-3 z-[100] h-[90px]">
              {/* Resource Panel */}
              <div className="flex gap-2 shrink-0 h-full items-center">
                {/* Wave Counter */}
                <div className="bg-ui-bg border-2 border-ui-border rounded-xl px-3 py-1 flex flex-col justify-center min-w-[70px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                   <span className="text-[8px] font-black text-white/50 uppercase leading-none mb-0.5">{t('wave')}</span>
                   <span className="text-xl font-black text-accent-yellow [text-shadow:2px_2px_0px_rgba(0,0,0,0.5)] tabular-nums">
                     #{wave}
                   </span>
                </div>
 
                {/* Money Box */}
                <div className="bg-ui-bg border-2 border-ui-border rounded-xl px-3 py-1 flex items-center gap-2 min-w-[120px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                  <div className="w-8 h-7 bg-[#27ae60] border border-money-green rounded relative flex flex-col justify-center items-center after:content-[''] after:absolute after:w-full after:h-1.5 after:bg-white after:opacity-80">
                    <img 
                      src="/Random icon/Cash_Icon.webp" 
                      alt="Money" 
                      className="w-5 h-5 object-contain relative z-10" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/50 uppercase leading-none mb-0.5">{t('money')}</span>
                    <span className="text-lg font-bold text-money-green [text-shadow:2px_2px_0px_rgba(0,0,0,0.5)] tabular-nums leading-none">
                      {isInfiniteMoney ? '∞' : `$${money.toLocaleString()}`}
                    </span>
                  </div>
                </div>
 
                {/* Base Health Panel */}
                <div className="bg-ui-bg border-2 border-ui-border rounded-xl px-3 py-1 flex items-center gap-2 min-w-[120px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                  <div className="w-8 h-7 bg-danger-red border border-[#922b21] rounded flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/50 uppercase leading-none mb-0.5">{t('lives')}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          initial={{ width: '100%' }}
                          animate={{ width: `${lives}%` }}
                          className={`h-full ${lives > 50 ? 'bg-money-green' : lives > 20 ? 'bg-orange-500' : 'bg-danger-red'}`}
                        />
                      </div>
                      <span className="text-base font-bold text-white tabular-nums">
                        {lives}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Unit selection bar - Compacted and Small */}
              <div className="bg-ui-bg border-2 border-ui-border rounded-xl flex-none flex items-center justify-center px-1 gap-1 h-full">
                {selectedLoadout.map((ut) => {
                  const levels = getLevels(ut);
                  const cost = Math.floor(levels[0].cost);
                  const isSelected = selectedSeed === ut;
                  
                  return (
                    <button
                      key={ut}
                      onClick={() => setSelectedSeed(isSelected ? null : ut)}
                      className={`w-[46px] h-[64px] rounded-lg border-2 relative cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${ 
                        isSelected 
                          ? 'bg-[#EBDCB2] border-accent-yellow border-2 -translate-y-1' 
                          : 'bg-[#D7C6A3] border-[#8B6B4C] hover:border-white/30'
                      } ${money < cost && !isInfiniteMoney ? 'opacity-50 grayscale' : ''}`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mb-0.5">
                        <img src={levels[0].icon || levels[0].appearance} alt={ut} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="bg-[#6D4C41] text-white text-[7px] font-black px-1 py-0.5 rounded-md">
                        ${cost}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Game Speed Controls */}
              <div className="flex flex-col bg-ui-bg border-2 border-ui-border rounded-xl p-1 gap-0.5 h-full min-w-[60px] justify-center items-center shadow-[0_4px_0_rgba(0,0,0,0.3)] shrink-0">
                <span className="text-[7px] font-black text-white/50 uppercase leading-none">Speed</span>
                <div className="grid grid-cols-2 gap-0.5">
                  {[0.5, 1.0, 1.5, 2.0].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setGameSpeed(speed)}
                      className={`text-[8px] font-black px-1 py-0.5 rounded transition-colors ${
                        gameSpeed === speed ? 'bg-accent-yellow text-black' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Abilities Panel */}
              <div className="flex flex-col bg-ui-bg border-2 border-ui-border rounded-xl p-1 gap-0.5 h-full min-w-[80px] justify-center items-center shadow-[0_4px_0_rgba(0,0,0,0.3)] shrink-0 overflow-hidden">
                <span className="text-[7px] font-black text-white/50 uppercase leading-none">Abilities</span>
                <div className="flex gap-1 items-center justify-center h-full">
                  {units.filter(u => (getLevels(u.unitType)[u.level] as any).hasAbility).length === 0 ? (
                    <div className="w-10 h-10 bg-black/20 border-2 border-white/5 rounded-xl flex items-center justify-center p-1 overflow-hidden" />
                  ) : (
                    <button 
                      onClick={() => {
                        const readyUnit = units.find(u => 
                          (getLevels(u.unitType)[u.level] as any).hasAbility && 
                          !(u.abilityCooldowns?.['Frost Grenade'] && gameTimeRef.current < (u.abilityCooldowns as any)['Frost Grenade'])
                        );
                        if (readyUnit) useAbility(readyUnit.id, 'Frost Grenade');
                      }}
                      className="relative group active:scale-95 transition-transform"
                    >
                       <div className="w-10 h-10 bg-blue-900/40 border-2 border-blue-400/50 rounded-xl flex items-center justify-center p-1 overflow-hidden shadow-inner">
                         <img src="/Freezer/Ability/Jester_Ability.webp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                         <div className="absolute -top-1 -right-1 bg-accent-yellow text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a1a1a] shadow-lg">
                           {units.filter(u => (getLevels(u.unitType)[u.level] as any).hasAbility && !(u.abilityCooldowns?.['Frost Grenade'] && gameTimeRef.current < (u.abilityCooldowns as any)['Frost Grenade'])).length}
                         </div>
                       </div>
                    </button>
                  )}
                </div>
              </div>
 
              {/* Menu Button */}
              <button 
                onClick={() => setIsPaused(true)}
                className="bg-ui-bg border-2 border-ui-border rounded-xl px-4 hover:bg-ui-border transition-colors text-white text-sm font-black uppercase tracking-tighter flex items-center justify-center shrink-0 h-full"
              >
                {t('menu')}
              </button>
            </div>

            {/* Game Board */}
            <div className={`absolute top-[150px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] border-4 border-[#334411] shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] ${
              difficulty === 'Very Easy' ? 'bg-[#FFD54F] border-[#816b1e]' : 
              difficulty === 'Easy' ? 'bg-[#5D4636] border-[#3B2D21]' :
              difficulty === 'Normal' ? 'bg-[#4a4a4a] border-[#333]' :
              difficulty === 'Infinite' ? 'bg-[#d2b48c] border-[#5D4037]' :
              'bg-grass-dark'
            }`}>
          {/* Far West Mode Decorations */}
          {difficulty === 'Infinite' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {/* Desert Ground Patterns */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-30 mix-blend-multiply" />
               
               {/* Cacti */}
               <div className="absolute bottom-10 left-5 text-4xl grayscale brightness-125 filter drop-shadow-lg">🌵</div>
               <div className="absolute top-20 right-10 text-5xl grayscale brightness-125 filter drop-shadow-lg">🌵</div>
               <div className="absolute top-1/2 left-2 text-2xl opacity-60">🌵</div>
               
               {/* Skulls and Bones */}
               <div className="absolute bottom-5 right-20 text-3xl opacity-50 contrast-125">💀</div>
               <div className="absolute top-10 left-[40%] text-2xl opacity-40">🦴</div>
               <div className="absolute bottom-1/4 right-[5%] text-2xl opacity-40 rotate-45">🦴</div>
               
               {/* Tumbleweeds (Animated) */}
               {Array.from({ length: 3 }).map((_, i) => (
                 <motion.div
                   key={i}
                    initial={{ x: 1000, y: 300 + i * 50 }}
                    animate={{ 
                      x: -200, 
                      rotate: 720,
                      y: [300 + i * 50, 280 + i * 50, 310 + i * 50, 300 + i * 50]
                    }}
                    transition={{ 
                      duration: 10 + i * 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: i * 3
                    }}
                    className="absolute text-3xl filter saturate-50 brightness-75"
                 >
                   🪹
                 </motion.div>
               ))}

               {/* Distant Mountains / Horizon Glow */}
               <div className="absolute bottom-0 inset-x-0 h-24 bg-orange-950/20 blur-xl" />
               
               {/* Sun Flare */}
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-400/10 rounded-full blur-[100px]" />
            </div>
          )}
          {/* Normal Difficulty Decorations */}
          {difficulty === 'Normal' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
               {/* Ground Cracks effect */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cracked-dirt.png')] opacity-20 mix-blend-overlay" />
               <div className="absolute top-2 left-10 text-4xl grayscale brightness-50">🪨</div>
               <div className="absolute bottom-5 right-20 text-3xl grayscale brightness-50">🪨</div>
               <div className="absolute top-1/2 left-5 text-2xl filter grayscale brightness-50 contrast-150">🌲</div>
               <div className="absolute top-1/4 right-8 text-2xl filter grayscale brightness-50 contrast-150 rotate-12">🌲</div>
               <div className="absolute top-[60%] right-[10%] text-3xl filter grayscale brightness-50">🦴</div>
               <div className="absolute top-10 right-1/4 w-32 h-32 bg-purple-900/30 rounded-full blur-[60px] animate-pulse" />
               <div className="absolute top-12 right-[26%] text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] filter hue-rotate(280deg)">🌀</div>
               <div className="absolute bottom-10 left-[40%] text-2xl opacity-30">💀</div>
            </div>
          )}

          {/* Hard Difficulty Decorations (Industrial Factory) */}
          {difficulty === 'Hard' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
               {/* Concrete and smoke overlay */}
               <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
               
               {/* Left Factory Side */}
               <div className="absolute top-5 left-5 w-32 h-48 bg-slate-800 border-r-4 border-slate-900 rounded-lg shadow-2xl flex flex-col justify-end p-2">
                 <div className="w-full h-4 bg-orange-500/20 mb-2 border-t border-white/5" />
                 <div className="w-full h-4 bg-orange-500/20 mb-2 border-t border-white/5" />
                 <div className="w-full h-4 bg-orange-500/20 border-t border-white/5" />
               </div>
               
               {/* Chimneys */}
               <div className="absolute -top-10 left-10 flex gap-4">
                 {[1, 2].map(i => (
                   <div key={i} className="w-8 h-24 bg-slate-700 border-x-2 border-slate-900 relative">
                     <div className="absolute -top-4 left-0 w-full h-4 bg-red-600 border-y-2 border-slate-900" />
                     {/* Smoke particles */}
                     <motion.div 
                       animate={{ 
                         y: [-20, -100], 
                         x: [0, 20, -20, 0], 
                         opacity: [0.5, 0], 
                         scale: [1, 4] 
                       }}
                       transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                       className="absolute -top-20 left-0 w-8 h-8 bg-slate-400 rounded-full blur-xl"
                     />
                   </div>
                 ))}
               </div>

               {/* Right Side Infrastructure */}
               <div className="absolute top-1/4 right-[2%] w-20 h-40 border-l-8 border-slate-800 flex flex-col gap-4">
                 <div className="w-full h-8 bg-slate-700/50 rounded-l" />
                 <div className="w-full h-8 bg-slate-700/50 rounded-l" />
               </div>

               {/* Pipes */}
               <div className="absolute bottom-10 right-20 w-48 h-8 bg-slate-600 border-y-4 border-slate-900 flex items-center justify-around overflow-hidden">
                 <div className="w-2 h-full bg-slate-900" />
                 <div className="w-2 h-full bg-slate-900" />
                 <div className="w-2 h-full bg-slate-900" />
               </div>

               {/* Large Moon/Sun */}
               <div className="absolute top-10 right-20 w-40 h-40 bg-orange-100 rounded-full blur-[2px] opacity-40 shadow-[0_0_100px_rgba(255,255,255,0.3)]" />

               {/* Hazard Cones */}
               <div className="absolute bottom-5 left-1/4 text-2xl">⚠️</div>
               <div className="absolute top-5 right-1/3 text-2xl opacity-40">🚧</div>
            </div>
          )}

          {/* Insane Difficulty Decorations (Lava Apocalypse) */}
          {difficulty === 'Insane' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {/* Lava Floor Glow */}
               <div className="absolute inset-x-0 bottom-0 h-48 bg-orange-600/30 blur-[100px] animate-pulse" />
               
               {/* Floating Rocks / Volcanic islands */}
               <div className="absolute top-10 left-[15%] text-6xl drop-shadow-[0_0_20px_rgba(255,69,0,0.5)] grayscale brightness-50 contrast-150">🪨</div>
               <div className="absolute bottom-20 right-[10%] text-7xl drop-shadow-[0_0_20px_rgba(255,69,0,0.5)] grayscale brightness-50 contrast-150 -rotate-45">🪨</div>
               
               {/* Demonic Pillars / Tentacles */}
               <div className="absolute -left-10 top-1/2 w-24 h-[400px] bg-red-950/80 rounded-full blur-xl animate-pulse -translate-y-1/2" />
               <div className="absolute -right-10 top-1/4 w-32 h-[500px] bg-red-950/80 rounded-full blur-xl animate-pulse -translate-y-1/2 rotate-12" />
               
               {/* Ash Particles */}
               {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ 
                     x: Math.random() * 1100, 
                     y: -50, 
                     opacity: Math.random(), 
                     scale: Math.random() * 0.5 + 0.5 
                   }}
                   animate={{ 
                     y: 850, 
                     x: (Math.random() - 0.5) * 300 + (Math.random() * 1100),
                     opacity: [0, 0.8, 0],
                     rotate: 360
                   }}
                   transition={{ 
                     duration: Math.random() * 5 + 5, 
                     repeat: Infinity, 
                     delay: Math.random() * 8 
                   }}
                   className="absolute w-1.5 h-1.5 bg-slate-500/40 rounded-full blur-[1px]"
                 />
               ))}

               {/* Hellscape color grading */}
               <div className="absolute inset-0 bg-red-900/10 mix-blend-hard-light" />
            </div>
          )}
          <div 
            className="grid h-full"
            style={{ 
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gridTemplateColumns: `repeat(${COLS}, 1fr)`
            }}
          >
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS);
              const c = i % COLS;
              const isVeryEasy = difficulty === 'Very Easy';
              const isEasy = difficulty === 'Easy';
              const isHard = difficulty === 'Hard';
              
              return (
                <div
                  key={i}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-full h-full border border-black/5 transition-all duration-200 cursor-pointer flex items-center justify-center relative ${
                    isVeryEasy 
                      ? (r + c) % 2 === 0 ? 'bg-[#FFE082]' : 'bg-[#FFD54F]'
                      : isEasy
                        ? (r + c) % 2 === 0 ? 'bg-[#8B6B4C]' : 'bg-[#5D4636]'
                        : isHard
                          ? (r + c) % 2 === 0 ? 'bg-slate-500' : 'bg-slate-600'
                          : difficulty === 'Insane'
                            ? (r + c) % 2 === 0 ? 'bg-[#150a0a]' : 'bg-[#1a0505]'
                            : (r + c) % 2 === 0 ? 'bg-grass-light' : 'bg-grass-dark'
                  } hover:bg-white/20 hover:scale-[0.98] active:scale-95`}
                />
              );
            })}
          </div>

          {/* Sky Money Drops */}
          <div className="absolute inset-0 pointer-events-none z-[1000] overflow-hidden">
            <AnimatePresence>
              {skyMoney.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ y: -100, x: m.x, opacity: 0 }}
                  animate={{ y: m.y, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onMouseEnter={() => {
                    if (m.collected) return;
                    const amount = Math.floor(100 * DIFFICULTY_CONFIG[difficulty].moneyMult);
                    setMoney(prev => prev + amount);
                    setSkyMoney(prev => prev.map(moneyItem => 
                      moneyItem.id === m.id ? { ...moneyItem, collected: true } : moneyItem
                    ));
                    playSFX('/Farm/Upgrade/Sounds/FarmCash.ogg');
                  }}
                  whileHover={{ scale: 1.2 }}
                  className={`absolute w-16 h-16 pointer-events-auto cursor-pointer flex items-center justify-center ${m.collected ? 'hidden' : ''}`}
                >
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ 
                        boxShadow: ["0 0 10px gold", "0 0 30px gold", "0 0 10px gold"],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-yellow-500/20 rounded-full border-4 border-yellow-400"
                    />
                    <img src="/Random icon/Cash_Icon.webp" alt="Cash" className="w-10 h-10 relative z-10" />
                    <span className="absolute -bottom-4 text-money-green font-black text-[10px] drop-shadow-md">
                      ${Math.floor(100 * DIFFICULTY_CONFIG[difficulty].moneyMult)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Projectiles Layer */}
          <div className="absolute inset-0 pointer-events-none z-[1400]">
            <AnimatePresence>
              {projectiles.map(proj => (
                <motion.div
                  key={proj.id}
                  initial={{ x: proj.x, y: proj.y, opacity: 1, scale: 0.8 }}
                  animate={{ 
                    x: proj.targetX, 
                    y: proj.type === 'grenade' 
                      ? [proj.y, proj.y - 180, proj.y - 220, proj.y - 180, proj.targetY]
                      : [proj.y, proj.targetY],
                    rotate: proj.type === 'grenade' ? [0, 360, 720, 1080] : proj.rotation, 
                    scale: proj.type === 'knife' ? [0.8, 1.5, 1.2] : [0.8, 1.2, 1] 
                  }}
                  transition={{ duration: proj.duration || 0.25, ease: proj.type === 'grenade' ? "easeOut" : "linear" }}
                  onAnimationComplete={() => {
                    setProjectiles(prev => prev.filter(p => p.id !== proj.id));
                  }}
                  className="absolute pointer-events-none"
                  style={{
                    width: proj.type === 'grenade' ? 40 : proj.type === 'sniper-bullet' ? 24 : proj.type === 'knife' ? 30 : proj.type === 'paintball' ? 12 : 16,
                    height: proj.type === 'grenade' ? 40 : proj.type === 'sniper-bullet' ? 6 : proj.type === 'knife' ? 10 : proj.type === 'paintball' ? 12 : 6,
                    zIndex: 1500
                  }}
                >
                  {proj.type === 'grenade' ? (
                    <img src="/Freezer/Ability/DefaultFreezeNade.webp" className="w-full h-full object-contain drop-shadow-[0_0_10px_#3498db]" referrerPolicy="no-referrer" />
                  ) : proj.type === 'knife' ? (
                    <div className="w-full h-full relative group">
                        <div 
                          className="w-full h-full bg-gradient-to-r from-gray-400 to-white rounded-l-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                          style={{
                             clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'
                          }}
                        />
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-900 rounded-r-md" />
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full"
                      style={{
                        backgroundColor: proj.color,
                        borderRadius: proj.type === 'paintball' ? '50%' : '4px',
                        boxShadow: `0 0 12px ${proj.color}`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Hit Effects Layer */}
          <div className="absolute inset-0 pointer-events-none z-[1600]">
            <AnimatePresence>
              {hits.map(hit => (
                <motion.div
                  key={hit.id}
                  initial={hit.type === 'whirlwind' ? { scale: 0, opacity: 1, rotate: 0 } : { scale: 0, opacity: 1, rotate: Math.random() * 360 }}
                  animate={hit.type === 'whirlwind' 
                    ? { scale: [0, 4, 3], opacity: [0, 1, 0], rotate: 720 } 
                    : { scale: [1, 4, 3], opacity: [1, 1, 0] }
                  }
                  transition={{ duration: hit.type === 'whirlwind' ? 0.5 : 0.2 }}
                  className="absolute pointer-events-none"
                  style={{
                    left: hit.x,
                    top: hit.y,
                    width: hit.type === 'whirlwind' ? 150 : 30,
                    height: hit.type === 'whirlwind' ? 150 : 30,
                    backgroundColor: hit.type === 'whirlwind' ? 'transparent' : hit.color,
                    borderRadius: hit.type === 'whirlwind' ? '50%' : '20%',
                    filter: 'blur(1px)',
                    boxShadow: hit.type === 'whirlwind' 
                      ? 'none' 
                      : `0 0 20px ${hit.color}, 0 0 40px ${hit.color}`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1600,
                    border: hit.type === 'whirlwind' ? '6px double #2ecc71' : 'none'
                  }}
                >
                  {hit.type === 'whirlwind' && (
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-green-500/10 rounded-full blur-md" />
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.8, 0], rotate: [0, 180] }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 border-r-[12px] border-l-[12px] border-white/40 rounded-full" 
                        />
                        <div className="absolute inset-0 border-2 border-green-400/50 rounded-full" />
                        <div className="absolute inset-1/4 border-4 border-white/20 rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

            <AnimatePresence>
              {moneyParticles.map(particle => (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    opacity: 0,
                    scale: 0.5,
                    y: 0,
                    x: 0
                  }}
                  animate={{ 
                    y: [0, -20, -particle.y - 130],
                    x: [0, -20, -particle.x - 120],
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1.3, 1, 0.2]
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.1, 1],
                    ease: "circIn"
                  }}
                  exit={{ opacity: 0 }}
                  onAnimationComplete={() => {
                    setMoneyParticles(prev => prev.filter(p => p.id !== particle.id));
                  }}
                  className="absolute w-16 h-16 flex flex-col items-center justify-center pointer-events-none z-[2000]"
                  style={{
                    left: particle.x + 20,
                    top: particle.y + 10
                  }}
                >
                  <div className="bg-money-green/30 backdrop-blur-md border-2 border-money-green rounded-full p-2.5 shadow-[0_0_15px_rgba(39,174,96,0.4)]">
                    <img src="/Random icon/Cash_Icon.webp" alt="Cash" className="w-7 h-7 object-contain" />
                  </div>
                  <span className="text-money-green font-black text-sm drop-shadow-[0_2px-2px_rgba(0,0,0,1)] uppercase mt-1">
                    +${particle.amount}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Entities Layer */}
            <div className="absolute inset-0 pointer-events-none">
            {units.map(unit => {
              const isProducing = Date.now() - unit.lastProductionTime < 500;
              return (
                <motion.div
                  key={unit.id}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: isProducing ? [1, 1.4, 1.1, 1.2, 1] : 1,
                    rotate: isProducing ? [0, -5, 5, -5, 5, 0] : 0,
                    y: isProducing ? [0, -10, 0] : 0
                  }}
                  transition={{
                    scale: { duration: 0.6, ease: "easeOut" },
                    rotate: { duration: 0.6 },
                    y: { duration: 0.6 }
                  }}
                  className="absolute flex items-center justify-center pointer-events-auto cursor-pointer"
                  data-unit-type={unit.unitType}
                  style={{ 
                    width: 100, 
                    height: 100, 
                    left: unit.x, 
                    top: unit.y
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUnitId(unit.id);
                  }}
                >
                  <div className={`relative w-24 h-24 flex items-center justify-center ${selectedUnitId === unit.id ? 'drop-shadow-[0_0_8px_gold]' : ''}`}>
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, -1, 1, 0]
                      }}
                      transition={{
                        duration: 3 + Math.random(),
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <motion.div
                        key={unit.unitType === 'farm' ? unit.lastProductionTime : unit.lastAttackTime}
                        initial={{ x: 0, scale: 1 }}
                        animate={
                          unit.unitType === 'farm' && unit.lastProductionTime && (Date.now() - unit.lastProductionTime < 500) ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, -5, 5, 0]
                          } :
                          unit.lastAttackTime && (Date.now() - unit.lastAttackTime < 100) ? {
                            x: ['demoman', 'soldier', 'shotgunner', 'sniper'].includes(unit.unitType) ? -10 : 10,
                            scale: [1, 1.1, 1]
                          } : {}
                        }
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img 
                          src={
                            unit.unitType === 'farm' ? FARM_LEVELS[unit.level].appearance :
                            unit.unitType === 'scout' ? SCOUT_LEVELS[unit.level].appearance :
                            unit.unitType === 'sniper' ? SNIPER_LEVELS[unit.level].appearance :
                            unit.unitType === 'demoman' ? DEMOMAN_LEVELS[unit.level].appearance :
                            unit.unitType === 'soldier' ? SOLDIER_LEVELS[unit.level].appearance :
                            unit.unitType === 'shotgunner' ? SHOTGUNNER_LEVELS[unit.level].appearance :
                            unit.unitType === 'freezer' ? FREEZER_LEVELS[unit.level].appearance :
                            unit.unitType === 'assassin' ? ASSASSIN_LEVELS[unit.level].appearance :
                            PAINTBALLER_LEVELS[unit.level].appearance
                          } 
                          alt={unit.unitType} 
                          className={`w-full h-full object-contain p-1 ${['demoman', 'soldier', 'shotgunner', 'freezer', 'assassin'].includes(unit.unitType) ? '' : 'scale-x-[-1]'}`}
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}

            {zombies.map(zombie => (
              <motion.div
                key={zombie.id}
                className="absolute flex items-center justify-center cursor-pointer"
                style={{ 
                  width: 900 / COLS, 
                  height: 500 / ROWS, 
                  left: (zombie.x / (COLS * CELL_SIZE)) * 900, 
                  top: (zombie.y / (ROWS * CELL_SIZE)) * 500,
                  transform: `scale(${(zombie.isBloated ? 1.4 : 1) * (zombie.isTank ? 1.5 : 1)})`,
                  zIndex: 10 + zombie.row
                }}
                animate={zombie.isFrozen ? {
                   scale: 1,
                   rotate: 0,
                   x: 0,
                   y: 0
                } : zombie.isEating ? {
                  scale: [1, 1.1, 1],
                  translateX: [0, -5, 0]
                } : {
                  rotate: [0, -2, 2, 0],
                  translateY: [0, -2, 0],
                  x: zombie.chillAmount > 0 ? [0, -1, 1, -1, 1, 0] : 0
                }}
                transition={{
                  duration: zombie.isFrozen ? 0.1 : zombie.isEating ? 0.3 : (zombie.chillAmount > 0 ? 0.1 : 0.6),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={() => {
                  setZombies(prev => prev.map(z => z.id === zombie.id ? { ...z, hp: z.hp - 1 } : z));
                }}
              >
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Frozen/Ice Block Overlay */}
                  {zombie.isFrozen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.15 }}
                      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-full h-full bg-blue-300/40 border-[6px] border-blue-100/60 rounded-xl backdrop-blur-[2px] shadow-[inset_0_0_30px_white,0_0_20px_#3498db]" />
                      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/ice-age.png')] invert scale-125" />
                      <div className="absolute top-1 right-2 text-white/50 text-[8px] font-black rotate-45 select-none">ICE</div>
                    </motion.div>
                  )}
                  {/* Boss Attribute Indicator */}
                  {zombie.hasBossAttribute && (
                    <motion.div
                      initial={{ scale: 0, y: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.2, 1, 1, 0], 
                        y: [0, -45, -45, -45, -60],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        times: [0, 0.1, 0.2, 0.8, 1],
                        ease: "easeOut"
                      }}
                      className="absolute z-[60] bg-purple-600 border-2 border-purple-400 rounded-lg px-2 py-0.5 shadow-[0_0_10px_purple]"
                    >
                      <span className="text-[10px] font-black text-white italic uppercase tracking-tighter text-nowrap">BOSS APPEARED!</span>
                    </motion.div>
                  )}
                  {/* Stun Stars Animation */}
                  {zombie.isStunned && (
                    <div className="absolute -top-6 inset-x-0 flex justify-center z-50 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            rotate: 360,
                            x: [Math.cos(i * 120 * Math.PI / 180) * 20, Math.cos((i * 120 + 360) * Math.PI / 180) * 20],
                            y: [Math.sin(i * 120 * Math.PI / 180) * 10, Math.sin((i * 120 + 360) * Math.PI / 180) * 10]
                          }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="absolute text-yellow-400 text-lg font-bold"
                          style={{ textShadow: '0 0 5px gold' }}
                        >
                          ⭐
                        </motion.div>
                      ))}
                    </div>
                  )}
               <img 
                    src={zombie.zombieType === 'SLOW'
                      ? `/Enemys/Normal/Slow/SlowAnim${zombie.variant % 2 + 1}.webp`
                      : zombie.zombieType === 'SPEEDY' 
                      ? `/Enemys/Normal/Speedy/SpeedyAnim${zombie.variant % 2 + 1}.webp`
                      : zombie.zombieType === 'NORMAL_BOSS'
                      ? `/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/EasyModeNormalBoss.webp`
                      : zombie.zombieType === 'HIDDEN'
                      ? `/Enemys/Normal/Hidden/HiddenV5.webp`
                      : zombie.zombieType === 'BREAKER2'
                      ? `/Enemys/Normal/Breakers/Breaker2/Breaker2Fallen.webp`
                      : zombie.zombieType === 'BREAKER'
                      ? `/Enemys/Normal/Breakers/Breaker/BreakerFallen.webp`
                      : `/Enemys/Normal/NormalAnim${zombie.variant % 2 + 1}.webp`} 
                    alt="Zombie" 
                    className={`w-full h-full object-contain ${zombie.isStunned ? 'brightness-75' : ''}`}
                    style={{
                      filter: [
                        zombie.isBloated ? 'sepia(0.5) hue-rotate(-50deg) saturate(1.5)' : '',
                        zombie.isTank ? 'drop-shadow(0 0 8px rgba(0,0,0,0.4))' : '',
                      ].filter(Boolean).join(' ') || 'none'
                    }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-emoji')) {
                        const emoji = document.createElement('div');
                        emoji.className = 'fallback-emoji text-3xl opacity-80';
                        emoji.innerText = zombie.isBloated ? '👹' : '🧟';
                        parent.appendChild(emoji);
                      }
                    }}
                  />
                </div>
                {/* Zombie HP */}
                <div className={`absolute -top-3 left-1 right-1 h-3.5 ${zombie.hasBossAttribute || (zombie.zombieType === 'NORMAL_BOSS' && !introducedTypesRef.current.has('NORMAL_BOSS')) ? 'bg-purple-600' : 'bg-danger-red'} rounded-sm border border-black/30 flex items-center justify-center shadow-lg`}>
                   <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    HP: {Math.ceil(zombie.hp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lawnmowers Layer */}
        <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none">
          {lawnmowers.map(mower => (
            <motion.div
              key={mower.id}
              animate={{ x: (mower.x / (COLS * CELL_SIZE)) * 900 }}
              transition={{ ease: "linear", duration: 0.1 }}
              className="absolute w-20 h-20 flex items-center justify-center"
              style={{
                top: (mower.row / ROWS) * 500,
                left: 0
              }}
            >
              {!mower.isDone && (
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Fire Trail Effect */}
                  {mower.isTriggered && (
                    <div className="absolute inset-y-0 -left-20 right-0 z-0">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.9, scale: 0.5, x: 80 }}
                          animate={{ 
                            opacity: 0, 
                            scale: [1, 2.5, 3], 
                            x: [80, -20, -100],
                            y: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.3 + Math.random() * 0.2, 
                            delay: i * 0.05 
                          }}
                          className={`absolute right-0 w-12 h-12 rounded-full blur-[10px] ${
                            i % 3 === 0 ? 'bg-orange-600' : i % 3 === 1 ? 'bg-red-500' : 'bg-yellow-400'
                          }`}
                        />
                      ))}
                      {/* Heat Glow */}
                      <div className="absolute inset-0 bg-orange-500/30 blur-[40px] animate-pulse" />
                    </div>
                  )}
                  
                  <img 
                    src="/Random icon/HeatwaveConsumable.webp" 
                    alt="Heatwave" 
                    className={`w-full h-full object-contain relative z-10 scale-x-[-1] drop-shadow-[0_0_15px_rgba(255,100,0,0.8)] ${mower.isTriggered ? 'animate-pulse scale-125' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Heat Trail Particles */}
                  {mower.isTriggered && (
                    <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(255, 100, 0, 0.5)",
                            "0 0 40px rgba(255, 200, 0, 0.8)",
                            "0 0 20px rgba(255, 100, 0, 0.5)"
                          ]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-16 h-16 rounded-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contextual Upgrade Menu */}
        <AnimatePresence>
          {selectedUnit && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute w-[320px] bg-[#1a1a1a]/95 border-2 border-accent-yellow/50 rounded-3xl p-5 z-[1000] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
              style={{
                left: Math.min(Math.max((selectedUnit.x / CELL_SIZE) * (900 / COLS) + 120, 50), 750),
                top: selectedUnit.row > 2 
                  ? (selectedUnit.y / CELL_SIZE) * (500 / ROWS) - 220 
                  : (selectedUnit.y / CELL_SIZE) * (500 / ROWS) + 50
              }}
            >
              {(() => {
                const levels = getLevels(selectedUnit.unitType);
                const currentData = levels[selectedUnit.level];
                const nextData = levels[selectedUnit.level + 1];
                const isMax = selectedUnit.level >= levels.length - 1;

                // Explicitly cast for TS property access
                const cur = currentData as any;
                const nxt = nextData as any;

                const nextDetections = !isMax ? {
                  hidden: nxt.hasHiddenDetection && !cur.hasHiddenDetection,
                  lead: nxt.hasLeadDetection && !cur.hasLeadDetection,
                  flying: nxt.hasFlyingDetection && !cur.hasFlyingDetection,
                } : null;

                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center p-1">
                          <img 
                            src={isMax ? cur.icon || cur.appearance : nxt.icon || nxt.appearance} 
                            alt="Current"
                            className="w-full h-full object-contain drop-shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white italic leading-none tracking-tighter">
                            {cur.name}
                          </h3>
                          <span className="text-[10px] font-bold text-accent-yellow uppercase tracking-widest bg-accent-yellow/10 px-2 py-0.5 rounded">
                            LV. {selectedUnit.level}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedUnitId(null)}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-danger-red transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {selectedUnit.unitType === 'farm' ? (
                      !isMax ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-white/30 uppercase font-black mb-1">{t('prod')}</span>
                               <span className="text-sm font-bold text-white">${cur.production}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-money-green uppercase font-black mb-1">{t('next')}</span>
                               <span className="text-sm font-bold text-money-green">${nxt.production}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpgrade(selectedUnit.id)}
                            disabled={!isInfiniteMoney && money < cur.upgradeCost}
                            className="group w-full h-14 bg-money-green hover:bg-[#2ecc71] active:translate-y-1 transition-all rounded-2xl flex items-center justify-between px-6 shadow-[0_6px_0_#1e8449] disabled:opacity-50 disabled:grayscale disabled:shadow-none disabled:translate-y-1"
                          >
                            <span className="text-lg font-black text-white italic tracking-tighter">{t('upgrade')}</span>
                            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10 group-hover:scale-105 transition-transform">
                              <img src="/Random icon/Cash_Icon.webp" alt="Cash" className="w-3 h-3" />
                              <span className="text-white font-black text-sm">${cur.upgradeCost}</span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-money-green/20 border-4 border-money-green p-8 rounded-3xl text-center shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                          <span className="text-6xl font-black text-money-green italic tracking-tighter uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-2 block">{t('max')}</span>
                          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                             <span className="text-[10px] text-white/30 uppercase font-black mb-1">Produzione Finale</span>
                             <span className="text-2xl font-bold text-money-green">${cur.production}</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="space-y-4">
                        {/* Stat Pair 1: Damage & Firerate */}
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-black/20 p-2 rounded-xl flex flex-col items-center">
                          <span className="text-[8px] text-white/30 uppercase font-black">{t('damage')}</span>
                          <span className="text-sm font-bold text-white tracking-tighter">{cur.damage}</span>
                       </div>
                       <div className="bg-black/20 p-2 rounded-xl flex flex-col items-center">
                          <span className="text-[8px] text-white/30 uppercase font-black">{t('firerate')}</span>
                          <span className="text-sm font-bold text-white tracking-tighter">{(1000/cur.interval).toFixed(2)}/s</span>
                       </div>
                    </div>

                    {/* Detections & Special */}
                    <div className="flex flex-wrap gap-1.5 justify-center">
                       {cur.hasHiddenDetection && (
                         <span className="text-[7px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-black uppercase">Hidden Detection</span>
                       )}
                       {cur.hasLeadDetection && (
                         <span className="text-[7px] bg-slate-500/20 text-slate-300 border border-slate-500/30 px-1.5 py-0.5 rounded font-black uppercase">Lead Detection</span>
                       )}
                       {cur.hasFlyingDetection && (
                         <span className="text-[7px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-black uppercase">Flying Detection</span>
                       )}
                       {cur.hasWhirlwind && (
                          <div className="flex flex-col items-center w-full mt-3 bg-black/60 p-4 rounded-2xl border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <div className="flex items-center gap-2 mb-2">
                              <img src="/Assassin/Passive Ability Icons/WhirlwindSlashPassive.webp" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" referrerPolicy="no-referrer" />
                              <span className="text-xs text-green-400 font-black uppercase drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">Whirlwind Slash</span>
                            </div>
                            <div className="w-full h-5 bg-black/80 rounded-full border-2 border-white/20 overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,1)]">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-green-600 via-green-400 to-green-300 shadow-[0_0_15px_#22c55e]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((selectedUnit.slashCount || 0) % 3) / 3 * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p className="text-[10px] text-white/50 mt-1.5 font-bold italic">Trigger on 3rd hit (AoE Damage)</p>
                          </div>
                       )}
                       {cur.hasFan && (
                          <div className="flex flex-col items-center w-full mt-3 bg-black/60 p-4 rounded-2xl border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <div className="flex items-center gap-2 mb-2">
                              <img src="/Assassin/Passive Ability Icons/FanofKnivesPassive.webp" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" referrerPolicy="no-referrer" />
                              <span className="text-xs text-red-500 font-black uppercase drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">Fan of Knives</span>
                            </div>
                            <div className="w-full h-5 bg-black/80 rounded-full border-2 border-white/20 overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,1)]">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-red-600 via-red-400 to-red-300 shadow-[0_0_15px_#ef4444]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (selectedUnit.damageSinceLastFan || 0) / 500 * 100)}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <p className="text-[10px] text-white/50 mt-1.5 font-bold italic">DMG CHARGE: {Math.floor(selectedUnit.damageSinceLastFan || 0)} / 500</p>
                          </div>
                       )}

  {cur.splashRange && (
    <span className="text-[7px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded font-black uppercase">Splash Area: {cur.splashRange}</span>
  )}
                       
                       {/* Unlocked in next level */}
                       {nextDetections?.hidden && (
                         <span className="text-[7px] bg-purple-600 text-white animate-pulse px-1.5 py-0.5 rounded font-black uppercase">+ Hidden Detection</span>
                       )}
                       {nextDetections?.lead && (
                         <span className="text-[7px] bg-slate-600 text-white animate-pulse px-1.5 py-0.5 rounded font-black uppercase">+ Lead Detection</span>
                       )}
                       {nextDetections?.flying && (
                         <span className="text-[7px] bg-blue-600 text-white animate-pulse px-1.5 py-0.5 rounded font-black uppercase">+ Flying Detection</span>
                       )}
                    </div>

                        {!isMax ? (
                           <>
                             <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                               <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{t('upgradeEffect')}</p>
                               <p className="text-sm font-black text-accent-yellow italic">
                                 {nxt.description}
                               </p>
                             </div>

                             <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                               <div className="flex flex-col items-center">
                                  <span className="text-[8px] text-white/30 uppercase font-black mb-1">STAT.</span>
                                  <span className="text-sm font-bold text-white">{cur.damage} | {(1000/cur.interval).toFixed(1)}/s</span>
                               </div>
                               <div className="w-px h-8 bg-white/10" />
                               <div className="flex flex-col items-center">
                                  <span className="text-[8px] text-money-green uppercase font-black mb-1">{t('next')}</span>
                                  <span className="text-sm font-bold text-money-green">{nxt.damage} | {(1000/nxt.interval).toFixed(1)}/s</span>
                               </div>
                             </div>

                             <button
                               onClick={() => handleUpgrade(selectedUnit.id)}
                               disabled={!isInfiniteMoney && money < cur.upgradeCost}
                               className="group w-full h-14 bg-money-green hover:bg-[#2ecc71] active:translate-y-1 transition-all rounded-2xl flex items-center justify-between px-6 shadow-[0_6px_0_#1e8449] disabled:opacity-50 disabled:grayscale disabled:shadow-none disabled:translate-y-1"
                             >
                               <span className="text-lg font-black text-white italic tracking-tighter">{t('upgrade')}</span>
                               <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10 group-hover:scale-105 transition-transform">
                                 <img src="/Random icon/Cash_Icon.webp" alt="Cash" className="w-3 h-3" />
                                 <span className="text-white font-black text-sm">${cur.upgradeCost}</span>
                               </div>
                             </button>
                           </>
                        ) : (
                          <div className="bg-money-green/20 border-4 border-money-green p-8 rounded-3xl text-center shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                            <span className="text-6xl font-black text-money-green italic tracking-tighter uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-2 block">{t('max')}</span>
                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                              <div className="flex flex-col items-center">
                                 <span className="text-[9px] text-white/30 uppercase font-black mb-1">{t('damage')}</span>
                                 <span className="text-xl font-bold text-white">{cur.damage}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                 <span className="text-[9px] text-white/30 uppercase font-black mb-1">{t('firerate')}</span>
                                 <span className="text-xl font-bold text-white">{(1000/cur.interval).toFixed(1)}/s</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                    
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center mt-3">
                       <span className="text-[10px] text-white/30 uppercase font-black mb-1">Danno Totale</span>
                       <span className="text-xl font-bold text-accent-yellow">{Math.floor(selectedUnit.totalDamageDealt).toLocaleString()}</span>
                    </div>

                      {(getLevels(selectedUnit.unitType)[selectedUnit.level] as any).hasAbility && (
                        <button
                          onClick={() => useAbility(selectedUnit.id, 'Frost Grenade')}
                          disabled={selectedUnit.abilityCooldowns?.['Frost Grenade'] && gameTimeRef.current < selectedUnit.abilityCooldowns['Frost Grenade']}
                          className="mt-3 w-full h-16 bg-blue-600 hover:bg-blue-500 active:translate-y-1 transition-all rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_0_#2980b9] disabled:opacity-50 disabled:grayscale disabled:shadow-none overflow-hidden"
                        >
                           <div className="w-full h-full p-2 relative flex items-center justify-center">
                             <img src="/Freezer/Ability/Jester_Ability.webp" className="h-full object-contain" />
                             {selectedUnit.abilityCooldowns?.['Frost Grenade'] && gameTimeRef.current < selectedUnit.abilityCooldowns['Frost Grenade'] && (
                               <div 
                                 className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-white"
                                 style={{
                                   height: `${Math.max(0, (selectedUnit.abilityCooldowns['Frost Grenade'] - gameTimeRef.current) / 15000 * 100)}%`,
                                   top: 'auto',
                                   bottom: 0
                                 }}
                               />
                             )}
                           </div>
                        </button>
                      )}

                    <button 
                      onClick={() => handleSell(selectedUnit.id)}
                      className="mt-4 w-full py-2 text-[10px] text-white/40 hover:text-danger-red hover:bg-danger-red/10 rounded-xl uppercase font-bold tracking-widest transition-all flex justify-between px-4 border border-white/5"
                    >
                      <span>{t('sell')}</span>
                      <span className="text-white/60">${Math.floor(cur.sellPrice)}</span>
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {showFinalWave && (
          <motion.div 
            animate={{
              scale: [1, 1.1, 1],
              textShadow: [
                "0 0 10px rgba(255,0,0,0.5)",
                "0 0 30px rgba(255,0,0,1)",
                "0 0 10px rgba(255,0,0,0.5)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/80 px-10 py-2 rounded-full text-xl font-black text-danger-red tracking-[4px] border-2 border-danger-red shadow-[0_0_20px_rgba(255,0,0,0.3)] z-[200]"
          >
            {t('finalWave')}
          </motion.div>
        )}

        {/* Boss HP Bar */}
        {zombies.find(z => z.hasBossAttribute) && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[600px] z-[1000] pointer-events-none">
            {zombies.filter(z => z.hasBossAttribute).map(boss => (
              <div key={boss.id} className="mb-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-purple-400 font-black italic uppercase tracking-tighter text-lg drop-shadow-md">
                    {t(boss.name)}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {Math.ceil(boss.hp)} / {Math.ceil(boss.maxHp)}
                  </span>
                </div>
                <div className="h-4 bg-black/60 rounded-full border-2 border-purple-900/50 overflow-hidden backdrop-blur-sm shadow-lg">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-800 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {/* Mod Console */}
        <AnimatePresence>
          {showModConsole && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-[120px] right-5 z-[3000] w-[280px]"
            >
              <div className="bg-[#1a1a1a]/95 border-4 border-accent-yellow rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
                <button 
                  onClick={() => setShowModConsole(false)}
                  className="absolute top-2 right-2 text-white/50 hover:text-white"
                >
                  <X size={18} />
                </button>
                <h2 className="text-lg font-black text-accent-yellow mb-4 uppercase tracking-tighter">{t('modConsole')}</h2>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setIsInfiniteMoney(!isInfiniteMoney)}
                    className={`${isInfiniteMoney ? 'bg-yellow-500' : 'bg-money-green'} text-white py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all`}
                  >
                    {isInfiniteMoney ? (t('infiniteMoney') + " (ON)") : t('infiniteMoney')}
                  </button>
                  <button 
                    onClick={() => setZombies([])}
                    className="bg-danger-red text-white py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                  >
                    {t('clearZombies')}
                  </button>
                  <button 
                    onClick={() => {
                      setUnits(prev => prev.map(u => {
                        const levels = getLevels(u.unitType);
                        if (u.level >= levels.length - 1) return u;
                        return {
                          ...u,
                          level: u.level + 1,
                        };
                      }));
                    }}
                    className="bg-accent-yellow text-black py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                  >
                    {t('upgradeAll')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setZombies(prev => prev.map(z => ({ ...z, isStunned: !z.isStunned })));
                    }}
                    className="bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                  >
                    {t('stunAll')}
                  </button>
                  
                  <div className="grid grid-cols-1 gap-1">
                    <button 
                      onClick={() => setIsPausedUnits(!isPausedUnits)}
                      className={`${isPausedUnits ? 'bg-blue-600' : 'bg-blue-400'} text-white py-1.5 rounded-lg text-[10px] font-bold`}
                    >
                      {isPausedUnits ? t('unfreezeUnits') : t('freezeUnits')}
                    </button>
                    <button 
                      onClick={() => setIsPausedZombies(!isPausedZombies)}
                      className={`${isPausedZombies ? 'bg-blue-600' : 'bg-blue-400'} text-white py-1.5 rounded-lg text-[10px] font-bold`}
                    >
                      {isPausedZombies ? t('unfreezeZombies') : t('freezeZombies')}
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      setGameOver(false);
                      setZombies([]);
                      setShowModConsole(false);
                      setLives(100);
                    }}
                    className="bg-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                  >
                    {t('revive')}
                  </button>

                  <div className="border-t border-white/10 pt-3 mt-1 space-y-3">
                    {/* Wave Jump */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-accent-yellow font-black uppercase">{t('jumpWave')}</span>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          min="1"
                          max="999"
                          value={modWaveInput}
                          onChange={(e) => setModWaveInput(e.target.value)}
                          className="w-full bg-black/40 border-2 border-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-bold focus:border-accent-yellow outline-none transition-all"
                        />
                        <button 
                          onClick={() => startWave(parseInt(modWaveInput))}
                          className="bg-accent-yellow text-black px-4 py-1.5 rounded-lg text-xs font-black hover:scale-105 active:scale-95 transition-all"
                        >
                          GO
                        </button>
                      </div>
                    </div>

                    {/* Spawn Zombie */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-danger-red font-black uppercase">{t('spawnZombie')}</span>
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        <select 
                          value={modSpawnType}
                          onChange={(e) => setModSpawnType(e.target.value as any)}
                          className="bg-black/60 border border-white/10 rounded-md p-1 text-[10px] text-white outline-none"
                        >
                          {Object.keys(ZOMBIE_TYPES).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <select 
                          value={modSpawnLane}
                          onChange={(e) => setModSpawnLane(parseInt(e.target.value))}
                          className="bg-black/60 border border-white/10 rounded-md p-1 text-[10px] text-white outline-none"
                        >
                          {[0, 1, 2, 3, 4].map(l => (
                            <option key={l} value={l}>{t('lane')} {l+1}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const newZ = getZombieData(modSpawnType, modSpawnLane);
                          setZombies(prev => [...prev, newZ]);
                        }}
                        className="bg-danger-red/80 hover:bg-danger-red text-white py-1.5 rounded-lg text-[10px] font-black transition-all"
                      >
                        SPAWN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Menu */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-[4000] flex items-center justify-center p-6"
            >
              <div className="bg-[#1a1a1a] border-8 border-ui-border rounded-[40px] p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <h2 className="text-5xl font-black text-white mb-10 text-center uppercase tracking-tighter italic">{t('pause')}</h2>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-white/70 font-bold uppercase text-sm tracking-widest">
                      <span>{t('music')}</span>
                      <span>{musicVolume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={musicVolume} 
                      onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                      className="w-full h-3 bg-ui-bg rounded-full appearance-none cursor-pointer accent-accent-yellow"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-white/70 font-bold uppercase text-sm tracking-widest">
                      <span>{t('sfx')}</span>
                      <span>{sfxVolume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={sfxVolume} 
                      onChange={(e) => setSfxVolume(parseInt(e.target.value))}
                      className="w-full h-3 bg-ui-bg rounded-full appearance-none cursor-pointer accent-money-green"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-6">
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="bg-money-green text-white py-4 rounded-2xl font-black text-xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_6px_0_#1e8449]"
                    >
                      {t('resume')}
                    </button>
                    <button 
                      onClick={() => startGame(difficulty)}
                      className="bg-danger-red text-white py-4 rounded-2xl font-black text-xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_6px_0_#922b21]"
                    >
                      {t('restart')}
                    </button>
                    <button 
                      onClick={() => setGameState('menu')}
                      className="bg-[#444] text-white py-4 rounded-2xl font-black text-xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_6px_0_#222]"
                    >
                      {t('mainMenu')}
                    </button>
                    <button 
                      onClick={() => setShowAlmanac(true)}
                      className="bg-[#5D4636] text-white py-4 rounded-2xl font-black text-xl uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_6px_0_#3B2D21]"
                    >
                      {t('zombieBook')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Almanac */}
        <AnimatePresence>
          {showAlmanac && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[6000] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
            >
              <div className="bg-[#5D4636] border-8 border-[#3B2D21] rounded-[40px] p-10 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                ></div>
                
                <h2 className="text-4xl font-black text-[#FFE082] mb-6 text-center uppercase tracking-widest italic drop-shadow-lg">
                  {t('almanacTitle')}
                </h2>

                <div className="flex justify-center gap-4 mb-6">
                  <button 
                    onClick={() => setAlmanacTab('units')}
                    className={`px-6 py-3 rounded-xl font-black uppercase transition-all ${almanacTab === 'units' ? 'bg-[#FFE082] text-[#3B2D21]' : 'bg-[#3B2D21] text-white/50'}`}
                  >
                    {t('unitsTab')}
                  </button>
                  <button 
                    onClick={() => setAlmanacTab('zombies')}
                    className={`px-6 py-3 rounded-xl font-black uppercase transition-all ${almanacTab === 'zombies' ? 'bg-[#FFE082] text-[#3B2D21]' : 'bg-[#3B2D21] text-white/50'}`}
                  >
                    {t('zombiesTab')}
                  </button>
                  <button 
                    onClick={() => setAlmanacTab('attributes')}
                    className={`px-6 py-3 rounded-xl font-black uppercase transition-all ${almanacTab === 'attributes' ? 'bg-[#FFE082] text-[#3B2D21]' : 'bg-[#3B2D21] text-white/50'}`}
                  >
                    {t('attributesTab')}
                  </button>
                </div>

                <div className="bg-[#FFE082]/10 rounded-3xl p-6 border-4 border-[#3B2D21] mb-8 overflow-y-auto flex-grow">
                  {almanacTab === 'attributes' ? (
                    <div className="grid grid-cols-1 gap-6">
                      {[
                        { name: t('attrBloated'), desc: t('attrBloatedDesc'), color: 'text-orange-400', victims: 'Normal, Speedy, Slow' },
                        { name: t('attrTank'), desc: t('attrTankDesc'), color: 'text-gray-400', victims: 'Speedy, Slow' },
                        { name: t('attrNimble'), desc: t('attrNimbleDesc'), color: 'text-yellow-400', victims: 'Slow' },
                        { name: t('attrRegen'), desc: t('attrRegenDesc'), color: 'text-green-400', victims: 'Slow' },
                        { name: t('attrBoss'), desc: t('attrBossDesc'), color: 'text-purple-400', victims: 'Normal Boss' }
                      ].map((attr, i) => (
                        <div key={i} className="bg-[#3B2D21]/50 p-6 rounded-2xl border-2 border-[#3B2D21]">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`text-2xl font-black uppercase ${attr.color}`}>{attr.name}</h4>
                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/60">{t('victims')}: {attr.victims}</span>
                          </div>
                          <p className="text-white/80 text-sm italic">{attr.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : almanacTab === 'zombies' ? (
                    <div className="flex flex-col gap-12">
                      {Object.entries(ZOMBIE_TYPES).map(([key, type]) => (
                        <div key={key} className="flex gap-8 items-start border-b border-[#3B2D21] pb-8 last:border-0">
                          <div className="w-32 h-32 bg-[#3B2D21]/30 rounded-full flex items-center justify-center border-4 border-[#3B2D21] p-4 overflow-hidden relative">
                            <img 
                              src={key === 'NORMAL' 
                                ? "/Enemys/Normal/NormalAnim1.webp" 
                                : key === 'SPEEDY'
                                ? "/Enemys/Normal/Speedy/SpeedyAnim1.webp"
                                : key === 'SLOW'
                                ? "/Enemys/Normal/Slow/SlowAnim1.webp"
                                : key === 'HIDDEN'
                                ? "/Enemys/Normal/Hidden/HiddenV5.webp"
                                : (type as any).image || "/Sniper/Sound/Demoman/Upgrade icon/Soldier/Sound/Normal Boss/EasyModeNormalBoss.webp"
                              } 
                              alt={type.name} 
                              className={`w-full h-full object-contain ${key === 'SPEEDY' ? 'brightness-125 saturate-150 scale-x-[-1]' : ''}`}
                              referrerPolicy="no-referrer"
                            />
                            {key === 'SPEEDY' && (
                              <div className="absolute top-2 right-2 text-xl animate-pulse">⚡</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-black text-white uppercase mb-2">{t('zombieName')}: {t(type.name)}</h3>
                            <p className="text-[#FFE082] italic mb-4">"{t(type.description)}"</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">{t('health')}</p>
                                <p className="text-xl font-bold text-danger-red">{type.baseHp} HP</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">{t('firerate')}</p>
                                <p className="text-xl font-bold text-accent-yellow">{type.speedPerGrid}s/m</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">{t('damage')}</p>
                                <p className="text-xl font-bold text-orange-400">{type.damage}/hit</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">{t('reward')}</p>
                                <p className="text-xl font-bold text-money-green">${type.reward}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-12">
                      {/* Farm */}
                      <div className="flex gap-8 items-start border-b border-[#3B2D21] pb-8">
                        <div className="w-32 h-32 bg-[#27ae60]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src="/Farm/Appearance/Farm0.webp" alt="Farm" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('farmName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('farmDesc')}</p>
                          <div className="grid grid-cols-1 gap-3">
                            {FARM_LEVELS.map((lvl, index) => (
                              <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#3B2D21]/50 rounded border border-[#3B2D21] overflow-hidden p-1">
                                    <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                    <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-white/40 uppercase">{t('production')}</p>
                                  <p className="text-lg font-black text-money-green">${lvl.production}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Scout */}
                      <div className="flex gap-8 items-start border-b border-[#3B2D21] pb-8">
                        <div className="w-32 h-32 bg-[#2980b9]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={SCOUT_LEVELS[0].appearance} alt="Scout" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('scoutName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('scoutDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {SCOUT_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Sniper */}
                      <div className="flex gap-8 items-start">
                        <div className="w-32 h-32 bg-[#e74c3c]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={SNIPER_LEVELS[0].appearance} alt="Sniper" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('sniperName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('sniperDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {SNIPER_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Paintballer */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#e67e22]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={PAINTBALLER_LEVELS[0].appearance} alt="Paintballer" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('paintballerName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('paintballerDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {PAINTBALLER_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   <p className="text-[10px] text-white/40 uppercase font-black">Splash: {lvl.splashRange}</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Soldier */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#27ae60]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={SOLDIER_LEVELS[0].appearance} alt="Soldier" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('soldierName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('soldierDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {SOLDIER_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s (Burst: {lvl.burstCount})</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                   {lvl.hasFlyingDetection && <p className="text-[10px] font-black text-blue-300 italic mt-1 leading-none">Flying Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Shotgunner */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#f1c40f]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={SHOTGUNNER_LEVELS[0].appearance} alt="Shotgunner" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('shotgunnerName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('shotgunnerDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {SHOTGUNNER_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage} x {lvl.bullets}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('range')}: {(lvl.range/100).toFixed(2)} tiles</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                   {lvl.hasLeadDetection && <p className="text-[10px] font-black text-slate-300 italic mt-1 leading-none">Lead Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Demoman */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#c0392b]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={DEMOMAN_LEVELS[0].appearance} alt="Demoman" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('demomanName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('demomanDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {DEMOMAN_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   <p className="text-[10px] text-white/40 uppercase font-black">Splash: {lvl.splashRange}</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                   {lvl.hasLeadDetection && <p className="text-[10px] font-black text-slate-300 italic mt-1 leading-none">Lead Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Freezer */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#3498db]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={FREEZER_LEVELS[0].appearance} alt="Freezer" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('freezerName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('freezerDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {FREEZER_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">Chill: {((lvl as any).maxSlow * 100).toFixed(0)}%</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">Freeze: {(lvl as any).freezeDuration ? (lvl as any).freezeDuration / 1000 : 0}s</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Assassin */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#e74c3c]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={ASSASSIN_LEVELS[0].appearance} alt="Assassin" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('assassinName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('assassinDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {ASSASSIN_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   {lvl.damage > 0 && <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>}
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(2)}s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                   {lvl.hasLeadDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Lead Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Militant */}
                      <div className="flex gap-8 items-start border-t border-[#3B2D21] pt-8">
                        <div className="w-32 h-32 bg-[#34495e]/30 rounded-2xl flex items-center justify-center border-4 border-[#3B2D21] p-4 relative">
                          <img src={MILITANT_LEVELS[0].appearance} alt="Militant" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-black text-white uppercase mb-2">{t('militantName')}</h3>
                          <p className="text-[#FFE082] italic mb-4">{t('militantDesc')}</p>
                          <div className="grid grid-cols-1 gap-4">
                             {MILITANT_LEVELS.map((lvl, index) => (
                               <div key={index} className="bg-[#3B2D21]/50 p-3 rounded-xl border border-[#3B2D21] flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-black/30 rounded overflow-hidden">
                                     <img src={lvl.appearance} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-black text-[#FFE082] uppercase">{t('level')} {index}</p>
                                     <p className="text-[10px] text-white/80 font-bold">{lvl.name}</p>
                                     <p className="text-[9px] text-white/50">{lvl.description}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('damage')}: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">{t('firerate')}: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
                                   {lvl.hasFlyingDetection && <p className="text-[10px] font-black text-blue-300 italic mt-1 leading-none">Flying Detection</p>}
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setShowAlmanac(false)}
                    className="bg-[#3B2D21] text-white px-12 py-4 rounded-2xl font-black text-xl uppercase hover:brightness-125 transition-all shadow-[0_6px_0_#1a120d]"
                  >
                    {t('closeBook')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Result Overlay */}
        {(gameOver || gameState === 'gameOver') && (
          <div className="absolute inset-0 bg-black/95 z-[5000] flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full scale-[0.8] origin-center"
            >
              {lives > 0 ? (
                <div className="mb-8">
                  <motion.div 
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-8xl mb-4"
                  >
                    🏆
                  </motion.div>
                  <h2 className="text-7xl font-black text-money-green italic uppercase drop-shadow-[0_0_20px_rgba(46,204,113,0.5)] leading-none mb-2">
                    {t('gameOverVictory')}
                  </h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest">{t('peak')}</p>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="text-8xl mb-4 grayscale text-accent-yellow">🧟</div>
                  <h2 className="text-7xl font-black text-danger-red italic uppercase drop-shadow-[0_0_20px_rgba(231,76,60,0.5)] leading-none mb-2">
                    {t('gameOverDefeat')}
                  </h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest">{t('zombiesWin')}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">{t('wave')}</span>
                  <span className="text-3xl font-black text-white">{wave}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">{t('money')}</span>
                  <span className="text-3xl font-black text-accent-yellow">${money.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => startGame(difficulty)}
                  className="bg-money-green text-white py-5 rounded-2xl font-black text-2xl uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_8px_0_#1e8449]"
                >
                  {t('restart')}
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="bg-white/10 text-white py-4 rounded-2xl font-black text-xl uppercase tracking-tighter hover:bg-white/20 transition-all"
                >
                  {t('mainMenu')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
