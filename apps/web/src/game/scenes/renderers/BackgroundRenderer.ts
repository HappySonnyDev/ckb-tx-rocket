/**
 * Background Renderer
 * Handles rendering of sky and grass backgrounds
 */

import { Scene } from "phaser";

export class BackgroundRenderer {
    private scene: Scene;
    
    private skyBackgroundCenter!: Phaser.GameObjects.TileSprite;
    private skyBackgroundLeft!: Phaser.GameObjects.TileSprite;
    private skyBackgroundRight!: Phaser.GameObjects.TileSprite;
    
    private grassBackgroundCenter!: Phaser.GameObjects.TileSprite;
    private grassBackgroundLeft!: Phaser.GameObjects.TileSprite;
    private grassBackgroundRight!: Phaser.GameObjects.TileSprite;
    
    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    /**
     * Renders tiled sky background with responsive extensions for wide screens
     */
    public renderSkyBackground(): void {
        const screenWidth = this.scene.scale.width;
        const screenCenterX = screenWidth / 2;
        const SKY_HEIGHT = 280;
        
        if (this.skyBackgroundCenter) this.skyBackgroundCenter.destroy();
        if (this.skyBackgroundLeft) this.skyBackgroundLeft.destroy();
        if (this.skyBackgroundRight) this.skyBackgroundRight.destroy();
        
        this.skyBackgroundCenter = this.scene.add.tileSprite(
            screenCenterX,
            0,
            screenWidth,
            SKY_HEIGHT,
            "sky",
        );
        this.skyBackgroundCenter.setOrigin(0.5, 0);
    }
    
    /**
     * Renders tiled grass background positioned below the sky
     */
    public renderGrassBackground(): void {
        const screenWidth = this.scene.scale.width;
        const screenCenterX = screenWidth / 2;
        const GRASS_Y_POSITION = 264;
        const GRASS_HEIGHT = 279;
        
        if (this.grassBackgroundCenter) this.grassBackgroundCenter.destroy();
        if (this.grassBackgroundLeft) this.grassBackgroundLeft.destroy();
        if (this.grassBackgroundRight) this.grassBackgroundRight.destroy();
        
        this.grassBackgroundCenter = this.scene.add.tileSprite(
            screenCenterX,
            264,
            screenWidth,
            283,
            "grass",
        );
        this.grassBackgroundCenter.setOrigin(0.5, 0);
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.skyBackgroundCenter) this.skyBackgroundCenter.destroy();
        if (this.skyBackgroundLeft) this.skyBackgroundLeft.destroy();
        if (this.skyBackgroundRight) this.skyBackgroundRight.destroy();
        if (this.grassBackgroundCenter) this.grassBackgroundCenter.destroy();
        if (this.grassBackgroundLeft) this.grassBackgroundLeft.destroy();
        if (this.grassBackgroundRight) this.grassBackgroundRight.destroy();
    }
}
