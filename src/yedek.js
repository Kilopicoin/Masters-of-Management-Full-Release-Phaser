import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import grassImage from './assets/grass.png'; // Replace with your image path
import whiteflagImage from './assets/whiteFlag.png'; // Replace with your white flag image path
import getContract, { getSignerContract } from './contract'; // Import contract functions

function App() {
  const gameRef = useRef(null); // To store the Phaser game instance
  const [tileCoords, setTileCoords] = useState({ x: null, y: null, occupied: null }); // Store the clicked tile coordinates and occupancy status
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false); // To check if MetaMask is connected
  const tilesRef = useRef([]); // Store the occupancy status of all tiles in a ref
  const mapSize = 20; // 20x20 map

  // Check if MetaMask is connected
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
  }, []);

  // Fetch occupancy data for all tiles at the start
  useEffect(() => {
    const fetchAllOccupiedTiles = async () => {
      try {
        const contract = await getContract();
        const occupiedTiles = await contract.getAllOccupiedTiles();
        tilesRef.current = occupiedTiles; // Update ref directly
        updateTileMap(); // Update the tilemap with the new data
      } catch (error) {
        console.error('Error fetching all occupied tiles:', error);
      }
    };
    fetchAllOccupiedTiles();
  }, []);

  // Function to update the tilemap after the occupancy data is loaded
  const updateTileMap = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.keys.default;
      const tileWidth = 386;
      const visibleTileHeight = 193;
      const overlap = visibleTileHeight / 2;
      const halfTileWidth = tileWidth / 2;
      const offsetX = window.innerWidth / 2;

      // Function to convert tile coordinates to world coordinates
      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }

      // Update the tilemap
      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const { worldX, worldY } = tileToWorldPosition(x, y);

          // Check if the tile is occupied and render the flag on top if it is
          if (tilesRef.current.length > 0 && tilesRef.current[x][y]) {
            scene.add.image(worldX, worldY, 'whiteflag').setDepth(worldY + 1);
          }
        }
      }
    }
  };

  // Occupy tile function to call the smart contract
  const occupyTile = async (x, y) => {
    try {
      const contract = await getSignerContract();
      await contract.occupyTile(x - 1, y - 1); // Use 0-based indexing for Solidity
      setTileCoords((prev) => ({ ...prev, occupied: true }));
      tilesRef.current[x - 1][y - 1] = true; // Update the tile as occupied in the ref
      updateTileMap(); // Update the tilemap
    } catch (error) {
      console.error('Error occupying tile:', error);
    }
  };

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    // Set overflow hidden to prevent scrollbars
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Disable right-click context menu
    const disableContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', disableContextMenu);

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth, // Dynamically set width
      height: window.innerHeight, // Dynamically set height
      parent: 'phaser-container',
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      scale: {
        mode: Phaser.Scale.RESIZE, // Rescale the game automatically
        autoCenter: Phaser.Scale.CENTER_BOTH, // Automatically center the game
      },
      audio: {
        disableWebAudio: true, // Disables Phaser's Web Audio to avoid AudioContext issues
      },
      transparent: true, // Ensure the canvas is transparent
      banner: false, // Disable the Phaser banner in the console
    };

    gameRef.current = new Phaser.Game(config); // Store the Phaser game instance

    let zoomLevel = 0.24; // Set the initial zoom level here

    function preload() {
      this.load.image('grass', grassImage);
      this.load.image('whiteflag', whiteflagImage);
    }

    async function create() {
      const tileWidth = 386; // Full width of the tile
      const visibleTileHeight = 193; // Only the bottom visible half of the tile is counted
      const overlap = visibleTileHeight / 2; // For isometric depth, tiles overlap vertically

      const halfTileWidth = tileWidth / 2;

      const totalMapHeight =
        ((mapSize - 1) * overlap + visibleTileHeight / 2) * 2; // Total height of the map considering vertical overlap

      const offsetX = window.innerWidth / 2;

      this.lights.enable();
      this.lights.setAmbientColor(0x9999);

      this.lights.addLight(window.innerWidth * 2.5, -1500, 800).setColor(0xfff8e1).setIntensity(2.5);

      const sunGraphics = this.add.graphics();
      sunGraphics.setScrollFactor(0); 
      sunGraphics.fillStyle(0xfff8e1, 1);
      sunGraphics.fillCircle(window.innerWidth * 2.5, -1500, 500);

      // Function to convert tile coordinates to world coordinates
      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }

      // Function to convert world coordinates to tile coordinates
      function worldToTilePosition(worldX, worldY) {
        const adjustedWorldX = worldX - offsetX;
        const x = Math.floor((worldY / overlap + adjustedWorldX / halfTileWidth) / 2);
        const y = Math.floor((worldY / overlap - adjustedWorldX / halfTileWidth) / 2);
        return { x, y };
      }

      // Set up the tiles in the scene
      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const { worldX, worldY } = tileToWorldPosition(x, y);

          // Render the grass tile
          const tile = this.add.image(worldX, worldY, 'grass').setDepth(worldY);
          tile.setPipeline('Light2D');
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

      this.input.on(
        'pointerdown',
        function (pointer) {
          // Prevent default behavior to avoid page refresh
          pointer.event.preventDefault();

          if (pointer.button === 0) {
            isDragging = true;
            dragStartX = pointer.x;
            dragStartY = pointer.y;
            cameraStartX = this.cameras.main.scrollX;
            cameraStartY = this.cameras.main.scrollY;
          } else if (pointer.button === 2) {
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;
            const { x, y } = worldToTilePosition(worldX, worldY);

            if (x + 1 >= 1 && x + 1 <= 20 && y + 1 >= 1 && y + 1 <= 20) {
              setTileCoords({ x: x + 1, y: y + 1, occupied: tilesRef.current[x][y] });
            } else {
              setTileCoords({ x: null, y: null, occupied: null }); // Clear if outside the range
            }
          }
        },
        this
      );

      this.input.on(
        'pointermove',
        function (pointer) {
          if (isDragging) {
            const zoom = this.cameras.main.zoom;
            const dragX = (dragStartX - pointer.x) / zoom;
            const dragY = (dragStartY - pointer.y) / zoom;
            this.cameras.main.scrollX = cameraStartX + dragX;
            this.cameras.main.scrollY = cameraStartY + dragY;
          }
        },
        this
      );

      this.input.on(
        'pointerup',
        function (pointer) {
          if (pointer.button === 0) {
            isDragging = false;
          }
        },
        this
      );

      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (deltaY > 0) {
          zoomLevel = Phaser.Math.Clamp(zoomLevel - 0.04, 0.24, 1);
        } else {
          zoomLevel = Phaser.Math.Clamp(zoomLevel + 0.04, 0.24, 1);
        }
        this.cameras.main.setZoom(zoomLevel);
      });
    }

    function update() {}

    const handleResize = () => {
      gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('contextmenu', disableContextMenu);

      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #87CEFA, #4682B4)',
      }}
    >
      <div
        id="phaser-container"
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}
      ></div>
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 100 }}>
        {tileCoords.x !== null && tileCoords.y !== null && (
          <p>
            Tile X: {tileCoords.x}, Tile Y: {tileCoords.y}
            <br />
            {tileCoords.occupied !== null && (
              <span>Occupied: {tileCoords.occupied ? 'Yes' : 'No'}</span>
            )}
          </p>
        )}
        {tileCoords.x !== null && tileCoords.y !== null && !tileCoords.occupied && (
          <div>
            {isMetaMaskConnected ? (
              <div>
                <p>Occupy this tile?</p>
                <button type="button" onClick={() => occupyTile(tileCoords.x, tileCoords.y)}>Yes</button>
              </div>
            ) : (
              <p>Login MetaMask to occupy this tile</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
