import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
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
import './App.css';

const TheLand = ({ tileCoords, goBackToApp }) => {
    const gameRef = useRef(null);
    const selectedBuildingRef = useRef(null);
    const [metaMaskAccount, setMetaMaskAccount] = useState(null); // Kept for loginMetaMask logic
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false); // Kept for MetaMask state tracking
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const buildingPreviewRef = useRef(null);
    const mapSize = 9;

    const buildingTypes = [
      { key: 'armory', label: 'Armory', image: 'armory' },
      { key: 'blacksmith', label: 'Blacksmith', image: 'blacksmith' },
      { key: 'clanhall', label: 'Clan Hall', image: 'clanhall' },
      { key: 'fightingpit', label: 'Fighting Pit', image: 'fightingpit' },
      { key: 'house', label: 'House', image: 'house' },
      { key: 'market', label: 'Market', image: 'market' },
      { key: 'tower', label: 'Tower', image: 'tower' },
      { key: 'workshop', label: 'Workshop', image: 'workshop' },
  ];

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
        }

        async function create() {
            const tileWidth = 386;
            const visibleTileHeight = 193;
            const overlap = visibleTileHeight / 2;
            const halfTileWidth = tileWidth / 2;

            const totalMapHeight = ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2;
            const offsetX = window.innerWidth / 2;

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

                    if (x === 4 && y === 4) {
                      const elders = this.add.image(worldX, worldY, 'elders').setDepth(worldY + 1);
      
                      // Add right-click listener to the elders image
                      elders.setInteractive();
                      elders.on('pointerdown', (pointer) => {
                          if (pointer.button === 2) {
                              // Show the "Select Building Type" menu
                              document.getElementById('building-menu').style.display = 'block';
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



            const previewImage = this.add
                .image(0, 0, '')
                .setAlpha(0.5)
                .setVisible(false)
                .setDepth(10000); // Make sure it's above everything else
            buildingPreviewRef.current = previewImage;

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



            this.input.on('pointerdown', function (pointer) {
              if (pointer.button === 0 && selectedBuildingRef.current) {
                const worldX = pointer.worldX;
                const worldY = pointer.worldY;

                const x = Math.floor((worldY / overlap + (worldX - offsetX) / halfTileWidth) / 2);
                const y = Math.floor((worldY / overlap - (worldX - offsetX) / halfTileWidth) / 2);

                if (x >= 0 && x < mapSize && y >= 0 && y < mapSize) {
                    const { worldX, worldY } = tileToWorldPosition(x, y);
                    this.add.image(worldX, worldY, selectedBuildingRef.current).setDepth(worldY + 1);
                    selectedBuildingRef.current = null;
                }
            }

              if (pointer.button === 0) {
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
        
        
    }, []);

    useEffect(() => {
      // Update the ref whenever `selectedBuilding` changes
      selectedBuildingRef.current = selectedBuilding;
  }, [selectedBuilding]);



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

<div
    id="building-menu"
    style={{
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'none', // Initially hidden
        zIndex: 200,
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}
>
    <strong>Select Building Type:</strong>
    <div style={{ marginTop: '10px' }}>
        {buildingTypes.map((building) => (
            <button
                key={building.key}
                style={{
                    margin: '5px',
                    padding: '10px',
                    backgroundColor: selectedBuilding === building.image ? '#007bff' : '#f0f0f0',
                    color: selectedBuilding === building.image ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    setSelectedBuilding(building.image);
                    document.getElementById('building-menu').style.display = 'none';
                }}
            >
                {building.label}
            </button>
        ))}
    </div>
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
          Go Back
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
    <p>
      <strong>Land:</strong> X: {tileCoords.x}, Y: {tileCoords.y}
    </p>
  )}
            </div>
        </div>
    );
};

export default TheLand;
