import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { CKBChainVizService, Block } from "../../services/CKBChainVizService";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import { NetworkSelector } from "../../components/NetworkSelector";
import { AboutUs } from "../../components/AboutUs";
import { FeedbackButton } from "../../components/FeedbackButton";
import { Tooltip, TooltipContent } from "../../components/Tooltip";

export class Game extends Scene {
    private skyBackgroundCenter!: Phaser.GameObjects.TileSprite;
    private skyBackgroundLeft!: Phaser.GameObjects.TileSprite;
    private skyBackgroundRight!: Phaser.GameObjects.TileSprite;

    private grassBackgroundCenter!: Phaser.GameObjects.TileSprite;
    private grassBackgroundLeft!: Phaser.GameObjects.TileSprite;
    private grassBackgroundRight!: Phaser.GameObjects.TileSprite;

    private roadPath!: Phaser.GameObjects.Image;
    private mempoolEntrance!: Phaser.GameObjects.Image;

    private grassBorderTop!: Phaser.GameObjects.TileSprite;
    private grassBorderLeft!: Phaser.GameObjects.TileSprite;
    private grassBorderRight!: Phaser.GameObjects.TileSprite;
    private grassBorderBottom!: Phaser.GameObjects.TileSprite;

    private gate!: Phaser.GameObjects.Image;
    private gateText1!: Phaser.GameObjects.Text;
    private gateText2!: Phaser.GameObjects.Text;

    private fenceLeft!: Phaser.GameObjects.TileSprite;
    private fenceRight!: Phaser.GameObjects.TileSprite;

    private grassBottomBorderLeft!: Phaser.GameObjects.TileSprite;
    private grassBottomBorderRight!: Phaser.GameObjects.TileSprite;

    private readonly MAIN_GAME_AREA_WIDTH: number = 1440;
    private mainGameAreaLeftBound: number = 0;
    private mainGameAreaRightBound: number = 0;

    private chainVizService: CKBChainVizService;
    private leftOverlayContainer!: Phaser.GameObjects.Container;
    private rightOverlayContainer!: Phaser.GameObjects.Container;
    private leftOverlayBackground!: Phaser.GameObjects.Rectangle;
    private rightOverlayBackground!: Phaser.GameObjects.Rectangle;
    private blockInfoText!: Phaser.GameObjects.Text;
    private metricsText!: Phaser.GameObjects.Text;
    private transactionInfoText!: Phaser.GameObjects.Text;
    private connectionStatusText!: Phaser.GameObjects.Text;
    private meseum!: Phaser.GameObjects.Image;
    private cafe!: Phaser.GameObjects.Image;
    private cake!: Phaser.GameObjects.Image;
    private networkSelector!: HTMLElement;
    private networkSelectorRoot!: Root;
    private aboutUs!: HTMLElement;
    private aboutUsRoot!: Root;
    private feedbackButton!: HTMLElement;
    private feedbackButtonRoot!: Root;
    private tooltip!: HTMLElement;
    private tooltipRoot!: Root;
    private currentTooltip: {
        visible: boolean;
        content: TooltipContent;
        x: number;
        y: number;
        width?: number | string;
        height?: number | string;
    } = {
        visible: false,
        content: { text: "" },
        x: 0,
        y: 0,
    };
    private tizi!: Phaser.GameObjects.Image;
    private platform_testnet!: Phaser.GameObjects.Image;
    private rocket!: Phaser.GameObjects.Image;
    private pow!: Phaser.GameObjects.Image;
    private king_testnet!: Phaser.GameObjects.Image;
    private king_next_testnet!: Phaser.GameObjects.Image;

    // Animal animation system
    private animalQueue: Array<{
        sprite: Phaser.GameObjects.Image;
        type: 'rabbit' | 'pig' | 'turtle';
        queuePosition: { x: number; y: number };
    }> = [];
    private readonly MEMPOOL_START_X = 80; // Mempool 出口位置（Mempool右侧）
    private readonly MEMPOOL_Y = 600; // Mempool 中心 Y 坐标（道路中心线）
    private readonly QUEUE_START_X = 870; // 排队区域起始 X（Gate下方左侧）
    private readonly QUEUE_BASE_Y = 580; // 排队基准 Y 坐标（道路中心偏下）
    private readonly ANIMAL_SIZE = 40; // 动物图片尺寸
    private animationLoopCount = 0; // 动画循环计数器
    private readonly MAX_ANIMATION_LOOPS = 5; // 最大循环次数

    constructor() {
        super("Game");
        this.chainVizService = new CKBChainVizService();
    }

    /**
     * Preloads all game assets including backgrounds, roads, and UI elements
     */
    preload(): void {
        this.load.setPath("assets");

        this.load.image("sky", "sky.png");
        this.load.image("lane", "lane.png");
        this.load.image("grass", "grass.png");
        this.load.image("lane-grass-top", "lane-grass-top.png");
        this.load.image("lane-grass-left", "lane-grass-left.png");
        this.load.image("lane-grass-right", "lane-grass-right.png");
        this.load.image("lane-grass-bottom", "lane-grass-left-bottom.png");
        this.load.image("gate", "gate.png");
        this.load.image("fence-left", "fence-left.png");
        this.load.image("fence-right", "fence-right.png");
        this.load.image("grass-left-bottom", "grass-left-bottom.png");
        this.load.image("grass-right-bottom", "grass-right-bottom.png");
        this.load.image("mempool", "mempool.png");
        this.load.image("cafe", "cafe.png");
        this.load.image("cake", "cake.png");
        this.load.image("meseum", "meseum.png");
        this.load.image("king_testnet", "king_testnet.png");
        this.load.image("platform_testnet", "platform_testnet.png");
        this.load.image("pow_testnet", "pow_testnet.png");
        this.load.image("rocket_testnet", "rocket_testnet.png");
        this.load.image("tizi_testnet", "tizi_testnet.png");
        this.load.image("king_next_testnet", "king_next_testnet.png");

        // Load animal sprites for animation
        this.load.svg("rabbit", "rabbit.svg");
        this.load.svg("rabbit_b", "rabbit_b.svg");
        this.load.svg("pig", "pig.svg");
        this.load.svg("pig_b", "pig_b.svg");
        this.load.svg("turtle", "turtle.svg");
        this.load.svg("turtle_b", "turtle_b.svg");
    }

    /**
     * Creates the game scene with backgrounds, road, and chain data overlays
     */
    create(): void {
        this.cameras.main.setBackgroundColor("#E2C0A0");

        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;

        this.mainGameAreaLeftBound =
            screenCenterX - this.MAIN_GAME_AREA_WIDTH / 2;
        this.mainGameAreaRightBound =
            screenCenterX + this.MAIN_GAME_AREA_WIDTH / 2;

        this.renderSkyBackground();
        this.renderGrassBackground();

        this.renderMempool();
        this.renderToolTip();
        this.roadPath = this.add.image(357, 370, "lane");
        this.roadPath.setOrigin(0, 0);
        this.roadPath.setDisplaySize(823, 176);

        this.renderRoadGrassBorders();
        this.renderGate();
        this.renderGrassBottomBorders();
        this.renderRocket();

        this.createNetworkSelector();
        this.createFeedbackButton();
        this.createAboutUs();
        this.createTooltip();

        // Setup click handlers for interactive objects
        this.setupInteractiveObjects();

        // Listen to canvas clicks to close dropdowns
        this.input.on("pointerdown", () => {
            EventBus.emit("canvas-clicked");
        });

        // this.createChainDataOverlays();
        // this.initializeChainConnection();

        this.scale.on("resize", this.handleScreenResize, this);

        EventBus.emit("current-scene-ready", this);

        // Start animal animation demonstration
        this.startAnimalAnimation();
    }

    private renderRocket(): void {
        const screenHight = this.scale.height;
        const grassBottomEdge = 264 + 279 - 75 - 14;

        if (this.tizi) this.tizi.destroy();

        this.tizi = this.add.image(0, grassBottomEdge, "tizi_testnet");
        this.tizi.setDisplaySize(154, 286);
        this.tizi.setOrigin(0, 1);

        if (this.platform_testnet) this.platform_testnet.destroy();
        this.platform_testnet = this.add.image(
            94,
            grassBottomEdge,
            "platform_testnet",
        );
        this.platform_testnet.setDisplaySize(232, 94);
        this.platform_testnet.setOrigin(0, 1);

        if (this.rocket) this.rocket.destroy();
        this.rocket = this.add.image(
            153,
            264 + 279 - 75 - 59,
            "rocket_testnet",
        );
        this.rocket.setDisplaySize(116, 332);
        this.rocket.setOrigin(0, 1);

        if (this.pow) this.pow.destroy();
        this.pow = this.add.image(96, 264 + 279 - 75 - 202, "pow_testnet");
        this.pow.setDisplaySize(78, 145);
        this.pow.setOrigin(0, 1);

        if (this.king_testnet) this.king_testnet.destroy();
        this.king_testnet = this.add.image(
            15,
            264 + 279 - 75 - 261,
            "king_testnet",
        );
        this.king_testnet.setDisplaySize(80, 77);
        this.king_testnet.setOrigin(0, 1);

        if (this.king_next_testnet) this.king_next_testnet.destroy();
        this.king_next_testnet = this.add.image(1102, 627, "king_next_testnet");
        this.king_next_testnet.setDisplaySize(236, 133);
        this.king_next_testnet.setOrigin(0, 1);
    }

    /**
     * Creates a network selector dropdown in the top-left corner
     */
    /**
     * Creates a network selector dropdown using React Portal
     * This approach provides better maintainability and component reusability
     */
    private createNetworkSelector(): void {
        // Create container for React component
        const container = document.createElement("div");
        container.id = "network-selector-container";
        container.style.cssText = `
            position: absolute;
            top: 10px;
            left: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);

        // Create React root and render NetworkSelector component
        this.networkSelectorRoot = createRoot(container);
        this.networkSelectorRoot.render(
            createElement(NetworkSelector, {
                defaultNetwork: "Mainnet",
                onNetworkChange: (network: string) => {
                    this.handleNetworkChange(network);
                },
            }),
        );

        // Store reference for cleanup
        this.networkSelector = container;
    }

    /**
     * Creates a Feedback button to the left of About Us
     */
    private createFeedbackButton(): void {
        // Create container for React component
        const container = document.createElement("div");
        container.id = "feedback-button-container";
        container.style.cssText = `
            position: absolute;
            top: 10px;
            right: 70px;
            z-index: 1000;
        `;
        document.body.appendChild(container);

        // Create React root and render FeedbackButton component
        this.feedbackButtonRoot = createRoot(container);
        this.feedbackButtonRoot.render(
            createElement(FeedbackButton, {
                onClick: () => {
                    this.handleFeedbackClick();
                },
            }),
        );

        // Store reference for cleanup
        this.feedbackButton = container;
    }

    /**
     * Handles Feedback button click
     */
    private handleFeedbackClick(): void {
        console.log("Feedback button clicked");

        // Emit event for other parts of the app to handle
        EventBus.emit("feedback-clicked");

        // TODO: Implement feedback form or dialog
        // You can open a modal, redirect to feedback page, etc.
    }

    /**
     * Creates an About Us menu in the top-right corner
     */
    private createAboutUs(): void {
        const screenWidth = this.scale.width;

        // Create container for React component
        const container = document.createElement("div");
        container.id = "about-us-container";
        container.style.cssText = `
            position: absolute;
            top: 14px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);

        // Create React root and render AboutUs component
        this.aboutUsRoot = createRoot(container);
        this.aboutUsRoot.render(
            createElement(AboutUs, {
                onMenuItemClick: (item: "about" | "tour") => {
                    this.handleAboutUsMenuClick(item);
                },
            }),
        );

        // Store reference for cleanup
        this.aboutUs = container;
    }

    /**
     * Handles About Us menu item clicks
     */
    private handleAboutUsMenuClick(item: "about" | "tour"): void {
        console.log(`About Us menu clicked: ${item}`);

        // Emit event for other parts of the app to handle
        EventBus.emit("about-menu-clicked", item);

        // TODO: Implement actual menu actions
        if (item === "about") {
            // Show about dialog or navigate to about page
        } else if (item === "tour") {
            // Start tutorial/tour
        }
    }

    /**
     * Creates a Tooltip component
     */
    private createTooltip(): void {
        // Create container for React component
        const container = document.createElement("div");
        container.id = "tooltip-container";
        document.body.appendChild(container);

        // Create React root and render Tooltip component
        this.tooltipRoot = createRoot(container);
        this.updateTooltip();

        // Store reference for cleanup
        this.tooltip = container;
    }

    /**
     * Updates the tooltip display
     */
    private updateTooltip(): void {
        if (this.tooltipRoot) {
            this.tooltipRoot.render(
                createElement(Tooltip, {
                    visible: this.currentTooltip.visible,
                    content: this.currentTooltip.content,
                    x: this.currentTooltip.x,
                    y: this.currentTooltip.y,
                    width: this.currentTooltip.width,
                    height: this.currentTooltip.height,
                    onClose: () => this.hideTooltip(),
                }),
            );
        }
    }

    /**
     * Shows a tooltip at specified position with content
     */
    private showTooltip(
        content: TooltipContent,
        x: number,
        y: number,
        width?: number | string,
        height?: number | string,
    ): void {
        this.currentTooltip = { visible: true, content, x, y, width, height };
        this.updateTooltip();
    }

    /**
     * Hides the current tooltip
     */
    private hideTooltip(): void {
        this.currentTooltip.visible = false;
        this.updateTooltip();
    }

    /**
     * Setup interactive objects (museum, cafe, etc.)
     */
    private setupInteractiveObjects(): void {
        // Make museum interactive
        if (this.meseum) {
            this.meseum.setInteractive({ useHandCursor: true });
            this.meseum.on("pointerdown", () => {
                this.showTooltip(
                    {
                        text: "🚀 This museum opened its doors on Nov 16, 2019 — the day CKB Mainnet launched!",
                        highlightText: "Nov 16, 2019",
                        highlightColor: "#F2EC8A",
                    },
                    798, // x position
                    100, // y position
                    240, // width
                    74, // height
                );
            });
        }

        // Make cafe interactive
        if (this.cafe) {
            this.cafe.setInteractive({ useHandCursor: true });
            this.cafe.on("pointerdown", () => {
                this.showTooltip(
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
                    1026 + 32, // x position (museum width + padding)
                    100, // y position,
                    193,
                    186,
                );
            });
        }

        // Make cake interactive
        if (this.cake) {
            this.cake.setInteractive({ useHandCursor: true });
            this.cake.on("pointerdown", () => {
                this.showTooltip(
                    {
                        text: "🎂 We slice the cake every 4 years!\nThe last halving was on Nov 19, 2023, and the next baking is expected in Nov 2027.\nBlock rewards get cut in half — fewer coins, same sweet taste! 🍰",
                        highlightText: ["Nov 19, 2023", "Nov 2027"],
                        highlightColor: "#F2EC8A",
                    },
                    1026 + 32 + 160 + 32, // x position (museum + cafe + 2 paddings)
                    100, // y position
                );
            });
        }

        // Make king_next interactive
        if (this.king_next_testnet) {
            this.king_next_testnet.setInteractive({ useHandCursor: true });
            this.king_next_testnet.on("pointerdown", () => {
                this.showTooltip(
                    {
                        text: "🐙 Furry? Fluffy? Fabulous? I don't care.  If your fee's not fire, you're not getting picked up — at least not first.\n Avg. Fee Rate 1.3 shannons/KB\nFee Range 0.8–2.5 shannons/KB\n(You know what to do)",
                    },
                    1002, // x position
                    500, // y position
                    300,
                    148,
                );
            });
        }
    }

    /**
     * Renders tiled sky background with responsive extensions for wide screens
     */
    private renderSkyBackground(): void {
        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;
        const SKY_HEIGHT = 280;

        if (this.skyBackgroundCenter) this.skyBackgroundCenter.destroy();
        if (this.skyBackgroundLeft) this.skyBackgroundLeft.destroy();
        if (this.skyBackgroundRight) this.skyBackgroundRight.destroy();

        this.skyBackgroundCenter = this.add.tileSprite(
            screenCenterX,
            0,
            // this.MAIN_GAME_AREA_WIDTH,
            screenWidth,
            SKY_HEIGHT,
            "sky",
        );
        this.skyBackgroundCenter.setOrigin(0.5, 0);
    }

    private renderMempool() {
        const screenHight = this.scale.height;
        const MEMPOOL_X_POSITION = 0; // 距离左边缘的位置
        const topHeight = 266 + 266;
        // const topHeight = 488
        const bottomHeight = screenHight - topHeight;
        // 计算 mempool  在垂直居中的 Y 坐标

        if (this.mempoolEntrance) this.mempoolEntrance.destroy();

        // 创建 mempool entrance 图片,位于道路左侧,垂直居中
        this.mempoolEntrance = this.add.image(
            MEMPOOL_X_POSITION,
            topHeight + bottomHeight / 2,
            "mempool",
        );
        this.mempoolEntrance.setDisplaySize(64, 494);
        // 设置锚点为中心,使图片以中心点定位
        this.mempoolEntrance.setOrigin(0, 0.5);
    }
    private renderToolTip() {
        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;
        // const ROAD_WIDTH = 823;
        const roadRightEdge = 798;
        const roadBottomEdge = 340;
        const padding = 32;
        if (this.meseum) this.meseum.destroy();
        if (this.cafe) this.cafe.destroy();
        this.meseum = this.add.image(roadRightEdge, roadBottomEdge, "meseum");
        this.meseum.setOrigin(0, 1);
        this.meseum.setDisplaySize(228, 247);
        this.cafe = this.add.image(
            roadRightEdge + 228 + padding,
            roadBottomEdge,
            "cafe",
        );
        this.cafe.setOrigin(0, 1);
        this.cafe.setDisplaySize(160, 172);
        this.cake = this.add.image(
            roadRightEdge + 228 + padding + 160 + padding,
            roadBottomEdge,
            "cake",
        );
        this.cake.setOrigin(0, 1);
        this.cake.setDisplaySize(170, 172);
    }

    /**
     * Renders tiled grass background positioned below the sky
     */
    private renderGrassBackground(): void {
        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;
        const GRASS_Y_POSITION = 264;
        const GRASS_HEIGHT = 279;

        if (this.grassBackgroundCenter) this.grassBackgroundCenter.destroy();
        if (this.grassBackgroundLeft) this.grassBackgroundLeft.destroy();
        if (this.grassBackgroundRight) this.grassBackgroundRight.destroy();

        this.grassBackgroundCenter = this.add.tileSprite(
            screenCenterX,
            264,
            screenWidth,
            283,
            "grass",
        );
        this.grassBackgroundCenter.setOrigin(0.5, 0);
    }

    /**
     * Renders decorative grass borders around the road edges
     */
    private renderRoadGrassBorders(): void {
        const screenWidth = this.scale.width;
        const ROAD_WIDTH = 823;

        if (this.grassBorderTop) this.grassBorderTop.destroy();
        if (this.grassBorderLeft) this.grassBorderLeft.destroy();
        if (this.grassBorderRight) this.grassBorderRight.destroy();
        if (this.grassBorderBottom) this.grassBorderBottom.destroy();

        this.grassBorderTop = this.add.tileSprite(
            357,
            365,
            ROAD_WIDTH,
            12,
            "lane-grass-top",
        );
        this.grassBorderTop.setOrigin(0, 0);

        this.grassBorderLeft = this.add.tileSprite(
            355,
            372,
            9,
            85,
            "lane-grass-left",
        );
        this.grassBorderLeft.setOrigin(0, 0);

        this.grassBorderRight = this.add.tileSprite(
            1175,
            372,
            9,
            85,
            "lane-grass-right",
        );
        this.grassBorderRight.setOrigin(0, 0);

        this.grassBorderBottom = this.add.tileSprite(
            355,
            448,
            368,
            10,
            "lane-grass-bottom",
        );
        this.grassBorderBottom.setOrigin(0, 0);
    }

    /**
     * Renders the gate and fence elements around the game area
     */
    private renderGate(): void {
        const roadBottomEdge = 543;

        if (this.gate) this.gate.destroy();
        if (this.gateText1) this.gateText1.destroy();
        if (this.gateText2) this.gateText2.destroy();
        if (this.fenceLeft) this.fenceLeft.destroy();
        if (this.fenceRight) this.fenceRight.destroy();

        this.gate = this.add.image(690, roadBottomEdge, "gate");
        this.gate.setOrigin(0, 1);

        // 添加门框上的文字
        const gateTextStyle = {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#5C4033',
            fontStyle: 'bold'
        };

        // 第一行文字: PROPOSED QUEUE
        this.gateText1 = this.add.text(
            942.5, // x position (gate x + offset)
            360,
            '↑ PROPOSED QUEUE:93',
            gateTextStyle
        );
        this.gateText1.setOrigin(0.5, 0.5);

        // 第二行文字: PENDING QUEUE
        this.gateText2 = this.add.text(
            942.5, // x position
            385, // y position
            '↓ PENDING QUEUE:1,023',
            gateTextStyle
        );
        this.gateText2.setOrigin(0.5, 0.5);

        const fenceWidth = 690;
        const fenceHeight = 75;

        this.fenceLeft = this.add.tileSprite(
            0,
            roadBottomEdge,
            fenceWidth,
            fenceHeight,
            "fence-left",
        );
        this.fenceLeft.setOrigin(0, 1);

        this.fenceRight = this.add.tileSprite(
            1200,
            roadBottomEdge,
            258,
            fenceHeight,
            "fence-right",
        );
        this.fenceRight.setOrigin(0, 1);
    }

    /**
     * Renders grass borders under the fence areas
     */
    private renderGrassBottomBorders(): void {
        const grassBottomHeight = 12;

        if (this.grassBottomBorderLeft) this.grassBottomBorderLeft.destroy();
        if (this.grassBottomBorderRight) this.grassBottomBorderRight.destroy();

        this.grassBottomBorderLeft = this.add.tileSprite(
            0,
            546,
            736,
            grassBottomHeight,
            "grass-left-bottom",
        );
        this.grassBottomBorderLeft.setOrigin(0, 1);

        this.grassBottomBorderRight = this.add.tileSprite(
            1170,
            546,
            258,
            grassBottomHeight,
            "grass-right-bottom",
        );
        this.grassBottomBorderRight.setOrigin(0, 1);
    }

    /**
     * Handles screen resize events by re-rendering all game elements
     */
    private handleScreenResize(): void {
        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;

        this.mainGameAreaLeftBound =
            screenCenterX - this.MAIN_GAME_AREA_WIDTH / 2;
        this.mainGameAreaRightBound =
            screenCenterX + this.MAIN_GAME_AREA_WIDTH / 2;

        this.renderSkyBackground();
        this.renderGrassBackground();

        this.roadPath.setPosition(screenCenterX, 543);
        this.roadPath.setDisplaySize(823, 176);

        this.renderRoadGrassBorders();
        this.renderGate();
        this.renderGrassBottomBorders();

        if (this.rightOverlayContainer) {
            const overlayWidth = 280;
            const padding = 20;
            this.rightOverlayContainer.x = screenWidth - overlayWidth - padding;
        }
    }

    /**
     * Gets the boundaries of the main game area
     * @returns Object containing left bound, right bound, and total width
     */
    public getMainGameAreaBounds(): {
        left: number;
        right: number;
        width: number;
    } {
        return {
            left: this.mainGameAreaLeftBound,
            right: this.mainGameAreaRightBound,
            width: this.MAIN_GAME_AREA_WIDTH,
        };
    }

    /**
     * Handles network selection change
     * @param network - Selected network (mainnet or testnet)
     */
    private handleNetworkChange(network: string): void {
        console.log(`Network changed to: ${network}`);

        // Add visual feedback
        this.tweens.add({
            targets: this.networkSelector,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            ease: "Power2",
        });

        // Emit event for other parts of the app to handle
        EventBus.emit("network-changed", network);

        // TODO: Implement network switch logic
        // - Reconnect to different CKB node
        // - Clear current blockchain data
        // - Reload data from new network
    }

    /**
     * Creates semi-transparent overlays for displaying blockchain data
     */
    private createChainDataOverlays(): void {
        const overlayWidth = 280;
        const overlayHeight = 180;
        const padding = 20;
        const textStyle = {
            fontSize: "12px",
            color: "#ffffff",
            fontFamily: "monospace",
            lineSpacing: 2,
        };

        this.leftOverlayContainer = this.add.container(padding, padding);

        this.leftOverlayBackground = this.add.rectangle(
            0,
            0,
            overlayWidth,
            overlayHeight,
            0x000000,
            0.7,
        );
        this.leftOverlayBackground.setOrigin(0, 0);
        this.leftOverlayBackground.setStrokeStyle(2, 0x00ff00, 0.8);

        this.blockInfoText = this.add.text(
            10,
            10,
            "Block: Loading...",
            textStyle,
        );
        this.metricsText = this.add.text(
            10,
            80,
            "Metrics: Loading...",
            textStyle,
        );

        this.leftOverlayContainer.add([
            this.leftOverlayBackground,
            this.blockInfoText,
            this.metricsText,
        ]);

        const screenWidth = this.scale.width;
        this.rightOverlayContainer = this.add.container(
            screenWidth - overlayWidth - padding,
            padding,
        );

        this.rightOverlayBackground = this.add.rectangle(
            0,
            0,
            overlayWidth,
            overlayHeight,
            0x000000,
            0.7,
        );
        this.rightOverlayBackground.setOrigin(0, 0);
        this.rightOverlayBackground.setStrokeStyle(2, 0x00ff00, 0.8);

        this.transactionInfoText = this.add.text(
            10,
            10,
            "Transactions: Loading...",
            textStyle,
        );

        this.connectionStatusText = this.add.text(
            10,
            120,
            "Status: Disconnected",
            {
                ...textStyle,
                fontSize: "12px",
                color: "#ff0000",
            },
        );

        this.rightOverlayContainer.add([
            this.rightOverlayBackground,
            this.transactionInfoText,
            this.connectionStatusText,
        ]);

        this.leftOverlayContainer.setDepth(1000);
        this.rightOverlayContainer.setDepth(1000);
    }

    /**
     * Initializes connection to CKB ChainViz service and loads initial data
     */
    private async initializeChainConnection(): Promise<void> {
        try {
            await this.chainVizService.connect();

            this.connectionStatusText.setText("Status: Connected");
            this.connectionStatusText.setColor("#00ff00");

            this.chainVizService.subscribe("chain");
            this.chainVizService.subscribe("transactions");

            this.setupChainEventListeners();

            const snapshot = await this.chainVizService.getSnapshot();
            if (snapshot.latestBlock) {
                this.updateBlockInfo(snapshot.latestBlock);
            }
            if (snapshot.pendingTransactions) {
                this.updateTransactionInfo({
                    pending: snapshot.pendingTransactions.length,
                    proposed: snapshot.proposedTransactions?.length || 0,
                });
            }
        } catch (error) {
            console.error("Failed to connect to ChainViz service:", error);
            this.connectionStatusText.setText("Status: Connection Failed");
            this.connectionStatusText.setColor("#ff0000");
        }
    }

    /**
     * Sets up event listeners for real-time blockchain data updates
     */
    private setupChainEventListeners(): void {
        EventBus.on("block-finalized", (block: Block) => {
            this.updateBlockInfo(block);
        });

        let pendingCount = 0;
        let proposedCount = 0;
        let confirmedCount = 0;

        EventBus.on("transaction-pending", () => {
            pendingCount++;
            this.updateTransactionInfo({
                pending: pendingCount,
                proposed: proposedCount,
                confirmed: confirmedCount,
            });
        });

        EventBus.on("transaction-proposed", () => {
            if (pendingCount > 0) pendingCount--;
            proposedCount++;
            this.updateTransactionInfo({
                pending: pendingCount,
                proposed: proposedCount,
                confirmed: confirmedCount,
            });
        });

        EventBus.on("transaction-confirmed", () => {
            if (proposedCount > 0) proposedCount--;
            confirmedCount++;
            this.updateTransactionInfo({
                pending: pendingCount,
                proposed: proposedCount,
                confirmed: confirmedCount,
            });

            this.time.delayedCall(5000, () => {
                confirmedCount = 0;
                this.updateTransactionInfo({
                    pending: pendingCount,
                    proposed: proposedCount,
                    confirmed: confirmedCount,
                });
            });
        });

        EventBus.on("chainviz-disconnected", () => {
            this.connectionStatusText.setText("Status: Disconnected");
            this.connectionStatusText.setColor("#ff0000");
        });
    }

    /**
     * Updates the block information display in the left overlay
     * @param block - Block data to display
     */
    private updateBlockInfo(block: Block): void {
        const blockTime = new Date(
            parseInt(block.timestamp),
        ).toLocaleTimeString();
        const blockInfo = [
            `Block: #${block.blockNumber}`,
            `Hash: ${block.blockHash.slice(0, 14)}...`,
            `Time: ${blockTime}`,
            `Txs: ${block.transactionCount}`,
        ].join("\n");

        this.blockInfoText.setText(blockInfo);

        const metricsInfo = [
            `Miner: ${block.miner.slice(0, 14)}...`,
            `Reward: ${block.reward}`,
            `Proposals: ${block.proposalsCount || 0}`,
            `Uncles: ${block.unclesCount || 0}`,
        ].join("\n");

        this.metricsText.setText(metricsInfo);

        this.tweens.add({
            targets: this.leftOverlayBackground,
            alpha: 1,
            duration: 200,
            yoyo: true,
            ease: "Power2",
        });
    }

    /**
     * Updates the transaction counts display in the right overlay
     * @param counts - Object containing pending, proposed, and confirmed transaction counts
     */
    private updateTransactionInfo(counts: {
        pending?: number;
        proposed?: number;
        confirmed?: number;
    }): void {
        const txInfo = [
            "Transactions:",
            `  Pending: ${counts.pending || 0}`,
            `  Proposed: ${counts.proposed || 0}`,
            `  Confirmed: ${counts.confirmed || 0}`,
        ].join("\n");

        this.transactionInfoText.setText(txInfo);

        if (counts.confirmed && counts.confirmed > 0) {
            this.tweens.add({
                targets: this.rightOverlayBackground,
                alpha: 1,
                duration: 200,
                yoyo: true,
                ease: "Power2",
            });
        }
    }

    /**
     * Cleans up resources when the scene is shut down
     */
    shutdown(): void {
        if (this.chainVizService.connected) {
            this.chainVizService.unsubscribe("chain");
            this.chainVizService.unsubscribe("transactions");
            this.chainVizService.disconnect();
        }

        EventBus.off("block-finalized");
        EventBus.off("transaction-pending");
        EventBus.off("transaction-proposed");
        EventBus.off("transaction-confirmed");
        EventBus.off("chainviz-disconnected");

        // Clean up network selector
        if (this.networkSelectorRoot) {
            this.networkSelectorRoot.unmount();
        }
        if (this.networkSelector && this.networkSelector.parentNode) {
            this.networkSelector.parentNode.removeChild(this.networkSelector);
        }

        // Clean up about us menu
        if (this.aboutUsRoot) {
            this.aboutUsRoot.unmount();
        }
        if (this.aboutUs && this.aboutUs.parentNode) {
            this.aboutUs.parentNode.removeChild(this.aboutUs);
        }

        // Clean up feedback button
        if (this.feedbackButtonRoot) {
            this.feedbackButtonRoot.unmount();
        }
        if (this.feedbackButton && this.feedbackButton.parentNode) {
            this.feedbackButton.parentNode.removeChild(this.feedbackButton);
        }

        // Clean up tooltip
        if (this.tooltipRoot) {
            this.tooltipRoot.unmount();
        }
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }

        // Clean up animals
        this.animalQueue.forEach(animal => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.animalQueue = [];
    }

    /**
     * Starts the animal animation demonstration
     * Animals move from Mempool to queue area in triangular formation
     */
    private startAnimalAnimation(): void {
        // Check if we've reached the maximum number of loops
        if (this.animationLoopCount >= this.MAX_ANIMATION_LOOPS) {
            console.log('动画已完成 5 次循环，停止执行');
            return;
        }

        // Increment loop counter
        this.animationLoopCount++;
        console.log(`开始第 ${this.animationLoopCount} 次动画循环`);

        // Clear existing animals before starting new animation cycle
        // this.clearAnimalQueue();
        
        // Spawn animals in sequence: rabbit -> pig -> turtle
        const animalTypes: Array<'rabbit' | 'pig' | 'turtle'> = ['rabbit', 'pig', 'turtle'];
        
        animalTypes.forEach((type, index) => {
            // Delay each animal spawn by 1 second
            this.time.delayedCall(index * 1000, () => {
                this.spawnAnimal(type);
            });
        });

        // Schedule next loop only if we haven't reached the max
        if (this.animationLoopCount < this.MAX_ANIMATION_LOOPS) {
            this.time.delayedCall(1000, () => {
                this.startAnimalAnimation();
            });
        } else {
            console.log('已达到最大循环次数，动画将停止');
        }
    }

    /**
     * Clears all animals from the queue
     */
    private clearAnimalQueue(): void {
        // Destroy all animal sprites
        this.animalQueue.forEach(animal => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        // Clear the queue array
        this.animalQueue = [];
    }

    /**
     * Spawns a single animal and animates it to queue position
     * @param type - Type of animal to spawn (rabbit, pig, or turtle)
     */
    private spawnAnimal(type: 'rabbit' | 'pig' | 'turtle'): void {
        // Create animal sprite at Mempool exit
        const animal = this.add.image(
            this.MEMPOOL_START_X,
            this.MEMPOOL_Y,
            type // Use running sprite
        );
        animal.setDisplaySize(this.ANIMAL_SIZE, this.ANIMAL_SIZE);
        animal.setOrigin(0.5, 0.5);
        // Flip horizontally to face right (头朝右)
        animal.setFlipX(true);

        // Temporarily calculate a position as if the animal was already in queue
        // This is just for movement calculation, not affecting existing queue
        const tempQueue = [...this.animalQueue, {
            sprite: animal,
            type: type,
            queuePosition: { x: 0, y: 0 }
        }];
        
        // Sort temp queue by priority
        const priorityMap: Record<string, number> = {
            'rabbit': 1,
            'pig': 2,
            'turtle': 3
        };
        tempQueue.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);
        
        // Find where this animal would be in the sorted queue
        const tempIndex = tempQueue.findIndex(a => a.sprite === animal);
        const queuePosition = this.calculatePositionByIndex(tempIndex);

        // Calculate movement duration based on animal speed
        const speed = this.getAnimalSpeed(type);
        const distance = queuePosition.x - this.MEMPOOL_START_X;
        const duration = (distance / speed) * 1000; // Convert to milliseconds

        // Animate movement to queue position
        this.tweens.add({
            targets: animal,
            x: queuePosition.x,
            y: queuePosition.y,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // Switch to queue sprite (背身图片)
                animal.setTexture(`${type}_b`);
                
                // Add to queue after arrival
                this.animalQueue.push({
                    sprite: animal,
                    type: type,
                    queuePosition: queuePosition
                });
                
                // Sort queue by priority
                this.sortQueueByPriority();
                
                // Rearrange all animals in triangular formation
                this.arrangeQueueTriangle();
            }
        });
    }

    /**
     * Sorts the animal queue by priority: rabbit > pig > turtle
     */
    private sortQueueByPriority(): void {
        const priorityMap: Record<string, number> = {
            'rabbit': 1,
            'pig': 2,
            'turtle': 3
        };
        
        this.animalQueue.sort((a, b) => {
            return priorityMap[a.type] - priorityMap[b.type];
        });
    }

    /**
     * Calculates the queue position based on queue index
     * @param index - Index in the sorted queue
     * @returns Position coordinates
     */
    private calculatePositionByIndex(index: number): { x: number; y: number } {
        // Base position
        const baseX = this.QUEUE_START_X;
        const baseY = this.QUEUE_BASE_Y;
        
        // Calculate row number: find which row this animal belongs to
        // Row 0: 1 animal (index 0)
        // Row 1: 2 animals (index 1-2)
        // Row 2: 3 animals (index 3-5)
        // Row 3: 4 animals (index 6-9)
        let row = 0;
        let countSoFar = 0;
        while (countSoFar + row + 1 <= index) {
            countSoFar += row + 1;
            row++;
        }
        
        // Column position within the row
        const col = index - countSoFar;
        
        // 更紧凑的间距，允许动物之间有重叠
        const rowSpacing = 28;  // 垂直间距
        const colSpacing = 30;  // 横向间距
        
        // Calculate position with triangular offset (centered)
        const x = baseX + (col * colSpacing) - (row * colSpacing / 2);
        const y = baseY + (row * rowSpacing);

        return { x, y };
    }

    /**
     * Recalculates positions for all animals in the queue after sorting
     */
    private recalculateAllPositions(): void {
        this.animalQueue.forEach((animal, index) => {
            animal.queuePosition = this.calculatePositionByIndex(index);
        });
    }

    /**
     * Gets the movement speed for each animal type
     * Rabbit is fastest, turtle is slowest
     * @param type - Animal type
     * @returns Speed in pixels per second
     */
    private getAnimalSpeed(type: 'rabbit' | 'pig' | 'turtle'): number {
        const speeds = {
            rabbit: 400,  // Fastest (最快)
            pig: 300,     // Medium (中速)
            turtle: 200   // Slowest (最慢)
        };
        return speeds[type];
    }

    /**
     * Arranges animals in a single triangular formation
     * All animals mixed together, forming one large triangle
     */
    private arrangeQueueTriangle(): void {
        const baseX = this.QUEUE_START_X;
        const baseY = this.QUEUE_BASE_Y;
        const rowSpacing = 28;  // 垂直间距
        const colSpacing = 30;  // 横向间距

        // Arrange all animals in a single triangular formation
        this.animalQueue.forEach((animal, index) => {
            // Calculate row number
            let row = 0;
            let countSoFar = 0;
            while (countSoFar + row + 1 <= index) {
                countSoFar += row + 1;
                row++;
            }
            
            // Column position within the row
            const col = index - countSoFar;
            
            // Calculate position with triangular offset (centered)
            const targetX = baseX + (col * colSpacing) - (row * colSpacing / 2);
            const targetY = baseY + (row * rowSpacing);
            
            // Smooth transition to new position
            this.tweens.add({
                targets: animal.sprite,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2'
            });

            // Update stored position
            animal.queuePosition = { x: targetX, y: targetY };
        });
    }
}
