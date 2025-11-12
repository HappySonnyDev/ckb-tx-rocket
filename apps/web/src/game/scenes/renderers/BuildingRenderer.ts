/**
 * Building Renderer
 * Handles rendering of museum, cafe, cake and interactive tooltips
 */

import { Scene } from "phaser";
import { networkConfig } from "../../../config/network.config";
import { chainVizService } from "../../../services/CKBChainVizService";

export class BuildingRenderer {
    private scene: any; // Game scene with getMainGameAreaBounds()

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
        scene: any,
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
     * Get the offset for the main game area
     */
    private getOffset(): number {
        return this.scene.getMainGameAreaBounds().left;
    }

    /**
     * Renders all buildings and sets up interactions
     */
    public renderBuildings(): void {
        const roadRightEdge = 798;
        const roadBottomEdge = 340;
        const padding = 32;
        const offset = this.getOffset();

        if (this.museum) this.museum.destroy();
        if (this.cafe) this.cafe.destroy();
        if (this.cake) this.cake.destroy();
        if (this.kingNext) this.kingNext.destroy();

        // Museum
        this.museum = this.scene.add.image(
            offset + roadRightEdge,
            roadBottomEdge,
            "meseum",
        );
        this.museum.setOrigin(0, 1);
        this.museum.setDisplaySize(228, 247);
        this.museum.setInteractive({ useHandCursor: true });
        this.museum.on("pointerdown", () => this.handleMuseumClick());

        // Cafe
        this.cafe = this.scene.add.image(
            offset + roadRightEdge + 228 + padding,
            roadBottomEdge,
            "cafe",
        );
        this.cafe.setOrigin(0, 1);
        this.cafe.setDisplaySize(160, 172);
        this.cafe.setInteractive({ useHandCursor: true });
        this.cafe.on("pointerdown", () => this.handleCafeClick());

        // Cake
        this.cake = this.scene.add.image(
            offset + roadRightEdge + 228 + padding + 160 + padding,
            roadBottomEdge,
            "cake",
        );
        this.cake.setOrigin(0, 1);
        this.cake.setDisplaySize(170, 172);
        this.cake.setInteractive({ useHandCursor: true });
        this.cake.on("pointerdown", () => this.handleCakeClick());

        // King Next
        const kingNextKey = networkConfig.getResourceName('king_next');
        this.kingNext = this.scene.add.image(offset + 1102, 627, kingNextKey);
        this.kingNext.setDisplaySize(236, 133);
        this.kingNext.setOrigin(0, 1);
        this.kingNext.setDepth(100);
        this.kingNext.setInteractive({ useHandCursor: true });
        this.kingNext.on("pointerdown", () => this.handleKingNextClick());
    }

    /**
     * Handle museum click
     */
    private handleMuseumClick(): void {
        console.log("🏛️ Museum clicked!");
        const offset = this.getOffset();
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: "🚀 This museum opened its doors on Nov 16, 2019 — the day CKB Mainnet launched!",
                    highlightText: "Nov 16, 2019",
                    highlightColor: "#F2EC8A",
                },
                offset + 798,
                50,
                240,
                74,
            );
        } else {
            console.log("⚠️ onTooltipShow callback is not set!");
        }
    }

    /**
     * Handle cafe click
     */
    private handleCafeClick(): void {
        console.log("☕ Cafe clicked!");
        const offset = this.getOffset();
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
                offset + 1040,
                63,
                193,
                198,
            );
        } else {
            console.log("⚠️ onTooltipShow callback is not set!");
        }
    }

    /**
     * Handle cake click
     */
    private handleCakeClick(): void {
        console.log("🍰 Cake clicked!");
        const offset = this.getOffset();
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: `🎂 We slice the cake every 4 years!

                    The last halving was on Nov 19, 2023, and the next baking is expected in Nov 2027.

                    Block rewards get cut in half — fewer coins, same sweet taste! 🍰`,
                    highlightText: ["Nov 19, 2023", "Nov 2027"],
                    highlightColor: "#F2EC8A",
                },
                offset + 1026 + 32 + 160 + 32,
                100,
                193,
                168,
            );
        } else {
            console.log("⚠️ onTooltipShow callback is not set!");
        }
    }

    /**
     * Handle king next click
     */
    private async handleKingNextClick(): Promise<void> {
        console.log("🐙 King Next clicked!");
        
        const offset = this.getOffset();
        
        // 先展示loading状态的tooltip
        if (this.onTooltipShow) {
            this.onTooltipShow(
                {
                    text: `🐙 Furry? Fluffy? Fabulous? I don't care.  If your fee's not fire, you're not getting picked up — at least not first.
                    
                    Loading...
                    
                    (You know what to do)`,
                    highlightText: "Loading...",
                    highlightColor: "#FFD700",
                },
                offset + 889,
                500,
                300,
                148,
            );
        } else {
            console.log("⚠️ onTooltipShow callback is not set!");
            return;
        }
        
        try {
            // 调用 tx_pool_info RPC 方法获取数据
            const txPoolInfo = await chainVizService.getTxPoolInfo();
            console.log("📊 TX Pool Info:", txPoolInfo);
            
            // 将十六进制 min_fee_rate 转换为十进制 (shannons/KB)
            const minFeeRateDecimal = parseInt(txPoolInfo.min_fee_rate, 16);
            const minFeeRateText = `Min Fee Rate ${minFeeRateDecimal} shannons/KB`;
            const highlightPart = `${minFeeRateDecimal} shannons/KB`;
            
            // 用实际数据更新tooltip
            if (this.onTooltipShow) {
                this.onTooltipShow(
                    {
                        text: `🐙 Furry? Fluffy? Fabulous? I don't care.  If your fee's not fire, you're not getting picked up — at least not first.
                    
                    ${minFeeRateText}
                    
                    (You know what to do)`,
                        highlightText: highlightPart,
                    },
                    offset + 889,
                    500,
                    300,
                    148,
                );
            }
        } catch (error) {
            console.error("❌ Failed to fetch tx pool info:", error);
            
            // 如果接口失败，显示错误提示
            if (this.onTooltipShow) {
                this.onTooltipShow(
                    {
                        text: `🐙 Furry? Fluffy? Fabulous? I don't care.  If your fee's not fire, you're not getting picked up — at least not first.
                    
                    Failed to load fee rate info
                    
                    (Please try again)`,
                        highlightText: "Failed to load fee rate info",
                        highlightColor: "#FF6B6B",
                    },
                    offset + 889,
                    500,
                    300,
                    148,
                );
            }
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

