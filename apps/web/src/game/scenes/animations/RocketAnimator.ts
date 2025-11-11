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
        this.platform.setTexture(platformOpenKey);
        this.platform.setDisplaySize(232, 94);
        this.platform.setOrigin(0, 1);
        
        // Hide pow
        this.pow.setVisible(false);
        
        // Step 2: After door closes, show fire and start liftoff
        this.scene.time.delayedCall(1000, () => {
            // Show and animate fire
            this.fire.setVisible(true);
            
            // Fire fade in and flicker animation
            this.scene.tweens.add({
                targets: this.fire,
                alpha: 1,
                duration: 300,
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
            
            // Step 3: Rocket slowly lifts off
            this.scene.time.delayedCall(500, () => {
                const liftoffDuration = 3000;
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
                        
                        // Reset rocket, platform and pow
                        this.scene.time.delayedCall(2000, () => {
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
     * Resets the rocket to its initial state
     */
    private resetRocket(): void {
        const grassBottomEdge = 264 + 279 - 75 - 14;
        const rocketY = 264 + 279 - 75 - 59;
        
        this.rocketCloseDoor.setY(rocketY);
        this.rocketCloseDoor.setVisible(false);
        
        this.rocket.setY(rocketY);
        this.rocket.setVisible(true);
        
        this.fire.setY(rocketY - 30);
        this.fire.setScale(1);
        this.fire.setAlpha(0);
        this.fire.setVisible(false);
        
        // Reset platform to closed state
        const platformKey = networkConfig.getResourceName('platform');
        this.platform.setTexture(platformKey);
        this.platform.setDisplaySize(232, 94);
        this.platform.setOrigin(0, 1);
        
        // Show pow again
        this.pow.setVisible(true);
        
        this.isRocketLaunching = false;
        console.log("火箭已重置");
    }
    
    /**
     * Checks if rocket is currently launching
     */
    public isLaunching(): boolean {
        return this.isRocketLaunching;
    }
}
