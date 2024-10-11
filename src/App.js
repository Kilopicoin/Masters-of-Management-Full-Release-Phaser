import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import grassImage from './assets/grass.png';
import whiteflagImage from './assets/whiteFlag.png';
import skyflagImage from './assets/skyFlag.png';
import largemapImage from './assets/file.png';
import getContract, { getSignerContract } from './contract';
import { Circles } from 'react-loader-spinner';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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



  }, []);


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
  }


  useEffect(() => {
  
  updateTileMap();
  }, [metaMaskAccount]);

  const fetchAllOccupiedTiles = async () => {
    try {
      const contract = await getContract();
      const occupiedTiles = await contract.getAllOccupiedTiles();
      tilesRef.current = occupiedTiles;
      updateTileMap();
      setLoading(false);  // End loading when done
    } catch (error) {
      console.error('Error fetching all occupied tiles:', error);
    }
  };



  const showWarning = () => {
    toast.warn(
      <div style={{ textAlign: 'center' }}>
        🚧 <strong>You already have a Land!</strong>
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
  
  
  
  
  
  


  const occupyTile = async (x, y) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const alreadyHasTile = await contract.hasOccupiedTile(metaMaskAccount);

      if (alreadyHasTile) {
        showWarning();
      } else {
        const contractSigner = await getSignerContract();

        // Pass the referrer to the occupyTile function in the smart contract
        const referrerAddress = referrer || '0x0000000000000000000000000000000000000000'; // Default to address(0) if no referrer
        const tx = await contractSigner.occupyTile(x - 1, y - 1, referrerAddress);
        await tx.wait();

        await fetchAllOccupiedTiles();
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
        setTileCoords({ x: x + 1, y: y + 1, occupied: true });
        updateTileImage(x, y); // Update the tile image to skyflag
      }
    }
  }, [metaMaskAccount]); // Now it depends only on metaMaskAccount

  useEffect(() => {
    checkIfAccountOccupiedTile();
  }, [metaMaskAccount, checkIfAccountOccupiedTile]);

  

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
  
      // Remove the current whiteflag image (if any) and add the skyflag image
      const currentFlag = scene.children.getByName(`flag-${x}-${y}`);
      if (currentFlag) {
        currentFlag.destroy(); // Remove the whiteflag image
      }
  
      const skyFlag = scene.add.image(worldX, worldY, 'skyflag').setDepth(worldY + 1);
      skyFlag.setName(`flag-${x}-${y}`); // Name it so it can be referenced later
    }
  };

  const generateReferralLink = () => {
    const link = `${window.location.origin}/?ref=${metaMaskAccount}`;
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
      this.load.image('whiteflag', whiteflagImage);
      this.load.image('skyflag', skyflagImage);
      this.load.image('largemap', largemapImage);
      
    }

    

    async function create() {

      const mapImage = this.add.image((window.innerWidth / 2) - 80, (window.innerHeight * 2) + 190, 'largemap');
    mapImage.setDisplaySize(8400, 4400); // Set the map image size


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
      ></div>
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
  {tileCoords.x !== null && tileCoords.y !== null && !tileCoords.occupied && (
    <div>
      {isMetaMaskConnected ? (
        <div>
          <p>Occupy this land?</p>

          <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter referrer address (optional)"
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                    className="fancy-input" // Applying the fancy style
                  />
                </div>


          <button type="button" onClick={() => occupyTile(tileCoords.x, tileCoords.y)}>
            Yes
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
    </div>
  );
}

export default App;
