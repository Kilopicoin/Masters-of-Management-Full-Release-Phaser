import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import Phaser from 'phaser';
import grassXImage from './assets/grassX.png';
import eldersImage from './assets/elders.png';
import armoryImage from './assets/buildings/armory.png';
import blacksmithImage from './assets/buildings/blacksmith.png';
import clanhallImage from './assets/buildings/clanhall.png';
import fightingpitImage from './assets/buildings/fightingpit.png';
import houseImage from './assets/buildings/house.png';
import marketImage from './assets/buildings/market.png';
import towerImage from './assets/buildings/tower.png';
import workshopImage from './assets/buildings/workshop.png';

import foodImage from './assets/res/food.png';
import woodImage from './assets/res/wood.png';
import stoneImage from './assets/res/stone.png';
import ironImage from './assets/res/iron.png';
import turnsImage from './assets/res/turns.png';

import defensiveArmorImage from './assets/armors/defensive.png';
import offensiveArmorImage from './assets/armors/offensive.png';

import { getTheLandSignerContract } from './TheLandContract';
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
    const [armorQuantities, setArmorQuantities] = useState({ offensive: 0, defensive: 0 }); // To track input quantities
    const [showArmorCosts, setShowArmorCosts] = useState(false);


    const [armorCosts, setArmorCosts] = useState({
        food: 0,
        wood: 0,
        stone: 0,
        iron: 0,
    });
    
    

    const buildingTypes = [
        { key: 'armory', label: 'Armory', image: 'armory', cost: { food: 100, wood: 50, stone: 30, iron: 20 } },
        { key: 'blacksmith', label: 'Blacksmith', image: 'blacksmith', cost: { food: 200, wood: 100, stone: 50, iron: 40 } },
        { key: 'clanhall', label: 'Clan Hall', image: 'clanhall', cost: { food: 300, wood: 100, stone: 50, iron: 40 } },
        { key: 'fightingpit', label: 'Fighting Pit', image: 'fightingpit', cost: { food: 400, wood: 100, stone: 50, iron: 40 } },
        { key: 'house', label: 'House', image: 'house', cost: { food: 500, wood: 100, stone: 50, iron: 40 } },
        { key: 'market', label: 'Market', image: 'market', cost: { food: 600, wood: 100, stone: 50, iron: 40 } },
        { key: 'tower', label: 'Tower', image: 'tower', cost: { food: 700, wood: 100, stone: 50, iron: 40 } },
        { key: 'workshop', label: 'Workshop', image: 'workshop', cost: { food: 800, wood: 100, stone: 50, iron: 40 } },
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

const calculateArmorCost = useCallback((armorType, quantity) => {
    if (!tileData) return;

    const baseCost = armorType === 1
        ? { food: 50, wood: 30, stone: 20, iron: 10 } // Base costs for offensive armor
        : { food: 40, wood: 20, stone: 30, iron: 15 }; // Base costs for defensive armor

    // Adjust the cost if armories exist
    const armoryCount = 1; // You may want to dynamically calculate this based on your interior map data
    const multiplier = quantity / armoryCount;

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






const calculateResources = useCallback((turns) => {
    if (!tileData || !tileCoords.bonusType) return;

    let food = turns + parseInt(tileData.level),
        wood = turns + parseInt(tileData.level),
        stone = turns + parseInt(tileData.level),
        iron = turns + parseInt(tileData.level);

    // Apply bonus based on the bonus type
    switch (tileCoords.bonusType) {
        case "Food":
            food += turns;
            break;
        case "Wood":
            wood += turns;
            break;
        case "Stone":
            stone += turns;
            break;
        case "Iron":
            iron += turns;
            break;
        default:
            break;
    }

    setCalculatedResources({ food, wood, stone, iron });
}, [tileData, tileCoords.bonusType]);


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
        const [food, wood, stone, iron, level, accumulatedTurns, offensiveArmor, defensiveArmor] = await contract.getTileData(x - 1, y - 1);
        const currentTurns = await contract.getTurn(x - 1, y - 1); // Fetch real-time turns

        // Convert BigNumber to string or number
        setTileData({
            food: food.toString(),
            wood: wood.toString(),
            stone: stone.toString(),
            iron: iron.toString(),
            level: level.toString(),
            accumulatedTurns: accumulatedTurns.toString(),
            turns: currentTurns.toString(), // Add turns
            inputTurns: "", // Initialize inputTurns
            offensiveArmor: offensiveArmor.toString(),
            defensiveArmor: defensiveArmor.toString()
        });
    } catch (error) {
        console.error("Error fetching tile data:", error);
        toast.error("Failed to fetch tile data.");
    }
}, []); // Add dependencies if required (e.g., external variables used inside the function)





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

        let zoomLevel = 0.24;

        function preload() {
            this.load.image('grassX', grassXImage);
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
        }

        async function create() {
            const tileWidth = 386;
            const visibleTileHeight = 193;
            const overlap = visibleTileHeight / 2;
            const halfTileWidth = tileWidth / 2;

            const totalMapHeight = ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2;
            const offsetX = window.innerWidth / 2;

            const { x: mainX, y: mainY } = tileCoords;
            const buildings = await fetchAllBuildings(mainX - 1, mainY - 1);

            this.lights.enable();
            this.lights.setAmbientColor(0x9999);
            this.lights.addLight(window.innerWidth * 2.5, -1500, 800).setColor(0xfff8e1).setIntensity(2.5);

            function tileToWorldPosition(x, y) {
                const worldX = (x - y) * halfTileWidth + offsetX;
                const worldY = (x + y) * overlap;
                return { worldX, worldY };
            }

            for (let y = 0; y < mapSize; y++) {
                for (let x = 0; x < mapSize; x++) {
                    const { worldX, worldY } = tileToWorldPosition(x, y);
                    this.add.image(worldX, worldY, 'grassX').setDepth(worldY);

                    const buildingType = buildings[x][y]; // Get building type from the fetched data
                    if (buildingType > 0 && buildingImageMap[buildingType]) {
                        const buildingImage = buildingImageMap[buildingType];
                        const building = this.add.image(worldX, worldY, buildingImage).setDepth(worldY + 1);
            
                        // Add interactivity specifically for the armory
                        if (buildingImage === 'armory') {
                            building.setInteractive({ pixelPerfect: true });
                            building.on('pointerdown', (pointer) => {
                                if (pointer.button === 2) { // Right-click
                                    setinteractionMenuType('armory'); // Set the menu type to armory
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
            
                            const onTransactionStart = () => {
                                tempImage.setVisible(true);
                            };
            
                            const onTransactionEnd = (success) => {
                                if (success) {
                                    tempImage.setAlpha(1); // Make the image permanent
                                } else {
                                    tempImage.destroy(); // Remove the image on failure
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
                    zoomLevel = Phaser.Math.Clamp(zoomLevel - 0.04, 0.24, 0.4);
                } else {
                    zoomLevel = Phaser.Math.Clamp(zoomLevel + 0.04, 0.24, 0.4);
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
    id="interaction-menu"
    style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'block', // Initially hidden
        zIndex: 200,
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
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
                        <img src={offensiveArmorImage} alt="Offensive Armor" style={{ width: '20px' }} />
                        <span>{tileData.offensiveArmor}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src={defensiveArmorImage} alt="Defensive Armor" style={{ width: '20px' }} />
                        <span>{tileData.defensiveArmor}</span>
                    </div>
                </div>


        {/* Loading Bar */}
        <div
            style={{
                height: '20px',
                width: '100%',
                backgroundColor: '#ddd',
                borderRadius: '5px',
                overflow: 'hidden',
                margin: '10px 0',
                position: 'relative',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${(tileData.accumulatedTurns / 1000) * 100}%`,
                    backgroundColor: '#007bff',
                    transition: 'width 0.3s ease',
                    position: 'absolute',
                }}
            />
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                }}
            >
                Next Level {tileData.accumulatedTurns}/{1000}
            </span>
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
                justifyContent: 'center',
            }}
        >
             <img src={turnsImage} alt="Turns" style={{ width: '20px' }} />
            <span style={{ marginLeft: '5px' }}>{tileData.turns}/600</span>
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
    style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }}
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
        <strong>Select Building Type:</strong>

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
                        flexDirection: 'column', // Stack image and text vertically
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px',
                        border: `2px solid ${
                            selectedBuilding === building.image ? '#007bff' : '#f0f0f0'
                        }`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        backgroundColor: selectedBuilding === building.image ? '#e8f0ff' : 'white',
                        minWidth: '120px', // Set a minimum width for each card
                    }}
                    onClick={() => setSelectedBuilding(building.image)}
                >
                    <img
                        src={require(`./assets/buildings/${building.image}.png`)}
                        alt={building.label}
                        style={{ width: '60px', height: '60px' }}
                    />
                    <strong>{building.label}</strong>
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





</div>



            <div
                className="message-card"
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    color: '#333',
                    zIndex: 100,
                    width: '250px',
                }}
            >
                <strong>Info Box</strong>
                <button
          onClick={goBackToApp}
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '14px',
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
            {tileCoords.bonusType && (
                <p>
                    <strong>Bonus:</strong> {tileCoords.bonusType}
                </p>
            )}
        </>
    )}
            </div>
        </div>
    );
};

export default TheLand;
