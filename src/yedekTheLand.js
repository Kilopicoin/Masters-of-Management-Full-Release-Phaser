import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Phaser from 'phaser';
import grassXImage from './assets/grassX.png';
import foodXImage from './assets/foodX.png';
import woodXImage from './assets/woodX.png';
import stoneXImage from './assets/stoneX.png';
import ironXImage from './assets/ironX.png';
import eldersImage from './assets/elders.png';
import armoryImage from './assets/buildings/armory.png';
import blacksmithImage from './assets/buildings/blacksmith.png';
import clanhallImage from './assets/buildings/clanhall.png';
import fightingpitImage from './assets/buildings/fightingpit.png';
import houseImage from './assets/buildings/house.png';
import marketImage from './assets/buildings/market.png';
import towerImage from './assets/buildings/tower.png';
import workshopImage from './assets/buildings/workshop.png';
import backgroundMusicFile from './assets/background2.mp3';
import foodImage from './assets/res/food.png';
import woodImage from './assets/res/wood.png';
import stoneImage from './assets/res/stone.png';
import ironImage from './assets/res/iron.png';
import turnsImage from './assets/res/turns.png';
import playIcon from './assets/play-icon.png';
import stopIcon from './assets/stop-icon.png';

import defensiveArmorImage from './assets/armors/defensive.png';
import offensiveArmorImage from './assets/armors/offensive.png';

import defensiveWeaponImage from './assets/weapons/defensive.png';
import offensiveWeaponImage from './assets/weapons/offensive.png';

import defensiveSoldierImage from './assets/soldiers/defensive.png';
import offensiveSoldierImage from './assets/soldiers/offensive.png';

import { getTheLandSignerContract } from './TheLandContract';
import { getMarketplaceSignerContract, MarketplacecontractAddress } from './MarketplaceContract';
import { getclanSignerContract, clancontractAddress } from './clancontract';
import { getTokenSignerContract } from './Tokencontract';
import { getNFTSignerContract } from './nftContract';

import { Circles } from 'react-loader-spinner';
import './App.css';

const TheLand = ({ tileCoords, goBackToApp }) => {
    const gameRef = useRef(null);
    const selectedBuildingRef = useRef(null);
    const [metaMaskAccount, setMetaMaskAccount] = useState(null); // Kept for loginMetaMask logic
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false); // Kept for MetaMask state tracking
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [interactionMenuType, setinteractionMenuType] = useState("home");
    const buildingPreviewRef = useRef(null);
    const [loading, setLoading] = useState(true); // New state for loading
    const [tileData, setTileData] = useState(null); // For storing tile data (food, wood, stone, iron, level)
    const mapSize = 9;
    const turnsPerLevel = 1000;
    const clancreationcost = 100000 * 10 ** 6;
    const [armorQuantities, setArmorQuantities] = useState({ offensive: 0, defensive: 0 }); // To track input quantities
    const [weaponQuantities, setWeaponQuantities] = useState({ offensive: 0, defensive: 0 }); // To track input quantities
    const [soldierQuantities, setSoldierQuantities] = useState({ offensive: 0, defensive: 0 });

    const [showArmorCosts, setShowArmorCosts] = useState(false);
    const [showWeaponCosts, setShowWeaponCosts] = useState(false);
    const [showSoldierCosts, setShowSoldierCosts] = useState(false);
    const [buildingCounts, setBuildingCounts] = useState({});
    const [newClanName, setNewClanName] = useState('');

    const [selectedResourceType, setSelectedResourceType] = useState("1"); // Default to Food
    const [marketplaceItems, setMarketplaceItems] = useState([]);

    const [selectedResource, setSelectedResource] = useState("1");
const [sellAmount, setSellAmount] = useState("");
const [sellPrice, setSellPrice] = useState("");

const [userClan, setUserClan] = useState(null);
const [clanDetails, setClanDetails] = useState(null);


const [allClans, setAllClans] = useState([]);
const [showAllClansModal, setShowAllClansModal] = useState(false);

const [pendingInviteClanId, setPendingInviteClanId] = useState(null);
const [pendingInviteClanName, setPendingInviteClanName] = useState("");


const [showNameInput, setShowNameInput] = useState(false);
const [tileNameInput, setTileNameInput] = useState('');

const [tileName, setTileName] = useState('');

const [showFlagSelector, setShowFlagSelector] = useState(false);
const [ownedFlagNFTs, setOwnedFlagNFTs] = useState([]);

const musicRef2 = useRef(null);
const [isMusicPlaying, setIsMusicPlaying] = useState(false);
const [defenderCooldownTurnsLeft, setDefenderCooldownTurnsLeft] = useState(null);
const [selectedInteriorCoords, setSelectedInteriorCoords] = useState(null);


const [musicOnce, setmusicOnce] = useState(false);
    const [armorCosts, setArmorCosts] = useState({
        food: 0,
        wood: 0,
        stone: 0,
        iron: 0,
    });

    const [weaponCosts, setWeaponCosts] = useState({
        food: 0,
        wood: 0,
        stone: 0,
        iron: 0,
    });

    const [soldierCosts, setSoldierCosts] = useState({
        food: 0,
        wood: 0,
        stone: 0,
        iron: 0,
    });
    
    

    const buildingTypes = [
    { key: 'armory', no: 1, label: 'Armory', image: 'armory', cost: { wood: 3200, stone: 1440, food: 1240, iron: 880 } },
    { key: 'blacksmith', no: 2, label: 'Blacksmith', image: 'blacksmith', cost: { wood: 3000, stone: 1300, food: 1300, iron: 900 } },
    { key: 'clanhall', no: 3, label: 'Clan Hall', image: 'clanhall', cost: { wood: 4200, stone: 1960, food: 1760, iron: 1320 } },
    { key: 'fightingpit', no: 4, label: 'Fighting Pit', image: 'fightingpit', cost: { wood: 2800, stone: 1240, food: 1240, iron: 940 } },
    { key: 'house', no: 5, label: 'House', image: 'house', cost: { wood: 1040, stone: 450, food: 400, iron: 230 } }, // unchanged
    { key: 'market', no: 6, label: 'Market', image: 'market', cost: { wood: 3120, stone: 1460, food: 1460, iron: 880 } },
    { key: 'tower', no: 7, label: 'Tower', image: 'tower', cost: { wood: 6400, stone: 12200, food: 2780, iron: 2340 } },
    { key: 'workshop', no: 8, label: 'Workshop', image: 'workshop', cost: { wood: 3680, stone: 1880, food: 1680, iron: 1360 } },
];



    


  const buildingImageMap = useMemo(() => ({
    1: 'armory',
    2: 'blacksmith',
    3: 'clanhall',
    4: 'fightingpit',
    5: 'house',
    6: 'market',
    7: 'tower',
    8: 'workshop',
}), []);

const [calculatedResources, setCalculatedResources] = useState({
    food: 0,
    wood: 0,
    stone: 0,
    iron: 0,
});



const demolishBuilding = async (interiorX, interiorY) => {
  try {
    setLoading(true);
    const contract = await getTheLandSignerContract();
    const tx = await contract.demolishBuilding(
      tileCoords.x - 1,
      tileCoords.y - 1,
      interiorX,
      interiorY
    );
    await tx.wait();
    toast.success(`Building at (${interiorX}, ${interiorY}) demolished successfully!`);

    // Fetch updated tile data after the building is placed
            await fetchTileData(tileCoords.x, tileCoords.y);
            setArmorQuantities({ offensive: 0, defensive: 0 });
setWeaponQuantities({ offensive: 0, defensive: 0 });
setSoldierQuantities({ offensive: 0, defensive: 0 });
setArmorCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setWeaponCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setSoldierCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setShowArmorCosts(false);
setWeaponCosts(false);
setSoldierCosts(false);


            const updatedBuildings = await fetchAllBuildings(tileCoords.x - 1, tileCoords.y - 1);

const updatedCounts = {};
updatedBuildings.forEach((row) => {
    row.forEach((type) => {
        if (type > 0) {
            updatedCounts[type] = (updatedCounts[type] || 0) + 1;
        }
    });
});
setBuildingCounts(updatedCounts);


if (gameRef.current && gameRef.current.scene && gameRef.current.scene.keys && gameRef.current.scene.keys.default) {
  const scene = gameRef.current.scene.keys.default;
  const sprite = scene.buildingSprites?.[interiorX]?.[interiorY];
  if (sprite) {
    sprite.destroy();
    scene.buildingSprites[interiorX][interiorY] = null;
  }
}

    // 3. Reset interaction menu
    setinteractionMenuType('home');




  } catch (error) {
    console.error("Failed to demolish building:", error);
    toast.error("Failed to demolish building.");
  } finally {
    setLoading(false);
  }
};





useEffect(() => {
  if (window.ethereum) {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) return;
      if (accounts[0] !== metaMaskAccount) {
        window.location.reload(); // 👈 Same effect as your "Back to Map" button
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }
}, [metaMaskAccount]);




const fetchDefenderCooldown = useCallback(async (x, y) => {
  try {
    const marketContract = await getMarketplaceSignerContract();
    const landContract = await getTheLandSignerContract();

    const defTurnsUsedRaw = await landContract.getTotalTurnsUsedByTile(x - 1, y - 1);
    const defTurnsUsed = parseInt(defTurnsUsedRaw.toString());

    const lastDefRaw = await marketContract.lastDefenseTurn(x - 1, y - 1);
    const lastDef = parseInt(lastDefRaw.toString());

    const cooldownEnd = lastDef + 300;
    const turnsLeft = Math.max(0, cooldownEnd - defTurnsUsed);

    setDefenderCooldownTurnsLeft(turnsLeft);
  } catch (error) {
    console.error("Error fetching defender cooldown:", error);
    setDefenderCooldownTurnsLeft(null);
  }
}, []);

useEffect(() => {
  if (tileCoords?.x != null && tileCoords?.y != null) {
    fetchDefenderCooldown(tileCoords.x, tileCoords.y);
  }
}, [tileCoords?.x, tileCoords?.y, fetchDefenderCooldown]);




const handleSetClanFlag = async (tokenId) => {
  try {
    const clanContract = await getclanSignerContract();
    const tx = await clanContract.setClanFlag(userClan, tokenId);

    await tx.wait();
    toast.success("Clan flag set!");
    setShowFlagSelector(false);
  } catch (err) {
    console.error("Failed to set clan flag", err);
    toast.error("Failed to set flag");
  }
};


useEffect(() => {
  const tryPlayMusic2 = (e) => {
    if (musicRef2.current && !isMusicPlaying) {
      try {
        musicRef2.current.play();
        setIsMusicPlaying(true);
      } catch (err) {
        console.warn("Music autoplay failed", err);
      }
    }

    // Remove listeners after first interaction
    document.removeEventListener('pointerdown', tryPlayMusic2);
  };

  if (!musicOnce) {
  document.addEventListener('pointerdown', tryPlayMusic2);
  setmusicOnce(true);
  }

  

}, [isMusicPlaying, musicOnce]);


const fetchFlagNFTs = async () => {
  try {
    const nftContract = await getNFTSignerContract(); // MyNFTMarket
    const tokenIds = await nftContract.getOwnedTokenIds(metaMaskAccount);
    
    const validFlagNFTs = [];
    for (let i = 0; i < tokenIds.length; i++) {
      const tid = tokenIds[i];
      const [, , url, , , , , , , cId, ] = await nftContract.getNFTData(tid);
      if (Number(cId) === 1) {
        validFlagNFTs.push({ tokenId: tid, imageUrl: url });
      }
    }

    setOwnedFlagNFTs(validFlagNFTs);
    setShowFlagSelector(true);
  } catch (err) {
    console.error("Failed to fetch flag NFTs", err);
    toast.error("Failed to load your NFTs from collection 1");
  }
};








useEffect(() => {
    const fetchTileName = async () => {
        try {
            const contract = await getclanSignerContract();
            const name = await contract.getTileName(tileCoords.x - 1, tileCoords.y - 1);
            setTileName(name);
        } catch (error) {
            console.error("Error fetching tile name:", error);
        }
    };

    if (tileCoords?.x !== null && tileCoords?.y !== null) {
        fetchTileName();
    }
}, [tileCoords]);




const handleNameTile = async () => {
    if (!tileNameInput.trim()) {
        toast.error("Tile name cannot be empty.");
        return;
    }

    try {
        setLoading(true);

        const TokenContract = await getTokenSignerContract();
        const approvalTx = await TokenContract.increaseAllowance(clancontractAddress, 10000 * 10 ** 6);
        await approvalTx.wait();

        const contract = await getclanSignerContract();
        const tx = await contract.nameTile(tileCoords.x - 1, tileCoords.y - 1, tileNameInput);
        await tx.wait();

        toast.success("Tile named successfully!");
        setShowNameInput(false);
        setTileNameInput('');
    } catch (error) {
        console.error("Error naming tile:", error);
        toast.error("Failed to name tile.");
    } finally {
        setLoading(false);
    }
};




const fetchAllClans = async () => {
    try {
        const contract = await getclanSignerContract();
        const clans = await contract.getAllClans();
        setAllClans(clans);
        setShowAllClansModal(true);
    } catch (error) {
        console.error("Error fetching all clans:", error);
        toast.error("Failed to load all clans.");
    }
};

const fetchPendingInvite = async () => {
    try {
        const contract = await getclanSignerContract();
        const userAddress = await window.ethereum.request({ method: 'eth_accounts' });
        if (!userAddress.length) return;

        const clanId = await contract.pendingInvites(userAddress[0]);
        if (clanId > 0) {
            const info = await contract.getClanInfo(clanId);
            setPendingInviteClanId(clanId);
            setPendingInviteClanName(info.name);
        } else {
            setPendingInviteClanId(null);
            setPendingInviteClanName("");
        }
    } catch (error) {
        console.error("Error fetching pending invite:", error);
    }
};


useEffect(() => {
    if (metaMaskAccount) {
        fetchPendingInvite();
    }
}, [metaMaskAccount]);

const checkUserClan = useCallback(async () => {
    try {
        const contract = await getclanSignerContract();
        const userAddress = await window.ethereum.request({ method: 'eth_accounts' });

        if (!userAddress.length) {
            setUserClan(null);
            return;
        }

        const clanId = await contract.members(userAddress[0]);
        if (clanId.isMember) {
            setUserClan(clanId.clanId);
            const details = await contract.getClanInfo(clanId.clanId);
            setClanDetails(details);
        } else {
            setUserClan(null);
            setClanDetails(null);
        }
    } catch (error) {
        console.error("Error fetching clan info:", error);
        toast.error("Failed to fetch clan information.");
    }
}, []);

const createClan = async () => {
    if (!newClanName || newClanName.trim() === "") {
        toast.error("Please enter a clan name.");
        return;
    }

    try {
        setLoading(true);

        const TokencontractSigner = await getTokenSignerContract();
        const Allowancetx = await TokencontractSigner.increaseAllowance(
            clancontractAddress,
            clancreationcost
        );
        await Allowancetx.wait();

        const contract = await getclanSignerContract();
        const tx = await contract.createClan(newClanName);
        await tx.wait();
        toast.success("Clan created successfully!");
        await checkUserClan();
        setNewClanName(""); // Reset input
    } catch (error) {
        console.error("Error creating clan:", error);
        toast.error("Failed to create clan.");
    } finally {
        setLoading(false);
    }
};




const handleDisbandClan = async () => {
    if (!userClan) return;
    
    try {
        setLoading(true);
        const contract = await getclanSignerContract();
        const tx = await contract.disbandClan(userClan);
        await tx.wait();
        toast.success("Clan disbanded successfully!");
        await checkUserClan(); // refresh clan data
    } catch (error) {
        console.error("Error disbanding clan:", error);
        toast.error("Failed to disband clan.");
    } finally {
        setLoading(false);
    }
};





useEffect(() => {
    checkUserClan();
}, [checkUserClan]);




const produceArmor = async (armorType, quantity) => {
    if (quantity <= 0) {
        toast.error("Quantity must be greater than 0.");
        return;
    }

    try {
        setLoading(true);
        const contract = await getTheLandSignerContract();
        const tx = await contract.produceArmor(
            tileCoords.x - 1,
            tileCoords.y - 1,
            armorType,
            quantity
        );
        await tx.wait();
        toast.success(`${armorType === 1 ? "Offensive" : "Defensive"} armor produced successfully!`);
        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh tile data
    } catch (error) {
        console.error("Error producing armor:", error);
        toast.error("Failed to produce armor. Please try again.");
    } finally {
        setLoading(false);
    }
};




const produceWeapon = async (weaponType, quantity) => {
    if (quantity <= 0) {
        toast.error("Quantity must be greater than 0.");
        return;
    }

    try {
        setLoading(true);
        const contract = await getTheLandSignerContract();
        const tx = await contract.produceWeapon(
            tileCoords.x - 1,
            tileCoords.y - 1,
            weaponType,
            quantity
        );
        await tx.wait();
        toast.success(`${weaponType === 1 ? "Offensive" : "Defensive"} weapon produced successfully!`);
        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh tile data
    } catch (error) {
        console.error("Error producing weapon:", error);
        toast.error("Failed to produce weapon. Please try again.");
    } finally {
        setLoading(false);
    }
};



const trainSoldier = async (soldierType, quantity) => {
    if (quantity <= 0) {
        toast.error("Quantity must be greater than 0.");
        return;
    }

    try {
        setLoading(true);
        const contract = await getTheLandSignerContract();
        const tx = await contract.createSoldier(
            tileCoords.x - 1,
            tileCoords.y - 1,
            soldierType,
            quantity
        );
        await tx.wait();
        toast.success(`${soldierType === 1 ? "Offensive" : "Defensive"} soldier trained successfully!`);
        
        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh tile data after training soldiers
    } catch (error) {
        console.error("Error training soldier:", error);
        toast.error("Failed to train soldier. Please try again.");
    } finally {
        setLoading(false);
    }
};


const upgradeTech = async (techType) => {
    try {
        setLoading(true);
        const contract = await getTheLandSignerContract();
        const tx = await contract.upgradeTech(tileCoords.x - 1, tileCoords.y - 1, techType);
        await tx.wait();
        toast.success("Technology upgraded successfully!");

        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh data after upgrade
    } catch (error) {
        console.error("Error upgrading tech:", error);
        toast.error("Failed to upgrade technology. Please try again.");
    } finally {
        setLoading(false);
    }
};







const calculateArmorCost = useCallback((armorType, quantity) => {
    if (!tileData) return;

    const baseCost = armorType === 1
        ? { food: 120, wood: 120, stone: 100, iron: 180 } // Base costs for offensive armor
        : { food: 150, wood: 150, stone: 100, iron: 400 }; // Base costs for defensive armor

    // Adjust the cost if armories exist
     const armoryCount = buildingCounts[1] || 1; // You may want to dynamically calculate this based on your interior map data
    const multiplier = quantity / armoryCount;

    return {
        food: Math.ceil(baseCost.food * multiplier),
        wood: Math.ceil(baseCost.wood * multiplier),
        stone: Math.ceil(baseCost.stone * multiplier),
        iron: Math.ceil(baseCost.iron * multiplier),
    };
}, [tileData, buildingCounts]);




const calculateWeaponCost = useCallback((weaponType, quantity) => {
    if (!tileData) return;

    const baseCost = weaponType === 1
        ? { food: 120, wood: 180, stone: 100, iron: 300 } // Base costs for offensive armor
        : { food: 150, wood: 200, stone: 100, iron: 250 }; // Base costs for defensive armor

    // Adjust the cost if armories exist
    const blacksmithCount = 1; // You may want to dynamically calculate this based on your interior map data
    const multiplier = quantity / blacksmithCount;

    return {
        food: Math.ceil(baseCost.food * multiplier),
        wood: Math.ceil(baseCost.wood * multiplier),
        stone: Math.ceil(baseCost.stone * multiplier),
        iron: Math.ceil(baseCost.iron * multiplier),
    };
}, [tileData]);


const calculateSoldierCost = useCallback((soldierType, quantity) => {
    if (!tileData) return;

    const baseCost = soldierType === 1
        ? { food: 400, wood: 200, stone: 150, iron: 100 } // Base costs for offensive soldier
        : { food: 400, wood: 200, stone: 150, iron: 100 }; // Base costs for defensive soldier

    // Adjust cost if a Fighting Pit exists
    const fightingPitCount = 1; // Replace this with dynamic logic if needed
    const multiplier = quantity / fightingPitCount;

    return {
        food: Math.ceil(baseCost.food * multiplier),
        wood: Math.ceil(baseCost.wood * multiplier),
        stone: Math.ceil(baseCost.stone * multiplier),
        iron: Math.ceil(baseCost.iron * multiplier),
    };
}, [tileData]);



const handleArmorInputChange = (armorType, value) => {
    const quantity = parseInt(value || "0", 10);

    const offensiveCost = calculateArmorCost(1, armorType === 1 ? quantity : armorQuantities.offensive);
    const defensiveCost = calculateArmorCost(2, armorType === 2 ? quantity : armorQuantities.defensive);

    setArmorCosts({
        food: offensiveCost.food + defensiveCost.food,
        wood: offensiveCost.wood + defensiveCost.wood,
        stone: offensiveCost.stone + defensiveCost.stone,
        iron: offensiveCost.iron + defensiveCost.iron,
    });

    setArmorQuantities((prev) => ({
        ...prev,
        [armorType === 1 ? 'offensive' : 'defensive']: value,
    }));

    // Show or hide the cost line based on input values
    setShowArmorCosts(quantity > 0 || (armorType === 1 ? armorQuantities.defensive : armorQuantities.offensive) > 0);
};




const handleWeaponInputChange = (weaponType, value) => {
    const quantity = parseInt(value || "0", 10);

    const offensiveCost = calculateWeaponCost(1, weaponType === 1 ? quantity : weaponQuantities.offensive);
    const defensiveCost = calculateWeaponCost(2, weaponType === 2 ? quantity : weaponQuantities.defensive);

    setWeaponCosts({
        food: offensiveCost.food + defensiveCost.food,
        wood: offensiveCost.wood + defensiveCost.wood,
        stone: offensiveCost.stone + defensiveCost.stone,
        iron: offensiveCost.iron + defensiveCost.iron,
    });

    setWeaponQuantities((prev) => ({
        ...prev,
        [weaponType === 1 ? 'offensive' : 'defensive']: value,
    }));

    // Show or hide the cost line based on input values
    setShowWeaponCosts(quantity > 0 || (weaponType === 1 ? weaponQuantities.defensive : weaponQuantities.offensive) > 0);
};


const handleSoldierInputChange = (soldierType, value) => {
    const quantity = parseInt(value || "0", 10);

    const offensiveCost = calculateSoldierCost(1, soldierType === 1 ? quantity : soldierQuantities.offensive);
    const defensiveCost = calculateSoldierCost(2, soldierType === 2 ? quantity : soldierQuantities.defensive);

    setSoldierCosts({
        food: offensiveCost.food + defensiveCost.food,
        wood: offensiveCost.wood + defensiveCost.wood,
        stone: offensiveCost.stone + defensiveCost.stone,
        iron: offensiveCost.iron + defensiveCost.iron,
    });

    setSoldierQuantities((prev) => ({
        ...prev,
        [soldierType === 1 ? 'offensive' : 'defensive']: value,
    }));

    setShowSoldierCosts(quantity > 0 || (soldierType === 1 ? soldierQuantities.defensive : soldierQuantities.offensive) > 0);
};





const calculateResources = useCallback((turns) => {
    if (!tileData || !tileCoords.bonusType || !buildingCounts) return;

    const houseCount = (buildingCounts[5] || 0) + 1; // Ensure at least a multiplier of 1

    let food = turns * houseCount;
    let wood = turns * houseCount;
    let stone = turns * houseCount;
    let iron = turns * houseCount;

    // Apply bonus based on the bonus type
    switch (tileCoords.bonusType) {
        case "Food":
            food += turns * houseCount;
            break;
        case "Wood":
            wood += turns * houseCount;
            break;
        case "Stone":
            stone += turns * houseCount;
            break;
        case "Iron":
            iron += turns * houseCount;
            break;
        default:
            break;
    }


    setCalculatedResources({ food, wood, stone, iron });
}, [tileData, tileCoords.bonusType, buildingCounts]);



useEffect(() => {
    if (tileData && tileData.inputTurns) {
        calculateResources(parseInt(tileData.inputTurns));
    }
}, [tileData?.inputTurns, calculateResources, tileData]);


const getMaxAllowedTurns = () => {
    if (!tileData) return 0;
    const maxTurns = turnsPerLevel - parseInt(tileData.accumulatedTurns);
    return Math.min(maxTurns, parseInt(tileData.turns)); // Limit by available turns
};



const fetchTileData = useCallback(async (x, y) => {
    try {
        const contract = await getTheLandSignerContract();
        const tileDataResponse = await contract.getTileData(x - 1, y - 1);
        const currentTurns = await contract.getTurn(x - 1, y - 1); // Fetch real-time turns

        // Convert BigNumber to string or number
        setTileData({
            food: tileDataResponse.food.toString(),
            wood: tileDataResponse.wood.toString(),
            stone: tileDataResponse.stone.toString(),
            iron: tileDataResponse.iron.toString(),
            level: tileDataResponse.level.toString(),
            accumulatedTurns: tileDataResponse.accumulatedTurns.toString(),
            turns: currentTurns.toString(), // Add turns
            inputTurns: "", // Initialize inputTurns
            offensiveArmor: tileDataResponse.offensiveArmor.toString(),
            defensiveArmor: tileDataResponse.defensiveArmor.toString(),
            offensiveWeapon: tileDataResponse.offensiveWeapon.toString(),
            defensiveWeapon: tileDataResponse.defensiveWeapon.toString(),
            offensiveSoldier: tileDataResponse.offensiveSoldier.toString(),
            defensiveSoldier: tileDataResponse.defensiveSoldier.toString(),
            techLevels: {
                offensiveTech: tileDataResponse.offensiveTech.toString(),
                defensiveTech: tileDataResponse.defensiveTech.toString()
            },
            points: tileDataResponse.points.toString()
        });
    } catch (error) {
        console.error("Error fetching tile data:", error);
        toast.error("Failed to fetch tile data.");
    }
}, []); // Add dependencies if required (e.g., external variables used inside the function)

const fetchTileTurns = async (x, y) => {
    try {
        const contract = await getTheLandSignerContract();
        const updatedTurnsX = await contract.getTurn(x - 1, y - 1); // Fetch real-time turns
        const updatedTurns = updatedTurnsX.toString();

        console.log(updatedTurns)

        setTileData((prev) => ({
            ...prev,
            turns: updatedTurns, // Update turns in the state
        }));

        toast.success("Turns updated!");
    } catch (error) {
        console.error("Error fetching turns:", error);
        toast.error("Failed to fetch turns.");
    }
};



const fetchMarketplaceItemsByType = async () => {
    try {
        setLoading(true);
        const contract = await getMarketplaceSignerContract();
        const items = await contract.getListingsByResourceType(selectedResourceType); // Fetch only selected category

        const formattedItems = items.map((item, index) => ({
            id: index, // Since we don't store an ID in the contract, use index
            seller: item.seller,
            resourceType: item.resourceType.toString(),
            amount: item.amount.toString(),
            price: item.price.toString(),
        }));

        setMarketplaceItems(formattedItems);
    } catch (error) {
        console.error("Error fetching marketplace items:", error);
        toast.error("Failed to load marketplace items.");
    } finally {
        setLoading(false);
    }
};




const listItemForSale = async () => {
    try {
        setLoading(true);
        const contract = await getMarketplaceSignerContract();
        const x = tileCoords.x - 1;
        const y = tileCoords.y - 1;

        const resourceType = parseInt(selectedResource);
        const amount = parseInt(sellAmount);
        const price = parseInt(sellPrice);

        if (amount <= 0 || price <= 0) {
            toast.error("Amount and price must be greater than 0");
            setLoading(false);
            return;
        }

        const tx = await contract.listItemForSale(x, y, resourceType, amount, price);
        await tx.wait();

        toast.success("Item listed successfully!");
        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh tile data

        // Reset the input fields after successful listing
        setSellAmount("");
        setSellPrice("");
    } catch (error) {
        console.error("Error listing item:", error);
        toast.error("Failed to list item.");
    } finally {
        setLoading(false);
    }
};





const buyItem = async (item, index) => {
    try {
        setLoading(true);




        const TokencontractSigner = await getTokenSignerContract();
        
                const Allowancetx = await TokencontractSigner.increaseAllowance(
                  MarketplacecontractAddress,
                  item.price
                );
                await Allowancetx.wait();



        const contract = await getMarketplaceSignerContract();
        const tx = await contract.buyItem(
            tileCoords.x - 1,
            tileCoords.y - 1,
            item.resourceType,
            index
        );
        await tx.wait();

        toast.success("Item purchased successfully!");
        await fetchTileData(tileCoords.x, tileCoords.y); // Refresh tile data
        await fetchMarketplaceItemsByType(); // Refresh marketplace items
    } catch (error) {
        console.error("Error buying item:", error);
        toast.error("Failed to buy item.");
    } finally {
        setLoading(false);
    }
};





useEffect(() => {
    if (tileCoords && tileCoords.x !== null && tileCoords.y !== null) {
        fetchTileData(tileCoords.x, tileCoords.y);
    }
}, [tileCoords, fetchTileData]); // Include fetchTileData as a dependency



const placeBuildingOnTile = useCallback(
    async (mainX, mainY, interiorX, interiorY, buildingType, onTransactionStart, onTransactionEnd) => {
        setLoading(true);
        try {
            onTransactionStart(); // Temporarily place the transparent image
            const contract = await getTheLandSignerContract();

            
            const tx = await contract.placeBuilding(mainX, mainY, interiorX, interiorY, buildingType);
            await tx.wait();

            onTransactionEnd(true); // Confirm the image placement
            toast.success('Building placed successfully!');

            // Fetch updated tile data after the building is placed
            await fetchTileData(tileCoords.x, tileCoords.y);
            setArmorQuantities({ offensive: 0, defensive: 0 });
setWeaponQuantities({ offensive: 0, defensive: 0 });
setSoldierQuantities({ offensive: 0, defensive: 0 });
setArmorCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setWeaponCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setSoldierCosts({ food: 0, wood: 0, stone: 0, iron: 0 });
setShowArmorCosts(false);
setWeaponCosts(false);
setSoldierCosts(false);

            const updatedBuildings = await fetchAllBuildings(tileCoords.x - 1, tileCoords.y - 1);

const updatedCounts = {};
updatedBuildings.forEach((row) => {
    row.forEach((type) => {
        if (type > 0) {
            updatedCounts[type] = (updatedCounts[type] || 0) + 1;
        }
    });
});
setBuildingCounts(updatedCounts);


            return true; // Indicate success
        } catch (error) {
            console.error('Error placing building:', error);
            onTransactionEnd(false); // Remove the transparent image
            toast.error('Failed to place building. Please try again.');
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    },
    [tileCoords, fetchTileData] // Include necessary dependencies
);









const fetchAllBuildings = async (mainX, mainY) => {
    try {
        const contract = await getTheLandSignerContract();
        const buildings = await contract.getAllBuildings(mainX, mainY);
        return buildings; // Returns a 9x9 array of building types
    } catch (error) {
        console.error('Error fetching all buildings:', error);
        return Array(9).fill(Array(9).fill(0)); // Return an empty grid on error
    } finally {
        setLoading(false);
      }
};


 const toggleMusic = () => {
    if (musicRef2.current) {
      if (isMusicPlaying) {
        musicRef2.current.pause();
      } else {
        musicRef2.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };


    const loginMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setIsMetaMaskConnected(true);
                    setMetaMaskAccount(accounts[0]);
                }
            } catch (error) {
                console.error('MetaMask login failed', error);
            }
        } else {
            alert('MetaMask not detected');
        }
    };

    useEffect(() => {
        // Initialize the MetaMask connection state
        if (!isMetaMaskConnected) {
            loginMetaMask();
        }
    }, [isMetaMaskConnected]);

    useEffect(() => {
        if (gameRef.current) {
            return;
        }

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const disableContextMenu = (e) => {
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
        };

        gameRef.current = new Phaser.Game(config);

        let zoomLevel = 0.4;

        function preload() {
            this.load.audio('backgroundMusic2', backgroundMusicFile);
            this.load.image('grassX', grassXImage);
            this.load.image('foodX', foodXImage);
            this.load.image('woodX', woodXImage);
            this.load.image('stoneX', stoneXImage);
            this.load.image('ironX', ironXImage);
            this.load.image('elders', eldersImage);
            this.load.image('armory', armoryImage);
            this.load.image('blacksmith', blacksmithImage);
            this.load.image('clanhall', clanhallImage);
            this.load.image('fightingpit', fightingpitImage);
            this.load.image('house', houseImage);
            this.load.image('market', marketImage);
            this.load.image('tower', towerImage);
            this.load.image('workshop', workshopImage);

            this.load.image('food', foodImage);
            this.load.image('wood', woodImage);
            this.load.image('stone', stoneImage);
            this.load.image('iron', ironImage);
            this.load.image('turns', turnsImage);

            this.load.image('defensivearmor', defensiveArmorImage);
            this.load.image('offensivearmor', offensiveArmorImage);

            this.load.image('defensiveweapon', defensiveWeaponImage);
            this.load.image('offensiveweapon', offensiveWeaponImage);

            this.load.image('defensivesoldier', defensiveSoldierImage);
            this.load.image('offensivesoldier', offensiveSoldierImage);

        }

        async function create() {
            this.buildingSprites = Array(mapSize).fill(null).map(() => Array(mapSize).fill(null));

            const tileWidth = 386;
            const visibleTileHeight = 193;
            const overlap = visibleTileHeight / 2;
            const halfTileWidth = tileWidth / 2;

            const totalMapHeight = ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2;
            const offsetX = window.innerWidth / 2;

            const { x: mainX, y: mainY } = tileCoords;
            const buildings = await fetchAllBuildings(mainX - 1, mainY - 1);

                  const counts = {};
              
                  buildings.forEach((row) => {
                    row.forEach((buildingType) => {
                      if (buildingType > 0) {
                        counts[buildingType] = (counts[buildingType] || 0) + 1;
                      }
                    });
                  });
              
                  setBuildingCounts(counts);
               
musicRef2.current = this.sound.add('backgroundMusic2', {
        loop: true,
        volume: 0.5,
      });






            this.lights.enable();
            this.lights.setAmbientColor(0x9999);
            this.lights.addLight(window.innerWidth * 2.5, -1500, 800).setColor(0xfff8e1).setIntensity(2.5);

            function tileToWorldPosition(x, y) {
                const worldX = (x - y) * halfTileWidth + offsetX;
                const worldY = (x + y) * overlap;
                return { worldX, worldY };
            }


            let landX = 'grassX';


            switch (tileCoords.bonusType) {
        case "Food":
            landX = 'foodX';
            break;
        case "Wood":
            landX = 'woodX';
            break;
        case "Stone":
            landX = 'stoneX';
            break;
        case "Iron":
            landX = 'ironX';
            break;
        default:
            break;
    }

 for (let y = -mapSize * 4; y < mapSize * 8; y++) {
                for (let x = -mapSize * 4; x < mapSize * 8; x++) {
                    const { worldX, worldY } = tileToWorldPosition(x, y);
            this.add.image(worldX, worldY, landX).setDepth(worldY - 1000);
                }}


            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    const { worldX, worldY } = tileToWorldPosition(x, y);
                    this.add.image(worldX, worldY, 'grassX').setDepth(worldY);
                    

                    const buildingType = buildings[x][y]; // Get building type from the fetched data
                    if (buildingType > 0 && buildingImageMap[buildingType]) {
                        const buildingImage = buildingImageMap[buildingType];
                        const building = this.add.image(worldX, worldY, buildingImage).setDepth(worldY + 1);
                        this.buildingSprites[x][y] = building;
            
                        // Add interactivity specifically for the armory
                        if (buildingImage === 'armory') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('armory'); // Set the menu type to armory
                                }
                            });
                        } else if (buildingImage === 'blacksmith') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('blacksmith'); // Set the menu type to blacksmith
                                }
                            });
                        } else if (buildingImage === 'fightingpit') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('train-soldier'); // Set the menu type to train soldiers
                                }
                            });
                        } else if (buildingImage === 'house') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('house-info'); // Set the menu type to train soldiers
                                }
                            });
                        } else if (buildingImage === 'tower') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('tower-info'); // Set the menu type to train soldiers
                                }
                            });
                        } else if (buildingImage === 'workshop') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('workshop'); // Set the menu type to train soldiers
                                }
                            });
                        } else if (buildingImage === 'market') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('marketplace'); // Set the menu type to train soldiers
                                }
                            });
                        } else if (buildingImage === 'clanhall') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setSelectedInteriorCoords({ x, y });
                                    setinteractionMenuType('clanhall'); // Set the menu type to train soldiers
                                }
                            });
                        }
                        
                    }
                    

                    if (x === 4 && y === 4) {
                      const elders = this.add.image(worldX, worldY, 'elders').setDepth(worldY + 1);
      
                      // Add right-click listener to the elders image
                      elders.setInteractive({
                        pixelPerfect: true
                      });
                      elders.on('pointerdown', (pointer) => {
                          if (pointer.button === 2) {
                              // Show the "Select Building Type" menu
                              setinteractionMenuType("buildings");
                          }
                      });
                  }
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


            this.input.on('pointerdown', (pointer, gameObjects) => {
                if (pointer.button === 2) {
                    // If the click is not on a building, show the "home" menu
                    if (!gameObjects.length) {
                        setinteractionMenuType("home");
                    }
                }
            });


            const previewImage = this.add
                .image(0, 0, '')
                .setAlpha(0.5)
                .setVisible(false)
                .setDepth(10000); // Make sure it's above everything else
            buildingPreviewRef.current = previewImage;


            this.input.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    // Deselect building
                    setSelectedBuilding(null);
                    selectedBuildingRef.current = null;
        
                    // Hide the preview image
                    if (buildingPreviewRef.current) {
                        buildingPreviewRef.current.setVisible(false);
                    }
                }
            });

            this.input.on('pointermove', (pointer) => {
                if (selectedBuildingRef.current) {
                    const worldX = pointer.worldX;
                    const worldY = pointer.worldY;

                    const x = Math.floor((worldY / overlap + (worldX - offsetX) / halfTileWidth) / 2);
                    const y = Math.floor((worldY / overlap - (worldX - offsetX) / halfTileWidth) / 2);

                    if (x >= 0 && x < mapSize && y >= 0 && y < mapSize) {
                        const { worldX, worldY } = tileToWorldPosition(x, y);
                        previewImage.setPosition(worldX, worldY);
                        previewImage.setTexture(selectedBuildingRef.current);
                        previewImage.setVisible(true);
                    } else {
                        previewImage.setVisible(false);
                    }
                } else {
                    previewImage.setVisible(false);
                }
            });



            this.input.on('pointerdown', async function (pointer) {
                if (pointer.button === 0 && selectedBuildingRef.current) {

                    const worldX = pointer.worldX;
                    const worldY = pointer.worldY;
            
                    const x = Math.floor((worldY / overlap + (worldX - offsetX) / halfTileWidth) / 2);
                    const y = Math.floor((worldY / overlap - (worldX - offsetX) / halfTileWidth) / 2);
            
                    if (x >= 0 && x < mapSize && y >= 0 && y < mapSize) {
                        const { worldX, worldY } = tileToWorldPosition(x, y);
                        const buildingType = Object.keys(buildingImageMap).find(
                            (key) => buildingImageMap[key] === selectedBuildingRef.current
                        );
            
                        if (buildingType) {
                            // Add a temporary transparent image
                            const tempImage = this.add.image(worldX, worldY, selectedBuildingRef.current)
                                .setAlpha(0.5)
                                .setDepth(worldY + 1);

                                this.buildingSprites[x][y] = tempImage;
            
                            const onTransactionStart = () => {
                                tempImage.setVisible(true);
                            };
            
                            const onTransactionEnd = (success) => {
    if (success) {
        tempImage.setAlpha(1); // Make the image permanent

        // Add interactivity after placement
        tempImage.setInteractive({ pixelPerfect: true });

        const imageKey = selectedBuildingRef.current;
        if (imageKey === 'armory') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('armory');
                }
            });
        } else if (imageKey === 'blacksmith') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('blacksmith');
                }
            });
        } else if (imageKey === 'fightingpit') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('train-soldier');
                }
            });
        } else if (imageKey === 'house') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('house-info');
                }
            });
        } else if (imageKey === 'tower') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('tower-info');
                }
            });
        } else if (imageKey === 'workshop') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('workshop');
                }
            });
        } else if (imageKey === 'market') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('marketplace');
                }
            });
        } else if (imageKey === 'clanhall') {
            tempImage.on('pointerdown', (pointer) => {
                if (pointer.button === 2) {
                    setSelectedInteriorCoords({ x, y });
                    setinteractionMenuType('clanhall');
                }
            });
        }

    } else {
        tempImage.destroy(); // Remove if placement fails
    }
};


                            
            
                            await placeBuildingOnTile(
                                tileCoords.x - 1, // Main X coordinate
                                tileCoords.y - 1, // Main Y coordinate
                                x,
                                y,
                                parseInt(buildingType),
                                onTransactionStart,
                                onTransactionEnd
                            );

                            

            
                            selectedBuildingRef.current = null; // Reset the selected building
                        }
                    }
                } else if (pointer.button === 0 && !selectedBuildingRef.current) {
                    isDragging = true;
                    dragStartX = pointer.x;
                    dragStartY = pointer.y;
                    cameraStartX = this.cameras.main.scrollX;
                    cameraStartY = this.cameras.main.scrollY;
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
                    const minScrollX = (- mapWidth - viewWidth) / 3;
                    const maxScrollX = (mapWidth + viewWidth) / 3;
                
                    const minScrollY = (- mapHeight - viewHeight) / 4;
                    const maxScrollY = (mapHeight + viewHeight) / 2;
                
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
                    zoomLevel = Phaser.Math.Clamp(zoomLevel - 0.04, 0.4, 0.8);
                } else {
                    zoomLevel = Phaser.Math.Clamp(zoomLevel + 0.04, 0.4, 0.8);
                }
                this.cameras.main.setZoom(zoomLevel);
            });
        }

        function update() {}

        return () => {
          if (gameRef.current) {
            gameRef.current.destroy(true); // Destroy the Phaser game instance
            gameRef.current = null; // Reset the reference
          }
          
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        };
        
        
    }, [buildingImageMap, tileCoords, placeBuildingOnTile]);

    useEffect(() => {
      // Update the ref whenever `selectedBuilding` changes
      selectedBuildingRef.current = selectedBuilding;
  }, [selectedBuilding]);


  const executeUseTurns = async (turns, tileCoords, toast) => {
    if (!tileCoords.x || !tileCoords.y) {
        toast.error("Please select a tile first");
        return;
    }

    setLoading(true);

    try {
        const contract = await getTheLandSignerContract(); // Replace with your function to get a signer instance
        const tx = await contract.useTurns(turns, tileCoords.x - 1, tileCoords.y - 1);
        await tx.wait();

        // Fetch updated tile data after the transaction
        await fetchTileData(tileCoords.x, tileCoords.y);
        await fetchDefenderCooldown(tileCoords.x, tileCoords.y);
        
        toast.success(`Successfully used ${turns} turn(s)!`);
    } catch (error) {
        console.error("Error using turns:", error);
        toast.error("Failed to use turns. Please try again.");
    } finally {
        setLoading(false);
    }
};






    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(to bottom, #87CEFA, #4682B4)',
            }}
        >
            <ToastContainer limit={1} closeButton={false} />
            <div
                id="phaser-container"
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
            />


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
    id="interaction-menu"
    style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'block', // Initially hidden
        zIndex: 200,
        padding: '10px',
        backgroundColor: 'rgba(62, 62, 62, 0.95)',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        border: '2px solid #c4aa70',
        fontFamily: 'EB Garamond, serif',
        color: '#e8dbc0',
    }}
>



{interactionMenuType === "home" && (
    <>
        {tileData && (
    <>
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
                <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                <span>{tileData.food}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                <span>{tileData.wood}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                <span>{tileData.stone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                <span>{tileData.iron}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <strong>Level:</strong>
                <span>{tileData.level}/500</span>
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
                        <img src={offensiveArmorImage} alt="Offensive Armor" style={{ width: '24px' }} />
                        <span>{tileData.offensiveArmor}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '24px' }} />
                        <span>{tileData.defensiveArmor}</span>
                    </div>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={offensiveWeaponImage} alt="Offensive Weapon" style={{ width: '24px' }} />
                        <span>{tileData.offensiveWeapon}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={defensiveWeaponImage} alt="Defensive Weapon" style={{ width: '24px' }} />
                        <span>{tileData.defensiveWeapon}</span>
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
                <img src={offensiveSoldierImage} alt="Offensive Soldier" style={{ width: '30px' }} />
                <span>{tileData.offensiveSoldier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: '30px' }} />
                <span>{tileData.defensiveSoldier}</span>
            </div>

            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    Attack: 
    <span>{tileData ? (parseInt(tileData.offensiveSoldier) + parseInt(tileData.level) + parseInt(tileData.techLevels.offensiveTech)) : 0}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    Defense: 
    <span>{tileData ? (parseInt(tileData.defensiveSoldier) + parseInt(tileData.level) + (parseInt(buildingCounts[7] || 0) * 100)  + parseInt(tileData.techLevels.defensiveTech)) : 0}</span>
</div>

            



                </div>


        {/* Loading Bar */}
        <div className="medieval-progress-bar">
  <div
    className="medieval-progress-fill"
    style={{ width: `${(tileData.accumulatedTurns / 1000) * 100}%` }}
  ></div>
  <div className="medieval-progress-label">
    Next Level {tileData.accumulatedTurns}/{1000}
  </div>
</div>

    </>
)}



        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
       
        {tileData && (
    <>

<div
    style={{
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        justifyContent: 'center',
    }}
>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} 
        onClick={() => fetchTileTurns(tileCoords.x, tileCoords.y)}>
        <img src={turnsImage} alt="Turns" style={{ width: '20px' }} />
        <span>{tileData.turns}/600</span>
    </div>
</div>

        </>
)}

<input
    type="number"
    min="1"
    className="fancy-inputX"
    placeholder="Enter a number"
    style={{ flex: '1' }}
    value={(tileData && tileData.inputTurns) || ""}
    onChange={(e) => {
        const enteredValue = parseInt(e.target.value || "0", 10);
        const maxAllowed = getMaxAllowedTurns();
        const validatedValue = Math.min(enteredValue, maxAllowed); // Ensure the input does not exceed maxAllowed
        setTileData((prev) => ({ ...prev, inputTurns: validatedValue })); // Update input value in state
    }}
/>


<button
    className="card-button"
    onClick={() => {
        const turns = tileData?.inputTurns;
        if (turns && turns > 0) {
            executeUseTurns(turns, tileCoords, toast); // Use the validated value
        } else {
            toast.error("Please enter a valid number of turns");
        }
    }}
>
    Use Turn(s)
</button>



        </div>


{defenderCooldownTurnsLeft !== null && defenderCooldownTurnsLeft > 0 && (
  <div style={{ marginTop: '5px', textAlign: 'center', color: '#ffcc00' }}>
    🛡️ Defender Cooldown: {defenderCooldownTurnsLeft} turn(s) remaining
  </div>
)}





        {pendingInviteClanId && (
    <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <p>You have a pending invite from clan <strong>{pendingInviteClanName}</strong></p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
                onClick={async () => {
                    try {
                        const contract = await getclanSignerContract();
                        const tx = await contract.acceptInvite();
                        await tx.wait();
                        toast.success("Joined the clan!");
                        await checkUserClan();
                        await fetchPendingInvite();
                    } catch (err) {
                        console.error("Accept failed:", err);
                        toast.error("Failed to accept invite.");
                    }
                }}
                style={{ padding: '6px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Accept
            </button>
            <button
                onClick={async () => {
                    try {
                        const contract = await getclanSignerContract();
                        const tx = await contract.refuseInvite();
                        await tx.wait();
                        toast.info("Invite refused.");
                        setPendingInviteClanId(null);
                        setPendingInviteClanName("");
                    } catch (err) {
                        console.error("Refuse failed:", err);
                        toast.error("Failed to refuse invite.");
                    }
                }}
                style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
            >
                Refuse
            </button>
        </div>
    </div>
)}



        {tileData && tileData.inputTurns > 0 && (
            <>
                <div
                    style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                        <span>+{calculatedResources.food}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                        <span>+{calculatedResources.wood}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                        <span>+{calculatedResources.stone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                        <span>+{calculatedResources.iron}</span>
                    </div>
                </div>




<div
            style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                <span>
                    {parseInt(tileData.food) + calculatedResources.food}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                <span>
                    {parseInt(tileData.wood) + calculatedResources.wood}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                <span>
                    {parseInt(tileData.stone) + calculatedResources.stone}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                <span>
                    {parseInt(tileData.iron) + calculatedResources.iron}
                </span>
            </div>
        </div>

        </>
            )}



    </>
)}





















{interactionMenuType === "buildings" && (
    <>
        
<div style={{
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    justifyContent: 'center',
                }}>
                Select Building Type
                </div>

        {/* Current Tile Resources */}
        {tileData && (
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
                    <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                    <span>{tileData.food}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                    <span>{tileData.wood}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                    <span>{tileData.stone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                    <span>{tileData.iron}</span>
                </div>
                
            </div>
        )}

        {/* Building Type List */}
        <div
            style={{
                marginTop: '10px',
                display: 'flex', // Use flex for horizontal alignment
                gap: '6px', // Add space between building cards
                overflowX: 'auto', // Enable horizontal scrolling if needed
                padding: '3px 0',
            }}
        >
            {buildingTypes.map((building) => (
                <div
                    key={building.key}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px',
                        border: `2px solid ${
                            selectedBuilding === building.image ? '#daccb0ff' : '#c4aa70'
                        }`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        backgroundColor: selectedBuilding === building.image ? '#575757ff' : '#3e3e3e',
                        minWidth: '120px',
                    }}
                    onClick={() => setSelectedBuilding(building.image)}
                >
                    <img
                        src={require(`./assets/buildings/${building.image}.png`)}
                        alt={building.label}
                        style={{ width: '60px', height: '60px' }}
                    />
                    {building.label}({buildingCounts[building.no] || 0})
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                            <span>{building.cost.food}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                            <span>{building.cost.wood}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                            <span>{building.cost.stone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                            <span>{building.cost.iron}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </>
)}



{interactionMenuType === "armory" && (
  <div>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>


    <div className="card-title">Produce Armor</div>

   



    {tileData && (
        <>
      <div className="card-resource-bar">
        <div className="resource-item">
          <img src={foodImage} alt="Food" style={{ width: "20px" }} />
          <span>{tileData.food}</span>
        </div>
        <div className="resource-item">
          <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
          <span>{tileData.wood}</span>
        </div>
        <div className="resource-item">
          <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
          <span>{tileData.stone}</span>
        </div>
        <div className="resource-item">
          <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
          <span>{tileData.iron}</span>
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
    <span>{tileData.offensiveArmor}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{tileData.defensiveArmor}</span>
</div>


<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={offensiveWeaponImage} alt="Offensive Weapon" style={{ width: '20px' }} />
    <span>{tileData.offensiveWeapon}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveWeaponImage} alt="Defensive Weapon" style={{ width: '20px' }} />
    <span>{tileData.defensiveWeapon}</span>
</div>


<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={offensiveSoldierImage} alt="Offensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.offensiveSoldier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.defensiveSoldier}</span>
            </div>


</div>

</>
    )}
    <div className="card-content">
    <div className="input-container">
        <img src={offensiveArmorImage} alt="Offensive" style={{ width: "50px" }} />
        <input
            type="number"
            min="0"
            value={armorQuantities.offensive}
            onChange={(e) => handleArmorInputChange(1, e.target.value)}
        />
        <button
            className="card-button"
            onClick={() => produceArmor(1, armorQuantities.offensive)}
        >
            Produce Offensive Armor
        </button>
    </div>
    <div className="input-container">
        <img src={defensiveArmorImage} alt="Defensive" style={{ width: "50px" }} />
        <input
            type="number"
            min="0"
            value={armorQuantities.defensive}
            onChange={(e) => handleArmorInputChange(2, e.target.value)}
        />
        <button
            className="card-button"
            onClick={() => produceArmor(2, armorQuantities.defensive)}
        >
            Produce Defensive Armor
        </button>
    </div>

    {showArmorCosts && (
        <>
    <div
        style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={foodImage} alt="Food" style={{ width: '20px' }} />
            <span>-{armorCosts.food}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
            <span>-{armorCosts.wood}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
            <span>-{armorCosts.stone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
            <span>-{armorCosts.iron}</span>
        </div>
    </div>

<div
style={{
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={foodImage} alt="Food" style={{ width: '20px' }} />
    
    <span>{parseInt(tileData.food) - armorCosts.food}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
    <span>{parseInt(tileData.wood) - armorCosts.wood}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
    <span>{parseInt(tileData.stone) - armorCosts.stone}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
    <span>{parseInt(tileData.iron) - armorCosts.iron}</span>
</div>
</div>

</>
)}

</div>


  </div>
)}






{interactionMenuType === "blacksmith" && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
    <div className="card-title">Produce Weapon</div>
    {tileData && (
        <>
      <div className="card-resource-bar">
        <div className="resource-item">
          <img src={foodImage} alt="Food" style={{ width: "20px" }} />
          <span>{tileData.food}</span>
        </div>
        <div className="resource-item">
          <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
          <span>{tileData.wood}</span>
        </div>
        <div className="resource-item">
          <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
          <span>{tileData.stone}</span>
        </div>
        <div className="resource-item">
          <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
          <span>{tileData.iron}</span>
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
    <span>{tileData.offensiveArmor}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{tileData.defensiveArmor}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={offensiveWeaponImage} alt="Offensive Armor" style={{ width: '20px' }} />
    <span>{tileData.offensiveWeapon}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveWeaponImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{tileData.defensiveWeapon}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={offensiveSoldierImage} alt="Offensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.offensiveSoldier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.defensiveSoldier}</span>
            </div>

</div>

</>
    )}
    <div className="card-content">
    <div className="input-container">
        <img src={offensiveWeaponImage} alt="Offensive" style={{ width: "50px" }} />
        <input
            type="number"
            min="0"
            value={weaponQuantities.offensive}
            onChange={(e) => handleWeaponInputChange(1, e.target.value)}
        />
        <button
            className="card-button"
            onClick={() => produceWeapon(1, weaponQuantities.offensive)}
        >
            Produce Offensive Weapon
        </button>
    </div>
    <div className="input-container">
        <img src={defensiveWeaponImage} alt="Defensive" style={{ width: "50px" }} />
        <input
            type="number"
            min="0"
            value={weaponQuantities.defensive}
            onChange={(e) => handleWeaponInputChange(2, e.target.value)}
        />
        <button
            className="card-button"
            onClick={() => produceWeapon(2, weaponQuantities.defensive)}
        >
            Produce Defensive Weapon
        </button>
    </div>

    {showWeaponCosts && (
        <>
    <div
        style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={foodImage} alt="Food" style={{ width: '20px' }} />
            <span>-{weaponCosts.food}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
            <span>-{weaponCosts.wood}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
            <span>-{weaponCosts.stone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
            <span>-{weaponCosts.iron}</span>
        </div>
    </div>

<div
style={{
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={foodImage} alt="Food" style={{ width: '20px' }} />
    
    <span>{parseInt(tileData.food) - weaponCosts.food}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
    <span>{parseInt(tileData.wood) - weaponCosts.wood}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
    <span>{parseInt(tileData.stone) - weaponCosts.stone}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
    <span>{parseInt(tileData.iron) - weaponCosts.iron}</span>
</div>
</div>

</>
)}

</div>


  </div>
)}



{interactionMenuType === "train-soldier" && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
    <div className="card-title">Train Soldiers</div>
    {tileData && (
        <>
          <div className="card-resource-bar">
            <div className="resource-item">
              <img src={foodImage} alt="Food" style={{ width: "20px" }} />
              <span>{tileData.food}</span>
            </div>
            <div className="resource-item">
              <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
              <span>{tileData.wood}</span>
            </div>
            <div className="resource-item">
              <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
              <span>{tileData.stone}</span>
            </div>
            <div className="resource-item">
              <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
              <span>{tileData.iron}</span>
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
    <span>{tileData.offensiveArmor}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{tileData.defensiveArmor}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={offensiveWeaponImage} alt="Offensive Armor" style={{ width: '20px' }} />
    <span>{tileData.offensiveWeapon}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={defensiveWeaponImage} alt="Defensive Armor" style={{ width: '20px' }} />
    <span>{tileData.defensiveWeapon}</span>
</div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={offensiveSoldierImage} alt="Offensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.offensiveSoldier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: '20px' }} />
                <span>{tileData.defensiveSoldier}</span>
            </div>
          </div>
        </>
    )}

    <div className="card-content">
      <div className="input-container">
          <img src={offensiveSoldierImage} alt="Offensive Soldier" style={{ width: "50px" }} />
          <input
              type="number"
              min="0"
              value={soldierQuantities.offensive}
              onChange={(e) => handleSoldierInputChange(1, e.target.value)}
          />
          <button
    className="card-button"
    onClick={() => trainSoldier(1, soldierQuantities.offensive)}
>
    Train Offensive Soldier
</button>
      </div>

      <div className="input-container">
          <img src={defensiveSoldierImage} alt="Defensive Soldier" style={{ width: "50px" }} />
          <input
              type="number"
              min="0"
              value={soldierQuantities.defensive}
              onChange={(e) => handleSoldierInputChange(2, e.target.value)}
          />
          <button
    className="card-button"
    onClick={() => trainSoldier(2, soldierQuantities.defensive)}
>
    Train Defensive Soldier
</button>
      </div>




      {showSoldierCosts && (
        <>
    <div
        style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={foodImage} alt="Food" style={{ width: '20px' }} />
            <span>-{soldierCosts.food}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
            <span>-{soldierCosts.wood}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
            <span>-{soldierCosts.stone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
            <span>-{soldierCosts.iron}</span>
        </div>
    </div>

<div
style={{
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
}}
>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={foodImage} alt="Food" style={{ width: '20px' }} />
    
    <span>{parseInt(tileData.food) - soldierCosts.food}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
    <span>{parseInt(tileData.wood) - soldierCosts.wood}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
    <span>{parseInt(tileData.stone) - soldierCosts.stone}</span>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
    <span>{parseInt(tileData.iron) - soldierCosts.iron}</span>
</div>
</div>

</>
)}




    </div>
  </div>
)}




{interactionMenuType === "house-info" && (
    <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
    <div className="card-title">House</div>
    {tileData && (
        <>
          <div className="card-resource-bar">
          House is providing +1 to all resources each turn
          </div>

          
        </>
    )}

  
  </div>
)}




{interactionMenuType === "tower-info" && (
    <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
    <div className="card-title">Tower</div>
    {tileData && (
        <>
          <div className="card-resource-bar">
          Tower is providing +100 to Realm's Defense Power
          </div>

          
        </>
    )}

  
  </div>
)}




{interactionMenuType === "workshop" && (
    <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
        <div className="card-title">Workshop</div>

        {tileData && (
            <>
                <div className="card-resource-bar">
                    <div className="resource-item">
                        <img src={foodImage} alt="Food" style={{ width: "20px" }} />
                        <span>{tileData.food}</span>
                    </div>
                    <div className="resource-item">
                        <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
                        <span>{tileData.wood}</span>
                    </div>
                    <div className="resource-item">
                        <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
                        <span>{tileData.stone}</span>
                    </div>
                    <div className="resource-item">
                        <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
                        <span>{tileData.iron}</span>
                    </div>
                </div>

                <div className="card-content">
                    {[
                        { id: 1, name: "Offensive Tech", level: tileData.techLevels.offensiveTech },
                        { id: 2, name: "Defensive Tech", level: tileData.techLevels.defensiveTech }
                    ].map((tech) => {
                        // Calculate upgrade costs dynamically
                        const workshopCount = buildingCounts[8] || 1; // Ensure at least 1 workshop exists
                        const costMultiplier = parseInt(tech.level) + 1;
                        const foodCost = Math.ceil((140 * costMultiplier) / workshopCount);
                        const woodCost = Math.ceil((120 * costMultiplier) / workshopCount);
                        const stoneCost = Math.ceil((180 * costMultiplier) / workshopCount);
                        const ironCost = Math.ceil((120 * costMultiplier) / workshopCount);

                        return (
                            <div className="tech-item" key={tech.id}>
                                <strong>{tech.name}:</strong> {tech.level} &nbsp;
                                <button className='card-button' style={{ marginleft: '15px', marginTop: '15px' }} onClick={() => upgradeTech(tech.id)}>Upgrade</button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <img src={foodImage} alt="Food" style={{ width: '20px' }} />
                                    <span>{foodCost}</span>
                                    <img src={woodImage} alt="Wood" style={{ width: '20px' }} />
                                    <span>{woodCost}</span>
                                    <img src={stoneImage} alt="Stone" style={{ width: '20px' }} />
                                    <span>{stoneCost}</span>
                                    <img src={ironImage} alt="Iron" style={{ width: '20px' }} />
                                    <span>{ironCost}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
    </div>
)}




{interactionMenuType === "marketplace" && (
    <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', marginBottom: '10px', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>
        <div className="card-title">Marketplace</div>

        {/* Resource Selection */}
        <div className="card-content">
            <h4>Select a Resource Type</h4>
            <select 
            className="medieval-select"
                value={selectedResourceType} 
                onChange={(e) => setSelectedResourceType(e.target.value)}
            >
                <option value="1">Food</option>
                <option value="2">Wood</option>
                <option value="3">Stone</option>
                <option value="4">Iron</option>
                <option value="5">Offensive Armor</option>
                <option value="6">Defensive Armor</option>
                <option value="7">Offensive Weapon</option>
                <option value="8">Defensive Weapon</option>
            </select>
            <button 
                onClick={fetchMarketplaceItemsByType} 
                className='card-button'
                style={{ marginTop: '10px', padding: '8px' }}
            >
                Show Listings
            </button>
        </div>

        {/* List of Items (Only shows after fetching) */}
        {marketplaceItems.length > 0 ? (
            <div className="marketplace-list">
                <h4>Listed Items</h4>
                {marketplaceItems.map((item, index) => (
                    <div key={index} className="market-item" 
                        style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '5px 10px', 
                            borderBottom: '1px solid #ddd'
                        }}>
                        <span><strong>{item.seller.slice(0, 6)}...</strong></span>
                        <span>Amount: {item.amount}</span>
                        <span>Price: {item.price} LOP</span>
                        <button 
                            style={{
                                padding: '5px 10px', 
                                backgroundColor: '#28a745', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '5px', 
                                cursor: 'pointer'
                            }}
                            onClick={() => buyItem(item, index)}
                        >
                            Buy
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <p style={{ marginTop: '10px' }}>No items found in this category.</p>
        )}

        {/* Button to List a New Item */}
        <button 
            onClick={() => setinteractionMenuType("marketplaceCreate")}
            className='card-button'
            style={{ marginTop: '10px', padding: '8px', width: '100%' }}
        >
            List an Item for Sale
        </button>
    </div>
)}








{interactionMenuType === "marketplaceCreate" && (
    <div>
        <div className="card-title">Marketplace</div>

        {tileData && (
            <>
                <div className="card-resource-bar">
                    <div className="resource-item">
                        <img src={foodImage} alt="Food" style={{ width: "20px" }} />
                        <span>{tileData.food}</span>
                    </div>
                    <div className="resource-item">
                        <img src={woodImage} alt="Wood" style={{ width: "20px" }} />
                        <span>{tileData.wood}</span>
                    </div>
                    <div className="resource-item">
                        <img src={stoneImage} alt="Stone" style={{ width: "20px" }} />
                        <span>{tileData.stone}</span>
                    </div>
                    <div className="resource-item">
                        <img src={ironImage} alt="Iron" style={{ width: "20px" }} />
                        <span>{tileData.iron}</span>
                    </div>
                </div>

                <div className="card-content">
                    <h4>List an Item for Sale</h4>
                    <select className="medieval-select" value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}>
    <option value="1">Food</option>
    <option value="2">Wood</option>
    <option value="3">Stone</option>
    <option value="4">Iron</option>
    <option value="5">Offensive Armor</option>
    <option value="6">Defensive Armor</option>
    <option value="7">Offensive Weapon</option>
    <option value="8">Defensive Weapon</option>
</select>
<input 
    className='fancy-input'
    type="number" 
    placeholder="Amount" 
    value={sellAmount} 
    onChange={(e) => setSellAmount(e.target.value)} 
/>

<input 
className='fancy-input'
    type="number" 
    placeholder="Price in LOP" 
    value={sellPrice} 
    onChange={(e) => setSellPrice(e.target.value)} 
/>

                    <button className='card-button' onClick={() => listItemForSale()}>
                        List Item for Sale
                    </button>
                </div>
            </>
        )}
    </div>
)}




{interactionMenuType === "clanhall" && (
    <div className="interaction-menu" style={{ minWidth: '300px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
  <button
    style={{ backgroundColor: '#3b0000ff', color: 'gray' }}
    onClick={() => demolishBuilding(selectedInteriorCoords.x, selectedInteriorCoords.y)}
  >
    Demolish This Building
  </button>
</div>


        <h4>Clan Hall</h4>
        {userClan ? (
            <div>
                <p><strong>Clan:</strong> {clanDetails?.name}</p>
                <p><strong>Leader:</strong> {clanDetails?.leader.slice(0, 6)}...{clanDetails?.leader.slice(-6)}</p>
                <p><strong>Members:</strong> {parseInt(clanDetails?.memberCount)}/30</p>

            {showFlagSelector && (
  <div className="interaction-menuA" style={{ minWidth: '900px', maxHeight: '500px', overflowY: 'auto' }}>
    <h3>Select an NFT as your Clan Flag</h3>
    <button className="card-button" onClick={() => setShowFlagSelector(false)}>Cancel</button>
    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {ownedFlagNFTs.map(nft => (
        <div key={nft.tokenId} style={{ border: '1px solid #ccc', padding: '5px' }}>
          <img src={nft.imageUrl} alt="nft" width={300} height={300} />
          <button className="card-button" onClick={() => handleSetClanFlag(nft.tokenId)}>
            Set as Flag
          </button>
        </div>
      ))}
    </div>
  </div>
)}




                {clanDetails?.leader?.toLowerCase() === metaMaskAccount?.toLowerCase() && (
<>
<div>
                    <button className="card-button" onClick={() => fetchFlagNFTs()}>
    Set Clan Flag
  </button>
</div>
                    <button 
                        onClick={handleDisbandClan}
                        style={{
                            marginTop: '10px',
                            marginBottom: '10px',
                            padding: '10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Disband Clan
                    </button>
                    </>
                )}
            </div>
        ) : (
            <div>
                <input
                    type="text"
                    placeholder="Enter clan name"
                    value={newClanName}
                    onChange={(e) => setNewClanName(e.target.value)}
                    className='fancy-input'
                    style={{
                        marginBottom: '10px',
                        padding: '8px',
                        borderRadius: '5px',
                    }}
                />
                <button
                    onClick={createClan}
                    disabled={loading}
                    className='card-button'
                    style={{
                        marginBottom: '10px'
                    }}
                >
                    {loading ? "Creating Clan..." : "Create Clan"}
                </button>
            </div>
        )}

        {/* Show this button for both cases */}
        <button
    className="card-button"
    onClick={fetchAllClans}
>
    List All Clans
</button>

    </div>
)}







{showAllClansModal && (
    <div
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#2b2b2b',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 999,
            width: '420px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
    >
        <h4 style={{ textAlign: 'center' }}>All Clans</h4>

        {allClans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Header Row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '6px',
                    }}
                >
                    <span>Name</span>
                    <span>Leader</span>
                    <span>Members</span>
                </div>

                {/* Clan Rows */}
                {allClans.map((clan, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #eee',
                            padding: '4px 0',
                            fontSize: '14px',
                        }}
                    >
                        <span>{clan.name}</span>
                        <span>{clan.leader.slice(0, 6)}...{clan.leader.slice(-3)}</span>
                        <span>{parseInt(clan.memberCount)}/30</span>
                    </div>
                ))}
            </div>
        ) : (
            <p>No clans found.</p>
        )}

        <button
            onClick={() => setShowAllClansModal(false)}
            style={{
                width: '100%',
                marginTop: '15px'
            }}
            className='card-button'
        >
            Close
        </button>
    </div>
)}







</div>




      
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



      




            <div
                className="message-card"
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '15px',
                    backgroundColor: 'rgba(62, 62, 62, 0.95)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    zIndex: 100,
                    width: '250px',
                    color: '#e0d8c3',
                }}
            >
                <strong >Info Box</strong>
                <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '18px',
          }}
        >
          Back to Map
        </button>
                {metaMaskAccount ? (
                    <p>
                        <strong>Logged in:</strong>{' '}
                        {`${metaMaskAccount.slice(0, 4)}...${metaMaskAccount.slice(-3)}`}
                    </p>
                ) : (
                    <button type="button" onClick={loginMetaMask}>
                        Connect
                    </button>
                )}
                {tileCoords && (
        <>
            <p>
                <strong>Land:</strong> X: {tileCoords.x}, Y: {tileCoords.y}
            </p>


                <p>
                    <strong>Bonus:</strong> {tileCoords.bonusType}
                </p>





            {tileName ? (
    <>
        <strong>Realm Name:</strong> {tileName}
    </>
) : (

<>
        Realm has no Name
    </>


)}







            {metaMaskAccount && (
    <>
        <button
            style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#7a5e3c',
                color: '#f3eacb',
                border: '1px solid #c4aa70',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold',
            }}
            onClick={() => setShowNameInput(prev => !prev)}

        >
            Name your Realm
        </button>

        {showNameInput && (
            <div style={{ marginTop: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter Realm Name (10.000 LOP)"
                    value={tileNameInput}
                    onChange={(e) => setTileNameInput(e.target.value)}
                    style={{
                        backgroundColor: '#2b2b2b',
                        width: '90%',
                        padding: '6px',
                        borderRadius: '5px',
                        border: '1px solid #a88f58',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#e8dbc0'
                    }}
                />
                <button
                    onClick={handleNameTile}
                    style={{
                padding: '8px',
                backgroundColor: '#7a5e3c',
                color: '#f3eacb',
                border: '1px solid #c4aa70',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold',
                    }}
                >
                    Submit
                </button>
            </div>
        )}
    </>
)}








            
        </>
    )}
            </div>
        </div>
    );
};

export default TheLand;
