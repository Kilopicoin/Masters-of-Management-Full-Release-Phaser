import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import Phaser from 'phaser';
import grassImage from './assets/grass.png';
import oceanImage from './assets/ocean.png';
import whiteflagImage from './assets/whiteFlag.png';
import skyflagImage from './assets/skyFlag.png';
import largemapImage from './assets/file.png';
import getContract, { getSignerContract, contractAddress } from './contract';
import getTokenContract, { getTokenSignerContract } from './Tokencontract';
import { Circles } from 'react-loader-spinner';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundMusicFile from './assets/background.mp3';
import playIcon from './assets/play-icon.png';
import stopIcon from './assets/stop-icon.png';
import { getAddress } from 'ethers';
import TheLand from './theLand';
import getclanContract, { getclanSignerContract } from './clancontract';
import { getTheLandSignerContract } from './TheLandContract';
import getNFTContract, { getNFTSignerContract } from './nftContract';
import { getMarketplaceSignerContract } from './MarketplaceContract';
import defensiveSoldierImage from './assets/soldiers/defensive.png';
import offensiveSoldierImage from './assets/soldiers/offensive.png';

function App() {
  const gameRef = useRef(null);
  const [tileCoords, setTileCoords] = useState({ x: null, y: null, occupied: null, occupant: null });
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const tilesRef = useRef([]);
  const mapSize = 20;
  const [loading, setLoading] = useState(true); // New state for loading
  const [metaMaskAccount, setMetaMaskAccount] = useState(null);
  const [referrer, setReferrer] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef(null);
  const [referralNetwork, setReferralNetwork] = useState(null); // To store referrer and referrals
  const [showReferralNetwork, setShowReferralNetwork] = useState(false); // To show/hide the referral network info
  const occupationCost = 100000 * 10**6;
  const [salePrice, setSalePrice] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
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



const fetchRecentWarLogs = async () => {
  try {
    setLoading(true);
    const marketContract = await getMarketplaceSignerContract();
    const data = await marketContract.getRecentWarHistory();
    setWarLogsData(data);
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
    const data = await marketContract.getAllWarHistory();
    setWarLogsData(data);
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

    const marketContract = await getMarketplaceSignerContract();

    const ax = attackerTileCoords.x;
    const ay = attackerTileCoords.y;
    const dx = tileCoords.x - 1;
    const dy = tileCoords.y - 1;

    const tx = await marketContract.attackTile(ax, ay, dx, dy);
    await tx.wait();

    toast.success("Attack executed successfully!");

    // Optionally update UI:
    await fetchAttackerResources();
    await calculateAttackCost(tileCoords.x, tileCoords.y);
    await checkIfAccountOccupiedTile(); // re-fetch ownership

    setinteractionMenuTypeA(""); // close attack menu
  } catch (err) {
    console.error("Attack failed:", err);
    toast.error("Attack failed: " + (err.reason || err.message));
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
    });

    const marketContract = await getMarketplaceSignerContract();

    const attTurnsUsedRaw = await landContract.getTotalTurnsUsedByTile(attackerTileCoords.x, attackerTileCoords.y);
const attTurnsUsed = parseInt(attTurnsUsedRaw.toString());

const lastAttRaw = await marketContract.lastAttackTurn(attackerTileCoords.x, attackerTileCoords.y);
const lastAtt = parseInt(lastAttRaw.toString());

const cooldown = 300;

if (attTurnsUsed < lastAtt + cooldown) {
  const turnsLeft = (lastAtt + cooldown) - attTurnsUsed;
  setAttackCooldownMessageX(`Attacker Cooldown (${turnsLeft} turns left)`);
  return;
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
console.log(ax, ay, dx, dy)
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
  console.log("XXX")
  setmusicOnce(true);
  }

  

}, [isMusicPlaying, musicOnce]);





  const fetchLeaderboardData = async () => {
      try {
          setLoading(true);
          const TileMap = await getSignerContract(); // This holds ownership info
          const Land = await getTheLandSignerContract();
          const Clan = await getclanSignerContract();
  
          const tiles = [];
  
          for (let x = 0; x < 20; x++) {
              for (let y = 0; y < 20; y++) {
                  const tileStats = await Land.getTileData(x, y);
                  const points = parseInt(tileStats.points.toString());
                  if (points > 0) {
                      const occupant = await TileMap.getTileOccupant(x, y);
                      const name = await Clan.getTileName(x, y);
                      const clan = await Clan.getTileClan(x, y);
                      const clanNo = parseInt(clan) - 1;
                      const clanName = allclansX[clanNo][0];
                      
                      tiles.push({
                          x: x + 1,
                          y: y + 1,
                          occupant,
                          name,
                          clanName,
                          level: tileStats.level.toString(),
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
      if (!metaMaskAccount) return;
      try {
        const clanContract = await getclanSignerContract();
        const memberInfo = await clanContract.members(metaMaskAccount);
        if (memberInfo.isMember) {
          const info = await clanContract.getClanInfo(memberInfo.clanId);
          setUserClan({
            id: memberInfo.clanId,
            isLeader: info.leader.toLowerCase() === metaMaskAccount.toLowerCase(),
          });
        } else {
          setUserClan(null);
        }
      } catch (err) {
        console.error('Failed to fetch user clan', err);
      }
    };
  
    fetchUserClan();
  }, [metaMaskAccount]);
  
useEffect(() => {
  if (interactionMenuTypeA === "attackMenu") {
    fetchAttackerMilitary().then(data => {
      setAttackerTroops(data);
      // Calculate attacker power using the same formula as in the contract
      console.log((data.offensiveSoldier * 2), (data.defensiveSoldier * 1), (data.offensiveTech + 1))
      const calculatedPower = (data.offensiveSoldier * 2) + (data.defensiveSoldier * 1) + (data.offensiveTech + 1);
      setAttackerPower(calculatedPower);
    });
    fetchAttackerResources();
    if (tileCoords.x !== null && tileCoords.y !== null) {
      calculateAttackCost(tileCoords.x, tileCoords.y);
    }
  }
}, [interactionMenuTypeA, fetchAttackerMilitary, calculateAttackCost, fetchAttackerResources, tileCoords]);






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
  
      toast.success(`Tile is now ${isOnSale ? 'on' : 'off'} sale at ${salePrice} LOP tokens`);
  
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

      toast.success('Tile purchased successfully!');
      setTileCoords((prev) => ({ ...prev, occupied: true, occupant: metaMaskAccount }));

      await updateTileSaleInfo(x, y);
      await checkIfAccountOccupiedTile();

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


let clanInfo = null;
if (clanId > 0) {
  const info = await clanContract.getClanInfo(clanId);
  clanInfo = {
    name: info.name,
    leader: info.leader,
    memberCount: Number(info.memberCount)
  };
}

const occupantPendingClanId = await clanContract.pendingInvites(occupant);
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
                });


    const marketContract = await getMarketplaceSignerContract();

    const defTurnsUsedRaw = await landContract.getTotalTurnsUsedByTile(x, y);
    const defTurnsUsed = parseInt(defTurnsUsedRaw.toString());
    console.log(defTurnsUsed);

    const lastDefRaw = await marketContract.lastDefenseTurn(x, y);
    const lastDef = parseInt(lastDefRaw.toString());
    console.log(lastDef);

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
    const clanTileMap = {};
    for (let i = 0; i < tilesWithClans.length; i++) {
      const { x, y, clanId, flagTokenId } = tilesWithClans[i];
      clanTileMap[`${x}-${y}`] = { clanId, flagTokenId };
    }

    // Fetch and map all clanId -> flagURL
    const clanList = await clanContract.getAllClans();
    setallclansX(clanList);
    const clanFlagMap = {};

    for (let i = 0; i < clanList.length; i++) {
      const clanId = i + 1;
      const clan = clanList[i];

      if (!clan.exists) continue;

      const tokenId = await clanContract.clanFlags(clanId);
      if (tokenId.toString() === '0') continue;

      const [, , url] = await nftContract.getNFTData(tokenId);
      clanFlagMap[clanId.toString()] = url;
    }

    // Inject data into each tile
    for (let x = 0; x < occupiedTiles.length; x++) {
      for (let y = 0; y < occupiedTiles[x].length; y++) {
        const value = occupiedTiles[x][y];

        if (value === true) {
          const key = `${x}-${y}`;
          const clanData = clanTileMap[key] || { clanId: 0, flagTokenId: 0 };
          const clanIdStr = clanData.clanId.toString();

          occupiedTiles[x][y] = {
            occupied: true,
            clanId: clanIdStr,
            flagTokenId: clanData.flagTokenId,
            flagUrl: clanFlagMap[clanIdStr] || null,
          };
        } else {
          occupiedTiles[x][y] = null;
        }
      }
    }

    tilesRef.current = occupiedTiles;


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


       // const oceanImage = this.add.image((window.innerWidth / 2) - 80, (window.innerHeight * 2) + 190, 'ocean');
        //  oceanImage.setDisplaySize(19200, 10800); // Set the map image size

       const mapImage = this.add.image((window.innerWidth / 2) , (window.innerHeight * 2) + 150, 'largemap');
      mapImage.setDisplaySize(8000, 4600); // Set the map image size


      const tileWidth = 386;
      const visibleTileHeight = 193;
      const overlap = visibleTileHeight / 2;
      const halfTileWidth = tileWidth / 2;

      const totalMapHeight = ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2;
      const offsetX = window.innerWidth / 2;

      this.lights.enable();
      this.lights.setAmbientColor(0x9999);
      this.lights.addLight(window.innerWidth * 2.5, -1500, 800).setColor(0xfff8e1).setIntensity(2.5);

      const sunGraphics = this.add.graphics();
      sunGraphics.setScrollFactor(0);
      sunGraphics.fillStyle(0xfff8e1, 1);
      sunGraphics.fillCircle(window.innerWidth * 2.5, -1500, 500);

      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }


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




      



      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const { worldX, worldY } = tileToWorldPosition(x, y);

          this.add.image(worldX, worldY, 'grass').setDepth(worldY);
          
          // const tile = this.add.image(worldX, worldY, 'grass').setDepth(worldY);
          // tile.setPipeline('Light2D');
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
          this.cameras.main.scrollX = cameraStartX + dragX;
          this.cameras.main.scrollY = cameraStartY + dragY;
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
        const contract = await getContract();
  
        // Clear existing listeners for "TileUpdated" to prevent duplicates
        contract.removeAllListeners("TileUpdated");
  
        // Set up the event listener with a single instance
        contract.on("TileUpdated", (x, y, isOccupied, occupant) => {

  
          // Convert BigInt coordinates to regular numbers
          const xCoord = Number(x);
          const yCoord = Number(y);
  
          const formattedOccupant = `${occupant.slice(0, 4)}...${occupant.slice(-4)}`;
          const newEntry = `${formattedOccupant} has occupied the land at coordinates (${xCoord + 1}, ${yCoord + 1})`;

  
          setJournalEntries((prevEntries) => {
            if (!prevEntries.includes(newEntry)) {
              let newEntries = [newEntry, ...prevEntries];
              if (newEntries.length > 3) {
                prevEntries.pop(); // Remove the oldest entry if we have more than 3
                newEntries = [newEntry, ...prevEntries];
              }
              return newEntries;
            }
            return prevEntries;
          });

        });
      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };
  
    if (!loading) {
      setupEventListener();
    }
  
    // Cleanup listener on unmount
    return () => {
      getContract().then((contract) => {
        contract.removeAllListeners("TileUpdated");
      });
    };
  }, [loading, appKey]);
  
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
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #87CEFA, #4682B4)',
      }}
    >

<ToastContainer limit={1} closeButton={false} />



{loading && (
  <>
    {/* Dark background overlay */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay with some transparency
        zIndex: 99, // Below the spinner, but above the rest of the content
      }}
    ></div>

    {/* Loading spinner */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100, // Above everything
      }}
    >
      <Circles
        height="100"
        width="100"
        color="#ffffff"
        ariaLabel="loading-indicator"
      />
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
            War Logs
        </button>





            </>



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



  {tileCoords.clan ? (
    <>
    <strong>Clan</strong>: {tileCoords.clan.name} <br />



    {tileCoords.occupant.toLowerCase() === metaMaskAccount?.toLowerCase() &&
  userClan &&
  !userClan.isLeader && (
    <button
      onClick={async () => {
        try {
          const clanContract = await getclanSignerContract();
          const tx = await clanContract.leaveClan();
          await tx.wait();
          toast.success("You have left the clan.");
          // Reset clan info in UI
          setUserClan(null);
          setTileCoords((prev) => ({
            ...prev,
            clan: null,
            hasPendingInviteToClan: false,
          }));
        } catch (err) {
          console.error("Error leaving clan:", err);
          toast.error("Failed to leave the clan.");
        }
      }}
    >
      Leave Clan
    </button>
)}








    {tileCoords.clan.leader.toLowerCase() === metaMaskAccount.toLowerCase() &&
  tileCoords.occupant.toLowerCase() !== metaMaskAccount.toLowerCase() && (
    <button
      onClick={async () => {
        try {
          const clanContract = await getclanSignerContract();
          const tx = await clanContract.removeMember(userClan.id, tileCoords.occupant);
          await tx.wait();
          toast.success("Member removed from clan");
          setTileCoords(prev => ({
            ...prev,
            clan: null,
            hasPendingInviteToClan: false
          }));
        } catch (err) {
          console.error("Failed to remove member from clan:", err);
          toast.error("Failed to remove member");
        }
      }}
    >
      Remove from Clan
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
            try {
              const clanContract = await getclanSignerContract();
              const tx = await clanContract.inviteToClan(userClan.id, tileCoords.occupant);
              await tx.wait();
              toast.success("Invitation sent!");
              // Refresh tileCoords after invite
              setTileCoords(prev => ({
                ...prev,
                hasPendingInviteToClan: true,
              }));
            } catch (err) {
              console.error(err);
              toast.error("Failed to send invite");
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


      {tileCoords.occupied && metaMaskAccount && getAddress(metaMaskAccount) !== tileCoords.occupant && (
  <div>
    {attackCooldownMessage ? (
      <p style={{ fontWeight: 'bold', color: 'orange' }}>{attackCooldownMessage}</p>
    ) : (
      <button className='card-button'
      onClick={() => setinteractionMenuTypeA("attackMenu")}
      >
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
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      color: '#333',
      zIndex: 100,
      width: '250px',
    }}
  >
    <strong>Referral Network</strong>
    <p><strong>Referrer:</strong> {referralNetwork.referrer ? `${referralNetwork.referrer.slice(0, 6)}...${referralNetwork.referrer.slice(-4)}` : 'None'}</p>
    <p><strong>Referrals:</strong></p>
    <ul>
      {referralNetwork.referrals.length > 0 ? (
        referralNetwork.referrals.map((referral, index) => (
          <li key={index}>{`${referral.slice(0, 6)}...${referral.slice(-4)}`}</li>
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





{interactionMenuTypeA === "attackMenu" && attackerTroops && (
  <div className="interaction-menuA">
    <h4>Attack Menu</h4>
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



{interactionMenuTypeA === "warlogsX" && (
    <div className="interaction-menuA">
        <p style={{ marginBottom: '15px', fontWeight: '400' }}>
            Loading War Logs require waiting time, please choose your preference
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
            Last Week's War Logs (Loading Approx. 1 Minute)
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
            All War Logs (Loading Up To 10 Minutes)
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
    <h3 style={{ marginBottom: '10px' }}>⚔️ Last Week's War Logs ⚔️</h3>

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
      <table style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#6c757d' }}>
            <th>Attacker</th>
            <th>Defender</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {warLogsData.map((item, index) => (
            <tr key={index}>
              <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
<td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
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
    <h3 style={{ marginBottom: '10px' }}>⚔️ All War Logs ⚔️</h3>

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
      <table style={{ width: '100%', fontSize: '18px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#6c757d' }}>
            <th>Attacker</th>
            <th>Defender</th>
            <th>Date</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {warLogsData.map((item, index) => (
            <tr key={index}>
              <td>{Number(item.attackerX) + 1},{Number(item.attackerY) + 1}</td>
<td>{Number(item.defenderX) + 1},{Number(item.defenderY) + 1}</td>
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
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Level</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Points</th>
                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Occupant</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.name || "Unnamed"}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.clanName || "None"}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.x},{item.y}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.level}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.points}</td>
                            <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>
                                {item.occupant.slice(0, 6)}...{item.occupant.slice(-4)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p style={{ marginTop: '10px' }}>Leaderboard is empty or not loaded.</p>
        )}
    </div>
)}







<div className="journal-card">
  <strong>Journal</strong>
  <ul>
    {journalEntries.map((entry, index) => (
      <li key={index}>{entry}</li>
    ))}
  </ul>
</div>

    </div>
  );

}

export default App;
