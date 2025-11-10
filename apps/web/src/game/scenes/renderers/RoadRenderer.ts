/**
 * Road Renderer
 * Handles rendering of roads, borders, gates, and fences
 */

import { Scene } from "phaser";

export class RoadRenderer {
    private scene: Scene;
    
    private roadPath!: Phaser.GameObjects.Image;
    private mempoolEntrance!: Phaser.GameObjects.Image;
    
    private grassBorderTop!: Phaser.GameObjects.TileSprite;
    private grassBorderLeft!: Phaser.GameObjects.TileSprite;
    private grassBorderRight!: Phaser.GameObjects.TileSprite;
    private grassBorderBottom!: Phaser.GameObjects.TileSprite;
    
    private gate!: Phaser.GameObjects.Image;
    private gateText1!: Phaser.GameObjects.Text;
    private gateText2!: Phaser.GameObjects.Text;
    private gateIcon1!: Phaser.GameObjects.Image;
    private gateIcon2!: Phaser.GameObjects.Image;
    
    private fenceLeft!: Phaser.GameObjects.TileSprite;
    private fenceRight!: Phaser.GameObjects.TileSprite;
    
    private grassBottomBorderLeft!: Phaser.GameObjects.TileSprite;
    private grassBottomBorderRight!: Phaser.GameObjects.TileSprite;
    
    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    /**
     * Renders the main road path
     */
    public renderRoadPath(): void {
        if (this.roadPath) this.roadPath.destroy();
        
        this.roadPath = this.scene.add.image(357, 370, "lane");
        this.roadPath.setOrigin(0, 0);
        this.roadPath.setDisplaySize(823, 176);
    }
    
    /**
     * Renders the mempool entrance
     */
    public renderMempool(): void {
        const screenHeight = this.scene.scale.height;
        const MEMPOOL_X_POSITION = 0;
        const topHeight = 266 + 266;
        const bottomHeight = screenHeight - topHeight;
        
        if (this.mempoolEntrance) this.mempoolEntrance.destroy();
        
        this.mempoolEntrance = this.scene.add.image(
            MEMPOOL_X_POSITION,
            topHeight + bottomHeight / 2,
            "mempool",
        );
        this.mempoolEntrance.setDisplaySize(64, 494);
        this.mempoolEntrance.setOrigin(0, 0.5);
    }
    
    /**
     * Renders decorative grass borders around the road edges
     */
    public renderRoadGrassBorders(): void {
        const screenWidth = this.scene.scale.width;
        const ROAD_WIDTH = 823;
        
        if (this.grassBorderTop) this.grassBorderTop.destroy();
        if (this.grassBorderLeft) this.grassBorderLeft.destroy();
        if (this.grassBorderRight) this.grassBorderRight.destroy();
        if (this.grassBorderBottom) this.grassBorderBottom.destroy();
        
        this.grassBorderTop = this.scene.add.tileSprite(
            357,
            365,
            ROAD_WIDTH,
            12,
            "lane-grass-top",
        );
        this.grassBorderTop.setOrigin(0, 0);
        
        this.grassBorderLeft = this.scene.add.tileSprite(
            355,
            372,
            9,
            85,
            "lane-grass-left",
        );
        this.grassBorderLeft.setOrigin(0, 0);
        
        this.grassBorderRight = this.scene.add.tileSprite(
            1175,
            372,
            9,
            85,
            "lane-grass-right",
        );
        this.grassBorderRight.setOrigin(0, 0);
        
        this.grassBorderBottom = this.scene.add.tileSprite(
            355,
            448,
            368,
            10,
            "lane-grass-bottom",
        );
        this.grassBorderBottom.setOrigin(0, 0);
    }
    
    /**
     * Renders the gate and fence elements
     */
    public renderGate(): void {
        const roadBottomEdge = 543;
        
        if (this.gate) this.gate.destroy();
        if (this.gateText1) this.gateText1.destroy();
        if (this.gateText2) this.gateText2.destroy();
        if (this.gateIcon1) this.gateIcon1.destroy();
        if (this.gateIcon2) this.gateIcon2.destroy();
        if (this.fenceLeft) this.fenceLeft.destroy();
        if (this.fenceRight) this.fenceRight.destroy();
        
        this.gate = this.scene.add.image(690, roadBottomEdge, "gate");
        this.gate.setOrigin(0, 1);
        this.gate.setDepth(100); // 设置较高深度，使 Gate 在动物之上
        
        const gateTextStyle = {
            fontSize: "24px",
            fontFamily: "'Jersey 25', monospace",
            color: "#664A3D",
            fontStyle: "400",
        };
        
        // 第一行: gate-left.svg + PROPOSED QUEUE:93
        const text1X = 942.5;
        const text1Y = 360;
        const iconSize = 18;
        const iconTextGap = 8;
        
        this.gateIcon1 = this.scene.add.image(
            text1X - 100,
            text1Y,
            "gate-left"
        );
        this.gateIcon1.setOrigin(0.5, 0.5);
        this.gateIcon1.setDisplaySize(iconSize, iconSize);
        this.gateIcon1.setDepth(100); // 与 Gate 同层
        
        this.gateText1 = this.scene.add.text(
            text1X - 150 + iconSize / 2 + iconTextGap+50,
            text1Y,
            "PROPOSED QUEUE:0",
            gateTextStyle,
        );
        this.gateText1.setOrigin(0, 0.5);
        this.gateText1.setDepth(100); // 与 Gate 同层
        
        // 第二行: gate-bottom.svg + PENDING QUEUE:1,023
        const text2X = 942.5;
        const text2Y = 385;
        
        this.gateIcon2 = this.scene.add.image(
            text2X - 100,
            text2Y,
            "gate-bottom"
        );
        this.gateIcon2.setOrigin(0.5, 0.5);
        this.gateIcon2.setDisplaySize(iconSize, iconSize);
        this.gateIcon2.setDepth(100); // 与 Gate 同层
        
        this.gateText2 = this.scene.add.text(
            text2X - 150 + iconSize / 2 + iconTextGap + 50,
            text2Y,
            "PENDING QUEUE:0",
            gateTextStyle,
        );
        this.gateText2.setOrigin(0, 0.5);
        this.gateText2.setDepth(100); // 与 Gate 同层
        
        const fenceWidth = 690;
        const fenceHeight = 75;
        
        this.fenceLeft = this.scene.add.tileSprite(
            0,
            roadBottomEdge,
            fenceWidth,
            fenceHeight,
            "fence-left",
        );
        this.fenceLeft.setOrigin(0, 1);
        this.fenceLeft.setDepth(100); // 与 Gate 同层
        
        this.fenceRight = this.scene.add.tileSprite(
            1200,
            roadBottomEdge,
            258,
            fenceHeight,
            "fence-right",
        );
        this.fenceRight.setOrigin(0, 1);
        this.fenceRight.setDepth(100); // 与 Gate 同层
    }
    
    /**
     * Renders grass borders under the fence areas
     */
    public renderGrassBottomBorders(): void {
        const grassBottomHeight = 12;
        
        if (this.grassBottomBorderLeft) this.grassBottomBorderLeft.destroy();
        if (this.grassBottomBorderRight) this.grassBottomBorderRight.destroy();
        
        this.grassBottomBorderLeft = this.scene.add.tileSprite(
            0,
            546,
            736,
            grassBottomHeight,
            "grass-left-bottom",
        );
        this.grassBottomBorderLeft.setOrigin(0, 1);
        
        this.grassBottomBorderRight = this.scene.add.tileSprite(
            1170,
            546,
            258,
            grassBottomHeight,
            "grass-right-bottom",
        );
        this.grassBottomBorderRight.setOrigin(0, 1);
    }
    
    /**
     * Updates gate text with queue counts
     */
    public setGateCounts(pending: number, proposed: number): void {
        if (this.gateText1) {
            this.gateText1.setText(`PROPOSED QUEUE:${proposed}`);
        }
        if (this.gateText2) {
            this.gateText2.setText(`PENDING QUEUE:${pending}`);
        }
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.roadPath) this.roadPath.destroy();
        if (this.mempoolEntrance) this.mempoolEntrance.destroy();
        if (this.grassBorderTop) this.grassBorderTop.destroy();
        if (this.grassBorderLeft) this.grassBorderLeft.destroy();
        if (this.grassBorderRight) this.grassBorderRight.destroy();
        if (this.grassBorderBottom) this.grassBorderBottom.destroy();
        if (this.gate) this.gate.destroy();
        if (this.gateText1) this.gateText1.destroy();
        if (this.gateText2) this.gateText2.destroy();
        if (this.gateIcon1) this.gateIcon1.destroy();
        if (this.gateIcon2) this.gateIcon2.destroy();
        if (this.fenceLeft) this.fenceLeft.destroy();
        if (this.fenceRight) this.fenceRight.destroy();
        if (this.grassBottomBorderLeft) this.grassBottomBorderLeft.destroy();
        if (this.grassBottomBorderRight) this.grassBottomBorderRight.destroy();
    }
}
