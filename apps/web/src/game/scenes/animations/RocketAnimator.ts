/**
 * Rocket Animator
 * Handles rocket launch animation
 */

import { Scene } from "phaser";
import { networkConfig } from "../../../config/network.config";

export class RocketAnimator {
    private scene: Scene;
    private isRocketLaunching: boolean = false;
    
    private rocket!: Phaser.GameObjects.Image;
    private rocketCloseDoor!: Phaser.GameObjects.Image;
    private platform!: Phaser.GameObjects.Image;
    private pow!: Phaser.GameObjects.Image;
    private fire!: Phaser.GameObjects.Image;
    
    constructor(
        scene: Scene,
        rocketElements: {
            rocket: Phaser.GameObjects.Image;
            rocketCloseDoor: Phaser.GameObjects.Image;
            platform: Phaser.GameObjects.Image;
            pow: Phaser.GameObjects.Image;
            fire: Phaser.GameObjects.Image;
        },
    ) {
        this.scene = scene;
        this.rocket = rocketElements.rocket;
        this.rocketCloseDoor = rocketElements.rocketCloseDoor;
        this.platform = rocketElements.platform;
        this.pow = rocketElements.pow;
        this.fire = rocketElements.fire;
    }
    
    /**
     * Launches the rocket with door closing and liftoff animation
     */
    public launchRocket(): void {
        if (this.isRocketLaunching) {
            console.log("火箭已在发射中，跳过");
            return;
        }
        
        this.isRocketLaunching = true;
        console.log("开始火箭发射动画");
        
        // Step 1: Close the rocket door and change platform
        this.rocketCloseDoor.setVisible(true);
        this.rocket.setVisible(false);
        
        // Change platform to open state
        const platformOpenKey = networkConfig.getResourceName('platform_open');
        // Check if texture exists before setting
        if (this.scene.textures.exists(platformOpenKey)) {
            this.platform.setTexture(platformOpenKey);
            this.platform.setDisplaySize(232, 94);
            this.platform.setOrigin(0, 1);
        } else {
            console.warn(`⚠️ Texture not found: ${platformOpenKey}`);
        }
        
        // Keep pow visible (don't hide it during launch)
        
        // Step 2: After door closes, show fire and start liftoff
        this.scene.time.delayedCall(800, () => {
            // Show and animate fire
            this.fire.setVisible(true);
            
            // Fire fade in and flicker animation
            this.scene.tweens.add({
                targets: this.fire,
                alpha: 1,
                duration: 200,
                ease: "Power2",
            });
            
            // Fire flickering effect
            this.scene.tweens.add({
                targets: this.fire,
                scaleX: { from: 0.9, to: 1.1 },
                scaleY: { from: 1.1, to: 0.9 },
                duration: 150,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
            
            // Step 3: Rocket lifts off faster
            this.scene.time.delayedCall(300, () => {
                const liftoffDuration = 2000; // Reduced from 3000ms to 2000ms
                const rocketStartY = 264 + 279 - 75 - 89;
                const targetY = -500;
                
                const fireOffsetFromRocketBottom = 30;
                const fireStartY = this.fire.y;
                const fireTargetY = targetY + fireOffsetFromRocketBottom;
                
                // Animate rocket liftoff
                this.scene.tweens.add({
                    targets: this.rocketCloseDoor,
                    y: targetY,
                    duration: liftoffDuration,
                    ease: "Power1",
                    onComplete: () => {
                        console.log("火箭发射完成");
                        // Hide fire after rocket is gone
                        this.fire.setVisible(false);
                        this.fire.setAlpha(0);
                        
                        // Reset rocket, platform and pow (faster reset)
                        this.scene.time.delayedCall(200, () => {
                            this.resetRocket();
                        });
                    },
                });
                
                // Animate fire with same duration and easing as rocket
                this.scene.tweens.add({
                    targets: this.fire,
                    y: fireTargetY,
                    duration: liftoffDuration,
                    ease: "Power1",
                });
                
                // Animate fire intensity during liftoff
                this.scene.tweens.add({
                    targets: this.fire,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0.8,
                    duration: liftoffDuration,
                    ease: "Power2",
                });
            });
        });
    }
    
    /**
     * Resets the rocket to its initial state with rise animation
     */
    private resetRocket(): void {
        const grassBottomEdge = 264 + 279 - 75 - 14;
        const rocketY = 264 + 279 - 75 - 59;
        const platformY = 264 + 279 - 75 - 14; // Platform bottom position
        
        // Keep platform in open state during rocket rise
        const platformOpenKey = networkConfig.getResourceName('platform_open');
        // Check if texture exists before setting
        if (this.scene.textures.exists(platformOpenKey)) {
            this.platform.setTexture(platformOpenKey);
            this.platform.setDisplaySize(232, 94);
            this.platform.setOrigin(0, 1);
        } else {
            console.warn(`⚠️ Texture not found: ${platformOpenKey}`);
        }
        
        // Hide closed door rocket
        this.rocketCloseDoor.setY(rocketY);
        this.rocketCloseDoor.setVisible(false);
        
        // Reset fire state
        this.fire.setY(rocketY - 30);
        this.fire.setScale(1);
        this.fire.setAlpha(0);
        this.fire.setVisible(false);
        
        // Position rocket below platform, showing only the top part
        // The rocket height is 332px, platform is at platformY
        // Start with rocket mostly hidden below platform
        const rocketHeight = 332;
        const rocketStartY = platformY - 20; // Start with only top 20px visible above platform
        this.rocket.setY(rocketStartY);
        this.rocket.setVisible(true);
        this.rocket.setAlpha(1); // Fully visible
        
        // Animate rocket rising from platform (showing more of the rocket as it rises)
        this.scene.tweens.add({
            targets: this.rocket,
            y: rocketY,
            duration: 800,
            ease: "Power2.Out",
            onComplete: () => {
                // Close platform after rocket is fully risen
                const platformKey = networkConfig.getResourceName('platform');
                // Check if texture exists before setting
                if (this.scene.textures.exists(platformKey)) {
                    this.platform.setTexture(platformKey);
                    this.platform.setDisplaySize(232, 94);
                    this.platform.setOrigin(0, 1);
                } else {
                    console.warn(`⚠️ Texture not found: ${platformKey}`);
                }
                
                this.isRocketLaunching = false;
                console.log("新火箭已从发射平台升起");
            },
        });
    }
    
    /**
     * Checks if rocket is currently launching
     */
    public isLaunching(): boolean {
        return this.isRocketLaunching;
    }
}
