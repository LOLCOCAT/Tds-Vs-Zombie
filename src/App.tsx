/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, TrendingUp, Shield, Trash2, X } from 'lucide-react';

// --- Constants & Types ---

const ROWS = 5;
const COLS = 9;
const CELL_SIZE = 100;
const TICK_RATE = 1000 / 60; // 60 FPS logic

type EntityType = 'farm' | 'zombie';
type Difficulty = 'Very Easy' | 'Easy' | 'Normal' | 'Hard' | 'Insane';
type Language = 'en' | 'it' | 'de' | 'meme' | 'gamer';

const SNIPER_LEVELS = [
  { level: 0, cost: 450, upgradeCost: 200, hp: 100, damage: 10, interval: 5008, sellPrice: 150, hasHiddenDetection: false, hasLeadDetection: false, hasFlyingDetection: true, name: 'Sniper', appearance: '/Sniper/Appearance/DHDefaultSniper0.webp', icon: '/Sniper/Appearance/DHDefaultSniper0.webp', description: 'Attack: 10 | Interval: 5.0s | High range' },
  { level: 1, cost: 0, upgradeCost: 750, hp: 100, damage: 12, interval: 4008, sellPrice: 216, hasHiddenDetection: false, hasLeadDetection: false, hasFlyingDetection: true, name: 'Sniper L1', appearance: '/Sniper/Appearance/DHDefaultSniper1.webp', icon: '/Sniper/Upgrade icon/Common1Image.webp', description: 'Attack: 12 (+2) | Interval: 4.0s' },
  { level: 2, cost: 0, upgradeCost: 2250, hp: 100, damage: 25, interval: 4008, sellPrice: 466, hasHiddenDetection: true, hasLeadDetection: false, hasFlyingDetection: true, name: 'Sniper L2', appearance: '/Sniper/Appearance/DHDefaultSniper2.webp', icon: '/Sniper/Upgrade icon/Sniper2.webp', description: 'Attack: 25 (+13) | +Hidden Detection' },
  { level: 3, cost: 0, upgradeCost: 4500, hp: 100, damage: 60, interval: 4008, sellPrice: 1216, hasHiddenDetection: true, hasLeadDetection: true, hasFlyingDetection: true, name: 'Sniper L3', appearance: '/Sniper/Appearance/DHDefaultSniper3.webp', icon: '/Sniper/Upgrade icon/Sniper3.webp', description: 'Attack: 60 (+35) | +Lead Detection' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 100, interval: 3508, sellPrice: 2716, hasHiddenDetection: true, hasLeadDetection: true, hasFlyingDetection: true, name: 'Sniper L4', appearance: '/Sniper/Appearance/DHDefaultSniper4.webp', icon: '/Sniper/Upgrade icon/Sniper4.webp', description: 'Attack: 100 (+40) | Interval: 3.5s' },
];

const TRANSLATIONS: Record<Language, any> = {
  en: {
    title: 'FARM DEFENSE',
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
    scoutName: "Scout",
    scoutDesc: "Quick unit for early game defense.",
    farmName: "Farm",
    farmDesc: "Produces gold to buy more units.",
    sniperName: "Sniper",
    sniperDesc: "Long-range unit that can hit any lane.",
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
    damage: 'Damage'
  },
  it: {
    title: 'DIFESA FATTORIA',
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
    scoutName: "Scout",
    scoutDesc: "Unità rapida per la difesa iniziale.",
    farmName: "Farm",
    farmDesc: "Produce oro per comprare altre unità.",
    sniperName: "Sniper",
    sniperDesc: "Unità a lungo raggio che può colpire ogni lane.",
    gameOver: 'Fine Giochi',
    reachedFarm: 'Gli zombie hanno invaso la fattoria!',
    finalWealth: 'Ricchezza Finale',
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
    next: 'PROSSIMO',
    upgrade: 'POTENZIA',
    upgradeTo: 'Potenzia a',
    gameOverVictory: 'VITTORIA!',
    gameOverDefeat: 'PARTITA FINITA',
    zombiesWin: 'Gli zombie hanno vinto!',
    upgradeEffect: 'Effetto Upgrade',
    damage: 'Danni'
  },
  de: {
    title: 'BAUERNHOF ABWEHR',
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
    upgrade: 'UPGRADE',
    upgradeTo: 'Verbessern zu',
    gameOverVictory: 'SIEG!',
    gameOverDefeat: 'SPIEL VORBEI',
    zombiesWin: 'Die Zombies haben gewonnen!'
  },
  meme: {
    title: 'PROTECC DA FARM',
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
    unfreezeUnits: 'Running state',
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
    zombiesWin: 'Skibidi Toilet took ur farm!'
  },
  gamer: {
    title: 'GG DEFENSE',
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
    upgradeTo: 'Craft'
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
  type: 'bullet' | 'dart' | 'sniper-bullet';
  color: string;
  rotation: number;
}

interface Hit {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  color: string;
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

type UnitType = 'farm' | 'scout' | 'sniper';

interface Unit extends BaseEntity {
  unitType: UnitType;
  level: number;
  lastProductionTime?: number;
  lastAttackTime?: number;
  isStunImmune: boolean;
}

interface Zombie extends BaseEntity {
  name: string;
  speed: number;
  damage: number;
  isEating: boolean;
  isBloated: boolean;
  isTank: boolean;
  isLead?: boolean;
  isFlying?: boolean;
  reward: number;
  variant: number;
  isStunned: boolean;
  isHidden?: boolean;
}

const ZOMBIE_TYPES = {
  NORMAL: {
    name: 'Normal',
    description: 'Il tuo zombie medio. Non molto intelligente, ma molto persistente.',
    baseHp: 6,
    speedPerGrid: 4.7, // seconds per grid
    reward: 5,
    damage: 0.5,
  },
  SPEEDY: {
    name: 'Speedy',
    description: 'Estremamente veloce e imprevedibile. Difficile da colpire!',
    baseHp: 4,
    speedPerGrid: 1.8,
    reward: 5,
    damage: 0.4,
  },
  TANK: {
    name: 'Tank',
    description: 'Corazzato. Riduce tutto il danno ricevuto (tranne collisioni) a 1 HP.',
    baseHp: 30,
    speedPerGrid: 6.5,
    reward: 15,
    damage: 1.2,
  }
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
  { level: 1, cost: 0, upgradeCost: 375, hp: 100, damage: 1, interval: 775, sellPrice: 58, hasHiddenDetection: false, hasLeadDetection: false, name: 'Scout L1', appearance: '/Scout/Appearance/LO_Scout_1.webp', icon: '/Scout/Upgrade/Scout1.webp', description: 'Firerate: 1.025 > 0.775' },
  { level: 2, cost: 0, upgradeCost: 1350, hp: 100, damage: 3, interval: 775, sellPrice: 183, hasHiddenDetection: true, hasLeadDetection: false, name: 'Scout L2', appearance: '/Scout/Appearance/LO_Scout_2.webp', icon: '/Scout/Upgrade/Scout2.webp', description: 'Sblocca Hidden Detection (+2 Damage)' },
  { level: 3, cost: 0, upgradeCost: 2200, hp: 100, damage: 8, interval: 625, sellPrice: 633, hasHiddenDetection: true, hasLeadDetection: false, name: 'Scout L3', appearance: '/Scout/Appearance/LO_Scout_3.webp', icon: '/Scout/Upgrade/Scout4.webp', description: 'Firerate: 0.775 > 0.625 (+5 Damage)' },
  { level: 4, cost: 0, upgradeCost: 0, hp: 100, damage: 8, interval: 325, sellPrice: 1366, hasHiddenDetection: true, hasLeadDetection: false, name: 'Scout L4', appearance: '/Scout/Appearance/LO_Scout_4.webp', icon: '/Scout/Upgrade/Scout5.webp', description: 'Firerate: 0.625 > 0.325' },
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
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
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
  const [isPausedUnits, setIsPausedUnits] = useState(false);
  const [isPausedZombies, setIsPausedZombies] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [almanacTab, setAlmanacTab] = useState<'zombies' | 'units'>('units');
  const [moneyParticles, setMoneyParticles] = useState<{ id: string; x: number; y: number; amount: number }[]>([]);
  const [skyMoney, setSkyMoney] = useState<{ id: string; x: number; y: number; targetY: number; collected: boolean; createdAt: number }[]>([]);
  const [lives, setLives] = useState(100);
  const [lawnmowers, setLawnmowers] = useState<Lawnmower[]>([]);
  const [showAlmanac, setShowAlmanac] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [wave, setWave] = useState(1);
  const [zombiesToSpawn, setZombiesToSpawn] = useState(0);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [showFinalWave, setShowFinalWave] = useState(false);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const playSFX = useCallback((path: string) => {
    if (sfxVolume <= 0) return;
    try {
      // Direct creation for maximum compatibility
      const audio = new Audio(path);
      audio.volume = sfxVolume / 100;
      audio.play().catch(err => {
        // Log errors to help debugging audio issues
        if (err.name !== 'NotAllowedError') {
          console.warn(`Audio play failed for ${path}:`, err);
        }
      });
    } catch (e) {
      console.error("SFX Execution failed:", e);
    }
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
    
    musicRef.current.volume = musicVolume / 100;
  }, [gameState, isPaused, musicVolume]);
  
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

  const getZombieData = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const row = Math.floor(Math.random() * ROWS);
    
    // Pick random type (Normal 60%, Speedy 30%, Tank 10% after wave 10)
    let typeKey: keyof typeof ZOMBIE_TYPES = 'NORMAL';
    if (wave >= 10 && Math.random() > 0.8) {
      typeKey = 'TANK';
    } else if (wave >= 3 && Math.random() > 0.7) {
      typeKey = 'SPEEDY';
    }
    
    const zombieType = ZOMBIE_TYPES[typeKey];
    const baseHp = zombieType.baseHp * (1 + (wave - 1) * 0.2); // HP scales with wave
    
    // speed is in pixels per ms: grid_size / (seconds * 1000)
    const baseSpeed = (CELL_SIZE / (zombieType.speedPerGrid * 1000)) * (1 + (wave - 1) * 0.05); 
    const baseReward = zombieType.reward;
    const isTank = typeKey === 'TANK' || (wave >= 12 && Math.random() > 0.95);
    const isBloated = !isTank && wave >= 6 && Math.random() > 0.8;
    const isLead = wave >= 8 && Math.random() > 0.7; // Lead property
    const isHidden = wave >= 12 && Math.random() > 0.8;

    let finalHp = isBloated ? baseHp * 2 : baseHp;
    if (isTank) finalHp *= 2.5;

    const newZombie: Zombie = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'zombie',
      name: zombieType.name,
      x: COLS * CELL_SIZE,
      y: row * CELL_SIZE,
      row,
      hp: finalHp,
      maxHp: finalHp,
      speed: isTank ? baseSpeed * 0.6 : baseSpeed,
      damage: zombieType.damage,
      isEating: false,
      isBloated,
      isTank,
      isLead,
      isHidden,
      reward: isBloated ? Math.floor(baseReward * 1.5) : baseReward,
      variant: Math.floor(Math.random() * 3),
      isStunned: false,
    };
    return newZombie;
  }, [difficulty, wave]);

  const startWave = useCallback((waveNum: number) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (waveNum > config.maxWaves) {
      setGameState('gameOver');
      return;
    }
    setWave(waveNum);
    setZombiesToSpawn(5 + waveNum * 3);
    setIsWaveActive(true);
    if (waveNum === 10) {
      setShowFinalWave(true);
      setTimeout(() => setShowFinalWave(false), 5000);
    }
  }, [difficulty]);

  const updateGame = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastTickRef.current;
    lastTickRef.current = now;

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
            const target = nextZombies.find(z => 
              z.row === unit.row && 
              z.x > unit.x && 
              z.hp > 0 && 
              (!z.isHidden || config.hasHiddenDetection)
            );

            if (target) {
              const damage = (target.isTank && !config.hasLeadDetection) ? 1 : config.damage;
              target.hp -= damage;
              
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

              // Scout weapons sound: L0-2 = ScoutFire2, L3-4 = ScoutFire1
              const fireSound = unit.level <= 2 ? '/Scout/Sound/ScoutFire2.ogg' : '/Scout/Sound/ScoutFire1.ogg';
              playSFX(fireSound);
              return { ...unit, lastAttackTime: now };
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
            // Target ANY row, prioritize closest to end (lowest x)
            const target = nextZombies
              .filter(z => z.hp > 0 && (!z.isHidden || config.hasHiddenDetection))
              .sort((a,b) => a.x - b.x)[0];

            if (target) {
              const damage = (target.isTank && !config.hasLeadDetection) ? 1 : config.damage;
              target.hp -= damage;

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

              return { ...unit, lastAttackTime: now };
            }
          }
        }
        return unit;
      });

      if (spawnSound) playSFX('/Farm/Upgrade/Sounds/FarmCash.ogg');

      // Cleanup effects
      setHits(prev => prev.filter(h => now - h.createdAt < 200));
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
          return;
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
          processedZombies.push({ ...zombie, isEating: true });
        } else if (!zombie.isStunned) {
          const movement = zombie.speed * deltaTime;
          const nextX = zombie.x - movement;
          
          const mower = nextLawnmowers.find(m => m.row === zombie.row && !m.isTriggered && !m.isDone);
          if (nextX < 20 && mower) {
            nextLawnmowers = nextLawnmowers.map(m => m.id === mower.id ? { ...m, isTriggered: true } : m);
            // Skip this zombie for now, it will be handled by mower next frame or die
            processedZombies.push({ ...zombie, x: nextX });
            return;
          }

          if (nextX < -50) {
            setLives(prev => {
              const damageTaken = Math.ceil(zombie.hp);
              const nextLives = prev - damageTaken;
              if (nextLives <= 0) setGameOver(true);
              setScreenShake(10);
              setTimeout(() => setScreenShake(0), 500);
              return Math.max(0, nextLives);
            });
            return;
          }
          processedZombies.push({ ...zombie, x: nextX, isEating: false });
        } else {
          processedZombies.push({ ...zombie, isEating: false });
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
        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > (5000 / wave) * config.spawnRateMult) { 
          const newZ = getZombieData();
          nextZombies.push(newZ);
          setZombiesToSpawn(prev => prev - 1);
          spawnTimerRef.current = 0;
        }
      } else if (nextZombies.length === 0 && isWaveActive) {
        setIsWaveActive(false);
        if (wave < config.maxWaves) {
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

    if (selectedSeed === 'farm') {
      const cost = Math.floor(FARM_LEVELS[0].cost);
      if (isInfiniteMoney || money >= cost) {
        const newUnit: Unit = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'farm',
          unitType: 'farm',
          x: col * CELL_SIZE,
          y: row * CELL_SIZE,
          row,
          hp: FARM_LEVELS[0].hp,
          maxHp: FARM_LEVELS[0].hp,
          level: 0,
          lastProductionTime: Date.now(),
          isStunImmune: true,
        };
        setUnits(prev => [...prev, newUnit]);
        if (!isInfiniteMoney) setMoney(prev => Math.max(0, prev - cost));
        setSelectedSeed(null);
      }
    } else if (selectedSeed === 'scout') {
      const cost = Math.floor(SCOUT_LEVELS[0].cost);
      if (isInfiniteMoney || money >= cost) {
        const newUnit: Unit = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'farm',
          unitType: 'scout',
          x: col * CELL_SIZE,
          y: row * CELL_SIZE,
          row,
          hp: SCOUT_LEVELS[0].hp,
          maxHp: SCOUT_LEVELS[0].hp,
          level: 0,
          lastAttackTime: Date.now(),
          isStunImmune: false,
        };
        setUnits(prev => [...prev, newUnit]);
        if (!isInfiniteMoney) setMoney(prev => Math.max(0, prev - cost));
        setSelectedSeed(null);
      }
    } else if (selectedSeed === 'sniper') {
      const cost = Math.floor(SNIPER_LEVELS[0].cost);
      if (isInfiniteMoney || money >= cost) {
        const newUnit: Unit = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'farm', // This internal type 'farm' seems to be used loosely for grid units
          unitType: 'sniper',
          x: col * CELL_SIZE,
          y: row * CELL_SIZE,
          row,
          hp: SNIPER_LEVELS[0].hp,
          maxHp: SNIPER_LEVELS[0].hp,
          level: 0,
          lastAttackTime: Date.now(),
          isStunImmune: true, // Sniper is stun immune per user request
        };
        setUnits(prev => [...prev, newUnit]);
        if (!isInfiniteMoney) setMoney(prev => Math.max(0, prev - cost));
        setSelectedSeed(null);
      }
    }
    setSelectedUnitId(null);
  };

  const handleUpgrade = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    const levels = unit.unitType === 'farm' ? FARM_LEVELS : unit.unitType === 'scout' ? SCOUT_LEVELS : SNIPER_LEVELS;
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
      const levels = unit.unitType === 'farm' ? FARM_LEVELS : unit.unitType === 'scout' ? SCOUT_LEVELS : SNIPER_LEVELS;
      const sellPrice = Math.floor(levels[unit.level].sellPrice);
      setMoney(prev => prev + sellPrice);
      setUnits(prev => prev.filter(u => u.id !== unitId));
    }
    setSelectedUnitId(null);
  };

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
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
    
    // Initialize Lawnmowers
    const mowers: Lawnmower[] = Array.from({ length: ROWS }).map((_, i) => ({
      id: `mower-${i}`,
      row: i,
      x: -40, // Off-screen slightly to the left
      isTriggered: false,
      isDone: false
    }));
    setLawnmowers(mowers);
    
    // Start first wave
    setTimeout(() => startWave(1), 1000);
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
                        'bg-[#F44336]/20 border-[#F44336] text-[#FFCDD2]'
                      }`}
                    >
                      <div className="flex flex-col items-start relative z-10">
                        <span className="text-2xl font-black uppercase tracking-tight italic">{t(diffKey as string)}</span>
                        <span className="text-[10px] font-bold opacity-60 tracking-widest uppercase">
                          {diff === 'Very Easy' ? t('relaxed') : diff === 'Insane' ? t('ultimate') : t('standard')}
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

        {/* Top Bar */}
        <div className="absolute top-5 left-5 right-5 h-[100px] flex gap-5 z-[100]">
          {/* Resource Panel */}
          <div className="flex gap-4">
            <div className="bg-ui-bg border-4 border-ui-border rounded-xl px-5 py-2 flex flex-col justify-center min-w-[120px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
               <span className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">{t('wave')}</span>
               <span className="text-2xl font-black text-accent-yellow [text-shadow:2px_2px_0px_rgba(0,0,0,0.5)] tabular-nums">
                 #{wave}
               </span>
            </div>

            <div className="bg-ui-bg border-4 border-ui-border rounded-xl px-5 py-2 flex items-center gap-4 min-w-[180px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
              <div className="w-12 h-10 bg-[#27ae60] border-2 border-money-green rounded relative flex flex-col justify-center items-center after:content-[''] after:absolute after:w-full after:h-2 after:bg-white after:opacity-80">
                <img 
                  src="/Random icon/Cash_Icon.webp" 
                  alt="Money" 
                  className="w-8 h-8 object-contain relative z-10" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">{t('money')}</span>
                <span className="text-3xl font-bold text-money-green [text-shadow:2px_2px_0px_rgba(0,0,0,0.5)] tabular-nums leading-none">
                  {isInfiniteMoney ? '∞' : `$${money.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Base Health Panel */}
            <div className="bg-ui-bg border-4 border-ui-border rounded-xl px-5 py-2 flex items-center gap-4 min-w-[180px] shadow-[0_4px_0_rgba(0,0,0,0.3)]">
              <div className="w-12 h-10 bg-danger-red border-2 border-[#922b21] rounded flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">{t('lives')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${lives}%` }}
                      className={`h-full ${lives > 50 ? 'bg-money-green' : lives > 20 ? 'bg-orange-500' : 'bg-danger-red'}`}
                    />
                  </div>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {lives}
                  </span>
                </div>
              </div>
            </div>
          </div>
                   {/* Seed Bar */}
          <div className="bg-ui-bg border-4 border-ui-border rounded-xl flex-grow flex items-center px-4 gap-3">
            <button
              onClick={() => setSelectedSeed(selectedSeed === 'farm' ? null : 'farm')}
              className={`w-[70px] h-[85px] rounded border-2 relative cursor-pointer flex flex-col items-center justify-end pb-1 transition-all duration-200 ${ 
                selectedSeed === 'farm' 
                  ? 'bg-[#D7C6A3] border-accent-yellow border-4 -translate-y-1' 
                  : 'bg-[#D7C6A3] border-[#8B6B4C] hover:border-white/30'
              }`}
            >
              <div className="w-10 h-10 bg-[#27ae60] rounded-sm mb-4 flex items-center justify-center overflow-hidden">
                <img src={FARM_LEVELS[0].icon || FARM_LEVELS[0].appearance} alt="Farm" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-[#6D4C41] text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute bottom-1">
                ${Math.floor(FARM_LEVELS[0].cost)}
              </div>
            </button>

            <button
              onClick={() => setSelectedSeed(selectedSeed === 'scout' ? null : 'scout')}
              className={`w-[70px] h-[85px] rounded border-2 relative cursor-pointer flex flex-col items-center justify-end pb-1 transition-all duration-200 ${ 
                selectedSeed === 'scout' 
                  ? 'bg-[#D7C6A3] border-accent-yellow border-4 -translate-y-1' 
                  : 'bg-[#D7C6A3] border-[#8B6B4C] hover:border-white/30'
              }`}
            >
              <div className="w-10 h-10 bg-[#2980b9] rounded-sm mb-4 flex items-center justify-center overflow-hidden">
                <img src={SCOUT_LEVELS[0].icon || SCOUT_LEVELS[0].appearance} alt="Scout" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-[#6D4C41] text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute bottom-1">
                ${Math.floor(SCOUT_LEVELS[0].cost)}
              </div>
            </button>

            <button
              onClick={() => setSelectedSeed(selectedSeed === 'sniper' ? null : 'sniper')}
              className={`w-[70px] h-[85px] rounded border-2 relative cursor-pointer flex flex-col items-center justify-end pb-1 transition-all duration-200 ${ 
                selectedSeed === 'sniper' 
                  ? 'bg-[#D7C6A3] border-accent-yellow border-4 -translate-y-1' 
                  : 'bg-[#D7C6A3] border-[#8B6B4C] hover:border-white/30'
              }`}
            >
              <div className="w-10 h-10 bg-[#e74c3c] rounded-sm mb-4 flex items-center justify-center overflow-hidden">
                <img src={SNIPER_LEVELS[0].icon || SNIPER_LEVELS[0].appearance} alt="Sniper" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-[#6D4C41] text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute bottom-1">
                ${Math.floor(SNIPER_LEVELS[0].cost)}
              </div>
            </button>
          </div>

          {/* Menu Button */}
          <button 
            onClick={() => setIsPaused(true)}
            className="bg-ui-bg border-4 border-ui-border rounded-xl px-6 hover:bg-ui-border transition-colors text-white font-black uppercase tracking-tighter flex items-center justify-center"
          >
            {t('menu')}
          </button>
        </div>

        {/* Game Board */}
        <div className={`absolute top-[150px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] border-4 border-[#334411] shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] ${
          difficulty === 'Very Easy' ? 'bg-[#FFD54F] border-[#816b1e]' : 
          difficulty === 'Easy' ? 'bg-[#5D4636] border-[#3B2D21]' :
          difficulty === 'Normal' ? 'bg-[#4a4a4a] border-[#333]' :
          'bg-grass-dark'
        }`}>
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
                  animate={{ x: proj.targetX, y: proj.targetY, rotate: proj.rotation }}
                  transition={{ duration: 0.15, ease: "linear" }}
                  onAnimationComplete={() => {
                    setProjectiles(prev => prev.filter(p => p.id !== proj.id));
                  }}
                  className="absolute pointer-events-none"
                  style={{
                    width: proj.type === 'sniper-bullet' ? 12 : 8,
                    height: proj.type === 'sniper-bullet' ? 4 : 4,
                    backgroundColor: proj.color,
                    borderRadius: '2px',
                    boxShadow: `0 0 8px ${proj.color}`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1500
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Hit Effects Layer */}
          <div className="absolute inset-0 pointer-events-none z-[1600]">
            <AnimatePresence>
              {hits.map(hit => (
                <motion.div
                  key={hit.id}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [1, 2.5, 1.8], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.15 }}
                  className="absolute pointer-events-none"
                  style={{
                    left: hit.x,
                    top: hit.y,
                    width: 20,
                    height: 20,
                    backgroundColor: hit.color,
                    borderRadius: '50%',
                    filter: 'blur(2px)',
                    boxShadow: `0 0 15px ${hit.color}`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1600
                  }}
                />
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
                    <img 
                      src={
                        unit.unitType === 'farm' ? FARM_LEVELS[unit.level].appearance :
                        unit.unitType === 'scout' ? SCOUT_LEVELS[unit.level].appearance :
                        SNIPER_LEVELS[unit.level].appearance
                      } 
                      alt={unit.unitType} 
                      className="w-full h-full object-contain p-1 scale-x-[-1]"
                      referrerPolicy="no-referrer"
                    />
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
                animate={zombie.isEating ? {
                  scale: [1, 1.1, 1],
                  translateX: [0, -5, 0]
                } : {
                  rotate: [0, -2, 2, 0],
                  translateY: [0, -2, 0]
                }}
                transition={{
                  duration: zombie.isEating ? 0.3 : 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={() => {
                  setZombies(prev => prev.map(z => z.id === zombie.id ? { ...z, hp: z.hp - 1 } : z));
                }}
              >
                <div className="w-full h-full relative flex items-center justify-center">
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
                    src={zombie.isTank 
                      ? `/Enemys/Normal/NormalAnim3.webp`
                      : zombie.name === 'Speedy' 
                      ? `/Enemys/Normal/Speedy/SpeedyAnim${zombie.variant % 2 + 1}.webp`
                      : `/Enemys/Normal/NormalAnim${zombie.variant % 2 + 1}.webp`} 
                    alt="Zombie" 
                    className={`w-full h-full object-contain ${zombie.isStunned ? 'brightness-75' : ''}`}
                    style={{
                      filter: [
                        zombie.isBloated ? 'sepia(0.5) hue-rotate(-50deg) saturate(1.5)' : '',
                        zombie.isTank ? 'brightness(0.6) contrast(1.4)' : ''
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
                <div className="absolute -top-3 left-1 right-1 h-3.5 bg-danger-red rounded-sm border border-black/30 flex items-center justify-center shadow-lg">
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
                const levels = selectedUnit.unitType === 'farm' ? FARM_LEVELS : selectedUnit.unitType === 'scout' ? SCOUT_LEVELS : SNIPER_LEVELS;
                const currentData = levels[selectedUnit.level];
                const nextData = levels[selectedUnit.level + 1];
                const isMax = selectedUnit.level >= levels.length - 1;

                // Explicitly cast for TS property access
                const cur = currentData as any;
                const nxt = nextData as any;

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
                      !isMax ? (
                        <div className="space-y-4">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{t('upgradeEffect')}</p>
                            <p className="text-sm font-black text-accent-yellow italic">
                              {nxt.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-white/30 uppercase font-black mb-1">{t('damage')}</span>
                               <span className="text-sm font-bold text-white">{cur.damage}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-money-green uppercase font-black mb-1">{t('next')}</span>
                               <span className="text-sm font-bold text-money-green">{nxt.damage}</span>
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
                          <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                            <div className="flex flex-col items-center">
                               <span className="text-[9px] text-white/30 uppercase font-black mb-1">{t('damage')}</span>
                               <span className="text-xl font-bold text-white">{cur.damage}</span>
                            </div>
                            <div className="flex flex-col items-center">
                               <span className="text-[9px] text-white/30 uppercase font-black mb-1">Velocità</span>
                               <span className="text-xl font-bold text-white">{(1000/cur.interval).toFixed(1)}/s</span>
                            </div>
                          </div>
                        </div>
                      )
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
                    {isInfiniteMoney ? `${t('infiniteMoney')} (ON)` : t('infiniteMoney')}
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
                        const levels = u.unitType === 'farm' ? FARM_LEVELS : u.unitType === 'scout' ? SCOUT_LEVELS : SNIPER_LEVELS;
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
                    className={`px-8 py-3 rounded-xl font-black uppercase transition-all ${almanacTab === 'units' ? 'bg-[#FFE082] text-[#3B2D21]' : 'bg-[#3B2D21] text-white/50'}`}
                  >
                    {t('unitsTab')}
                  </button>
                  <button 
                    onClick={() => setAlmanacTab('zombies')}
                    className={`px-8 py-3 rounded-xl font-black uppercase transition-all ${almanacTab === 'zombies' ? 'bg-[#FFE082] text-[#3B2D21]' : 'bg-[#3B2D21] text-white/50'}`}
                  >
                    {t('zombiesTab')}
                  </button>
                </div>

                <div className="bg-[#FFE082]/10 rounded-3xl p-6 border-4 border-[#3B2D21] mb-8 overflow-y-auto flex-grow">
                  {almanacTab === 'zombies' ? (
                    <div className="flex flex-col gap-12">
                      {Object.entries(ZOMBIE_TYPES).map(([key, type]) => (
                        <div key={key} className="flex gap-8 items-start border-b border-[#3B2D21] pb-8 last:border-0">
                          <div className="w-32 h-32 bg-[#3B2D21]/30 rounded-full flex items-center justify-center border-4 border-[#3B2D21] p-4 overflow-hidden relative">
                            <img 
                              src={key === 'NORMAL' 
                                ? "/Enemys/Normal/NormalAnim1.webp" 
                                : key === 'SPEEDY' 
                                ? "/Enemys/Normal/Speedy/SpeedyAnim1.webp" 
                                : "/Enemys/Normal/NormalAnim3.webp"
                              } 
                              alt={type.name} 
                              className={`w-full h-full object-contain ${key === 'SPEEDY' ? 'brightness-125 saturate-150 scale-x-[-1]' : key === 'TANK' ? 'brightness-50 contrast-125' : ''}`}
                              referrerPolicy="no-referrer"
                            />
                            {key === 'SPEEDY' && <div className="absolute top-2 right-2 text-xl animate-pulse">⚡</div>}
                            {key === 'TANK' && <div className="absolute bottom-1 text-[10px] font-bold text-danger-red uppercase">Armored</div>}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-black text-white uppercase mb-2">{t('zombieName')}: {type.name}</h3>
                            <p className="text-[#FFE082] italic mb-4">"{type.description}"</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">Resistenza</p>
                                <p className="text-xl font-bold text-danger-red">{type.baseHp} HP</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">Velocità</p>
                                <p className="text-xl font-bold text-accent-yellow">{type.speedPerGrid}s/m</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">Danno</p>
                                <p className="text-xl font-bold text-orange-400">{type.damage}/morso</p>
                              </div>
                              <div className="bg-[#3B2D21]/50 p-3 rounded-xl border-2 border-[#3B2D21]">
                                <p className="text-xs text-white/50 uppercase font-bold">Ricompensa</p>
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
                                    <p className="text-xs font-black text-[#FFE082]">LIVELLO {index}</p>
                                    <p className="text-[10px] text-white/60">{lvl.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-white/40 uppercase">Produzione</p>
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
                                     <p className="text-xs font-black text-[#FFE082]">LIVELLO {index}</p>
                                     {index > 0 && <p className="text-[10px] text-white/60">{lvl.description}</p>}
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">Danni: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">Velocità: {(1000/lvl.interval).toFixed(1)}/s</p>
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
                                     <p className="text-xs font-black text-[#FFE082]">LIVELLO {index}</p>
                                     {index > 0 && <p className="text-[10px] text-white/60">{lvl.description}</p>}
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[11px] font-black text-white/80 uppercase">Danni: {lvl.damage}</p>
                                   <p className="text-[11px] font-black text-white/80 uppercase">Velocità: {(1000/lvl.interval).toFixed(1)}/s</p>
                                   {lvl.hasHiddenDetection && <p className="text-[10px] font-black text-accent-yellow italic mt-1 leading-none">Hidden Detection</p>}
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
