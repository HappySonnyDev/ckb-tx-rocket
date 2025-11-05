/**
 * Building Renderer
 * Handles rendering of museum, cafe, cake and interactive tooltips
 */

import { Scene } from "phaser";

export class BuildingRenderer {
    private scene: Scene;
    
    private museum!: Phaser.GameObjects.Image;
    private cafe!: Phaser.GameObjects.Image;
    private cake!: Phaser.GameObjects.Image;
    private kingNext!: Phaser.GameObjects.Image;
    
    private onTooltipShow?: (
        content: any,
        x: number,
        y: number,
        width?: number | string,
        height?: number | string,
    ) => void;
    
    constructor(
        scene: Scene,
        onTooltipShow?: (
            content: any,
            x: number,
            y: number,
            width?: number | string,
            height?: number | string,
        ) => void,
    ) {
        this.scene = scene;
        this.onTooltipShow = onTooltipShow;
    }
    
    /**
     * Renders all buildings and sets up interactions
     */
    public renderBuildings(): void {
        const roadRightEdge = 798;
        const roadBottomEdge = 340;
        const padding = 32;
        
        if (this.museum) this.museum.destroy();
        if (this.cafe) this.cafe.destroy();
        if (this.cake) this.cake.destroy();
        if (this.kingNext) this.kingNext.destroy();
        
        // Museum
        this.museum = this.scene.add.image(roadRightEdge, roadBottomEdge, "meseum");
        this.museum.setOrigin(0, 1);
        this.museum.setDisplaySize(228, 247);
        this.museum.setInteractive({ useHandCursor: true });
        this.museum.on("pointerdown", () => this.handleMuseumClick());
        
        // Cafe
        this.cafe = this.scene.add.image(
            roadRightEdge + 228 + padding,
            roadBottomEdge,
            "cafe",
        );
        this.cafe.setOrigin(0, 1);
        this.cafe.setDisplaySize(160, 172);
        this.cafe.setInteractive({ useHandCursor: true });
        this.cafe.on("pointerdown", () => this.handleCafeClick());
        
        // Cake
        this.cake = this.scene.add.image(
            roadRightEdge + 228 + padding + 160 + padding,
            roadBottomEdge,
            "cake",
        );
        this.cake.setOrigin(0, 1);
        this.cake.setDisplaySize(170, 172);
        this.cake.setInteractive({ useHandCursor: true });
        this.cake.on("pointerdown", () => this.handleCakeClick());
        
        // King Next
        this.kingNext = this.scene.add.image(1102, 627, "king_next_testnet");
        this.kingNext.setDisplaySize(236, 133);
        this.kingNext.setOrigin(0, 1);
        this.kingNext.setInteractive({ useHandCursor: true });
        this.kingNext.on("pointerdown", () => this.handleKingNextClick());
    }
    
    /**
     * Handle museum click
     */
    private handleMuseumClick(): void {
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: "🚀 This museum opened its doors on Nov 16, 2019 — the day CKB Mainnet launched!",
                    highlightText: "Nov 16, 2019",
                    highlightColor: "#F2EC8A",
                },
                798,
                100,
                240,
                74,
            );
        }
    }
    
    /**
     * Handle cafe click
     */
    private handleCafeClick(): void {
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: `🍴 Welcome to Fork Café — where big upgrades are always on the menu!
 1st hardfork – Mirana
 May 2021
2nd hardfork – Pudge
 May 2023
3rd hardfork – Meepo
 May 2025`,
                    highlightText: ["Mirana", "Pudge", "Meepo"],
                    highlightColor: "#F2EC8A",
                },
                1026 + 32,
                100,
                193,
                186,
            );
        }
    }
    
    /**
     * Handle cake click
     */
    private handleCakeClick(): void {
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: "🎂 We slice the cake every 4 years!\nThe last halving was on Nov 19, 2023, and the next baking is expected in Nov 2027.\nBlock rewards get cut in half — fewer coins, same sweet taste! 🍰",
                    highlightText: ["Nov 19, 2023", "Nov 2027"],
                    highlightColor: "#F2EC8A",
                },
                1026 + 32 + 160 + 32,
                100,
            );
        }
    }
    
    /**
     * Handle king next click
     */
    private handleKingNextClick(): void {
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: "🐙 Furry? Fluffy? Fabulous? I don't care.  If your fee's not fire, you're not getting picked up — at least not first.\n Avg. Fee Rate 1.3 shannons/KB\nFee Range 0.8–2.5 shannons/KB\n(You know what to do)",
                },
                1002,
                500,
                300,
                148,
            );
        }
    }
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        if (this.museum) this.museum.destroy();
        if (this.cafe) this.cafe.destroy();
        if (this.cake) this.cake.destroy();
        if (this.kingNext) this.kingNext.destroy();
    }
}
