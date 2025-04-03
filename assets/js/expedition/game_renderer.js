/**
 * Game Renderer for Alchemy Blaster
 */

class GameRenderer {
    constructor(canvasId, gameController) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameController = gameController;
        
        // Size canvas appropriately - updated to match the larger container
        this.canvas.width = 800;
        this.canvas.height = 960;
        
        // Load and cache sprites
        this.sprites = {};
        this.loadSprites();
        
        // Load and cache background images
        this.backgrounds = {};
        this.loadBackgrounds();
        
        // Cache for performance
        this.backgroundGradient = this.createBackgroundGradient();
        
        // UI elements
        this.uiElements = {
            characterSelect: {
                dereButton: { x: 50, y: 300, width: 230, height: 400 },
                alizaButton: { x: 290, y: 300, width: 230, height: 400 },
                shinshiButton: { x: 530, y: 300, width: 230, height: 400 }
            }
        };
        
        // Animation frames tracking
        this.animationFrames = {
            explosion: 0,
            shield: 0
        };
        
        // Text rendering settings
        this.textSettings = {
            title: { font: 'bold 40px Arial', color: '#FFFFFF', shadow: '#000000' },
            score: { font: '24px Arial', color: '#FFFFFF', shadow: '#000000' },
            wave: { font: '20px Arial', color: '#FFFF00', shadow: '#000000' },
            gameOver: { font: 'bold 60px Arial', color: '#FF0000', shadow: '#000000' },
            victory: { font: 'bold 50px Arial', color: '#00FF00', shadow: '#000000' },
            button: { font: 'bold 18px Arial', color: '#FFFFFF', shadow: '#000000' }
        };
    }
    
    /**
     * Load all game sprites
     */
    loadSprites() {
        const characterSprites = this.gameController.monsterLogic.characterSprites;
        
        // Load character sprites
        for (const character of ['dere', 'aliza', 'shinshi']) {
            for (const type of ['select', 'left', 'right', 'gameover']) {
                this.loadSprite(`${character}_${type}`, characterSprites[character][type]);
            }
            
            // Load shot sprites
            characterSprites[character].shots.forEach((shot, index) => {
                this.loadSprite(`${character}_shot_${index}`, shot);
            });
        }
        
        // Load Shinshi's special beam attack sprites
        this.loadSprite('shinbeam1', 'assets/images/darklings/shinbeam1.png');
        this.loadSprite('shinbeam2', 'assets/images/darklings/shinbeam2.png');
        this.loadSprite('shinbeam3', 'assets/images/darklings/shinbeam3.png');
        this.loadSprite('shinspecialbeamleftside', 'assets/images/darklings/shinspecialbeamleftside.png');
        this.loadSprite('shinspecialbeamrightside', 'assets/images/darklings/shinspecialbeamrightside.png');
        
        // Load enemy sprites - corrected naming convention from MOB to mob (lowercase)
        for (let i = 1; i <= 10; i++) {
            this.loadSprite(`darkling${i}`, `assets/images/darklings/darklingmob${i}.png`);
        }
        
        // Load boss sprites - corrected naming convention from BOSS to boss (lowercase)
        for (let i = 1; i <= 3; i++) {
            this.loadSprite(`darklingboss${i}`, `assets/images/darklings/darklingboss${i}.png`);
        }
        
        // Load darkling projectile sprites - use the specific darklingshot sprites
        for (let i = 1; i <= 7; i++) {
            this.loadSprite(`darklingshot${i}`, `assets/images/darklings/darklingshot${i}.png`);
        }
        this.loadSprite('darklingshotspecial', 'assets/images/darklings/darklingshotspecial.png');
        
        // Load generic shot sprites for backward compatibility
        this.loadSprite('shot1', 'assets/images/darklings/darklingshot1.png');
        this.loadSprite('shot2', 'assets/images/darklings/darklingshot2.png');
        
        // Load powerup sprites - corrected paths to include darklings folder
        this.loadSprite('healthpotion', 'assets/images/darklings/health_potion.png');
        this.loadSprite('shieldpotion', 'assets/images/darklings/shield_potion.png');
        this.loadSprite('powerpotion', 'assets/images/darklings/power_potion.png');
        
        // Load logo image
        this.loadSprite('logo', 'assets/images/darklings/logo.png');
        
        // Load character select screen image
        this.loadSprite('charselect', 'assets/images/darklings/charselect.png');
        
        // Create fallback effect sprites directly
        this.createFallbackSprite('explosion', 64, '#FF8800');
        this.createFallbackSprite('shield', 80, '#55AAFF');
    }
    
    /**
     * Load background images
     */
    loadBackgrounds() {
        // Load wave background images
        this.loadBackground('wave1', 'assets/images/darklings/wave1bg.png');
        this.loadBackground('wave2', 'assets/images/darklings/wave2bg.png');
        this.loadBackground('wave3', 'assets/images/darklings/wave3bg.png');
    }
    
    /**
     * Load a background image
     * @param {string} name - Name to reference the background
     * @param {string} path - Path to the background image
     */
    loadBackground(name, path) {
        const img = new Image();
        img.src = path;
        
        img.onerror = () => {
            console.error(`Failed to load background: ${name} from path: ${path}`);
        };
        
        img.onload = () => {
            console.log(`Successfully loaded background: ${name}`);
        };
        
        this.backgrounds[name] = img;
    }
    
    /**
     * Load a single sprite
     * @param {string} name - Name to reference the sprite
     * @param {string} path - Path to the sprite image
     */
    loadSprite(name, path) {
        const img = new Image();
        img.src = path;
        
        // Add better error handling for sprite loading
        img.onerror = () => {
            console.error(`Failed to load sprite: ${name} from path: ${path}`);
            
            // Create a fallback canvas for missing sprites
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Size based on sprite type
            if (name.includes('potion')) {
                canvas.width = canvas.height = 32;
            } else if (name.includes('boss')) {
                canvas.width = canvas.height = 96;
            } else if (name === 'shield') {
                canvas.width = canvas.height = 80;
            } else if (name === 'explosion') {
                canvas.width = canvas.height = 64;
            } else if (name.includes('shot')) {
                canvas.width = canvas.height = 24;
            } else {
                canvas.width = canvas.height = 48;
            }
            
            // Draw a placeholder with the sprite name
            ctx.fillStyle = this.getColorForSprite(name);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            
            // Add text label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Truncate name if too long
            const displayName = name.length > 8 ? name.substring(0, 7) + '...' : name;
            ctx.fillText(displayName, canvas.width / 2, canvas.height / 2);
            
            // Use this canvas as the sprite
            this.sprites[name] = canvas;
        };
        
        img.onload = () => {
            // Log sprite dimensions for debugging
            console.log(`Loaded sprite: ${name}, dimensions: ${img.width}x${img.height}`);
            
            // Check if sprite is too large and needs scaling
            if (img.width > 100 || img.height > 100) {
                console.warn(`Sprite ${name} is large: ${img.width}x${img.height}. Consider scaling down.`);
            }
        };
        
        this.sprites[name] = img;
    }
    
    /**
     * Get a color for a placeholder sprite based on its name
     * @param {string} name - Sprite name
     * @returns {string} - CSS color
     */
    getColorForSprite(name) {
        if (name.includes('health')) return '#FF5555';
        if (name.includes('shield')) return '#55AAFF';
        if (name.includes('power')) return '#FFAA55';
        if (name.includes('shot')) return '#FFFF55';
        if (name.includes('explosion')) return '#FF8800';
        if (name.includes('boss')) return '#FF0000';
        if (name.includes('darkling')) return '#AA55FF';
        if (name.includes('dere')) return '#9900FF';
        if (name.includes('aliza')) return '#00AAFF';
        return '#888888';
    }
    
    /**
     * Create background gradient
     * @returns {CanvasGradient} - Background gradient
     */
    createBackgroundGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000022');
        gradient.addColorStop(0.5, '#000044');
        gradient.addColorStop(1, '#000033');
        return gradient;
    }
    
    /**
     * Draw text with shadow
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} settings - Text settings (font, color, shadow)
     * @param {string} align - Text alignment (left, center, right)
     */
    drawText(text, x, y, settings, align = 'left') {
        this.ctx.font = settings.font;
        this.ctx.textAlign = align;
        
        // Draw shadow
        this.ctx.fillStyle = settings.shadow;
        this.ctx.fillText(text, x + 2, y + 2);
        
        // Draw text
        this.ctx.fillStyle = settings.color;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * Render the entire game
     * @param {number} timestamp - Current animation frame timestamp
     */
    render(timestamp) {
        // Clear canvas
        this.ctx.fillStyle = this.backgroundGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gameState = this.gameController.getGameState();
        
        if (!gameState.isActive) {
            if (gameState.gameOver) {
                this.renderGameOver(gameState);
            } else {
                this.renderCharacterSelect();
            }
            return;
        }
        
        // Draw correct background based on current wave
        this.renderBackground(gameState);
        
        // Transform to game coordinates
        this.ctx.save();
        this.setupGameCoordinates();
        
        // Render game elements
        this.renderEnemies(gameState.enemies, timestamp);
        this.renderPlayer(gameState.player, gameState.selectedCharacter);
        this.renderProjectiles(gameState.projectiles);
        this.renderPowerups(gameState.powerups);
        
        // Restore normal coordinates for UI
        this.ctx.restore();
        
        // Render UI elements
        this.renderUI(gameState);
    }
    
    /**
     * Render appropriate background based on game state
     * @param {Object} gameState - Current game state
     */
    renderBackground(gameState) {
        // Determine which background to show based on round
        let backgroundKey = 'wave1';
        
        if (gameState.currentRound === 3) {
            backgroundKey = 'wave3';
        } else if (gameState.currentRound === 2) {
            backgroundKey = 'wave2';
        }
        
        const background = this.backgrounds[backgroundKey];
        
        // Draw background if loaded
        if (background && background.complete) {
            this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback to gradient if background not loaded
            this.ctx.fillStyle = this.backgroundGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Set up coordinate system for in-game elements
     * Origin at center, y-up, x-right
     */
    setupGameCoordinates() {
        // Position the game elements properly in the portrait viewport
        // Center horizontally, and position vertically at 60% from top (lower quarter of screen)
        this.ctx.translate(this.canvas.width / 2, this.canvas.height * 0.6);
    }
    
    /**
     * Render the character selection screen
     */
    renderCharacterSelect() {
        // Draw character select background
        const charSelectBg = this.sprites['charselect'];
        if (charSelectBg && charSelectBg.complete) {
            this.ctx.drawImage(charSelectBg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback to gradient if background not loaded
            this.ctx.fillStyle = this.backgroundGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw logo
        const logo = this.sprites['logo'];
        if (logo && logo.complete) {
            // Position logo at the top center of the screen
            const logoWidth = Math.min(logo.width, this.canvas.width * 0.8);
            const logoHeight = logo.height * (logoWidth / logo.width);
            this.ctx.drawImage(
                logo, 
                (this.canvas.width - logoWidth) / 2, 
                50, 
                logoWidth, 
                logoHeight
            );
        } else {
            // Draw title as fallback if logo not loaded
            this.drawText('ALCHEMY BLASTER', this.canvas.width / 2, 100, 
                         this.textSettings.title, 'center');
        }
        
        // Draw Dere character option
        const dereBtn = this.uiElements.characterSelect.dereButton;
        this.drawCharacterOption('dere', dereBtn.x, dereBtn.y, dereBtn.width, dereBtn.height);
        
        // Draw Aliza character option
        const alizaBtn = this.uiElements.characterSelect.alizaButton;
        this.drawCharacterOption('aliza', alizaBtn.x, alizaBtn.y, alizaBtn.width, alizaBtn.height);
        
        // Draw Shinshi character option
        const shinshiBtn = this.uiElements.characterSelect.shinshiButton;
        this.drawCharacterOption('shinshi', shinshiBtn.x, shinshiBtn.y, shinshiBtn.width, shinshiBtn.height);
        
        // Draw instruction text AFTER drawing character buttons (moved from above)
        // Position it below the character buttons
        this.drawText('Select your character', this.canvas.width / 2, alizaBtn.y + alizaBtn.height + 30, 
                     this.textSettings.score, 'center');
    }
    
    /**
     * Draw a character option button
     * @param {string} character - Character name ('dere' or 'aliza')
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     */
    drawCharacterOption(character, x, y, width, height) {
        // Draw button background
        this.ctx.fillStyle = character === 'dere' ? '#440044' : '#004444';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 10);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw character image
        const sprite = this.sprites[`${character}_select`];
        if (sprite && sprite.complete) {
            // Scale down oversized sprites to fit within button dimensions
            let spriteWidth = sprite.width;
            let spriteHeight = sprite.height;
            const maxWidth = width - 20; // Ensure some padding
            const maxHeight = height - 60; // Leave room for text
            
            if (spriteWidth > maxWidth || spriteHeight > maxHeight) {
                const scale = Math.min(maxWidth / spriteWidth, maxHeight / spriteHeight);
                spriteWidth *= scale;
                spriteHeight *= scale;
            }
            
            // Center the image within the button
            const spriteX = x + (width - spriteWidth) / 2;
            const spriteY = y + 20;
            
            this.ctx.drawImage(sprite, spriteX, spriteY, spriteWidth, spriteHeight);
        }
        
        // Draw character name
        const displayName = character === 'dere' ? 'DERE' : character === 'aliza' ? 'ALIZA' : 'SHINSHI';
        this.drawText(displayName, x + width/2, y + height - 20, 
                     this.textSettings.button, 'center');
        
        // Draw character trait
        const trait = character === 'dere' ? 'Balanced' : character === 'aliza' ? 'Technical' : 'Specialized';
        this.drawText(trait, x + width/2, y + height - 45, 
                    { font: '16px Arial', color: '#CCCCCC', shadow: '#000000' }, 'center');
    }
    
    /**
     * Render player character
     * @param {Object} player - Player state
     * @param {string} character - Selected character ('dere' or 'aliza')
     */
    renderPlayer(player, character) {
        const direction = player.direction || 'right';
        const spriteName = `${character}_${direction}`;
        const sprite = this.sprites[spriteName];
        
        if (sprite && sprite.complete) {
            // Increased player sprite size by 50%
            const maxDimension = 128; // Increased from 64 to 96 (50% larger)
            let width = sprite.width;
            let height = sprite.height;
            
            // Scale the sprite, but make it 50% larger than before
            if (width > maxDimension || height > maxDimension) {
                const scale = Math.min(maxDimension / width, maxDimension / height);
                width *= scale;
                height *= scale;
            } else {
                // If sprite is smaller than max size, still increase by 50%
                width *= 1.5;
                height *= 1.5;
            }
            
            // Position player at the bottom by counteracting the enemyRenderingOffset
            // This keeps the player at the bottom while enemies are properly positioned
            const playerYPosition = 200;
            
            // Draw player at the correct position with increased size
            this.ctx.drawImage(
                sprite, 
                player.position.x - width / 2,
                playerYPosition - height / 2,
                width,
                height
            );
            
            // Store the actual gameplay position for the player
            // This is the position in the game's coordinate system (without visual offset)
            // Keep the player's x position unchanged, but use the fixed 200 for y
            // This is the logical game position, not the visual position
            player.position.y = 200;
        }
        
        // Draw shield if active
        if (player.shield > 0) {
            this.renderPlayerShield(player);
        }
    }
    
    /**
     * Render player shield effect
     * @param {Object} player - Player state
     */
    renderPlayerShield(player) {
        const shieldSprite = this.sprites['shield'];
        
        // Check if sprite exists AND is fully loaded before trying to draw it
        if (shieldSprite && shieldSprite.complete && shieldSprite.naturalWidth !== 0) {
            // Use alpha for shield strength
            this.ctx.globalAlpha = 0.3 + (player.shield / player.maxShield) * 0.5;
            
            // Draw shield with pulsing animation
            const scale = 1.1 + Math.sin(Date.now() * 0.005) * 0.1;
            
            // Apply the same offset correction as for the player
            const shieldY = player.position.y;
            
            this.ctx.drawImage(
                shieldSprite,
                player.position.x - (shieldSprite.width / 2) * scale,
                shieldY - (shieldSprite.height / 2) * scale,
                shieldSprite.width * scale,
                shieldSprite.height * scale
            );
            
            this.ctx.globalAlpha = 1.0;
        } else {
            // Fallback: If shield sprite is missing, draw a circle
            this.ctx.save();
            const radius = 40 + Math.sin(Date.now() * 0.005) * 5;
            this.ctx.globalAlpha = 0.3 + (player.shield / player.maxShield) * 0.3;
            this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            this.ctx.beginPath();
            
            // Apply the same offset correction as for the player
            const shieldY = player.position.y;
            
            this.ctx.arc(player.position.x, shieldY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    /**
     * Render all enemies
     * @param {Array} enemies - Array of enemy objects
     * @param {number} timestamp - Current animation frame timestamp
     */
    renderEnemies(enemies, timestamp) {
        for (const enemy of enemies) {
            const spriteName = enemy.type;
            const sprite = this.sprites[spriteName];
            
            if (sprite && sprite.complete) {
                // Add slight bobbing animation
                const bobOffset = Math.sin(timestamp * 0.003 + enemy.position.x * 0.1) * 3;
                
                // Scale down oversized sprites
                const maxDimension = enemy.type.includes('boss') ? 96 : 48; // Larger for bosses
                let width = sprite.width;
                let height = sprite.height;
                
                // Scale down if the sprite is too large
                if (width > maxDimension || height > maxDimension) {
                    const scale = Math.min(maxDimension / width, maxDimension / height);
                    width *= scale;
                    height *= scale;
                }
                
                // Draw the enemy using its original position - no manual Y offset needed now
                // The global transform handles the offset for all rendered elements
                this.ctx.drawImage(
                    sprite,
                    enemy.position.x - width / 2,
                    enemy.position.y - height / 2 + bobOffset,
                    width,
                    height
                );
                
                // Draw health bar for enemies with more than 1 health
                if (enemy.health > 1) {
                    // No need for adjustedY anymore - use enemy's actual position
                    this.renderEnemyHealthBar(enemy, enemy.position.y);
                }
            }
        }
    }
    
    /**
     * Render enemy health bar
     * @param {Object} enemy - Enemy object
     * @param {number} yPosition - Y position for enemy
     */
    renderEnemyHealthBar(enemy, yPosition) {
        const initialHealth = this.gameController.monsterLogic.getInitialHealth(enemy.type);
        const healthPercent = Math.max(0, enemy.health / initialHealth);
        
        const barWidth = 40;
        const barHeight = 5;
        const x = enemy.position.x - barWidth / 2;
        const y = yPosition + 25; // Position below enemy, using the original position
        
        // Background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        let color;
        if (healthPercent > 0.6) {
            color = '#00FF00'; // Green for high health
        } else if (healthPercent > 0.3) {
            color = '#FFFF00'; // Yellow for medium health
        } else {
            color = '#FF0000'; // Red for low health
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    /**
     * Render all projectiles
     * @param {Object} projectiles - Object with player and enemy projectiles
     */
    renderProjectiles(projectiles) {
        // Get current game state for character info
        const gameState = this.gameController.getGameState();
        const character = gameState.selectedCharacter;
        
        // Render player projectiles
        for (const projectile of projectiles.player) {
            const spriteIndex = projectile.sprite || 0;
            const spriteName = `${character}_shot_${spriteIndex}`;
            const sprite = this.sprites[spriteName];
            
            if (sprite && sprite.complete) {
                // Scale factor - make Aliza's projectiles half size
                const scaleFactor = character === 'aliza' ? 0.5 : 1;
                
                // Calculate the projectile dimensions with the proper scale factor
                const width = sprite.width * scaleFactor;
                const height = sprite.height * scaleFactor;
                
                // Counteract the enemy rendering offset for player projectiles
                // This ensures player projectiles appear at the correct visual position
                const projectileY = projectile.y;
                
                // For Aliza, create a spread pattern to ensure coverage across the screen
                if (character === 'aliza' && projectile.isSpecialAttack) {
                    // Draw a wider pattern for Aliza's special attacks
                    // We'll draw 3 projectiles side by side to create a spread
                    const spreadOffsets = [-width*1.5, 0, width*1.5]; // Left, center, right
                    
                    for (const offset of spreadOffsets) {
                        this.ctx.drawImage(
                            sprite,
                            projectile.x + offset - width / 2,
                            projectileY - height / 2,  // Use the offset-corrected Y position
                            width,
                            height
                        );
                    }
                } else {
                    // Standard single projectile rendering
                    this.ctx.drawImage(
                        sprite,
                        projectile.x - width / 2,
                        projectileY - height / 2,  // Use the offset-corrected Y position
                        width,
                        height
                    );
                }
            } else {
                // Fallback if sprite not found - draw a simple colored circle
                // Also apply the offset correction for the fallback
                const projectileY = projectile.y;
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectileY, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Render enemy projectiles
        if (projectiles.enemy && projectiles.enemy.length > 0) {
            for (const projectile of projectiles.enemy) {
                // Get the actual sprite name from the projectile object or default to darklingshot1
                const spriteName = projectile.sprite || 'darklingshot1';
                const sprite = this.sprites[spriteName];
                
                // Calculate the adjusted position for enemy projectiles
                // No Y adjustment needed since enemy projectiles use the same coordinate system as player projectiles
                const x = projectile.x;
                const y = projectile.y;
                
                if (sprite && sprite.complete) {
                    // Save context for rotation if needed
                    this.ctx.save();
                    
                    // Calculate dimensions and position
                    const width = projectile.width || 30;
                    const height = projectile.height || 30;
                    
                    // Handle rotation for projectiles that should rotate
                    if (projectile.rotate && projectile.rotation !== undefined) {
                        // Rotate around the center of the projectile
                        this.ctx.translate(x, y);
                        this.ctx.rotate(projectile.rotation);
                        
                        // Draw at the origin (since we've translated)
                        this.ctx.drawImage(
                            sprite,
                            -width / 2,
                            -height / 2,
                            width,
                            height
                        );
                    } else {
                        // Draw without rotation
                        this.ctx.drawImage(
                            sprite,
                            x - width / 2,
                            y - height / 2,
                            width,
                            height
                        );
                    }
                    
                    // Restore context after rotation
                    this.ctx.restore();
                } else {
                    // Fallback if sprite not found
                    this.ctx.fillStyle = '#ff5500'; // Orange/red for enemy projectiles
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x, 
                        y, 
                        (projectile.width || 15) / 2, 
                        0, 
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    
                    // Add "points" to make it look more like a projectile
                    this.ctx.strokeStyle = '#ff7700';
                    this.ctx.lineWidth = 2;
                    const points = 3;
                    for (let i = 0; i < points; i++) {
                        const angle = (i / points) * Math.PI * 2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y);
                        this.ctx.lineTo(
                            x + Math.cos(angle) * (projectile.width || 15),
                            y + Math.sin(angle) * (projectile.height || 15)
                        );
                        this.ctx.stroke();
                    }
                }
            }
        }

        // Render Shinshi's beam attacks if any exist
        if (character === 'shinshi' && projectiles.beams && projectiles.beams.length > 0) {
            this.renderBeams(projectiles.beams);
        }

        // Render Shinshi's special beam attacks if any exist
        if (character === 'shinshi' && projectiles.specialBeams && projectiles.specialBeams.length > 0) {
            this.renderSpecialBeams(projectiles.specialBeams);
        }
    }

    /**
     * Render Shinshi's beam attacks
     * @param {Array} beams - Array of beam objects
     */
    renderBeams(beams) {
        for (const beam of beams) {
            // Calculate pulsation alpha based on time
            const pulseFactor = Math.sin(Date.now() * 0.008) * 0.3 + 0.7; // Value between 0.4 and 1.0
            // Get appropriate beam sprite based on level
            const spriteName = `shinbeam${beam.level}`;
            const sprite = this.sprites[spriteName];
            // Counteract the enemy rendering offset for beam origins
            const beamY = beam.y;
            if (sprite && sprite.complete) {
                // Calculate beam dimensions - beam should reach the top edge of screen
                const x = beam.x - beam.width / 2;
                // Instead of stretching the sprite, we'll repeat it to reach the top
                const beamHeight = sprite.height;
                const distanceToTop = beamY + this.canvas.height/2; // Distance from beam source to top of screen
                const repetitions = Math.ceil(distanceToTop / beamHeight);
                // Apply pulsating effect with globalAlpha
                this.ctx.globalAlpha = pulseFactor;
                // Draw the beam by repeating the sprite from player position up to the top of screen
                for (let i = 0; i < repetitions; i++) {
                    this.ctx.drawImage(
                        sprite,
                        x,
                        beamY - (i+1) * beamHeight,  // Use the offset-corrected Y position
                        beam.width,
                        beamHeight
                    );
                }
                // Reset global alpha
                this.ctx.globalAlpha = 1.0;
            } else {
                // Fallback if sprite not found
                this.ctx.globalAlpha = pulseFactor * 0.7;
                this.ctx.fillStyle = beam.level === 3 ? '#88ccff' : beam.level === 2 ? '#66aaff' : '#4488ff';
                // Simple line for fallback - also using offset-corrected Y position
                const distanceToTop = beamY + this.canvas.height/2;
                this.ctx.fillRect(beam.x - beam.width / 2, beamY - distanceToTop, beam.width, distanceToTop);
                this.ctx.globalAlpha = 1.0;
            }
        }
    }

    /**
     * Render Shinshi's special attack (horizontal beams)
     * @param {Array} specialBeams - Array of special beam objects
     */
    renderSpecialBeams(specialBeams) {
        if (!specialBeams || specialBeams.length === 0) {
            return;
        }
        
        for (const beam of specialBeams) {
            // Calculate how long the beam has been active
            const beamAge = Date.now() - beam.createdAt;
            // Skip if the beam has expired (duration of 800ms)
            if (beamAge > 800) continue;
            // Counteract the enemy rendering offset for special beams
            const beamY = beam.y;
            // Get the appropriate sprite based on direction
            const spriteKey = beam.direction === 'right' ? 
                'shinspecialbeamrightside' : 'shinspecialbeamleftside';
            const sprite = this.sprites[spriteKey];
            if (sprite && sprite.complete) {
                // Draw the full-width beam
                this.ctx.drawImage(
                    sprite,
                    0,                  // Source X
                    0,                  // Source Y
                    sprite.width,       // Source width
                    sprite.height,      // Source height
                    -this.canvas.width/2,  // Destination X
                    beamY - beam.height/2,  // Destination Y with offset correction
                    this.canvas.width,   // Destination width
                    beam.height         // Destination height
                );
            } else {
                // Fallback rendering with color - also using offset-corrected Y position
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(
                    -this.canvas.width/2,
                    beamY - beam.height/2,  // Use the offset-corrected Y position
                    this.canvas.width,
                    beam.height
                );
            }
        }
    }
    
    /**
     * Render powerups
     * @param {Array} powerups - Array of powerup objects
     */
    renderPowerups(powerups) {
        for (const powerup of powerups) {
            const spriteName = `${powerup.type}potion`;
            const sprite = this.sprites[spriteName];
            
            if (sprite && sprite.complete) {
                // Add floating animation
                const floatOffset = Math.sin(Date.now() * 0.005) * 5;
                
                this.ctx.drawImage(
                    sprite,
                    powerup.position.x - sprite.width / 2,
                    powerup.position.y - sprite.height / 2 + floatOffset
                );
            }
        }
    }
    
    /**
     * Render UI elements
     * @param {Object} gameState - Current game state
     */
    renderUI(gameState) {
        // Render score
        this.drawText(`Score: ${gameState.score}`, 20, 30, this.textSettings.score);
        
        // Render round and wave
        this.drawText(`Round ${gameState.currentRound} - Wave ${gameState.currentWave}`, 
                     this.canvas.width - 20, 30, this.textSettings.wave, 'right');
        
        // Render player health/shield
        this.renderHealthUI(gameState);
        
        // Render wave completed message if applicable
        if (gameState.waveCompleted) {
            this.renderWaveCompleted(gameState);
        }
        
        // Render pause button
        this.renderPauseButton(gameState.isPaused);
    }
    
    /**
     * Render health and shield UI with chrome appearance and LCD font
     * @param {Object} gameState - Current game state
     */
    renderHealthUI(gameState) {
        const player = gameState.player;
        const character = gameState.selectedCharacter;
        
        // Position for health display
        const x = 20;
        const y = this.canvas.height - 60;
        
        // Use LCD font for all text
        this.ctx.font = "18px 'Digital-7', monospace";
        this.ctx.shadowColor = "#33ff66";
        this.ctx.shadowBlur = 5;
        
        if (character === 'dere') {
            // Dere: Show layered health with chrome segments
            this.ctx.fillStyle = "#33ff66";
            this.ctx.fillText(`Health: `, x, y);
            this.ctx.shadowBlur = 0; // Turn off shadow for bars
            
            // Draw health layers with chrome appearance
            for (let i = 0; i < 3; i++) {
                // Create chrome-style background for segment
                const segmentX = x + 80 + (i * 30);
                const segmentY = y - 15;
                const segmentWidth = 25;
                const segmentHeight = 20;
                
                // Background gradient (dark gray to gray)
                const bgGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                bgGradient.addColorStop(0, "#444");
                bgGradient.addColorStop(0.5, "#333");
                bgGradient.addColorStop(1, "#222");
                
                this.ctx.fillStyle = bgGradient;
                this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                
                // If segment is active, fill with chrome-style health gradient
                if (i < player.health) {
                    const fillGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                    fillGradient.addColorStop(0, "rgba(255, 100, 100, 1)");
                    fillGradient.addColorStop(0.5, "rgba(180, 30, 30, 1)");
                    fillGradient.addColorStop(1, "rgba(255, 100, 100, 1)");
                    
                    this.ctx.fillStyle = fillGradient;
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                    
                    // Add highlight effect at the top
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight / 3);
                }
                
                // Add dark gray outline
                this.ctx.strokeStyle = "#444";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(segmentX, segmentY, segmentWidth, segmentHeight);
            }
            
            // Show temporary shield if active
            if (player.shield > 0) {
                // Reset shadow for text
                this.ctx.shadowColor = "#33ff66";
                this.ctx.shadowBlur = 5;
                this.ctx.fillStyle = "#33ff66";
                this.ctx.fillText(`Shield: `, x, y + 25);
                
                // Shield bar with chrome appearance
                const shieldX = x + 80;
                const shieldY = y + 10;
                const shieldWidth = 100;
                const shieldHeight = 20;
                const shieldFillWidth = (player.shield / player.maxShield) * shieldWidth;
                
                this.ctx.shadowBlur = 0; // Turn off shadow for bars
                
                // Background gradient
                const bgGradient = this.ctx.createLinearGradient(shieldX, shieldY, shieldX, shieldY + shieldHeight);
                bgGradient.addColorStop(0, "#444");
                bgGradient.addColorStop(0.5, "#333");
                bgGradient.addColorStop(1, "#222");
                
                this.ctx.fillStyle = bgGradient;
                this.ctx.fillRect(shieldX, shieldY, shieldWidth, shieldHeight);
                
                // Shield fill with chrome appearance
                const fillGradient = this.ctx.createLinearGradient(shieldX, shieldY, shieldX, shieldY + shieldHeight);
                fillGradient.addColorStop(0, "rgba(100, 180, 255, 1)");
                fillGradient.addColorStop(0.5, "rgba(30, 80, 170, 1)");
                fillGradient.addColorStop(1, "rgba(100, 180, 255, 1)");
                
                this.ctx.fillStyle = fillGradient;
                this.ctx.fillRect(shieldX, shieldY, shieldFillWidth, shieldHeight);
                
                // Add highlight effect at the top
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                this.ctx.fillRect(shieldX, shieldY, shieldFillWidth, shieldHeight / 3);
                
                // Add dark gray outline
                this.ctx.strokeStyle = "#444";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(shieldX, shieldY, shieldWidth, shieldHeight);
                
                // Add shield value as LCD text
                this.ctx.shadowColor = "#33ff66";
                this.ctx.shadowBlur = 5;
                this.ctx.fillStyle = "#33ff66";
                this.ctx.textAlign = "center";
                this.ctx.fillText(`${Math.floor(player.shield)}`, shieldX + shieldWidth / 2, shieldY + 15);
                this.ctx.textAlign = "left";
            }
        } else if (character === 'aliza') {
            // Aliza: Show health segments like Dere, but with 4 segments
            this.ctx.fillStyle = "#33ff66";
            this.ctx.fillText(`Health: `, x, y);
            this.ctx.shadowBlur = 0; // Turn off shadow for bars
            
            // Draw health layers with chrome appearance - 4 segments for Aliza
            for (let i = 0; i < 4; i++) {
                // Create chrome-style background for segment
                const segmentX = x + 80 + (i * 30);
                const segmentY = y - 15;
                const segmentWidth = 25;
                const segmentHeight = 20;
                
                // Background gradient (dark gray to gray)
                const bgGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                bgGradient.addColorStop(0, "#444");
                bgGradient.addColorStop(0.5, "#333");
                bgGradient.addColorStop(1, "#222");
                
                this.ctx.fillStyle = bgGradient;
                this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                
                // If segment is active, fill with chrome-style health gradient
                if (i < player.health) {
                    const fillGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                    fillGradient.addColorStop(0, "rgba(255, 100, 100, 1)");
                    fillGradient.addColorStop(0.5, "rgba(180, 30, 30, 1)");
                    fillGradient.addColorStop(1, "rgba(255, 100, 100, 1)");
                    
                    this.ctx.fillStyle = fillGradient;
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                    
                    // Add highlight effect at the top
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight / 3);
                }
                
                // Add dark gray outline
                this.ctx.strokeStyle = "#444";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(segmentX, segmentY, segmentWidth, segmentHeight);
            }
        } else if (character === 'shinshi') {
            // Shinshi: Show health segments like Dere, but with 4 segments
            this.ctx.fillStyle = "#33ff66";
            this.ctx.fillText(`Health: `, x, y);
            this.ctx.shadowBlur = 0; // Turn off shadow for bars
            
            // Draw health layers with chrome appearance - 4 segments for Shinshi
            for (let i = 0; i < 4; i++) {
                // Create chrome-style background for segment
                const segmentX = x + 80 + (i * 30);
                const segmentY = y - 15;
                const segmentWidth = 25;
                const segmentHeight = 20;
                
                // Background gradient (dark gray to gray)
                const bgGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                bgGradient.addColorStop(0, "#444");
                bgGradient.addColorStop(0.5, "#333");
                bgGradient.addColorStop(1, "#222");
                
                this.ctx.fillStyle = bgGradient;
                this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                
                // If segment is active, fill with chrome-style health gradient
                if (i < player.health) {
                    const fillGradient = this.ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentHeight);
                    fillGradient.addColorStop(0, "rgba(255, 100, 100, 1)");
                    fillGradient.addColorStop(0.5, "rgba(180, 30, 30, 1)");
                    fillGradient.addColorStop(1, "rgba(255, 100, 100, 1)");
                    
                    this.ctx.fillStyle = fillGradient;
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight);
                    
                    // Add highlight effect at the top
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    this.ctx.fillRect(segmentX, segmentY, segmentWidth, segmentHeight / 3);
                }
                
                // Add dark gray outline
                this.ctx.strokeStyle = "#444";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(segmentX, segmentY, segmentWidth, segmentHeight);
            }
        }
        
        // Power level indicator with LCD and chrome style for all characters
        this.ctx.shadowColor = "#33ff66";
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = "#33ff66";
        this.ctx.fillText(`Power: `, x + 300, y);
        
        this.ctx.shadowBlur = 0;
        
        for (let i = 0; i < 3; i++) {
            const powerX = x + 370 + (i * 25);
            const powerY = y - 5;
            const powerRadius = 10;
            
            // Draw chrome-style power indicator backgrounds
            const powerGradient = this.ctx.createRadialGradient(
                powerX, powerY, 0,
                powerX, powerY, powerRadius
            );
            
            // All power indicators have chrome background
            powerGradient.addColorStop(0, "#444");
            powerGradient.addColorStop(0.7, "#333");
            powerGradient.addColorStop(1, "#222");
            
            this.ctx.fillStyle = powerGradient;
            this.ctx.beginPath();
            this.ctx.arc(powerX, powerY, powerRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Only filled for active power levels
            if (i < player.powerLevel) {
                const activePowerGradient = this.ctx.createRadialGradient(
                    powerX, powerY, 0,
                    powerX, powerY, powerRadius
                );
                
                activePowerGradient.addColorStop(0, "rgba(255, 200, 100, 1)");
                activePowerGradient.addColorStop(0.7, "rgba(255, 150, 50, 1)");
                activePowerGradient.addColorStop(1, "rgba(200, 100, 30, 1)");
                
                this.ctx.fillStyle = activePowerGradient;
                this.ctx.beginPath();
                this.ctx.arc(powerX, powerY, powerRadius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add highlight
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                this.ctx.beginPath();
                this.ctx.arc(powerX - 2, powerY - 2, powerRadius / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Add dark gray outline
            this.ctx.strokeStyle = "#444";
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(powerX, powerY, powerRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    /**
     * Render wave completed message
     * @param {Object} gameState - Current game state
     */
    renderWaveCompleted(gameState) {
        const wavesInRound = this.gameController.monsterLogic.getWavesInRound(gameState.currentRound);
        
        if (gameState.currentWave <= wavesInRound) {
            // Wave completed message
            this.drawText('WAVE COMPLETED!', this.canvas.width / 2, 200, 
                        this.textSettings.wave, 'center');
                        
            // Show bonus
            const waveBonus = 100 * gameState.currentWave * gameState.currentRound;
            this.drawText(`Bonus: ${waveBonus}`, this.canvas.width / 2, 230, 
                        this.textSettings.score, 'center');
            
            // Show next wave message
            this.drawText(`Preparing next wave...`, this.canvas.width / 2, 270, 
                        { font: '16px Arial', color: '#AAAAAA', shadow: '#000000' }, 'center');
        } else {
            // Round completed message
            this.drawText('ROUND COMPLETED!', this.canvas.width / 2, 200, 
                        this.textSettings.wave, 'center');
            
            if (gameState.currentRound < 3) {
                // Show next round message
                this.drawText(`Preparing Round ${gameState.currentRound + 1}...`, 
                            this.canvas.width / 2, 240, 
                            { font: '20px Arial', color: '#FFFF00', shadow: '#000000' }, 'center');
            }
        }
    }
    
    /**
     * Render pause button
     * @param {boolean} isPaused - Whether the game is paused
     */
    renderPauseButton(isPaused) {
        const x = this.canvas.width - 50;
        const y = 60;
        const size = 30;
        
        // Draw button background
        this.ctx.fillStyle = isPaused ? '#005500' : '#333333';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x - size/2, y - size/2, size, size, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw pause/play icon
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        
        if (isPaused) {
            // Draw play triangle
            this.ctx.beginPath();
            this.ctx.moveTo(x - 7, y - 10);
            this.ctx.lineTo(x - 7, y + 10);
            this.ctx.lineTo(x + 10, y);
            this.ctx.closePath();
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fill();
        } else {
            // Draw pause bars
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x - 9, y - 10, 6, 20);
            this.ctx.fillRect(x + 3, y - 10, 6, 20);
        }
    }
    
    /**
     * Render game over or victory screen
     * @param {Object} gameState - Current game state
     */
    renderGameOver(gameState) {
        const character = gameState.selectedCharacter;
        
        if (gameState.victory) {
            // Victory screen
            this.drawText('VICTORY!', this.canvas.width / 2, 150, 
                        this.textSettings.victory, 'center');
                        
            // Show final score
            this.drawText(`Final Score: ${gameState.score}`, this.canvas.width / 2, 230, 
                        this.textSettings.score, 'center');
                        
            // Show completion time
            const timeInSeconds = Math.floor(gameState.elapsedTime / 1000);
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            
            this.drawText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 
                        this.canvas.width / 2, 270, 
                        this.textSettings.score, 'center');
                        
            // Show play again button
            this.drawButton('Play Again', this.canvas.width / 2, 350, 150, 50);
        } else {
            // Game over screen
            this.drawText('GAME OVER', this.canvas.width / 2, 150, 
                        this.textSettings.gameOver, 'center');
                        
            // Draw character game over sprite
            const sprite = this.sprites[`${character}_gameover`];
            if (sprite && sprite.complete) {
                this.ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 - sprite.width / 2,
                    200
                );
            }
            
            // Show final score
            this.drawText(`Score: ${gameState.score}`, this.canvas.width / 2, 800, 
                        this.textSettings.score, 'center');
                        
            // Show retry button
            this.drawButton('Try Again', this.canvas.width / 2, 850, 150, 50);
        }
    }
    
    /**
     * Draw a button
     * @param {string} text - Button text
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} width - Button width
     * @param {number} height - Button height
     */
    drawButton(text, x, y, width, height) {
        // Draw button background
        this.ctx.fillStyle = '#004488';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(x - width/2, y - height/2, width, height, 10);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw text
        this.drawText(text, x, y + 5, this.textSettings.button, 'center');
    }
    
    /**
     * Get UI element at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} - UI element at position or null
     */
    getElementAtPosition(x, y) {
        const gameState = this.gameController.getGameState();
        
        // Character select screen
        if (!gameState.isActive && !gameState.gameOver) {
            const dereBtn = this.uiElements.characterSelect.dereButton;
            if (this.isPointInRect(x, y, dereBtn)) {
                return { type: 'character', value: 'dere' };
            }
            
            const alizaBtn = this.uiElements.characterSelect.alizaButton;
            if (this.isPointInRect(x, y, alizaBtn)) {
                return { type: 'character', value: 'aliza' };
            }
            
            const shinshiBtn = this.uiElements.characterSelect.shinshiButton;
            if (this.isPointInRect(x, y, shinshiBtn)) {
                return { type: 'character', value: 'shinshi' };
            }
        }
        
        // Game over screen buttons
        if (gameState.gameOver) {
            const buttonX = this.canvas.width / 2;
            const buttonY = gameState.victory ? 350 : 450;
            const buttonWidth = 150;
            const buttonHeight = 50;
            
            if (this.isPointInRect(x, y, {
                x: buttonX - buttonWidth/2,
                y: buttonY - buttonHeight/2,
                width: buttonWidth,
                height: buttonHeight
            })) {
                return { type: 'restart' };
            }
        }
        
        // Pause button (during active game)
        if (gameState.isActive) {
            const pauseX = this.canvas.width - 50;
            const pauseY = 60;
            const pauseSize = 30;
            
            if (this.isPointInRect(x, y, {
                x: pauseX - pauseSize/2,
                y: pauseY - pauseSize/2,
                width: pauseSize,
                height: pauseSize
            })) {
                return { type: 'pause' };
            }
        }
        
        return null;
    }
    
    /**
     * Check if a point is within a rectangle
     * @param {number} x - Point X coordinate
     * @param {number} y - Point Y coordinate
     * @param {Object} rect - Rectangle {x, y, width, height}
     * @returns {boolean} - True if point is in rectangle
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    /**
     * Create a fallback sprite directly instead of trying to load a missing image
     * @param {string} name - Name to reference the sprite
     * @param {number} size - Size of the sprite (width and height)
     * @param {string} color - Base color for the sprite
     */
    createFallbackSprite(name, size, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.height = size;
        
        // Fill with base color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        
        if (name === 'shield') {
            // Create a shield-like appearance
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner circle
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (name === 'explosion') {
            // Create an explosion-like appearance
            for (let i = 0; i < 8; i++) {
                const angle = i * Math.PI / 4;
                const x1 = size/2 + Math.cos(angle) * (size/4);
                const y1 = size/2 + Math.sin(angle) * (size/4);
                const x2 = size/2 + Math.cos(angle) * (size/2 - 5);
                const y2 = size/2 + Math.sin(angle) * (size/2 - 5);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        
        // Add border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        
        // Store the canvas element as the sprite
        this.sprites[name] = canvas;
        console.log(`Created fallback sprite for: ${name}`);
    }
    
    /**
     * Render player beams (for Shinshi character)
     * @param {Array} beams - Array of beam objects
     */
    renderPlayerBeams(beams) {
        if (!beams || beams.length === 0) {
            return;
        }
        
        for (const beam of beams) {
            // Get the appropriate beam sprite based on beam level
            const spriteKey = `shinbeam${beam.level}`;
            const sprite = this.sprites[spriteKey];
            
            if (sprite && sprite.complete) {
                // Calculate beam length to reach from player to top of screen
                const beamLength = this.canvas.height; // Use full canvas height
                const sourceHeight = sprite.height;
                
                // Draw the beam from player position to top of screen
                // Note: We're not squishing the beam, just stretching it to reach the top
                this.ctx.drawImage(
                    sprite,
                    0,                  // Source X
                    0,                  // Source Y
                    sprite.width,       // Source width
                    sourceHeight,       // Source height
                    beam.x - beam.width/2,  // Destination X (centered on beam.x)
                    -this.canvas.height/2,  // Destination Y (top of canvas)
                    beam.width,         // Destination width
                    beamLength          // Destination height
                );
            } else {
                // Fallback rendering with color
                this.ctx.fillStyle = '#88FFFF';
                this.ctx.fillRect(
                    beam.x - beam.width/2,
                    -this.canvas.height/2,
                    beam.width,
                    this.canvas.height
                );
            }
        }
    }
}
