import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import grassImage from './assets/grass.png';
import whiteflagImage from './assets/whiteFlag.png';
import getContract, { getSignerContract } from './contract';
import { Circles } from 'react-loader-spinner';

function App() {
  const gameRef = useRef(null);
  const [tileCoords, setTileCoords] = useState({ x: null, y: null, occupied: null, occupant: null });
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const tilesRef = useRef([]);
  const mapSize = 20;
  const [loading, setLoading] = useState(true); // New state for loading

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

  useEffect(() => {
    const fetchAllOccupiedTiles = async () => {
      try {
        const contract = await getContract();
        const occupiedTiles = await contract.getAllOccupiedTiles();
        tilesRef.current = occupiedTiles;
        updateTileMap();
        setLoading(false); // Set loading to false when fetching is done
      } catch (error) {
        console.error('Error fetching all occupied tiles:', error);
      }
    };
    fetchAllOccupiedTiles();
  }, []);

  const updateTileMap = () => {
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
            const flag = scene.add.image(worldX, worldY, 'whiteflag').setDepth(worldY + 1);
            
            // Enable pixel-perfect hit detection
            flag.setInteractive({
              pixelPerfect: true, // Only detect opaque areas
              useHandCursor: true  // Shows a hand cursor when hovering
            });

            // Add right-click event listener to the white flag
            flag.on('pointerdown', async (pointer) => {
              if (pointer.rightButtonDown()) {
                const contract = await getContract();
                const occupant = await contract.getTileOccupant(x, y); // Fetch the occupant address
                setTileCoords({ x: x + 1, y: y + 1, occupied: true, occupant }); // Update the state with occupant info
              }
            });
          }
        }
      }
    }
  };


  const occupyTile = async (x, y) => {
    setLoading(true);
    try {
      
      const contract = await getSignerContract();
      const tx = await contract.occupyTile(x - 1, y - 1);
      await tx.wait();
      setTileCoords((prev) => ({ ...prev, occupied: true }));
      tilesRef.current[x - 1][y - 1] = true;
      updateTileMap();
    } catch (error) {
      console.error('Error occupying tile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameRef.current) {
      return;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const disableContextMenu = (e) => {
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
      this.load.image('whiteflag', whiteflagImage);
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

      const sunGraphics = this.add.graphics();
      sunGraphics.setScrollFactor(0);
      sunGraphics.fillStyle(0xfff8e1, 1);
      sunGraphics.fillCircle(window.innerWidth * 2.5, -1500, 500);

      function tileToWorldPosition(x, y) {
        const worldX = (x - y) * halfTileWidth + offsetX;
        const worldY = (x + y) * overlap;
        return { worldX, worldY };
      }

      function worldToTilePosition(worldX, worldY) {
        const adjustedWorldX = worldX - offsetX;
        const x = Math.floor((worldY / overlap + adjustedWorldX / halfTileWidth) / 2);
        const y = Math.floor((worldY / overlap - adjustedWorldX / halfTileWidth) / 2);
        return { x, y };
      }

      for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
          const { worldX, worldY } = tileToWorldPosition(x, y);

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

      this.input.on('pointerdown', function (pointer) {
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
            setTileCoords({ x: null, y: null, occupied: null });
          }
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
      ></div>
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 100 }}>
        {tileCoords.x !== null && tileCoords.y !== null && (
          <p>
            Tile X: {tileCoords.x}, Tile Y: {tileCoords.y}
            <br />
            {tileCoords.occupied !== null && (
              <span>Occupied: {tileCoords.occupied ? 'Yes' : 'No'}</span>
            )}
            {tileCoords.occupant && (
              <span><br />Occupant: {tileCoords.occupant}</span>
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
