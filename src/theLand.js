import React, { useEffect, useRef, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import { ToastContainer } from 'react-toastify';
import Phaser from 'phaser';
import grassImage from './assets/grass.png';
import grassXImage from './assets/grassX.png';
import oceanImage from './assets/ocean.png';
import whiteflagImage from './assets/whiteFlag.png';
import skyflagImage from './assets/skyFlag.png';
import eldersImage from './assets/elders.png';

const TheLand = () => {
    const gameRef = useRef(null);
    const [tileCoords, setTileCoords] = useState({ x: null, y: null, occupied: null, occupant: null });
    const [metaMaskAccount, setMetaMaskAccount] = useState(null);
    const [loading, setLoading] = useState(false); // New state for loading
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    const mapSize = 9;
    const tilesRef = useRef([]);


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
          this.load.image('grassX', grassXImage);
          this.load.image('ocean', oceanImage);
          this.load.image('whiteflag', whiteflagImage);
          this.load.image('skyflag', skyflagImage);
          this.load.image('elders', eldersImage);
          
        }
    
    
        const handleRightClick = async (x, y) => {
         
        
          if (x + 1 >= 1 && x + 1 <= 20 && y + 1 >= 1 && y + 1 <= 20) {
            setTileCoords({ x: x + 1, y: y + 1, occupied: tilesRef.current[x][y] });
          } else {
            setTileCoords({ x: null, y: null, occupied: null });
          }
        };
        
    
        async function create() {
    
    
           // const oceanImage = this.add.image((window.innerWidth / 2) - 80, (window.innerHeight * 2) + 190, 'ocean');
            //  oceanImage.setDisplaySize(19200, 10800); // Set the map image size
    

    
    
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
              
              this.add.image(worldX, worldY, 'grassX').setDepth(worldY);

              if (x === 4 && y === 4) {
                this.add.image(worldX, worldY, 'elders').setDepth(worldY + 1); // Set higher depth to appear above other images
              }

              
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
            gameRef.current.destroy(true);
            gameRef.current = null;
          }
    
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
      
     



      
      </div>
      <div
  className="message-card"
  style={{
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white background
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a soft shadow
    color: '#333', // Darker text color for contrast
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
  <p>
    <strong>Occupant</strong>: 
    {`${tileCoords.occupant.slice(0, 4)}...${tileCoords.occupant.slice(-3)}`} {/* Show first 4 and last 3 characters */}
  </p>
      )}







    </div>
  )}


  
</div>

    </div>
  );
};

export default TheLand;
