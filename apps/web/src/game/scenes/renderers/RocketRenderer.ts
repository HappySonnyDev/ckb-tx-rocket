/**
 * Rocket Renderer
 * Handles rendering of rocket and related elements
 */

import { Scene } from "phaser";
import { networkConfig } from "../../../config/network.config";

export class RocketRenderer {
    private scene: Scene;
    
    private tizi!: Phaser.GameObjects.Image;
    private platform!: Phaser.GameObjects.Image;
    private rocket!: Phaser.GameObjects.Image;
    private pow!: Phaser.GameObjects.Image;
    private king!: Phaser.GameObjects.Image;
    private rocketCloseDoor!: Phaser.GameObjects.Image;
    private fire!: Phaser.GameObjects.Image;
    
    private onRocketClick?: () => void;
    private onPowClick?: () => void;
    
    constructor(scene: Scene, onRocketClick?: () => void, onPowClick?: () => void) {
        this.scene = scene;
        this.onRocketClick = onRocketClick;
        this.onPowClick = onPowClick;
    }
    
    /**
     * Renders rocket and all related elements
     */
    public renderRocket(): void {
        const screenHeight = this.scene.scale.height;
        const grassBottomEdge = 264 + 279 - 75 - 14;
        const rocketY = 264 + 279 - 75 - 59;
        
        // Get network-specific resource names
        const tiziKey = networkConfig.getResourceName('tizi');
        const platformKey = networkConfig.getResourceName('platform');
        const rocketKey = networkConfig.getResourceName('rocket');
        const powKey = networkConfig.getResourceName('pow');
        const kingKey = networkConfig.getResourceName('king');
        const rocketCloseKey = networkConfig.getResourceName('rocket_close');
        
        // Tizi (base platform)
        if (this.tizi) this.tizi.destroy();
        this.tizi = this.scene.add.image(0, grassBottomEdge, tiziKey);
        this.tizi.setDisplaySize(154, 286);
        this.tizi.setOrigin(0, 1);
        
        // Platform
        if (this.platform) this.platform.destroy();
        this.platform = this.scene.add.image(
            94,
            grassBottomEdge,
            platformKey,
        );
        this.platform.setDisplaySize(232, 94);
        this.platform.setOrigin(0, 1);
        
        // Rocket (open door)
        if (this.rocket) this.rocket.destroy();
        this.rocket = this.scene.add.image(153, rocketY, rocketKey);
        this.rocket.setDisplaySize(116, 332);
        this.rocket.setOrigin(0, 1);
        this.rocket.setInteractive({ useHandCursor: true });
        this.rocket.on("pointerdown", () => {
            if (this.onRocketClick) {
                this.onRocketClick();
            }
        });
        
        // POW
        if (this.pow) this.pow.destroy();
        this.pow = this.scene.add.image(96, 264 + 279 - 75 - 202, powKey);
        this.pow.setDisplaySize(78, 145);
        this.pow.setOrigin(0, 1);
        this.pow.setInteractive({ useHandCursor: true });
        this.pow.on("pointerdown", () => {
            if (this.onPowClick) {
                this.onPowClick();
            }
        });
        
        // King
        if (this.king) this.king.destroy();
        this.king = this.scene.add.image(15, 264 + 279 - 75 - 261, kingKey);
        this.king.setDisplaySize(80, 77);
        this.king.setOrigin(0, 1);
        
        // Rocket close door (initially hidden)
        if (this.rocketCloseDoor) this.rocketCloseDoor.destroy();
        this.rocketCloseDoor = this.scene.add.image(
            153,
            rocketY,
            rocketCloseKey,
        );
        this.rocketCloseDoor.setDisplaySize(116, 332);
        this.rocketCloseDoor.setOrigin(0, 1);
        this.rocketCloseDoor.setVisible(false);
        
        // Fire (initially hidden)
        if (this.fire) this.fire.destroy();
        this.fire = this.scene.add.image(153 + 58, rocketY - 30, "fire");
        this.fire.setDisplaySize(78, 94);
        this.fire.setOrigin(0.5, 0);
        this.fire.setVisible(false);
        this.fire.setAlpha(0);
    }
    
    /**
     * Get rocket game objects for animation
     */
    public getRocketElements() {
        return {
            rocket: this.rocket,
            rocketCloseDoor: this.rocketCloseDoor,
            platform: this.platform,
            pow: this.pow,
            fire: this.fire,
        };
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.tizi) this.tizi.destroy();
        if (this.platform) this.platform.destroy();
        if (this.rocket) this.rocket.destroy();
        if (this.pow) this.pow.destroy();
        if (this.king) this.king.destroy();
        if (this.rocketCloseDoor) this.rocketCloseDoor.destroy();
        if (this.fire) this.fire.destroy();
    }
}
