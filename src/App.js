import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ChatBox from './ChatBox';
import Phaser from 'phaser';
import grassImage from './assets/grass.png';
import oceanImage from './assets/ocean.png';
import whiteflagImage from './assets/whiteFlag.png';
import skyflagImage from './assets/skyFlag.png';
import largemapImage from './assets/file.png';
import getContract, { getSignerContract, contractAddress, RPC } from './contract';
import getTokenContract, { getTokenSignerContract } from './Tokencontract';
import { Circles } from 'react-loader-spinner';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundMusicFile from './assets/background.mp3';

import leaderboardSound from './assets/leaderboard.mp3';
import paperSound from './assets/paper.mp3';
import horsecartSound from './assets/horsecart.mp3';
import battleSound from './assets/battle.mp3';


import playIcon from './assets/play-icon.png';
import stopIcon from './assets/stop-icon.png';
import { getAddress } from 'ethers';
import TheLand from './theLand';
import getclanContract, { getclanSignerContract, clancontractAddress } from './clancontract';
import getTheLandContract, { getTheLandSignerContract } from './TheLandContract';
import getNFTContract, { getNFTSignerContract } from './nftContract';
import getMarketplaceContract, { getMarketplaceSignerContract } from './MarketplaceContract';
import defensiveSoldierImage from './assets/soldiers/defensive.png';
import offensiveSoldierImage from './assets/soldiers/offensive.png';
import { BrowserProvider } from 'ethers';

import foodImage from './assets/res/food.png';
import woodImage from './assets/res/wood.png';
import stoneImage from './assets/res/stone.png';
import ironImage from './assets/res/iron.png';

import defensiveArmorImage from './assets/armors/defensive.png';
import offensiveArmorImage from './assets/armors/offensive.png';

import defensiveWeaponImage from './assets/weapons/defensive.png';
import offensiveWeaponImage from './assets/weapons/offensive.png';

import arrowIconImage from './assets/arrowRight.png';
import arrowRedIconImage from './assets/arrowRightRed.png';

import battleGifImage from './assets/battle.gif';

function App() {
  const gameRef = useRef(null);
  const [tileCoords, setTileCoords] = useState({ x: null, y: null, occupied: null, occupant: null });
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const tilesRef = useRef([]);
  const mapSize = 20;
  const [loading, setLoading] = useState(true); // New state for loading
  const [LoadingAttack, setLoadingAttack] = useState(false); // New state for loading
  const [loadingResources, setloadingResources] = useState(false); // New state for loading
  const [metaMaskAccount, setMetaMaskAccount] = useState(null);
  const [referrer, setReferrer] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef(null);
  const [referralNetwork, setReferralNetwork] = useState(null); // To store referrer and referrals
  const [showReferralNetwork, setShowReferralNetwork] = useState(false); // To show/hide the referral network info
  const occupationCost = 100000 * 10**6;
  const [salePrice, setSalePrice] = useState("");
  const [hasTileG, sethasTileG] = useState(false);
  const [showTheLand, setShowTheLand] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [appKey, setAppKey] = useState(Date.now());
  const [userClan, setUserClan] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allclansX, setallclansX] = useState([]);
  const [musicOnce, setmusicOnce] = useState(false);
  const [interactionMenuTypeA, setinteractionMenuTypeA] = useState("");
  const [attackCooldownMessage, setAttackCooldownMessage] = useState("");
  const [attackCooldownMessageX, setAttackCooldownMessageX] = useState("");
  const [attackerTroops, setAttackerTroops] = useState(null);
const [attackerTileCoords, setAttackerTileCoords] = useState({ x: null, y: null });
const [attackCost, setAttackCost] = useState(null);
const [attackerResources, setAttackerResources] = useState(null);
const [attackDistance, setAttackDistance] = useState(null);
const [attackerPower, setAttackerPower] = useState(0);
const [warLogsData, setWarLogsData] = useState([]);

const [defenderHandle, setdefenderHandle] = useState("");

const [sendResourceAmount, setSendResourceAmount] = useState("");
const [sendResourceType, setSendResourceType] = useState("1"); // 1 = Food, default
const [sendResourceLOPCost, setSendResourceLOPCost] = useState(null);

const [sendResourceCost, setSendResourceCost] = useState(null);

const [hasMarketplace, setHasMarketplace] = useState(false);

const arrowRef = useRef(null);
const arrowRedRef = useRef(null);
const resourceAnimationLoopRef = useRef(null);
const elseattackAnimationLoopRef = useRef(null);
const elseresourceAnimationLoopRef = useRef(null);
const attackAnimationLoopRef = useRef(null);

const battleGifRef = useRef(null);
const [txCounter, setTxCounter] = useState(0);

const flagSpritesRef = useRef({});

const urlToKeyMap = useMemo(() => ({
  "https://kilopi.net/mom/nfts/1.png": "nftflag_1",
  "https://kilopi.net/mom/nfts/2.png": "nftflag_2",
  "https://kilopi.net/mom/nfts/3.png": "nftflag_3",
  "https://kilopi.net/mom/nfts/4.png": "nftflag_4",
  "https://kilopi.net/mom/nfts/5.png": "nftflag_5",
  "https://kilopi.net/mom/nfts/6.png": "nftflag_6",
  "https://kilopi.net/mom/nfts/7.png": "nftflag_7",
  "https://kilopi.net/mom/nfts/8.png": "nftflag_8",
  "https://kilopi.net/mom/nfts/9.png": "nftflag_9",
  "https://kilopi.net/mom/nfts/10.png": "nftflag_10",
  "https://kilopi.net/mom/nfts/11.png": "nftflag_11",
  "https://kilopi.net/mom/nfts/12.png": "nftflag_12",
  "https://kilopi.net/mom/nfts/13.png": "nftflag_13",
  "https://kilopi.net/mom/nfts/14.png": "nftflag_14",
  "https://kilopi.net/mom/nfts/15.png": "nftflag_15",
  "https://kilopi.net/mom/nfts/16.png": "nftflag_16",
  "https://kilopi.net/mom/nfts/17.png": "nftflag_17",
  "https://kilopi.net/mom/nfts/18.png": "nftflag_18",
  "https://kilopi.net/mom/nfts/19.png": "nftflag_19",
  "https://kilopi.net/mom/nfts/20.png": "nftflag_20",
  "https://kilopi.net/mom/nfts/21.png": "nftflag_21",
  "https://kilopi.net/mom/nfts/22.png": "nftflag_22",
  "https://kilopi.net/mom/nfts/23.png": "nftflag_23",
  "https://kilopi.net/mom/nfts/24.png": "nftflag_24",
  "https://kilopi.net/mom/nfts/25.png": "nftflag_25",
  "https://kilopi.net/mom/nfts/26.png": "nftflag_26",
  "https://kilopi.net/mom/nfts/27.png": "nftflag_27",
  "https://kilopi.net/mom/nfts/28.png": "nftflag_28",
  "https://kilopi.net/mom/nfts/29.png": "nftflag_29",
  "https://kilopi.net/mom/nfts/30.png": "nftflag_30"
}), []);



const removeClanFlagFromTile = (x, y) => {
  const k = `${x}-${y}`;
  const sprite = flagSpritesRef.current[k];
  if (sprite && sprite.active) {
    sprite.destroy();             // removes the image from the scene
    delete flagSpritesRef.current[k];
  }

  // Also update your tilesRef so that next redraw won’t re-add a flag
  if (tilesRef.current[x] && tilesRef.current[x][y]) {
    tilesRef.current[x][y].flagUrl = null;
    tilesRef.current[x][y].clanId = "0";
  }
};




const refreshTileCard = async (x1Based, y1Based) => {
  const x0 = x1Based - 1;
  const y0 = y1Based - 1;

  const contract = await getContract();
  const clanContract = await getclanSignerContract();
  const landContract = await getTheLandSignerContract();

  const occupant = await contract.getTileOccupant(x0, y0);
  const tile = await contract.tiles(x0, y0);
  const bonusX = await contract.bonuses(x0, y0);
  const tileName = await clanContract.getTileName(x0, y0);

  const tileData = await landContract.getTileData(x0, y0);
  const points = Number(tileData.points);
  const level  = Number(tileData.level);

 let bonusType;
switch (parseInt(bonusX)) {
  case 1: bonusType = 'Food'; break;
  case 2: bonusType = 'Wood'; break;
  case 3: bonusType = 'Stone'; break;
  case 4: bonusType = 'Iron'; break;
  default: bonusType = 'None';
}


  const twitterHandle = occupant
    ? await clanContract.getTwitterHandle(occupant)
    : null;

  setTileCoords({
    x: x1Based,
    y: y1Based,
    occupied: occupant && occupant !== '0x0000000000000000000000000000000000000000',
    occupant,
    isOnSale: tile.isOnSale,
    salePrice: Number(tile.salePrice + tile.saleBurnAmount),
    bonusType,
    tileName: tileName && tileName.trim().length > 0 ? tileName : null,
    points,
    twitterHandle: twitterHandle || null,
    level
  });
};





useEffect(() => {
    const loadTXCounter = async () => {
      const contract = await getTheLandContract();
      const counter = await contract.TXCounter(); // public getter
      setTxCounter(counter.toString());
    };


    // Optional: refresh every 10 seconds
    const interval = setInterval(loadTXCounter, 10000);
    return () => clearInterval(interval);
  }, []);



// Play ONE soldier travel (no loop) then destroy it.
const playSingleSoldierTravel = (from, to, duration) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  // NOTE:
  // - from is expected 0-based
  // - to is expected 1-based (consistent with your other helpers)
  const fromPos = tileToWorldPosition(from.x, from.y);
  const toPos   = tileToWorldPosition(to.x - 1, to.y - 1);

 if (elseattackAnimationLoopRef.current) {
    elseattackAnimationLoopRef.current.remove(false);
    elseattackAnimationLoopRef.current = null;
  }

  elseattackAnimationLoopRef.current = scene.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
      const img = scene.add.image(fromPos.worldX, fromPos.worldY, 'offensivesoldier')
        .setDisplaySize(120, 120)
        .setDepth(9999);

      scene.tweens.add({
        targets: img,
        x: toPos.worldX,
        y: toPos.worldY,
        duration,
        ease: 'Power2',
        onComplete: () => img.destroy(),
      });
    }
  });




};





const playSingleResourceTravel = (from, to, type, duration) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  // NOTE:
  // - from is expected 0-based
  // - to is expected 1-based (consistent with your other helpers)
  const fromPos = tileToWorldPosition(from.x, from.y);
  const toPos   = tileToWorldPosition(to.x - 1, to.y - 1);

 if (elseresourceAnimationLoopRef.current) {
    elseresourceAnimationLoopRef.current.remove(false);
    elseresourceAnimationLoopRef.current = null;
  }

  const typeX = Number(type);
  let typex = '';
      switch (typeX) {
        case 1:
          typex = 'food';
          break;
        case 2:
          typex = 'wood';
          break;
        case 3:
          typex = 'stone';
          break;
        case 4:
          typex = 'iron';
          break;
          case 5:
          typex = 'offensivearmor';
          break;
          case 6:
          typex = 'defensivearmor';
          break;
          case 7:
          typex = 'offensiveweapon';
          break;
          case 8:
          typex = 'defensiveweapon';
          break;
        default:
          typex = 'food';
      }



  elseresourceAnimationLoopRef.current = scene.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
      const img = scene.add.image(fromPos.worldX, fromPos.worldY, typex)
        .setDisplaySize(120, 120)
        .setDepth(9999);

      scene.tweens.add({
        targets: img,
        x: toPos.worldX,
        y: toPos.worldY,
        duration,
        ease: 'Power2',
        onComplete: () => img.destroy(),
      });
    }
  });




};




const stopElseResourceLoop = () => {
  if (elseresourceAnimationLoopRef.current) {
    elseresourceAnimationLoopRef.current.remove(false);
    elseresourceAnimationLoopRef.current = null;
  }
};





const stopElseAttackLoop = () => {
  if (elseattackAnimationLoopRef.current) {
    elseattackAnimationLoopRef.current.remove(false);
    elseattackAnimationLoopRef.current = null;
  }
};


// Show all three attack visuals for ~6s, then cleanup.
const triggerAttackCinematics = useCallback(({ ax, ay, dx, dy }) => {
  gameRef.current.sounds.battle.play();
  // Convert BigInts to numbers if needed
  const A = { x: Number(ax), y: Number(ay) };   // 0-based from chain
  const D = { x: Number(dx) + 1, y: Number(dy) + 1 }; // make target 1-based for helpers

  // Red arrow
  drawRedArrowBetweenTiles(A, D);

  // Single soldier travel
  playSingleSoldierTravel(A, D, 8000);

  // Battle GIF on defender tile
  showBattleGifAtTile(D);

  // Auto cleanup after 6s
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  scene.time.delayedCall(16000, () => {
    stopElseAttackLoop();
    // remove red arrow
    if (arrowRedRef.current) {
      arrowRedRef.current.destroy();
      arrowRedRef.current = null;
    }
    // remove gif
    hideBattleGif();
  });
}, [gameRef]);





const triggerResourcesCinematics = useCallback(({ ax, ay, dx, dy, type }) => {
  gameRef.current.sounds.horsecart.play();
  // Convert BigInts to numbers if needed
  const A = { x: Number(ax), y: Number(ay) };   // 0-based from chain
  const D = { x: Number(dx) + 1, y: Number(dy) + 1 }; // make target 1-based for helpers

  // Red arrow
  drawArrowBetweenTiles(A, D);

  // Single soldier travel
  playSingleResourceTravel(A, D, type, 8000);

  // Auto cleanup after 6s
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  scene.time.delayedCall(16000, () => {
    stopElseResourceLoop();
    // remove red arrow
    if (arrowRef.current) {
      arrowRef.current.destroy();
      arrowRef.current = null;
    }

  });
}, [gameRef]);






const showBattleGifAtTile = (to) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  const { worldX, worldY } = tileToWorldPosition(to.x - 1, to.y - 1);

  // Remove any old battle gif
  if (battleGifRef.current) {
    battleGifRef.current.destroy();
    battleGifRef.current = null;
  }

  // Create DOM overlay with your gif
  const gifOverlay = scene.add.dom(worldX, worldY).createFromHTML(`
    <img 
      src="${battleGifImage}" 
      style="width: 210px; height: 210px; filter: brightness(2.1); transform: translate(50px, -110px);" 
    />
  `);

  gifOverlay.setDepth(10000);

  // Save reference
  battleGifRef.current = gifOverlay;


};




const hideBattleGif = () => {
  if (battleGifRef.current) {
    battleGifRef.current.destroy();
    battleGifRef.current = null;
  }
};




const startResourceTransferLoop = (resourceType, from, to) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  const resourceKeyMap = {
    "1": "food",
    "2": "wood",
    "3": "stone",
    "4": "iron",
    "5": "offensivearmor",
    "6": "defensivearmor",
    "7": "offensiveweapon",
    "8": "defensiveweapon",
  };

  const imageKey = resourceKeyMap[resourceType];
  if (!imageKey) return;

  const fromPos = tileToWorldPosition(from.x, from.y);
  const toPos = tileToWorldPosition(to.x - 1, to.y - 1);

  // Clean up old loop if it exists
  if (resourceAnimationLoopRef.current) {
    resourceAnimationLoopRef.current.remove(false);
  }

  resourceAnimationLoopRef.current = scene.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
      const img = scene.add.image(fromPos.worldX, fromPos.worldY, imageKey)
        .setDisplaySize(120, 120)
        .setDepth(9999);

      scene.tweens.add({
        targets: img,
        x: toPos.worldX,
        y: toPos.worldY,
        duration: 5000,
        ease: 'Power2',
        onComplete: () => img.destroy(),
      });
    }
  });
};


const stopResourceTransferLoop = () => {
  if (resourceAnimationLoopRef.current) {
    resourceAnimationLoopRef.current.remove(false); // Stop the loop
    resourceAnimationLoopRef.current = null;
  }
};




const startAttackTransferLoop = (from, to) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  showBattleGifAtTile(to);

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  const resourceKey = "offensivesoldier";

  const imageKey = resourceKey;
  if (!imageKey) return;

  const fromPos = tileToWorldPosition(from.x, from.y);
  const toPos = tileToWorldPosition(to.x - 1, to.y - 1);

  // Clean up old loop if it exists
  if (attackAnimationLoopRef.current) {
    attackAnimationLoopRef.current.remove(false);
  }

  attackAnimationLoopRef.current = scene.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
      const img = scene.add.image(fromPos.worldX, fromPos.worldY, imageKey)
        .setDisplaySize(120, 120)
        .setDepth(9999);

      scene.tweens.add({
        targets: img,
        x: toPos.worldX,
        y: toPos.worldY,
        duration: 5000,
        ease: 'Power2',
        onComplete: () => img.destroy(),
      });
    }
  });
};




const stopAttackTransferLoop = () => {
  if (attackAnimationLoopRef.current) {
    attackAnimationLoopRef.current.remove(false); // Stop the loop
    attackAnimationLoopRef.current = null;
  }
  hideBattleGif();
};


const drawArrowBetweenTiles = (from, to) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  const { worldX: x1, worldY: y1 } = tileToWorldPosition(from.x, from.y);
  const { worldX: x2, worldY: y2 } = tileToWorldPosition(to.x - 1, to.y - 1); // subtract 1 to match contract coords

  // Remove existing arrow
  if (arrowRef.current) {
    arrowRef.current.destroy();
    arrowRef.current = null;
  }

  // Create arrow
  const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
  const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);

  const arrow = scene.add.image(x1, y1, 'arrowIcon')
    .setOrigin(0, 0.5)
    .setRotation(angle)
    .setDisplaySize(distance, 1500)
    .setDepth(1000); // on top

  arrowRef.current = arrow;
};




const drawRedArrowBetweenTiles = (from, to) => {
  const scene = gameRef.current?.scene.keys.default;
  if (!scene) return;

  const tileWidth = 386;
  const visibleTileHeight = 193;
  const overlap = visibleTileHeight / 2;
  const halfTileWidth = tileWidth / 2;
  const offsetX = window.innerWidth / 2;

  const tileToWorldPosition = (x, y) => {
    const worldX = (x - y) * halfTileWidth + offsetX;
    const worldY = (x + y) * overlap;
    return { worldX, worldY };
  };

  const { worldX: x1, worldY: y1 } = tileToWorldPosition(from.x, from.y);
  const { worldX: x2, worldY: y2 } = tileToWorldPosition(to.x - 1, to.y - 1); // subtract 1 to match contract coords

  // Remove existing arrow
  if (arrowRedRef.current) {
    arrowRedRef.current.destroy();
    arrowRedRef.current = null;
  }

  // Create arrow
  const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
  const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);

  const arrowRed = scene.add.image(x1, y1, 'arrowRedIcon')
    .setOrigin(0, 0.5)
    .setRotation(angle)
    .setDisplaySize(distance, 1500)
    .setDepth(1000); // on top

  arrowRedRef.current = arrowRed;
};





const checkMarketplacePresence = useCallback(async () => {
  try {
    const { x, y } = attackerTileCoords || {};
    if (x === undefined || y === undefined) return;

    const land = await getTheLandContract();
    const tileMap = await getContract();

    // Optional: ensure the tile is yours
    const occupant = await tileMap.getTileOccupant(x, y);
    if (!occupant || occupant.toLowerCase() !== metaMaskAccount?.toLowerCase()) {
      setHasMarketplace(false);
      return;
    }

    // Tile-based marketplace check
    const hasMarket = await land.hasMarketAtCoord(x, y);
    setHasMarketplace(Boolean(hasMarket));
  } catch (err) {
    console.error("Error checking marketplace presence:", err);
    setHasMarketplace(false);
  }
}, [attackerTileCoords, metaMaskAccount]);





const getResourceName = (type) => {
  switch (type) {
    case "1": return "Food";
    case "2": return "Wood";
    case "3": return "Stone";
    case "4": return "Iron";
    case "5": return "Offensive Armor";
    case "6": return "Defensive Armor";
    case "7": return "Offensive Weapon";
    case "8": return "Defensive Weapon";
    default: return "Unknown";
  }
};

const getRemainingAmount = (type) => {
  if (!attackerResources) return 0;

  const keyMap = {
    "1": "food",
    "2": "wood",
    "3": "stone",
    "4": "iron",
    "5": "offensiveArmor",
    "6": "defensiveArmor",
    "7": "offensiveWeapon",
    "8": "defensiveWeapon"
  };

  const key = keyMap[type];
  const currentAmount = attackerResources[key] || 0;
  const cost = sendResourceCost || 0;
  return currentAmount - cost - sendResourceAmount;
};




const handleTwitterConnect = async () => {
  try {
    setLoading(true);
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const signature = await signer.signMessage(`Linking wallet ${address}`);

    window.location.href = `http://localhost:4000/twitter/login?wallet=${address}&signature=${signature}`;
  } catch (err) {
    console.error("Twitter connection failed", err);
    toast.error("Failed to connect Twitter");
  } finally {
    setLoading(false);
  }
};




const createTwitterStoryShareLink = (log, defenderHandle = null) => {
  const attackerCoords = `(${Number(log.attackerX) + 1},${Number(log.attackerY) + 1})`;
  const defenderCoords = `(${Number(log.defenderX) + 1},${Number(log.defenderY) + 1})`;

  const attackerArmy = `${log.attackerSoldiers} Soldiers`;
  const defenderArmy = `${log.defenderSoldiers} Soldiers`;

  const result = log.attackerWon ? "🔥 I claimed victory!" : "🛡️ The defender held strong!";

  const resources = `${log.resourcesStolen}`;

  const defenderMention = (typeof defenderHandle === 'string' && defenderHandle.trim() !== '')
  ? `@${defenderHandle}`
  : 'an unknown warrior';

  const gameUrl = "https://kilopi.net/mom/full/"; // Replace with your real URL
  const tutorialUrl = "https://youtu.be/rSffsKpfmDQ?si=_8EsxA-MNu3a-EEK"; // Replace with your real URL

  const tweet = `I ${attackerCoords} attacked ${defenderMention} at ${defenderCoords} with ${attackerArmy}\n` +
                `\nDefender had ${defenderArmy}\n` +
                `\nResult: ${result}\n` +
                `\nI stole ${resources} resources\n\n` +
                `🌍 Join the competition: ${gameUrl}\n📺 Tutorial: ${tutorialUrl}`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
};





useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const twitterHandle = params.get('handle');

  if (twitterHandle) {
    
    
    
    // Optionally send the handle to the smart contract
    sendToSmartContract(twitterHandle);

    // Remove query from URL
    window.history.replaceState(null, '', window.location.pathname);
  }
}, []);


async function sendToSmartContract(twitterHandle) {
  try {
    

    const clanContract = await getclanSignerContract();
    
    const tx = await clanContract.setTwitterHandle(twitterHandle);
    setLoading(true); // show loader
    await tx.wait();

  

    toast.success(`Twitter handle @${twitterHandle} saved on-chain!`);
    
  } catch (error) {
    console.error("Error sending to smart contract:", error);
    toast.error("Failed to save Twitter handle.");
  } finally {
    setLoading(false); // hide loader
  }
}


const fetchMyRecentWarLogs = async () => {

  try {
    setLoading(true);
    gameRef.current?.sounds?.paper?.play?.();

    const market = await getMarketplaceSignerContract();
    const tileMap = await getContract();

    // Connected account
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    const account = accounts && accounts[0] ? accounts[0] : null;
    if (!account) {
      toast.error("Connect your wallet first.");
      return;
    }

    // Resolve user tile + verify ownership
    const x = tileCoords.x - 1;
    const y = tileCoords.y - 1;

    const occupant = await tileMap.getTileOccupant(x, y);
    if (!occupant || occupant.toLowerCase() !== account.toLowerCase()) {
      toast.error("You must own your tile to fetch war logs.");
      return;
    }

    // Fetch wars for this tile (tile-based API)
    // If your contract uses a different name, adapt the call accordingly.
    const data = await market.getRecentTileWars(x, y);

    setWarLogsData(data);
  } catch (err) {
    console.error("Error fetching my recent war logs:", err);
    toast.error("Failed to fetch your recent war logs.");
  } finally {
    setLoading(false);
  }
};


const fetchMyAllWarLogs = async () => {

  try {
    setLoading(true);
    gameRef.current?.sounds?.paper?.play?.();

    const market = await getMarketplaceSignerContract();
    const tileMap = await getContract();

    // Connected account
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    const account = accounts && accounts[0] ? accounts[0] : null;
    if (!account) {
      toast.error("Connect your wallet first.");
      return;
    }

    // Resolve user's tile and verify ownership
    const x = tileCoords.x - 1;
    const y = tileCoords.y - 1;

    const occupant = await tileMap.getTileOccupant(x, y);
    if (!occupant || occupant.toLowerCase() !== account.toLowerCase()) {
      toast.error("You must own your tile to fetch war logs.");
      return;
    }

    // Tile-based API
    const data = await market.getAllTileWars(x, y);
    setWarLogsData(data);
  } catch (err) {
    console.error("Error fetching all my war logs:", err);
    toast.error("Failed to fetch your all war logs.");
  } finally {
    setLoading(false);
  }
};


const normalizeWar = (w) => ({
  attackerX: parseInt(w.attackerX),
  attackerY: parseInt(w.attackerY),
  defenderX: parseInt(w.defenderX),
  defenderY: parseInt(w.defenderY),
  timestamp: parseInt(w.timestamp), 
  attackerWon: Boolean(w.attackerWon),
  attackerSoldiers: parseInt(w.attackerSoldiers),
  attackerCasualties: parseInt(w.attackerCasualties),
  attackerPower: parseInt(w.attackerPower),
  defenderSoldiers: parseInt(w.defenderSoldiers),
  defenderCasualties: parseInt(w.defenderCasualties),
  defenderPower: parseInt(w.defenderPower),
  resourcesStolen: parseInt(w.resourcesStolen),
});


const fetchRecentWarLogs = async () => {
  try {
    setLoading(true);
    gameRef.current?.sounds?.paper?.play?.();

    const marketContract = await getMarketplaceSignerContract();

    // NEW: get wars + clans in parallel arrays
    const [wars, clans] = await marketContract.getRecentWarHistoryWithClans();

    // Zip arrays and attach clan ids onto each war record
    const combined = wars.map((w, i) => {
      const ww = normalizeWar(w);
      const c = clans[i] || {};
      return {
        ...ww,
        attackerClanName: c.attackerClanNam === "" ? "None" : `${c.attackerClanNam}`,
        defenderClanName: c.defenderClanNam === "" ? "None" : `${c.defenderClanNam}`,
      };
    });

    setWarLogsData(combined);
  } catch (err) {
    console.error("Error fetching recent war logs:", err);
    toast.error("Failed to fetch recent war logs.");
  } finally {
    setLoading(false);
  }
};



const fetchAllWarLogs = async () => {
  try {
    setLoading(true);
    const marketContract = await getMarketplaceSignerContract();
    const [wars, clans] = await marketContract.getAllWarHistoryWithClans();
    const combined = wars.map((w, i) => {
      const ww = normalizeWar(w);
      const c = clans[i] || {};
      return {
        ...ww,
        attackerClanName: c.attackerClanNam === "" ? "None" : `${c.attackerClanNam}`,
        defenderClanName: c.defenderClanNam === "" ? "None" : `${c.defenderClanNam}`,
      };
    });
    setWarLogsData(combined);
  } catch (err) {
    console.error("Error fetching all war logs:", err);
    toast.error("Failed to fetch all war logs.");
  } finally {
    setLoading(false);
  }
};






const handleConfirmAttack = async () => {
  try {
    if (!attackerTileCoords || !tileCoords) return;

    if (!attackerTroops || attackerTroops.offensiveSoldier < 10) {
      toast.warn("You need at least 10 Offensive Soldiers to launch an attack.");
      return;
    }

    setLoadingAttack(true);
    gameRef.current?.sounds?.battle?.play?.();
    startAttackTransferLoop(attackerTileCoords, tileCoords);

    const market = await getMarketplaceSignerContract();
    const tileMap = await getContract();
    const clan = await getclanSignerContract();

    const ax = attackerTileCoords.x;
    const ay = attackerTileCoords.y;
    const dx = tileCoords.x - 1;
    const dy = tileCoords.y - 1;

    // Execute attack (ownsTile(ax,ay) enforced on-chain)
    const tx = await market.attackTile(ax, ay, dx, dy);
    await tx.wait();

    toast.success("Attack executed successfully!");

    // Refresh resources/costs/cooldowns
    await fetchAttackerResources();
    await calculateAttackCost(tileCoords.x, tileCoords.y);
    await checkIfAccountOccupiedTile();

    // Fetch updated war logs for the ATTACKER tile
    const updatedLogs = await market.getAllTileWars(ax, ay);
    const latest = updatedLogs && updatedLogs.length ? updatedLogs[updatedLogs.length - 1] : null;

    // Defender info (address -> twitter handle)
    try {
      const defenderAddress = await tileMap.getTileOccupant(dx, dy);
      if (defenderAddress && defenderAddress !== "0x0000000000000000000000000000000000000000") {
        const handle = await clan.getTwitterHandle(defenderAddress);
        setdefenderHandle(handle);
      } else {
        setdefenderHandle("");
      }
    } catch {
      setdefenderHandle("");
    }

    // Update state and show result
    if (latest) setWarLogsData([latest]); // show only this result
    setinteractionMenuTypeA("warlogsAllMineX");
  } catch (err) {
    console.error("Attack failed:", err);
    toast.error("Attack failed: " + (err?.reason || err?.message || "Unknown error"));
  } finally {
    stopAttackTransferLoop();
    setLoadingAttack(false);
  }
};






const fetchAttackerResources = useCallback(async () => {
  try {
    const landContract = await getTheLandSignerContract();
    const { x, y } = attackerTileCoords;
    const data = await landContract.getTileData(x, y);

    setAttackerResources({
      food: Number(data.food),
      wood: Number(data.wood),
      stone: Number(data.stone),
      iron: Number(data.iron),
      offensiveArmor: Number(data.offensiveArmor),
      defensiveArmor: Number(data.defensiveArmor),
      offensiveWeapon: Number(data.offensiveWeapon),
      defensiveWeapon: Number(data.defensiveWeapon),
    });

    // Optional: cooldown logic
    const marketContract = await getMarketplaceSignerContract();
    const attTurnsUsedRaw = await landContract.getTotalTurnsUsedByTile(x, y);
    const lastAttRaw = await marketContract.lastAttackTurn(x, y);
    const attTurnsUsed = parseInt(attTurnsUsedRaw.toString());
    const lastAtt = parseInt(lastAttRaw.toString());
    const cooldown = 150;
    if (attTurnsUsed < lastAtt + cooldown) {
      setAttackCooldownMessageX(`Attacker Cooldown (${(lastAtt + cooldown) - attTurnsUsed} turns left)`);
    }
  } catch (err) {
    console.error("Error fetching attacker's resources", err);
    setAttackerResources(null);
  }
}, [attackerTileCoords]);




const calculateAttackCost = useCallback(async (targetX, targetY) => {
  if (attackerTileCoords.x === null || attackerTileCoords.y === null) return;

  const ax = attackerTileCoords.x;
  const ay = attackerTileCoords.y;
  const dx = targetX - 1;
  const dy = targetY - 1;

  const distance = Math.abs(ax - dx) + Math.abs(ay - dy);
   setAttackDistance(distance);
  const ATTACK_COST_FACTOR = 10;

  const landContract = await getTheLandSignerContract();
  const tileData = await landContract.getTileData(ax, ay);
  const offensiveSoldier = Number(tileData.offensiveSoldier);
  const defensiveSoldier = Number(tileData.defensiveSoldier);

  const totalCost = ATTACK_COST_FACTOR * distance * (offensiveSoldier + defensiveSoldier);

  setAttackCost({
    food: Math.floor((totalCost * 40) / 100),
    wood: Math.floor((totalCost * 30) / 100),
    stone: Math.floor((totalCost * 20) / 100),
    iron: Math.floor((totalCost * 10) / 100),
  });
}, [attackerTileCoords]);



const fetchAttackerMilitary = useCallback(async () => {
  try {
    const landContract = await getTheLandSignerContract();
    const { x, y } = attackerTileCoords;
    const data = await landContract.getTileData(x, y);

    return {
      offensiveSoldier: Number(data.offensiveSoldier),
      defensiveSoldier: Number(data.defensiveSoldier),
      offensiveTech: Number(data.offensiveTech),
      level: Number(data.level)
    };
  } catch (err) {
    console.error("Error fetching attacker's soldier data", err);
    return { offensiveSoldier: 0, defensiveSoldier: 0 };
  }
}, [attackerTileCoords]);



useEffect(() => {
  const tryPlayMusic = (e) => {
    if (musicRef.current && !isMusicPlaying) {
      try {
        musicRef.current.play();
        setIsMusicPlaying(true);
      } catch (err) {
        console.warn("Music autoplay failed", err);
      }
    }

    // Remove listeners after first interaction
    document.removeEventListener('click', tryPlayMusic);
    document.removeEventListener('contextmenu', tryPlayMusic);
  };

  if (!musicOnce) {
  document.addEventListener('click', tryPlayMusic);
  document.addEventListener('contextmenu', tryPlayMusic); // for right click
  setmusicOnce(true);
  }

  

}, [isMusicPlaying, musicOnce]);





  const fetchLeaderboardData = async () => {
      try {
          setLoading(true);
          gameRef.current.sounds.leaderboard.play();
          const Land = await getTheLandSignerContract();
          const Clan = await getclanSignerContract();
  
          const tiles = [];
  
          for (let x = 0; x < 20; x++) {
              for (let y = 0; y < 20; y++) {
                  const tilePoints = await Land.pointsByCoords(x, y);
                  const points = parseInt(tilePoints.toString());
                  if (points > 0) {
                      const name = await Clan.getTileName(x, y);
                      const clan = await Clan.getTileClan(x, y);
                      const clanNo = parseInt(clan) - 1;
                      let clanName = "None";

                      if (allclansX[clanNo]) {
                        clanName = allclansX[clanNo][0];
                      }

                      
                      
                      tiles.push({
                          x: x + 1,
                          y: y + 1,
                          name,
                          clanName,
                          points,
                      });
                  }
              }
          }

  
          tiles.sort((a, b) => b.points - a.points); // sort descending
          setLeaderboardData(tiles);
      } catch (error) {
          console.error("Error fetching leaderboard:", error);
          toast.error("Failed to load leaderboard.");
      } finally {
          setLoading(false);
      }
  };




  useEffect(() => {
    const fetchUserClan = async () => {
    if (!metaMaskAccount) {
      setUserClan(null);
      return;
    }
    try {
      const clanContract = await getclanSignerContract();
      const tileMap = await getContract(); // make sure you have this getter

      // Get the player's tile coords
      const coords = await tileMap.getOccupiedTileByAddress(metaMaskAccount);
      const x = parseInt(coords[0]);
      const y = parseInt(coords[1]);

      // Verify the address actually occupies (x,y)
      const occupant = await tileMap.getTileOccupant(x, y);
      if (!occupant || occupant.toLowerCase() !== metaMaskAccount.toLowerCase()) {
        setUserClan(null);
        return;
      }

      // Clan by tile
      const clanIdRaw = await clanContract.getTileClan(x, y);
      const clanId = parseInt(clanIdRaw);

      if (clanId > 0) {
        const info = await clanContract.getClanInfo(clanId);
        const leaderX = parseInt(info.leaderX);
        const leaderY = parseInt(info.leaderY);

        setUserClan({
          id: clanId,
          isLeader: leaderX === x && leaderY === y,
        });
      } else {
        setUserClan(null);
      }
    } catch (err) {
      console.error('Failed to fetch user clan', err);
      setUserClan(null);
    }
  };
  
    fetchUserClan();
  }, [metaMaskAccount]);
  
useEffect(() => {
  if (interactionMenuTypeA === "attackMenu" || interactionMenuTypeA === "sendResources") {
    fetchAttackerMilitary().then(data => {
      setAttackerTroops(data);
      // Calculate attacker power using the same formula as in the contract
      const calculatedPower = (data.offensiveSoldier * 2) + (data.defensiveSoldier) + (data.offensiveTech) + (data.level);
      setAttackerPower(calculatedPower);
    });
    fetchAttackerResources();
    if (tileCoords.x !== null && tileCoords.y !== null) {
      calculateAttackCost(tileCoords.x, tileCoords.y);
    }

if (interactionMenuTypeA === "sendResources") {
      checkMarketplacePresence(); // ✅ safe to call now
      drawArrowBetweenTiles(attackerTileCoords, tileCoords);
    }

    if (interactionMenuTypeA === "attackMenu") {
      drawRedArrowBetweenTiles(attackerTileCoords, tileCoords);
    }

    
  }
}, [interactionMenuTypeA, fetchAttackerMilitary, calculateAttackCost, fetchAttackerResources, tileCoords, checkMarketplacePresence, attackerTileCoords]);


useEffect(() => {
  if (interactionMenuTypeA !== "sendResources") {
    // Cleanup arrow when leaving "sendResources"
    if (arrowRef.current) {
      arrowRef.current.destroy();
      arrowRef.current = null;
    }
  }
  if (interactionMenuTypeA !== "attackMenu") {
    // Cleanup arrow when leaving "sendResources"
    if (arrowRedRef.current) {
      arrowRedRef.current.destroy();
      arrowRedRef.current = null;
    }
  }
}, [interactionMenuTypeA]);




  const handleEnterLand = () => {
    if (tileCoords.x !== null && tileCoords.y !== null) {
      setSelectedTile({ x: tileCoords.x, y: tileCoords.y, bonusType: tileCoords.bonusType }); // Pass selected tile coordinates
      if (gameRef.current) {
        gameRef.current.destroy(true); // Destroy the current Phaser game instance
        gameRef.current = null; // Reset the reference
      }
      setShowTheLand(true); // Show the new content
    } else {
      toast.warn("Please select a tile before entering the land.");
    }
  };
  


  
  

  

  const updateTileSaleInfo = async (x, y) => {
    try {
      const contract = await getContract();
      const tile = await contract.tiles(x - 1, y - 1); // Fetch the latest tile information
      setTileCoords(prev => ({
        ...prev,
        isOnSale: tile.isOnSale,
        salePrice: Number(tile.salePrice + tile.saleBurnAmount),
      }));
    } catch (error) {
      console.error('Error fetching updated tile info:', error);
    }
  };

  

  const setTileForSale = async (x, y, isOnSale) => {
    setLoading(true);
    try {

      const paused = await isContractPaused(); // Check the paused state
    if (paused) {
      showWarning("Game is in PAUSE mode, please contact the management");
      setLoading(false);
      return; // Exit early if the contract is paused
    }

    
      if (isOnSale && !salePrice) {
        toast.error('Please enter a sale price.');
        return;
      }
  
      const salePriceX = salePrice * 10 ** 6;


      if (isOnSale) {

      
      if (salePrice < 10 || salePrice > 1000000) {
        toast.warn(
          `Sale price must be between 10 and 1,000,000 LOP tokens`

        );
        setLoading(false); // Ensure loading state resets
        return;
      }
    }

      
      const contractSigner = await getSignerContract();
      const tx = await contractSigner.setTileOnSale(x - 1, y - 1, isOnSale, salePriceX);
      await tx.wait();
  
      toast.success(`Realm is now ${isOnSale ? 'on' : 'off'} sale at ${salePrice} LOP tokens`);
  
      // Reset sale price after setting the tile for sale
      setSalePrice('');

      await updateTileSaleInfo(x, y);
    } catch (error) {
      console.error('Error setting tile sale status:', error);
      toast.error('Failed to set tile on sale');
    } finally {
      setLoading(false);
    }
  };

  const buyTile = async (x, y) => {
    setLoading(true);
    try {

      const paused = await isContractPaused(); // Check the paused state
    if (paused) {
      showWarning("Game is in PAUSE mode, please contact the management");
      setLoading(false);
      return; // Exit early if the contract is paused
    }

      const contract = await getContract();
        const alreadyHasTile = await contract.hasOccupiedTile(metaMaskAccount);

        if (alreadyHasTile) {
          showWarning("You already occupy a tile!");
            return;
        }

      // Get the sale price (already in the tileCoords state in LOP units)
    const salePriceLOP = tileCoords.salePrice; 
    if (!salePriceLOP) {
      toast.error('Sale price not available');
      setLoading(false);
      return;
    }

    const salePriceInWei = salePriceLOP; // Convert to smallest unit if required


    // Fetch the user's LOP token balance
    const lopBalance = await getLOPBalance(metaMaskAccount);
        
    if (lopBalance < salePriceInWei) {
        toast.warn("Insufficient LOP tokens. You need more LOP tokens to buy this land.");
        setLoading(false);
        return;
    }

    // Increase allowance for the sale price
    const tokenContractSigner = await getTokenSignerContract();
    const allowanceTx = await tokenContractSigner.increaseAllowance(contractAddress, salePriceInWei);
    await allowanceTx.wait();


      const contractSigner = await getSignerContract();
      const tx = await contractSigner.buyTile(x - 1, y - 1 ); // Set tile price here
      await tx.wait();

      toast.success('Realm purchased successfully!');
      setTileCoords((prev) => ({ ...prev, occupied: true, occupant: metaMaskAccount }));

      await refreshTileCard(x, y);

      await updateTileSaleInfo(x, y);
      await checkIfAccountOccupiedTile();

      setAttackerTileCoords({ x: x - 1, y: y - 1 });

    } catch (error) {
      console.error('Error buying tile:', error);
      toast.error('Failed to purchase tile');
    } finally {
      setLoading(false);
    }
  };



  const getReferralFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref');
  };



  useEffect(() => {

    const referralFromUrl = getReferralFromUrl();
    if (referralFromUrl) {
      setReferrer(referralFromUrl); // Set the referrer state from the URL
    }


    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsMetaMaskConnected(true);
            setMetaMaskAccount(accounts[0]); // Set the account when MetaMask is already connected
          }
        } catch (error) {
          console.error('Error connecting to MetaMask', error);
        }
      }
    };
    checkMetaMaskConnection();

    // Add event listener for account change
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setMetaMaskAccount(accounts[0]); // Update to the new account
          setIsMetaMaskConnected(true);
        } else {
          setIsMetaMaskConnected(false); // If no accounts, user is disconnected
          setMetaMaskAccount(null);
        }
      });
    }

    // Cleanup event listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };



  }, [appKey]);


  const loginMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setIsMetaMaskConnected(true); // Update state when MetaMask is connected
          setMetaMaskAccount(accounts[0]);
        }
      } catch (error) {
        console.error('MetaMask login failed', error);
      }
    } else {
      alert('MetaMask not detected');
    }
  };

  const fetchReferralNetwork = async () => {
    if (metaMaskAccount) {
      try {
        const contract = await getContract();
        const [referrer, referrals] = await contract.getReferralNetwork(metaMaskAccount); // Fetch referral data
        setReferralNetwork({ referrer, referrals });
        setShowReferralNetwork(true); // Show the referral info card
      } catch (error) {
        console.error('Error fetching referral network:', error);
      }
    }
  };
  

  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsMetaMaskConnected(true);
          }
        } catch (error) {
          console.error('Error connecting to MetaMask', error);
        }
      }
    };
    checkMetaMaskConnection();
  }, [appKey]);


  const updateTileMap = useCallback(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.keys.default;
      const tileWidth = 386;
      const visibleTileHeight = 193;
      const overlap = visibleTileHeight / 2;
      const halfTileWidth = tileWidth / 2;
      const offsetX = window.innerWidth / 2;

      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }

      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const { worldX, worldY } = tileToWorldPosition(x, y);

          if (tilesRef.current.length > 0 && tilesRef.current[x][y]) {
           

            const flagUrl = tilesRef.current[x][y].flagUrl;


const textureKey = urlToKeyMap[flagUrl] || 'whiteflag'; // fallback

const flag = scene.add.image(worldX, worldY, textureKey).setDepth(worldY + 1);


            // Enable pixel-perfect hit detection
            flag.setInteractive({
              pixelPerfect: true, // Only detect opaque areas
              useHandCursor: true  // Shows a hand cursor when hovering
            });

            // Add right-click event listener to the white flag
            flag.on('pointerdown', async (pointer) => {
              if (pointer.rightButtonDown()) {
                pointer.flagClicked = true;
                const contract = await getContract();
                const occupant = await contract.getTileOccupant(x, y); // Fetch the occupant address


                const clanContract = await getclanSignerContract();
                const tileName = await clanContract.getTileName(x, y);
const clanId = await clanContract.getTileClan(x, y);

const landContract = await getTheLandSignerContract();
const tileData = await landContract.getTileData(x, y);

const totalPoints = Number(tileData.points);
const tileLevel = Number(tileData.level);


let clanInfo = null;
if (clanId > 0) {
  const info = await clanContract.getClanInfo(clanId);
  clanInfo = {
    clanId: parseInt(clanId),
    name: info.name,
    leader: info.leader,
    memberCount: Number(info.memberCount)
  };
}


const tileKey = x * 256 + y;   

const clanIdBN = await clanContract.pendingInvitesByTile(tileKey);

const occupantPendingClanId = parseInt(clanIdBN);
let hasPendingInvite = false;
if (occupantPendingClanId > 0) {
  hasPendingInvite = true;
}





 










      const tile = await contract.tiles(x, y);

      const bonusX = await contract.bonuses(x, y);
      const bonus = parseInt(bonusX);
      
      let bonusTypeX = '';
      switch (bonus) {
        case 1:
          bonusTypeX = 'Food';
          break;
        case 2:
          bonusTypeX = 'Wood';
          break;
        case 3:
          bonusTypeX = 'Stone';
          break;
        case 4:
          bonusTypeX = 'Iron';
          break;
        default:
          bonusTypeX = 'None';
      }

const twitterHandle = await clanContract.getTwitterHandle(occupant);

                setTileCoords({
                  x: x + 1,
                  y: y + 1,
                  occupied: true,
                  occupant,
                  isOnSale: tile.isOnSale,
                  salePrice: Number(tile.salePrice + tile.saleBurnAmount),
                  bonusType: bonusTypeX,
                  clan: clanInfo, // Add clan info here
                  hasPendingInviteToClan: hasPendingInvite,
                  tileName: tileName && tileName.trim().length > 0 ? tileName : null,
                  points: totalPoints,
                  twitterHandle: twitterHandle || null,
                  level: tileLevel
                });


    const marketContract = await getMarketplaceSignerContract();

    const defTurnsUsedRaw = await landContract.getTotalTurnsUsedByTile(x, y);
    const defTurnsUsed = parseInt(defTurnsUsedRaw.toString());


    const lastDefRaw = await marketContract.lastDefenseTurn(x, y);
    const lastDef = parseInt(lastDefRaw.toString());


    const cooldown = 300;

    if (defTurnsUsed < lastDef + cooldown) {
      setAttackCooldownMessage("Defender Cooldown");
    } else {
      setAttackCooldownMessage("");
    }







              }
            });
          }
        }
      }
    }
  }, [gameRef, mapSize, urlToKeyMap]);


  useEffect(() => {
    const fetchAllOccupiedTiles = async () => {
  try {
    const contract = await getContract();
    const clanContract = metaMaskAccount ? await getclanSignerContract() : await getclanContract();
const nftContract = metaMaskAccount ? await getNFTSignerContract() : await getNFTContract();


    // Fetch all occupied tiles
    const occupiedTilesRaw = await contract.getAllOccupiedTiles();
    const occupiedTiles = occupiedTilesRaw.map(row => [...row]);

    // Fetch clan tile mappings
    const tilesWithClans = await clanContract.getAllTilesWithClans();

    // Build quick lookup of clan data per tile
    // Build quick lookup of clan data per tile
const clanTileMap = {};
const clanIdSet = new Set(); // <- collect real clan IDs in use
for (let i = 0; i < tilesWithClans.length; i++) {
  const { x, y, clanId, flagTokenId } = tilesWithClans[i];
  clanTileMap[`${x}-${y}`] = { clanId: Number(clanId), flagTokenId: Number(flagTokenId) };
  if (Number(clanId) > 0) clanIdSet.add(Number(clanId));
}



// Build clanId -> flagURL map using the ACTUAL IDs we saw on tiles
const clanFlagMap = {};
const clanInfoMap = {}; // optional: clanId -> { name, memberCount, ... }

for (const id of clanIdSet) {
  // guard against nonexistent/old IDs
  try {
    const info = await clanContract.getClanInfo(id);
    if (!info.exists) continue;

    // optional: cache name/info keyed by clanId so you never rely on array index
    clanInfoMap[id] = { name: info.name, memberCount: Number(info.memberCount), leaderX: Number(info.leaderX), leaderY: Number(info.leaderY) };

    const tokenId = await clanContract.clanFlags(id);
    if (tokenId && tokenId.toString() !== '0') {
      const [, , url] = await nftContract.getNFTData(tokenId);
      clanFlagMap[id] = url; // ← key is the real clanId
    }
  } catch (e) {
    // ignore missing/old ids
  }
}


    for (let x = 0; x < occupiedTiles.length; x++) {
  for (let y = 0; y < occupiedTiles[x].length; y++) {
    const val = occupiedTiles[x][y];
    if (val === true) {
      const key = `${x}-${y}`;
      const clanData = clanTileMap[key] || { clanId: 0, flagTokenId: 0 };
      const cid = Number(clanData.clanId);

      occupiedTiles[x][y] = {
        occupied: true,
        clanId: cid,                       // keep as number
        flagTokenId: clanData.flagTokenId, // number
        flagUrl: cid ? (clanFlagMap[cid] || null) : null,
        // optionally: clanName: clanInfoMap[cid]?.name || "None"
      };
    } else {
      occupiedTiles[x][y] = null;
    }
  }
}

tilesRef.current = occupiedTiles;
setallclansX(clanInfoMap);


    updateTileMap();
    setLoading(false);
  } catch (error) {
    console.error('Error fetching all occupied tiles with clans and flags:', error);
  }
};


    fetchAllOccupiedTiles();
}, [metaMaskAccount, appKey, updateTileMap]);

  




 useEffect(() => {
  updateTileMap();
}, [metaMaskAccount, appKey, updateTileMap]);






  const showWarning = (message) => {
    toast.warn(
      <div style={{ textAlign: 'center' }}>
        🚧 <strong>{message}</strong>
        <br />
        <button
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '8px 15px',
            marginTop: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onClick={() => toast.dismiss()}
        >
          OK
        </button>
      </div>,
      {
        position: "bottom-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        draggable: false,
        style: {
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.9)', // Softer white background
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow
          borderRadius: '15px', // Rounded corners
          border: '1px solid #007bff', // Border to match the blue button
          textAlign: 'center',
          maxWidth: '350px',
          zIndex: 110, // Ensure it's on top
          fontSize: '16px',
          color: '#333', // Match the text color from your other elements
        },
        icon: false,
        theme: "light", // Matching light theme
      }
    );
  };
  
  
  
  
  const getLOPBalance = async (account) => {
    const contract = await getTokenContract();
    return await contract.balanceOf(account);
  };

  const isContractPaused = async () => {
    try {
      const contract = await getContract();
      return await contract.paused(); // Call the `paused` state variable
    } catch (error) {
      console.error("Error checking contract pause status:", error);
      return false; // Default to not paused if there's an error
    }
  };
  

  const updateSingleTileWithFlag = async (x, y) => {
  const contract = await getContract();
  const clanContract = await getclanSignerContract();
  const nftContract = await getNFTSignerContract();

  const tile = await contract.tiles(x, y);
  const occupied = tile.occupied;
  
  let flagUrl = null;

  if (occupied) {
    const clanId = await clanContract.getTileClan(x, y);
    if (clanId.toString() !== "0") {
      const flagTokenId = await clanContract.clanFlags(clanId);
      if (flagTokenId.toString() !== "0") {
        const [, , url] = await nftContract.getNFTData(flagTokenId);
        flagUrl = url;
      }
    }
  }

  // Update the specific tile in the tilesRef
  tilesRef.current[x][y] = {
    occupied,
    flagUrl,
  };

  updateTileMap();
};




  const occupyTile = async (x, y) => {
    setLoading(true);
    try {

      const paused = await isContractPaused(); // Check the paused state
    if (paused) {
      showWarning("Game is in PAUSE mode, please contact the management");
      setLoading(false);
      return; // Exit early if the contract is paused
    }


      const contract = await getContract();
      const alreadyHasTile = await contract.hasOccupiedTile(metaMaskAccount);



      if (referrer && referrer !== '0x0000000000000000000000000000000000000000') {

        const referrerHasTile = await contract.hasOccupiedTile(referrer);

            if (!referrerHasTile) {
                showWarning("Referrer should have a land occupied.");
                setLoading(false);
                return; // Exit if the referrer has no occupied tile
            }

            
        const referrals = await contract.getReferredBy(referrer);
        if (referrals.length >= 30) {
          showWarning("Your Referrer Address already has 30 (Max) Referrals.");
          setLoading(false);
          return;
        }
      }


      if (alreadyHasTile) {
        showWarning("You already occupy a tile!");
      } else {
        // Fetch the user's LOP token balance
        const lopBalance = await getLOPBalance(metaMaskAccount);
        
        if (lopBalance < occupationCost) {
          toast.warn("Insufficient LOP tokens. You need 100,000 LOP tokens to occupy this land.");
          return;
        }

        const TokencontractSigner = await getTokenSignerContract();

        const Allowancetx = await TokencontractSigner.increaseAllowance(
          contractAddress,
          occupationCost
        );
        await Allowancetx.wait();


        const contractSigner = await getSignerContract();

        // Pass the referrer to the occupyTile function in the smart contract
        const referrerAddress = referrer || '0x0000000000000000000000000000000000000000';
        const tx = await contractSigner.occupyTile(x - 1, y - 1, referrerAddress);
        await tx.wait();

        await updateSingleTileWithFlag(x - 1, y - 1);
        await checkIfAccountOccupiedTile();
        setTileCoords((prev) => ({ ...prev, occupied: true }));
      }
    } catch (error) {
      console.error('Error occupying tile:', error);
    } finally {
      setLoading(false);
    }
  };



  const checkIfAccountOccupiedTile = useCallback(async () => {
    if (metaMaskAccount) {
      const contract = await getContract();
      const hasTile = await contract.hasOccupiedTile(metaMaskAccount);
      if (hasTile) {
        // Fetch the coordinates of the occupied tile
        const coords = await contract.getOccupiedTileByAddress(metaMaskAccount);
        const [x, y] = coords.map(coord => Number(coord)); // Convert BigInt to regular numbers
        setAttackerTileCoords({ x, y });
        updateTileImage(x, y); // Update the tile image to skyflag
      } else {
        const scene = gameRef.current.scene.keys.default;
        const existingFlag = scene.children.getByName(`flagSky`);
          if (existingFlag) {
            existingFlag.destroy();
          }
      }

      

      sethasTileG(hasTile);
    }
  }, [metaMaskAccount]); // Now it depends only on metaMaskAccount

  useEffect(() => {
    checkIfAccountOccupiedTile();
  }, [metaMaskAccount, checkIfAccountOccupiedTile, appKey]);

  

  const updateTileImage = (x, y) => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.keys.default;
      const tileWidth = 386;
      const visibleTileHeight = 193;
      const overlap = visibleTileHeight / 2;
      const halfTileWidth = tileWidth / 2;
      const offsetX = window.innerWidth / 2;
  
      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }
  
      const { worldX, worldY } = tileToWorldPosition(x, y);
  
      const existingFlag = scene.children.getByName(`flagSky`);
    if (existingFlag) {
      existingFlag.destroy();
    }
  
      const skyFlag = scene.add.image(worldX, worldY, 'skyflag').setDepth(worldY + 2);
      skyFlag.setName(`flagSky`); // Name it so it can be referenced later
    }
  };

  const generateReferralLink = () => {
    const link = `${window.location.href}/?ref=${metaMaskAccount}`;
    setReferralLink(link);
    toast.success("Referral link created successfully!");
  };

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.info("Referral link copied to clipboard!");
    }
  };
  
  

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const disableContextMenu = (e) => {
      // Allow the context menu only for the referral input
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener('contextmenu', disableContextMenu);
    

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'phaser-container',
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      audio: {
        disableWebAudio: true,
      },
      transparent: true,
      banner: false,
      dom: { createContainer: true },
    };

    gameRef.current = new Phaser.Game(config);

    let zoomLevel = 0.24;

    function preload() {
      this.load.image('grass', grassImage);
      this.load.image('ocean', oceanImage);
      this.load.image('whiteflag', whiteflagImage);
      this.load.image('skyflag', skyflagImage);
      this.load.image('largemap', largemapImage);
      this.load.audio('backgroundMusic', backgroundMusicFile);

      this.load.audio('leaderboardSound', leaderboardSound);
      this.load.audio('paperSound', paperSound);
      this.load.audio('horsecartSound', horsecartSound);
      this.load.audio('battleSound', battleSound);


      this.load.image('nftflag_1', "https://kilopi.net/mom/nfts/1.png");
      this.load.image('nftflag_2', "https://kilopi.net/mom/nfts/2.png");
      this.load.image('nftflag_3', "https://kilopi.net/mom/nfts/3.png");
      this.load.image('nftflag_4', "https://kilopi.net/mom/nfts/4.png");
      this.load.image('nftflag_5', "https://kilopi.net/mom/nfts/5.png");
      this.load.image('nftflag_6', "https://kilopi.net/mom/nfts/6.png");
      this.load.image('nftflag_7', "https://kilopi.net/mom/nfts/7.png");
      this.load.image('nftflag_8', "https://kilopi.net/mom/nfts/8.png");
      this.load.image('nftflag_9', "https://kilopi.net/mom/nfts/9.png");
      this.load.image('nftflag_10', "https://kilopi.net/mom/nfts/10.png");
      this.load.image('nftflag_11', "https://kilopi.net/mom/nfts/11.png");
      this.load.image('nftflag_12', "https://kilopi.net/mom/nfts/12.png");
      this.load.image('nftflag_13', "https://kilopi.net/mom/nfts/13.png");
      this.load.image('nftflag_14', "https://kilopi.net/mom/nfts/14.png");
      this.load.image('nftflag_15', "https://kilopi.net/mom/nfts/15.png");
      this.load.image('nftflag_16', "https://kilopi.net/mom/nfts/16.png");
      this.load.image('nftflag_17', "https://kilopi.net/mom/nfts/17.png");
      this.load.image('nftflag_18', "https://kilopi.net/mom/nfts/18.png");
      this.load.image('nftflag_19', "https://kilopi.net/mom/nfts/19.png");
      this.load.image('nftflag_20', "https://kilopi.net/mom/nfts/20.png");
      this.load.image('nftflag_21', "https://kilopi.net/mom/nfts/21.png");
      this.load.image('nftflag_22', "https://kilopi.net/mom/nfts/22.png");
      this.load.image('nftflag_23', "https://kilopi.net/mom/nfts/23.png");
      this.load.image('nftflag_24', "https://kilopi.net/mom/nfts/24.png");
      this.load.image('nftflag_25', "https://kilopi.net/mom/nfts/25.png");
      this.load.image('nftflag_26', "https://kilopi.net/mom/nfts/26.png");
      this.load.image('nftflag_27', "https://kilopi.net/mom/nfts/27.png");
      this.load.image('nftflag_28', "https://kilopi.net/mom/nfts/28.png");
      this.load.image('nftflag_29', "https://kilopi.net/mom/nfts/29.png");
      this.load.image('nftflag_30', "https://kilopi.net/mom/nfts/30.png");
      this.load.image('defensivesoldier', defensiveSoldierImage);
      this.load.image('offensivesoldier', offensiveSoldierImage);

      this.load.image('food', foodImage);
                  this.load.image('wood', woodImage);
                  this.load.image('stone', stoneImage);
                  this.load.image('iron', ironImage);
      
                  this.load.image('defensivearmor', defensiveArmorImage);
                  this.load.image('offensivearmor', offensiveArmorImage);
      
                  this.load.image('defensiveweapon', defensiveWeaponImage);
                  this.load.image('offensiveweapon', offensiveWeaponImage);

                  this.load.image('arrowIcon', arrowIconImage);
                  this.load.image('arrowRedIcon', arrowRedIconImage);


                  this.load.image('battlegif', battleGifImage);

    }

    const getTileBonus = async (x, y) => {
      try {
        const contract = await getContract();
        const bonus = await contract.bonuses(x, y); // Fetch the bonus for the tile (x, y)
        return parseInt(bonus);
      } catch (error) {
        console.error('Error fetching bonus:', error);
        return null; // Handle error by returning null or some default value
      }
    };


    const handleRightClick = async (x, y) => {
      const bonus = await getTileBonus(x, y);
      
      let bonusTypeX = '';
      switch (bonus) {
        case 1:
          bonusTypeX = 'Food';
          break;
        case 2:
          bonusTypeX = 'Wood';
          break;
        case 3:
          bonusTypeX = 'Stone';
          break;
        case 4:
          bonusTypeX = 'Iron';
          break;
        default:
          bonusTypeX = 'None';
      }
    
      if (x + 1 >= 1 && x + 1 <= 20 && y + 1 >= 1 && y + 1 <= 20) {
        setTileCoords({ x: x + 1, y: y + 1, occupied: tilesRef.current[x][y], bonusType: bonusTypeX });
      } else {
        setTileCoords({ x: null, y: null, occupied: null, bonusType: bonusTypeX });
      }
    };
    

    async function create() {

       gameRef.current.sounds = {
   leaderboard: this.sound.add('leaderboardSound', { volume: 0.6 }),
   paper: this.sound.add('paperSound', { volume: 0.6 }),
   horsecart: this.sound.add('horsecartSound', { volume: 0.6 }),
   battle: this.sound.add('battleSound', { volume: 0.6 }),

};


const tileWidth = 386;
      const visibleTileHeight = 193;
      const overlap = visibleTileHeight / 2;
      const halfTileWidth = tileWidth / 2;


      const totalMapHeight = ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2;
      const offsetX = window.innerWidth / 2;


      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }
       

       const centerTileX = Math.floor(mapSize / 2);
const centerTileY = Math.floor(mapSize / 2);
const { worldX: centerX, worldY: centerY } = tileToWorldPosition(centerTileX, centerTileY);

// Center the large map image there
const mapImage = this.add.image(centerX, centerY, 'largemap');
mapImage.setDisplaySize(8000, 4600); // Optional: you can also scale it with .setScale() instead


      

      

      this.lights.enable();
      this.lights.setAmbientColor(0x9999);
      this.lights.addLight(window.innerWidth * 2.5, -1500, 800).setColor(0xfff8e1).setIntensity(2.5);

      const sunGraphics = this.add.graphics();
      sunGraphics.setScrollFactor(0);
      sunGraphics.fillStyle(0xfff8e1, 1);
      sunGraphics.fillCircle(window.innerWidth * 2.5, -1500, 500);

      


      musicRef.current = this.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.5,
      });

      function worldToTilePosition(worldX, worldY) {
        const adjustedWorldX = worldX - offsetX;
        const x = Math.floor((worldY / overlap + adjustedWorldX / halfTileWidth) / 2);
        const y = Math.floor((worldY / overlap - adjustedWorldX / halfTileWidth) / 2);
        return { x, y };
      }




      const hoverCells = Array.from({ length: mapSize }, () => Array(mapSize).fill(null));



      for (let y = 0; y < mapSize; y++) {
  for (let x = 0; x < mapSize; x++) {
    const { worldX, worldY } = tileToWorldPosition(x, y);

    // 1) Create the GRASS sprite fully hidden.
    // Depth places it under flags/units but above the big background map.
    const grass = this.add.image(worldX, worldY, 'grass')
      .setDepth(worldY - 10)
      .setAlpha(0);
    hoverCells[y][x] = grass;

    // 2) Create an invisible interactive zone on top of the cell.
    // Slightly smaller than tile so you don't catch neighbor edges.
   const diamond = new Phaser.Geom.Polygon([
  0, visibleTileHeight / 2,               // top point
  tileWidth / 2, visibleTileHeight,       // right point
  tileWidth, visibleTileHeight / 2,       // bottom point
  tileWidth / 2, 0                        // left point
]);

const zone = this.add.zone(worldX - tileWidth / 2, worldY, tileWidth, visibleTileHeight)
  .setOrigin(0, 0) // match polygon coords
  .setInteractive(diamond, Phaser.Geom.Polygon.Contains);
    zone.setDepth(worldY + 50); // ensure it's on top to receive hover

    // 3) Fade in/out on hover (skip while dragging the map).
    zone.on('pointerover', () => {
      this.tweens.add({
        targets: grass,
        alpha: 1,
        tint: 0xff0000,
        duration: 120,
        ease: 'Linear'
      });
    });

    zone.on('pointerout', () => {
      this.tweens.add({
        targets: grass,
        alpha: 0,
        duration: 120,
        ease: 'Linear'
      });
    });
  }
}




     

          
          


     



      

      this.cameras.main.setZoom(zoomLevel);
      const mapCenterY = totalMapHeight / 2;
      this.cameras.main.scrollY = mapCenterY - window.innerHeight / 2;

      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let cameraStartX = 0;
      let cameraStartY = 0;

      this.input.on('pointerdown', function (pointer) {
        pointer.event.preventDefault();

        if (pointer.button === 0) {
          isDragging = true;
          dragStartX = pointer.x;
          dragStartY = pointer.y;
          cameraStartX = this.cameras.main.scrollX;
          cameraStartY = this.cameras.main.scrollY;
        } else if (pointer.button === 2) {

                        setinteractionMenuTypeA("");


          if (pointer.flagClicked) {
            // Reset the flag and skip global handling since it was already handled by the flag
            pointer.flagClicked = false;
            return;
          }


          const worldX = pointer.worldX;
          const worldY = pointer.worldY;
          const { x, y } = worldToTilePosition(worldX, worldY);
      
          handleRightClick(x, y);  // Call the async function to fetch the bonus
        }
      }, this);
      

      this.input.on('pointermove', function (pointer) {
  if (isDragging) {
    const zoom = this.cameras.main.zoom;
    const dragX = (dragStartX - pointer.x) / zoom;
    const dragY = (dragStartY - pointer.y) / zoom;

    let newScrollX = cameraStartX + dragX;
    let newScrollY = cameraStartY + dragY;

    // Get dimensions of the full map (after scaling)
    const mapWidth = 8000; // your large map image width
    const mapHeight = 4600; // your large map image height

    const viewWidth = this.scale.width / zoom;
    const viewHeight = this.scale.height / zoom;

    // Calculate scroll limits
    const minScrollX = (- mapWidth - viewWidth) / 2;
    const maxScrollX = (mapWidth + viewWidth) / 2;

    const minScrollY = (- mapHeight - viewHeight) / 2;
    const maxScrollY = (mapHeight + viewHeight);

    // Clamp camera position
    this.cameras.main.scrollX = Phaser.Math.Clamp(newScrollX, minScrollX, maxScrollX);
    this.cameras.main.scrollY = Phaser.Math.Clamp(newScrollY, minScrollY, maxScrollY);
  }
}, this);


      this.input.on('pointerup', function (pointer) {
        if (pointer.button === 0) {
          isDragging = false;
        }
      }, this);

      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (deltaY > 0) {
          zoomLevel = Phaser.Math.Clamp(zoomLevel - 0.04, 0.24, 0.8);
        } else {
          zoomLevel = Phaser.Math.Clamp(zoomLevel + 0.04, 0.24, 0.8);
        }
        this.cameras.main.setZoom(zoomLevel);
      });
    }

    function update() {}

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }

      window.removeEventListener('contextmenu', disableContextMenu);

      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [appKey]);



  const toggleMusic = () => {
    if (musicRef.current) {
      if (isMusicPlaying) {
        musicRef.current.pause();
      } else {
        musicRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };


  
  


  useEffect(() => {
    const setupEventListener = async () => {
      try {
        const marketcontract = await getMarketplaceContract();
  
        // Clear existing listeners for "TileUpdated" to prevent duplicates
        marketcontract.removeAllListeners("ResourcesSent");
        marketcontract.removeAllListeners("TileAttacked");
  
        // Set up the event listener with a single instance
        marketcontract.on("ResourcesSent", (sender, ax, ay, receiver, dx, dy, type, amount) => {

          triggerResourcesCinematics({ ax, ay, dx, dy, type });

        });



        marketcontract.on("TileAttacked", (attacker, ax, ay, defender, dx, dy, attackerWon) => {


      triggerAttackCinematics({ ax, ay, dx, dy });

      
    });


      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };
  

     if (RPC !== 'https://api.s0.b.hmny.io') {
    setupEventListener();
  }

    // Cleanup listener on unmount
    return () => {

      getMarketplaceContract().then((marketcontract) => {
    marketcontract.removeAllListeners("TileAttacked");
    marketcontract.removeAllListeners("ResourcesSent");
  });

    };
  }, [triggerAttackCinematics, triggerResourcesCinematics]);
  
  const handleGoBackToApp = () => {
    setShowTheLand(false);
    setAppKey(Date.now()); // Force a full re-render of App.js
  };
  
  
  
  
  
  if (showTheLand) {
    return (
      <TheLand
        tileCoords={selectedTile} // Pass the selected tile coordinates
        goBackToApp={handleGoBackToApp} // Pass the go-back function
      />
    );
  }
  
  



  return (
    <div
  style={{
    pointerEvents: LoadingAttack || loadingResources ? 'none' : 'auto',
  }}
>
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #87CEFA, #4682B4)',
      }}
    >

<ToastContainer limit={1} closeButton={false} />






{loading && (
  <>
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        pointerEvents: 'all',
      }}
    ></div>

    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
      }}
    >
      <Circles height="100" width="100" color="#ffffff" ariaLabel="loading-indicator" />
    </div>
  </>
)}


      <div
        id="phaser-container"
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
      >
      
      <button
  onClick={toggleMusic}
  style={{
    position: 'absolute',
    top: 10,
    right: 10,
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 101,
  }}
>
  <img
    src={isMusicPlaying ? stopIcon : playIcon}
    alt={isMusicPlaying ? 'Stop Music' : 'Play Music'}
    style={{ width: '24px', height: '24px' }}
  />
</button>



      
      </div>
      <div
  className="message-card"
  style={{
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '15px',
    backgroundColor: 'rgba(62, 62, 62, 0.95)', // Slightly transparent white background
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a soft shadow
    color: '#f1e5c6', // Darker text color for contrast
    zIndex: 100,
    width: '250px',
  }}
><strong>Info Box</strong>
<div>
<a
            href={`https://twitter.com`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: '16px' }}
          >
            Tutorial Video
          </a>
          </div>
{metaMaskAccount ? (
<>
          <p>
            <strong>Logged in:</strong> {`${metaMaskAccount.slice(0, 4)}...${metaMaskAccount.slice(-3)}`} {/* Display logged in address */}
          </p>

          </>
        ) : (
          <p>
          <button type="button" onClick={loginMetaMask}>Connect</button>
          </p>
        )}

        {metaMaskAccount && hasTileG && (
          <>

<button onClick={generateReferralLink} style={{ marginBottom: '10px' }}>
              Create Referral Link
            </button>

            {/* Display the referral link if created */}
            {referralLink && (
              <p>
                <strong>Referral Link:</strong>
                <br />
                <span
                  style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline', fontSize: '9px' }}
                  onClick={copyToClipboard}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    copyToClipboard();
                  }}
                >
                  {referralLink}
                </span>
              </p>
            )}






        <button
            style={{
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '400',
                fontSize: '18px',
            }}
            onClick={() => setinteractionMenuTypeA("leaderboardX")}
        >
            Leaderboard
        </button>


        <button
            style={{
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '400',
                fontSize: '18px',
            }}
            onClick={() => setinteractionMenuTypeA("warlogsX")}
        >
            War Logs (World)
        </button>





            </>



        )}




        {tileCoords.occupied && (
  metaMaskAccount && (
    getAddress(metaMaskAccount) === tileCoords.occupant && (
      <div >
<button
            style={{
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '400',
                fontSize: '18px',
            }}
            onClick={() => setinteractionMenuTypeA("warlogsMine")}
        >
            My War Logs
        </button>

        




      </div>
    )
  ) 
)}



{tileCoords.occupant && (
  <div>
    {metaMaskAccount && getAddress(metaMaskAccount) === tileCoords.occupant ? (
      tileCoords.twitterHandle ? (
        <p>
          🐦 <strong>Twitter:</strong>{' '}
          <a
            href={`https://twitter.com/${tileCoords.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline' }}
          >
            @{tileCoords.twitterHandle}
          </a>
        </p>
      ) : (
        <button onClick={handleTwitterConnect}>Connect Twitter</button>
      )
    ) : (
      tileCoords.twitterHandle ? (
        <p>
          🐦 <strong>Twitter:</strong>{' '}
          <a
            href={`https://twitter.com/${tileCoords.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline' }}
          >
            @{tileCoords.twitterHandle}
          </a>
        </p>
      ) : (
        <p>🐦 Not connected to Twitter</p>
      )
    )}
  </div>
)}






  {tileCoords.x !== null && tileCoords.y !== null && (
    <div>
      <p>
        <strong>Land Coordinates</strong>:<br />
        X: {tileCoords.x}, Y: {tileCoords.y}
      </p>
      {tileCoords.bonusType && (
      <p>
        <strong>Bonus</strong>: {tileCoords.bonusType}
      </p>
    )}
      {tileCoords.occupied !== null && (
        <p>
          <strong>Occupied</strong>: {tileCoords.occupied ? 'Yes' : 'No'}
        </p>
      )}
      {tileCoords.occupant && (
        <>
  <p>
    <strong>Occupant</strong>: 
    {`${tileCoords.occupant.slice(0, 4)}...${tileCoords.occupant.slice(-3)}`} {/* Show first 4 and last 3 characters */}
  </p>

  {tileCoords.tileName ? (
  <p><strong>Realm Name</strong>: {tileCoords.tileName}</p>
) : (
  <p>Realm has no Name</p>
)}

{tileCoords.points !== undefined && (
  <p><strong>Points</strong>: {tileCoords.points}</p>
)}

{tileCoords.level !== undefined && (
  <p><strong>Level</strong>: {tileCoords.level}</p>
)}

  {tileCoords.clan ? (
    <>
    <strong>Clan</strong>: {tileCoords.clan.name} <br />



    {tileCoords.occupant.toLowerCase() === metaMaskAccount?.toLowerCase() &&
  userClan &&
  !userClan?.isLeader && (
    <button
      onClick={async () => {
        try {
              setLoading(true);

              // Approve 1000 LOP (1e3 * 1e6)
              const token = await getTokenSignerContract();
              const allowanceTx = await token.increaseAllowance(
                clancontractAddress,
                1_000_000_000 // 1000 * 10^6
              );
              await allowanceTx.wait();

              // Leave by tile coords
              const clan = await getclanSignerContract();
              const tx = await clan.leaveClanForTile(tileCoords.x - 1, tileCoords.y - 1);
              await tx.wait();


              // after await tx.wait()
const tileMap = await getContract();
const coords = await tileMap.getOccupiedTileByAddress(metaMaskAccount);
const x0 = Number(coords[0]), y0 = Number(coords[1]);

removeClanFlagFromTile(x0, y0);




              toast.success("You have left the clan.");
              setUserClan(null);
              setTileCoords((prev) => ({
                ...prev,
                clan: null,
                hasPendingInviteToClan: false,
              }));

              // Clear the flag on this tile and refresh visuals
              if (tilesRef?.current?.[tileCoords.x]?.[tileCoords.y]) {
                tilesRef.current[tileCoords.x][tileCoords.y].flagUrl = null;
              }
              updateTileMap();

              setLoading(false);
            } catch (err) {
              console.error("Error leaving clan:", err);
              toast.error("Failed to leave the clan.");
              setLoading(false);
            }
          }}
        >
          Leave Clan (1000 LOP)
        </button>
)}








    {userClan?.isLeader && tileCoords.clan.clanId === userClan.id &&
  tileCoords.occupant.toLowerCase() !== metaMaskAccount.toLowerCase() && (
    <button
    style={{ marginBottom: '9px'}}
      onClick={async () => {
         try {
              setLoading(true);

              const clan = await getclanSignerContract();
              const land = await getTheLandContract();

              // Fetch leader coords from on-chain clan info
              const info = await clan.getClanInfo(userClan.id);
              const leaderX = parseInt(info.leaderX);
              const leaderY = parseInt(info.leaderY);

              // Must have Clan Hall at the leader tile
              const hasHall = await land.hasClanHallAtCoord(leaderX, leaderY);
              if (!hasHall) {
                toast.error("Can not remove members without Clan Hall at your leader tile.");
                setLoading(false);
                return;
              }

              // Approve 1000 LOP (1e3 * 1e6)
              const token = await getTokenSignerContract();
              const allowanceTx = await token.increaseAllowance(
                clancontractAddress,
                1_000_000_000 // 1000 * 10^6
              );
              await allowanceTx.wait();

              // Remove member by tile coords
              const tx = await clan.removeMemberTile(
                userClan.id,
                leaderX,
                leaderY,
                tileCoords.x - 1,
                tileCoords.y - 1
              );
              await tx.wait();


removeClanFlagFromTile(tileCoords.x - 1, tileCoords.y - 1);


              toast.success("Member removed from clan");
              setTileCoords((prev) => ({
                ...prev,
                clan: null,
                hasPendingInviteToClan: false,
              }));

              // Clear flag on the removed member's tile & refresh
              if (tilesRef?.current?.[tileCoords.x]?.[tileCoords.y]) {
                tilesRef.current[tileCoords.x][tileCoords.y].flagUrl = null;
              }
              updateTileMap();

              setLoading(false);
            } catch (err) {
              console.error("Failed to remove member from clan:", err);
              toast.error("Failed to remove member");
              setLoading(false);
            }
          }}
        >
          RemoveFromClan (1000 LOP)
        </button>
)}


    
    </>
  ) : (
    
<p><strong>Clan</strong>: None</p>

)}





{tileCoords.occupant &&
  !tileCoords.clan && // Tile has no clan
  userClan?.isLeader && (
    <p>
      {tileCoords.hasPendingInviteToClan ? (
        <span>Has a pending clan invitation</span>
      ) : (
        <button
          onClick={async () => {

            setLoading(true);
            try {
              const clan = await getclanSignerContract();
              const land = await getTheLandContract();

              // Get leader tile coords from on-chain clan info
              const info = await clan.getClanInfo(userClan.id);
              const leaderX = parseInt(info.leaderX);
              const leaderY = parseInt(info.leaderY);

              // Must have a Clan Hall at the leader tile
              const hasHall = await land.hasClanHallAtCoord(leaderX, leaderY);
              if (!hasHall) {
                toast.error("Can not send invites without a Clan Hall at your leader tile.");
                setLoading(false);
                return;
              }

              // Send invite to the TARGET tile coordinates
              const tx = await clan.inviteTileToClan(
                userClan.id,
                leaderX,
                leaderY,
                tileCoords.x - 1,
                tileCoords.y - 1
              );
              await tx.wait();

              toast.success("Invitation sent!");

              // Mark pending in UI
              setTileCoords((prev) => ({
                ...prev,
                hasPendingInviteToClan: true,
              }));
              setLoading(false);
            } catch (err) {
              console.error(err);
              toast.error("Failed to send invite");
              setLoading(false);
            }
          }}
        >
          Invite to Clan
        </button>
      )}
    </p>
)}





</>
      )}


      {tileCoords.occupied && hasTileG &&
 metaMaskAccount &&
 getAddress(metaMaskAccount) !== tileCoords.occupant && (
  <div>
    <button className='card-button' onClick={() => setinteractionMenuTypeA("sendResources")}>
      Send Resources Here
    </button>
  </div>
)}



      {tileCoords.occupied &&
 hasTileG &&
 metaMaskAccount &&
  metaMaskAccount.toLowerCase() !== tileCoords.occupant.toLowerCase() &&
  userClan.id !== tileCoords.clan?.clanId &&
 (!userClan?.id || !tileCoords.clanId) && (
  <div>
    {attackCooldownMessage ? (
      <p style={{ fontWeight: 'bold', color: 'orange' }}>{attackCooldownMessage}</p>
    ) : (
      <button className='card-button' onClick={() => setinteractionMenuTypeA("attackMenu")}>
        Attack here
      </button>
    )}
  </div>
)}



  



{tileCoords.occupied && (
  metaMaskAccount ? (
    getAddress(metaMaskAccount) === tileCoords.occupant && (
      <div >
<p>
<button onClick={handleEnterLand}>Enter the Land</button>
      </p>

        {tileCoords.isOnSale ? (
          <>
          <p>Sale Price: {tileCoords.salePrice / 10 ** 6} LOP</p>
      <button onClick={() => setTileForSale(tileCoords.x, tileCoords.y, false)}>
        Remove from Sale
      </button>
      </>
    ) : (
      <>
        <input
          type="number"
          placeholder="Enter sale price in LOP"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="fancy-inputX"
        />
        <button onClick={() => setTileForSale(tileCoords.x, tileCoords.y, true)}>
          Put on Sale
        </button>
      </>
    )} <p>
        <button onClick={fetchReferralNetwork} style={{ marginTop: '10px' }}>
    My Referral Network
  </button></p>


     


      </div>
    )
  ) : (
    <div>
      <p>Login MetaMask to manage or buy this land.</p>
      <button type="button" onClick={loginMetaMask}>Login MetaMask</button>
    </div>
  )
)}






           
        {metaMaskAccount && (
          <>
            {tileCoords.isOnSale && tileCoords.occupied && getAddress(metaMaskAccount) !== tileCoords.occupant && (
              <div>
                <p>This tile is on sale for {tileCoords.salePrice / 10 ** 6} LOP tokens. Do you want to buy it?</p>
                <button onClick={() => buyTile(tileCoords.x, tileCoords.y)}>Buy Tile</button>
              </div>
            )}
          </>
          )}


    </div>
  )}

{showReferralNetwork && referralNetwork && (
  <div
    style={{
      position: 'absolute',
      top: '100px',
      left: '20px',
      padding: '15px',
      backgroundColor: 'rgba(44, 37, 37, 1)',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      color: '#333',
      zIndex: 100,
      width: '250px',
    }}
  >
    <p><strong>Referral Network</strong></p>
    <div>
        <a
            href={`https://twitter.com`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: '16px' }}
          >
            Referral System Docs
          </a>

</div>
    <p><strong>Referrer:</strong> {referralNetwork.referrer ? `${referralNetwork.referrer.slice(0, 6)}...${referralNetwork.referrer.slice(-4)}` : 'None'}</p>
    <p><strong>Referrals:</strong></p>
    <ul>
      {referralNetwork.referrals.length > 0 ? (
        referralNetwork.referrals.map((referral, index) => (
          <li key={index} style={{ color: '#aaac96ff' }}>{`${referral.slice(0, 6)}...${referral.slice(-4)}`}</li>
        ))
      ) : (
        <p>No referrals</p>
      )}
    </ul>
    <button onClick={() => setShowReferralNetwork(false)} style={{ marginTop: '10px' }}>Close</button>
  </div>
)}


  {tileCoords.x !== null && tileCoords.y !== null && !tileCoords.occupied && (
    <div>
      {isMetaMaskConnected ? (
        <div>
          <p>Occupy this land?</p>
          <p>Requires 100,000.00 LOP</p>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
  <input
    type="text"
    placeholder="Enter referrer address (optional)"
    value={referrer}
    onChange={(e) => setReferrer(e.target.value)}
    className="fancy-input"
    style={{ maxWidth: '100%', fontSize: '18px' }}
  />
</div>



          <button type="button" onClick={() => occupyTile(tileCoords.x, tileCoords.y)}>
            Occupy
          </button>
        </div>
      ) : (
        <div>
          <p>Login MetaMask to occupy this land</p>
          <button type="button" onClick={loginMetaMask}>Login MetaMask</button>
        </div>
      )}
    </div>
  )}
</div>



{interactionMenuTypeA === "sendResources" && (
  <div className="interaction-menuA">
    <h4>Send Resources</h4>

    {attackerResources && (
<>

<div className="card-resource-bar">
        <div className="resource-item">
          <img src={foodImage} alt="Food" style={{ width: "20px" }} />
          <span>{attackerResources.food}</span>
        </div>
        <div className="resource-item">
          <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
          <span>{attackerResources.wood}</span>
        </div>
        <div className="resource-item">
          <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
          <span>{attackerResources.stone}</span>
        </div>
        <div className="resource-item">
          <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
          <span>{attackerResources.iron}</span>
        </div>

        
      </div>

<div
style={{
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    justifyContent: 'center',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={offensiveArmorImage} alt="Offensive Armor" style={{ width: '20px' }} />
    <span>{attackerResources.offensiveArmor}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{attackerResources.defensiveArmor}</span>
</div>


<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={offensiveWeaponImage} alt="Offensive Weapon" style={{ width: '20px' }} />
    <span>{attackerResources.offensiveWeapon}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveWeaponImage} alt="Defensive Weapon" style={{ width: '20px' }} />
    <span>{attackerResources.defensiveWeapon}</span>
</div>



</div>

</>
)}








    <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: '400' }}>
  Target Land: ({tileCoords.x}, {tileCoords.y})
</div>

{attackDistance !== null && (
  <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: '400' }}>
    Distance: {attackDistance} units
  </div>
)}


    <div>
      <label>Resource Type: </label>
      <select className="medieval-select" value={sendResourceType} onChange={(e) => setSendResourceType(e.target.value)}>
        <option value="1">Food</option>
        <option value="2">Wood</option>
        <option value="3">Stone</option>
        <option value="4">Iron</option>
        <option value="5">Offensive Armor</option>
        <option value="6">Defensive Armor</option>
        <option value="7">Offensive Weapon</option>
        <option value="8">Defensive Weapon</option>
      </select>
    </div>
    <div style={{ marginTop: '10px', marginBottom: '20px' }}>
      <label>Amount: </label>
      <input
  type="number"
  className='fancy-input'
  value={sendResourceAmount}
  onChange={(e) => {
    const amount = e.target.value;
    setSendResourceAmount(amount);

    if (!isNaN(amount) && attackDistance !== null) {
      const distance = attackDistance;
      const lopCost = 100 * 10 ** 6 * distance;
      const resourceCost = Math.floor((distance * parseInt(amount)) / 30);

      setSendResourceLOPCost(lopCost);
      setSendResourceCost(resourceCost);
    } else {
      setSendResourceLOPCost(null);
      setSendResourceCost(null);
    }
  }}
  min={30}
  placeholder="Min: 30"
/>


    </div>
    {hasMarketplace ? (
  <button
    className="card-button"
    onClick={async () => {
      try {
        setloadingResources(true);
        gameRef.current.sounds.horsecart.play();
        startResourceTransferLoop(sendResourceType, attackerTileCoords, tileCoords);
        const signerMarket = await getMarketplaceSignerContract();
        const tokenContract = await getTokenSignerContract();
        const fromX = attackerTileCoords.x;
        const fromY = attackerTileCoords.y;
        const toX = tileCoords.x - 1;
        const toY = tileCoords.y - 1;
        const amount = parseInt(sendResourceAmount);
        const distance = Math.abs(fromX - toX) + Math.abs(fromY - toY);
        const lopFee = 100 * 10 ** 6 * distance;


        const approveTx = await tokenContract.increaseAllowance(signerMarket.target, lopFee);
        await approveTx.wait();

        const tx = await signerMarket.sendResources(fromX, fromY, toX, toY, parseInt(sendResourceType), amount);
        
        await tx.wait();
        


        toast.success("Resources sent!");
        setinteractionMenuTypeA("");
      } catch (err) {
        console.error("Send failed:", err);
        toast.error("Sending failed: " + (err.reason || err.message));
      } finally {
        stopResourceTransferLoop();
        setloadingResources(false);
      }
    }}
    disabled={!sendResourceAmount || parseInt(sendResourceAmount) < 30}
  >
    Confirm Send
  </button>
) : (
  <button className="card-button" disabled>
    Need Marketplace to send resources
  </button>
)}

    &nbsp;
    <button
      className="card-button"
      onClick={() => setinteractionMenuTypeA("")}
    >
      Cancel
    </button>

    {sendResourceLOPCost !== null && (
  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: '400' }}>
    Required LOP Tokens: {sendResourceLOPCost / 10 ** 6}
  </div>
)}

{sendResourceLOPCost !== null && sendResourceCost !== null && (
  <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: '400' }}>
    Required {getResourceName(sendResourceType)}: {sendResourceAmount} + {sendResourceCost} (Sending Cost) = {parseInt(sendResourceAmount) + parseInt(sendResourceCost)} <br />
    Remaining {getResourceName(sendResourceType)}: {getRemainingAmount(sendResourceType)} 
  </div>
)}



  </div>
)}




{interactionMenuTypeA === "attackMenu" && attackerTroops && (
  <div className="interaction-menuA">
    <h4>Attack Menu</h4>
    <div>
        <a
            href={`https://twitter.com`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: '16px' }}
          >
            War System Docs
          </a>

</div>
    <div>
      Attacker Soldiers<br/>
      <img src={offensiveSoldierImage} alt="Defensive Soldier" style={{ width: '20px' }} /> Offensive Soldiers: {attackerTroops.offensiveSoldier} 
    &nbsp; &nbsp;
    <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: '20px' }} /> Defensive Soldiers: {attackerTroops.defensiveSoldier}</div>

     <div style={{ marginTop: '10px' }}>
      Attack Power: {attackerPower} units
      </div>

    <div style={{ marginTop: '10px' }}>
       Distance: {attackDistance} units
      </div>

    {attackCost && attackerResources && (
  <div style={{ marginTop: '10px' }}>
    ⚔️ Attack Cost:<br/>
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Resource</th>
          <th>Current</th>
          <th>Cost</th>
          <th>Remaining</th>
        </tr>
      </thead>
      <tbody>
        {["food", "wood", "stone", "iron"].map((res) => (
          <tr key={res}>
            <td>{res.charAt(0).toUpperCase() + res.slice(1)}</td>
            <td>{attackerResources[res]}</td>
            <td>{attackCost[res]}</td>
            <td style={{ color: (attackerResources[res] - attackCost[res]) < 0 ? 'red' : 'inherit' }}>
              {attackerResources[res] - attackCost[res]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


{attackCooldownMessageX ? (
  <p style={{ fontWeight: 'bold', color: 'orange' }}>{attackCooldownMessageX}</p>
) : (
  <button className='card-button' onClick={handleConfirmAttack}>
    Confirm Attack
  </button>
)}

&nbsp;

<button
      onClick={() => setinteractionMenuTypeA("")}
      className='card-button'
    >
      Close
    </button>


  </div>
)}



{interactionMenuTypeA === "warlogsMine" && (
    <div className="interaction-menuA">
        <p style={{ marginBottom: '15px', fontWeight: '400' }}>
            Loading My War Logs require waiting time, please choose your preference
        </p>
        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("warlogsWeekMine");
                fetchMyRecentWarLogs();

            }}
        >
            Last Week's Logs (Loading Approx. 30 Seconds)
        </button>

        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("warlogsAllMine");
                fetchMyAllWarLogs();

            }}
        >
            All Time Logs (Loading Up To 3 Minutes)
        </button>

        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("");
            }}
        >
            Cancel
        </button>

    </div>
)}





{interactionMenuTypeA === "warlogsX" && (
    <div className="interaction-menuA">
        <p style={{ marginBottom: '15px', fontWeight: '400' }}>
            Loading War Logs (World) require waiting time, please choose your preference
        </p>
        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("warlogsWeek");
                fetchRecentWarLogs();
            }}
        >
            Last Week's Logs (Loading Approx. 1 Minute)
        </button>

        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("warlogsAll");
                fetchAllWarLogs();
            }}
        >
            All Time Logs (Loading Up To 10 Minutes)
        </button>

        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("");
            }}
        >
            Cancel
        </button>

    </div>
)}


{interactionMenuTypeA === "warlogsWeek" && (
  <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '10px' }}>⚔️ Last Week's War Logs (World) ⚔️</h3>

    <button
      onClick={() => setinteractionMenuTypeA("")}
      style={{
        padding: '8px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Close
    </button>

    {warLogsData.length > 0 ? (
      <table className="fancy-table" style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#6c757d' }}>
            <th>Attacker</th>
            <th>Attacker Clan</th>
            <th>Defender</th>
            <th>Defender Clan</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {warLogsData.map((item, index) => (
            <tr key={index}>
              <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
              <td>{item.attackerClanName}</td>
<td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
<td>{item.defenderClanName}</td>
<td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>

              <td>{item.attackerWon ? "Attacker Won" : "Defender Won"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No war logs available.</p>
    )}
  </div>
)}



{interactionMenuTypeA === "warlogsAll" && (
  <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '10px' }}>⚔️ All War Logs (World) ⚔️</h3>

    <button
      onClick={() => setinteractionMenuTypeA("")}
      style={{
        padding: '8px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Close
    </button>

    {warLogsData.length > 0 ? (
      <table className="fancy-table" style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#6c757d' }}>
            <th>Attacker</th>
            <th>Attacker Clan</th>
            <th>Defender</th>
            <th>Defender Clan</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {warLogsData.map((item, index) => (
            <tr key={index}>
              <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
              <td>{item.attackerClanName}</td>
<td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
<td>{item.defenderClanName}</td>
<td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>

              <td>{item.attackerWon ? "Attacker Won" : "Defender Won"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No war logs available.</p>
    )}
  </div>
)}




{interactionMenuTypeA === "warlogsWeekMine" && (
  <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '10px' }}>⚔️ My Last Week's War Logs ⚔️</h3>
    <button
      onClick={() => setinteractionMenuTypeA("")}
      style={{
        padding: '8px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Close
    </button>

    {warLogsData.length > 0 ? (
      <table className="fancy-table" style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
  <tr style={{ backgroundColor: '#6c757d' }}>
    <th>Attacker</th>
    <th>Attacker Power</th>
    <th>Attacker Soldiers</th>
    <th>Defender</th>
    <th>Defender Power</th>
    <th>Defender Soldiers</th>
    <th>Date</th>
    <th>Result</th>
    <th>Resources Stolen</th>
    
    
  </tr>
</thead>
<tbody>
  {warLogsData.map((item, index) => (
    <tr key={index}>
      <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
      <td>{item.attackerPower?.toString()}</td>
      <td>{item.attackerSoldiers?.toString()} - {item.attackerCasualties?.toString()} </td>
      <td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
      <td>{item.defenderPower?.toString()}</td>
      <td>{item.defenderSoldiers?.toString()} - {item.defenderCasualties?.toString()} </td>
      <td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>
      <td>{item.attackerWon ? "Attacker Won" : "Defender Won"}</td>
      <td>{item.resourcesStolen?.toString()}</td>
      
      
    </tr>
  ))}
</tbody>

      </table>
    ) : (
      <p>No war logs available.</p>
    )}
  </div>
)}




{interactionMenuTypeA === "warlogsAllMine" && (
  <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '10px' }}>⚔️ My All-Time War Logs ⚔️</h3>

    <button
      onClick={() => setinteractionMenuTypeA("")}
      style={{
        padding: '8px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Close
    </button>

    {warLogsData.length > 0 ? (
      <table className="fancy-table" style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
  <tr style={{ backgroundColor: '#6c757d' }}>
    <th>Attacker</th>
    <th>Attacker Power</th>
    <th>Attacker Soldiers</th>
    <th>Defender</th>
    <th>Defender Power</th>
    <th>Defender Soldiers</th>
    <th>Date</th>
    <th>Result</th>
    <th>Resources Stolen</th>
    
    
  </tr>
</thead>
<tbody>
  {warLogsData.map((item, index) => (
    <tr key={index}>
      <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
      <td>{item.attackerPower?.toString()}</td>
      <td>{item.attackerSoldiers?.toString()} - {item.attackerCasualties?.toString()} </td>
      <td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
      <td>{item.defenderPower?.toString()}</td>
      <td>{item.defenderSoldiers?.toString()} - {item.defenderCasualties?.toString()} </td>
      <td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>
      <td>{item.attackerWon ? "Attacker Won" : "Defender Won"}</td>
      <td>{item.resourcesStolen?.toString()}</td>
      
      
    </tr>
  ))}
</tbody>

      </table>
    ) : (
      <p>No war logs available.</p>
    )}
  </div>
)}




{interactionMenuTypeA === "warlogsAllMineX" && (
  <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
    <h3 style={{ marginBottom: '10px' }}>⚔️ Result of the Recent War ⚔️</h3>

    <button
      onClick={() => setinteractionMenuTypeA("")}
      style={{
        padding: '8px 12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Close
    </button>

    {warLogsData.length > 0 ? (
      <>
      <table className="fancy-table" style={{ width: '100%', fontSize: '16px', borderCollapse: 'collapse' }}>
        <thead>
  <tr style={{ backgroundColor: '#6c757d' }}>
    <th>Attacker</th>
    <th>Attacker Power</th>
    <th>Attacker Soldiers</th>
    <th>Defender</th>
    <th>Defender Power</th>
    <th>Defender Soldiers</th>
    <th>Date</th>
    <th>Result</th>
    <th>Resources Stolen</th>
    
    
  </tr>
</thead>
<tbody>
  {warLogsData.map((item, index) => (
    <tr key={index}>
      <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
      <td>{item.attackerPower?.toString()}</td>
      <td>{item.attackerSoldiers?.toString()} - {item.attackerCasualties?.toString()} </td>
      <td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
      <td>{item.defenderPower?.toString()}</td>
      <td>{item.defenderSoldiers?.toString()} - {item.defenderCasualties?.toString()} </td>
      <td>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</td>
      <td>{item.attackerWon ? "Attacker Won" : "Defender Won"}</td>
      <td>{item.resourcesStolen?.toString()}</td>
      
      
    </tr>
  ))}
</tbody>

      </table>

<a
  href={createTwitterStoryShareLink(warLogsData[0], defenderHandle)}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#1DA1F2',
    color: '#fff',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold'
  }}
>
  🐦 Share on Twitter
</a>


</>
    ) : (
      <p>No war logs available.</p>
    )}
  </div>
)}





{interactionMenuTypeA === "leaderboardX" && (
    <div className="interaction-menuA">
        <p style={{ marginBottom: '15px', fontWeight: '400' }}>
            Loading Leaderboard requires around 1 minute, do you want to load the Leaderboard?
        </p>
        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("leaderboard");
                fetchLeaderboardData();
            }}
        >
            Yes, load the Leaderboard
        </button>

        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                margin: '5px'
            }}
            onClick={() => {
                setinteractionMenuTypeA("");
            }}
        >
            Cancel
        </button>

<div>
        <a
            href={`https://twitter.com`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: '16px' }}
          >
            Leaderboard Docs
          </a>

</div>

    </div>
)}




{interactionMenuTypeA === "leaderboard" && (
    <div className="interaction-menuA" style={{ maxHeight: '500px', overflowY: 'auto', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '10px' }}>🏆 Leaderboard 🏆</h3>

        <button
            style={{
                padding: '8px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                marginBottom: '10px',
                cursor: 'pointer'
            }}
            onClick={() => {
              setinteractionMenuTypeA("");
          }}
        >
            Close Leaderboard
        </button>

        {leaderboardData.length > 0 ? (
            <table style={{ width: '100%', fontSize: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#6c757d' }}>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>#</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Realm</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Clan</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Coords</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.name || "Unnamed"}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.clanName || "None"}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.x},{item.y}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p style={{ marginTop: '10px' }}>Leaderboard is empty or not loaded.</p>
        )}
    </div>
)}

<ChatBox
  account={metaMaskAccount}
  twitterHandle={
    metaMaskAccount && getAddress(metaMaskAccount) === tileCoords.occupant
      ? tileCoords.twitterHandle
      : null
  }
/>


<div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "monospace"
      }}
    >
      Total UseTurn TXs: {txCounter === 0 ? "Counting on-chain" : txCounter}
    </div>


</div>
    </div>
  );

}

export default App;
