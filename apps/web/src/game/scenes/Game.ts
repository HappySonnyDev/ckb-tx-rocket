import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { CKBChainVizService, Block, EnhancedTransaction } from "../../services/CKBChainVizService";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import { NetworkSelector } from "../../components/NetworkSelector";
import { AboutUs } from "../../components/AboutUs";
import { FeedbackButton } from "../../components/FeedbackButton";
import { Tooltip, TooltipContent } from "../../components/Tooltip";
import { getAnimalTypeByFeeRate, calculateFeeRateThresholds, AnimalType } from "../../utils/feeRateUtils";

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
    private rocketCloseDoor!: Phaser.GameObjects.Image;
    private fire!: Phaser.GameObjects.Image;
    private isRocketLaunching: boolean = false;

    // Pending transaction queue (animals in pending state)
    private pendingQueue: Array<{
        sprite: Phaser.GameObjects.Image;
        type: "rabbit" | "pig" | "turtle";
        queuePosition: { x: number; y: number };
        randomOffset: { x: number; y: number }; // 固定的随机偏移，不会改变
    }> = [];

    // Proposed transaction queue (animals moving from pending queue to proposed)
    private proposedQueue: Array<{
        sprite: Phaser.GameObjects.Image;
        type: "rabbit" | "pig" | "turtle";
        queuePosition: { x: number; y: number };
        randomOffset: { x: number; y: number };
    }> = [];

    // Confirmed transaction queue (animals in the rocket)
    private confirmQueue: Array<{
        sprite: Phaser.GameObjects.Image;
        type: "rabbit" | "pig" | "turtle";
        txHash?: string; // Transaction hash from API
        queuePosition: { x: number; y: number };
        randomOffset: { x: number; y: number };
    }> = [];

    // Current block information
    private currentBlock: Block | null = null;

    private readonly MEMPOOL_START_X = 80; // Mempool 出口位置（Mempool右侧）
    private readonly MEMPOOL_Y = 800; // Mempool 中心 Y 坐标（道路中心线）
    private readonly QUEUE_START_X = 930; // 排队区域起始 X（Gate下方左侧）
    private readonly QUEUE_BASE_Y = 580; // 排队基准 Y 坐标（道路中心偏下）

    // Checkpoint queue position (火箭右侧)
    private readonly CHECKPOINT_START_X = 380; // Checkpoint队列起始 X（火箭右侧）
    private readonly CHECKPOINT_BASE_Y = 390; // Checkpoint队列基准 Y

    private readonly ANIMAL_SIZE = 40; // 动物图片尺寸
    private animationLoopCount = 0; // 动画循环计数器
    private readonly MAX_ANIMATION_LOOPS = 30; // 最大循环次数
    private checkpointMoveCount = 0; // Checkpoint移动计数器
    private readonly MAX_CHECKPOINT_MOVES = 16; // 最多移动8个动物到Checkpoint

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
        this.load.image("platform_open_testnet", "platform_open_testnet.png");
        this.load.image("pow_testnet", "pow_testnet.png");
        this.load.image("rocket_testnet", "rocket_testnet.png");
        this.load.image("tizi_testnet", "tizi_testnet.png");
        this.load.image("king_next_testnet", "king_next_testnet.png");
        this.load.image("rocket_close_testnet", "rocket_close_testnet.png");
        this.load.image("fire", "fire.png");

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

        // Note: Queue initialization will be done via initializeFromSnapshot()
        // when snapshot data is available from App.tsx
        console.log('🎮 Game scene ready, waiting for snapshot data...');
    }

    /**
     * Public method to initialize game state from snapshot data
     * Called from App.tsx when snapshot data is loaded
     * @param data - Snapshot data from useCKBChainViz hook
     */
    public initializeFromSnapshot(data: { 
        latestBlock: Block | null;
        pendingTransactions: EnhancedTransaction[];
        proposedTransactions: EnhancedTransaction[];
        confirmedTransactions: EnhancedTransaction[];
    }): void {
        console.log('🎮 Game.ts: Received snapshot data from App.tsx');
        console.log('   - latestBlock:', data.latestBlock?.blockNumber);
        console.log('   - pendingTransactions:', data.pendingTransactions);
        console.log('   - pendingTransactions.length:', data.pendingTransactions?.length);
        console.log('   - proposedTransactions:', data.proposedTransactions);
        console.log('   - proposedTransactions.length:', data.proposedTransactions?.length);
        console.log('   - confirmedTransactions:', data.confirmedTransactions);
        console.log('   - confirmedTransactions.length:', data.confirmedTransactions?.length);
        
        // Store current block
        if (data.latestBlock) {
            this.currentBlock = data.latestBlock;
            console.log('📦 Latest block:', data.latestBlock.blockNumber);
        }
        
        // Initialize pending queue
        if (data.pendingTransactions && data.pendingTransactions.length > 0) {
            console.log('🐇 Initializing pending queue...');
            this.initializePendingQueue(data.pendingTransactions);
        } else {
            console.log('⚠️ No pending transactions (data:', data.pendingTransactions, ')');
        }
        
        // Initialize proposed queue
        if (data.proposedTransactions && data.proposedTransactions.length > 0) {
            console.log('🐷 Initializing proposed queue...');
            this.initializeProposedQueue(data.proposedTransactions);
        } else {
            console.log('⚠️ No proposed transactions (data:', data.proposedTransactions, ')');
        }
        
        // Store confirmed transactions for rocket click display
        // No need to create sprites, just store the transaction data
        if (data.confirmedTransactions && data.confirmedTransactions.length > 0) {
            console.log('🚀 Storing confirmed transactions:', data.confirmedTransactions.length);
            // Clear and populate confirmQueue with transaction metadata
            this.confirmQueue = data.confirmedTransactions.map((tx, index) => {
                // Determine animal type based on fee rate
                const feeRate = parseFloat(tx.feeRate || '0');
                const animalType = this.determineAnimalType(tx, index, null);
                
                return {
                    sprite: null as any, // No sprite needed for confirmed transactions
                    type: animalType,
                    txHash: tx.txHash,
                    queuePosition: { x: 0, y: 0 },
                    randomOffset: { x: 0, y: 0 },
                };
            });
        } else {
            console.log('⚠️ No confirmed transactions');
            this.confirmQueue = [];
        }
        
        console.log('✅ Queues initialized:');
        console.log(`   - Pending: ${this.pendingQueue.length}`);
        console.log(`   - Proposed: ${this.proposedQueue.length}`);
        console.log(`   - Confirmed: ${this.confirmQueue.length}`);
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

        // Add rocket close door image (initially hidden)
        if (this.rocketCloseDoor) this.rocketCloseDoor.destroy();
        this.rocketCloseDoor = this.add.image(
            153,
            264 + 279 - 75 - 59,
            "rocket_close_testnet",
        );
        this.rocketCloseDoor.setDisplaySize(116, 332);
        this.rocketCloseDoor.setOrigin(0, 1);
        this.rocketCloseDoor.setVisible(false); // Initially hidden

        // Add fire image (initially hidden)
        if (this.fire) this.fire.destroy();
        this.fire = this.add.image(
            153 + 58, // Center under rocket
            264 + 279 - 75 - 89, // Below rocket
            "fire",
        );
        this.fire.setDisplaySize(78, 94);
        this.fire.setOrigin(0.5, 0);
        this.fire.setVisible(false); // Initially hidden
        this.fire.setAlpha(0);
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
        // Make rocket interactive
        if (this.rocket) {
            this.rocket.setInteractive({ useHandCursor: true });
            this.rocket.on('pointerdown', () => {
                this.handleRocketClick();
            });
        }

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
     * Handles rocket click event - logs confirmed transactions
     */
    private handleRocketClick(): void {
        console.log('🚀 Rocket clicked!');
        console.log('📦 Confirmed transactions in rocket:');
        
        if (this.confirmQueue.length === 0) {
            console.log('  No confirmed transactions yet.');
        } else {
            this.confirmQueue.forEach((animal, index) => {
                console.log(`  [${index + 1}] Type: ${animal.type}, TxHash: ${animal.txHash || 'N/A'}`);
            });
        }
        
        console.log(`Total: ${this.confirmQueue.length} confirmed transaction(s)`);
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
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#5C4033",
            fontStyle: "bold",
        };

        // 第一行文字: PROPOSED QUEUE
        this.gateText1 = this.add.text(
            942.5, // x position (gate x + offset)
            360,
            "↑ PROPOSED QUEUE:93",
            gateTextStyle,
        );
        this.gateText1.setOrigin(0.5, 0.5);

        // 第二行文字: PENDING QUEUE
        this.gateText2 = this.add.text(
            942.5, // x position
            385, // y position
            "↓ PENDING QUEUE:1,023",
            gateTextStyle,
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
            if (snapshot.data.latestBlock) {
                this.updateBlockInfo(snapshot.data.latestBlock);
            }
            if (snapshot.data.pendingTransactions) {
                this.updateTransactionInfo({
                    pending: snapshot.data.pendingTransactions.length,
                    proposed: snapshot.data.proposedTransactions?.length || 0,
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

        // Clean up pending animals
        this.pendingQueue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.pendingQueue = [];

        // Clean up proposed animals
        this.proposedQueue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.proposedQueue = [];

        // Clean up confirmed animals
        this.confirmQueue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.confirmQueue = [];
    }

    /**
     * Starts the animal animation demonstration
     * Animals move from Mempool to queue area in triangular formation
     */
    private startAnimalAnimation(): void {
        // Check if we've reached the maximum number of loops
        if (this.animationLoopCount >= this.MAX_ANIMATION_LOOPS) {
            console.log("动画已完成 5 次循环，停止执行");
            return;
        }

        // Increment loop counter
        this.animationLoopCount++;
        console.log(`开始第 ${this.animationLoopCount} 次动画循环`);

        // Clear existing animals before starting new animation cycle
        // this.clearAnimalQueue();

        // Spawn animals in sequence: rabbit -> pig -> turtle
        const animalTypes: Array<"rabbit" | "pig" | "turtle"> = [
            "rabbit",
            "pig",
            "turtle",
        ];

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
            console.log("已达到最大循环次数，动画将停止");
        }
    }

    /**
     * Clears all animals from the pending queue
     */
    private clearPendingQueue(): void {
        // Destroy all animal sprites
        this.pendingQueue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        // Clear the queue array
        this.pendingQueue = [];
    }

    /**
     * Initializes the pending queue with existing transactions from snapshot
     * @param transactions - Array of pending transactions from snapshot API
     */
    private initializePendingQueue(transactions: EnhancedTransaction[]): void {
        console.log(`Initializing pending queue with ${transactions.length} transactions`);
        
        // Clear existing queue first
        this.clearPendingQueue();
        
        // Calculate dynamic thresholds based on all transactions
        const feeRates = transactions
            .map(tx => parseFloat(tx.feeRate || '0'))
            .filter(rate => !isNaN(rate));
        const thresholds = calculateFeeRateThresholds(feeRates);
        
        console.log('Fee rate thresholds:', thresholds);
        
        // Create animals for each transaction
        transactions.forEach((tx, index) => {
            // Determine animal type based on fee rate
            const feeRate = parseFloat(tx.feeRate || '0');
            const animalType = this.determineAnimalType(tx, index, thresholds);
            
            // Generate random offset for this animal
            const randomOffset = this.generateRandomOffset();
            
            // Calculate queue position
            const basePosition = this.calculateBasePositionByIndex(this.pendingQueue.length);
            const queuePosition = {
                x: basePosition.x + randomOffset.x,
                y: basePosition.y + randomOffset.y,
            };
            
            // Create animal sprite directly at queue position (no animation)
            const animal = this.add.image(
                queuePosition.x,
                queuePosition.y,
                `${animalType}_b`, // Use queue sprite (背身图片)
            );
            animal.setDisplaySize(this.ANIMAL_SIZE, this.ANIMAL_SIZE);
            animal.setOrigin(0.5, 0.5);
            
            // Add to pending queue
            this.pendingQueue.push({
                sprite: animal,
                type: animalType,
                queuePosition: queuePosition,
                randomOffset: randomOffset,
            });
        });
        
        // Sort and arrange queue (without animation for initial load)
        this.sortPendingByPriority();
        this.arrangePendingTriangle(true); // Pass true to skip animation
        
        console.log(`Pending queue initialized with ${this.pendingQueue.length} animals`);
    }
    
    /**
     * Determines animal type based on transaction data
     * @param tx - Transaction data
     * @param index - Index in the transaction array (fallback)
     * @param thresholds - Fee rate thresholds (optional)
     * @returns Animal type
     */
    private determineAnimalType(
        tx: EnhancedTransaction, 
        index: number,
        thresholds?: { p33: number; p66: number } | null
    ): "rabbit" | "pig" | "turtle" {
        // If transaction has feeRate, use it to determine animal type
        if (tx.feeRate) {
            const feeRate = parseFloat(tx.feeRate);
            if (!isNaN(feeRate)) {
                const animalType = getAnimalTypeByFeeRate(feeRate, thresholds);
                // Convert AnimalType enum to string literal type
                return animalType as "rabbit" | "pig" | "turtle";
            }
        }
        
        // Fallback: distribute evenly by index
        const types: Array<"rabbit" | "pig" | "turtle"> = ["rabbit", "pig", "turtle"];
        return types[index % 3];
    }

    /**
     * Initializes the proposed queue with existing transactions from snapshot
     * @param transactions - Array of proposed transactions from snapshot API
     */
    private initializeProposedQueue(transactions: EnhancedTransaction[]): void {
        console.log(`Initializing proposed queue with ${transactions.length} transactions`);
        
        // Clear existing proposed queue first
        this.proposedQueue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.proposedQueue = [];
        
        // Calculate dynamic thresholds based on all transactions
        const feeRates = transactions
            .map(tx => parseFloat(tx.feeRate || '0'))
            .filter(rate => !isNaN(rate));
        const thresholds = calculateFeeRateThresholds(feeRates);
        
        console.log('Fee rate thresholds (proposed):', thresholds);
        
        // Create animals for each transaction
        transactions.forEach((tx, index) => {
            // Determine animal type based on fee rate
            const animalType = this.determineAnimalType(tx, index, thresholds);
            
            // Generate random offset for this animal
            const randomOffset = this.generateRandomOffset();
            
            // Calculate proposed queue position
            const position = this.calculateProposedPosition(animalType);
            const queuePosition = {
                x: position.x + randomOffset.x,
                y: position.y + randomOffset.y,
            };
            
            // Create animal sprite directly at proposed position (no animation)
            // Use left-facing sprite since animals in proposed queue face left
            const animal = this.add.image(
                queuePosition.x,
                queuePosition.y,
                animalType, // Use left-facing sprite
            );
            animal.setDisplaySize(this.ANIMAL_SIZE, this.ANIMAL_SIZE);
            animal.setOrigin(0.5, 0.5);
            animal.setFlipX(false); // Face left
            
            // Add to proposed queue
            this.proposedQueue.push({
                sprite: animal,
                type: animalType,
                queuePosition: queuePosition,
                randomOffset: randomOffset,
            });
        });
        
        // Sort and arrange queue (without animation for initial load)
        this.sortProposedQueue();
        this.arrangeProposedQueue(true); // Pass true to skip animation
        
        console.log(`Proposed queue initialized with ${this.proposedQueue.length} animals`);
    }

    /**
     * Starts the proposed animation - moves animals from pending queue to proposed
     * This runs slower than the main animation
     */
    private startProposedAnimation(): void {
        // Check if we've reached the maximum moves
        if (this.checkpointMoveCount >= this.MAX_CHECKPOINT_MOVES) {
            console.log("Checkpoint队列已达到8个动物，停止移动");
            return;
        }

        // Wait for some animals to accumulate in the queue
        this.time.delayedCall(3000, () => {
            this.moveAnimalToProposed();
        });
    }

    /**
     * Moves a random animal from pending queue to proposed queue
     */
    private moveAnimalToProposed(): void {
        // Check if there are animals in the queue
        if (this.pendingQueue.length === 0) {
            console.log("Pending队列为空，稍后再试");
            // Try again later
            this.time.delayedCall(2000, () => {
                this.moveAnimalToProposed();
            });
            return;
        }

        // Randomly select an animal from the queue
        const randomIndex = Phaser.Math.Between(0, this.pendingQueue.length - 1);
        const selectedAnimal = this.pendingQueue[randomIndex];

        // Remove from pending queue
        this.pendingQueue.splice(randomIndex, 1);

        // Increment proposed counter
        this.checkpointMoveCount++;

        // Calculate proposed position
        const proposedPosition = this.calculateProposedPosition(
            selectedAnimal.type,
        );

        // Get animal speed based on type
        const speed = this.getAnimalSpeed(selectedAnimal.type);

        // Calculate intermediate position (move up first)
        const upwardY = 400;
        const upDistance = Math.abs(selectedAnimal.sprite.y - upwardY);
        const upDuration = (upDistance / speed) * 1000; // 使用动物自身的速度

        // Step 1: Move upward
        this.tweens.add({
            targets: selectedAnimal.sprite,
            y: upwardY,
            duration: upDuration,
            ease: "Linear",
            onComplete: () => {
                // Step 2: Move left and change sprite direction
                // Switch to facing-left sprite (移除背身图片的_b后缀)
                const baseTexture = selectedAnimal.type; // rabbit, pig, or turtle
                selectedAnimal.sprite.setTexture(baseTexture);
                // Face left (头朝左，不需要翻转，因为原始图片头就是朝左的)
                selectedAnimal.sprite.setFlipX(false);

                const leftDistance =
                    selectedAnimal.sprite.x - proposedPosition.x;
                const leftDuration = (leftDistance / speed) * 1000; // 使用动物自身的速度

                this.tweens.add({
                    targets: selectedAnimal.sprite,
                    x: proposedPosition.x,
                    y: proposedPosition.y,
                    duration: leftDuration,
                    ease: "Linear",
                    onComplete: () => {
                        // 到达Proposed后保持头朝左的姿态，不再切换图片

                        // Add to proposed queue
                        this.proposedQueue.push({
                            sprite: selectedAnimal.sprite,
                            type: selectedAnimal.type,
                            queuePosition: proposedPosition,
                            randomOffset: selectedAnimal.randomOffset,
                        });

                        // 按优先级排序：兔子优先，猪中间，乌龟最后
                        this.sortProposedQueue();

                        // 重新排列队列（竖向填充）
                        this.arrangeProposedQueue();
                    },
                });
            },
        });

        // Rearrange remaining animals in pending queue
        this.arrangePendingTriangle();

        // Schedule next move if haven't reached max
        if (this.checkpointMoveCount < this.MAX_CHECKPOINT_MOVES) {
            // Slower interval: 4-6 seconds
            const nextDelay = Phaser.Math.Between(4000, 6000);
            this.time.delayedCall(nextDelay, () => {
                this.moveAnimalToProposed();
            });
        }
    }

    /**
     * Calculates proposed queue position for an animal
     * Proposed queue: arranged by arrival order in vertical columns
     * Fill vertically: column 1 fills top to bottom, then column 2, etc.
     */
    private calculateProposedPosition(type: "rabbit" | "pig" | "turtle"): {
        x: number;
        y: number;
    } {
        // Use current queue length as the position index (arrival order)
        const queueIndex = this.proposedQueue.length;

        // Rectangular layout parameters
        const colSpacing = 35; // 列间距
        const rowSpacing = 35; // 行间距
        const rowsPerColumn = 2; // 每列最多2行（竖向填充）

        // Calculate column and row based on queue index (vertical filling)
        const col = Math.floor(queueIndex / rowsPerColumn);
        const row = queueIndex % rowsPerColumn;

        // Calculate position
        const baseX = this.CHECKPOINT_START_X;
        const baseY = this.CHECKPOINT_BASE_Y;

        const x = baseX + col * colSpacing;
        const y = baseY + row * rowSpacing;

        return { x, y };
    }

    /**
     * Sorts the proposed queue by priority
     */
    private sortProposedQueue(): void {
        const priorityMap: Record<string, number> = {
            rabbit: 1,
            pig: 2,
            turtle: 3,
        };

        this.proposedQueue.sort((a, b) => {
            return priorityMap[a.type] - priorityMap[b.type];
        });
    }

    /**
     * Arranges animals in proposed queue
     * Order by priority, then arrange in rectangular formation (vertical filling)
     * @param skipAnimation - If true, directly set positions without animation
     */
    private arrangeProposedQueue(skipAnimation: boolean = false): void {
        // Save old positions for comparison
        const oldPositions = new Map<
            Phaser.GameObjects.Image,
            { x: number; y: number }
        >();
        this.proposedQueue.forEach((animal) => {
            oldPositions.set(animal.sprite, { ...animal.queuePosition });
        });

        // Layout parameters
        const colSpacing = 35; // 列间距
        const rowSpacing = 35; // 行间距
        const rowsPerColumn = 2; // 每列2行（竖向填充）

        // Arrange animals based on their current sorted index (vertical filling)
        this.proposedQueue.forEach((animal, index) => {
            const col = Math.floor(index / rowsPerColumn);
            const row = index % rowsPerColumn;

            const baseX = this.CHECKPOINT_START_X;
            const targetX = baseX + col * colSpacing + animal.randomOffset.x;
            const targetY =
                this.CHECKPOINT_BASE_Y +
                row * rowSpacing +
                animal.randomOffset.y;

            // Get old position
            const oldPos = oldPositions.get(animal.sprite);

            // Only animate if position actually changed
            if (
                !oldPos ||
                Math.abs(oldPos.x - targetX) > 0.1 ||
                Math.abs(oldPos.y - targetY) > 0.1
            ) {
                if (skipAnimation) {
                    // Directly set position without animation
                    animal.sprite.setPosition(targetX, targetY);
                } else {
                    // Smooth transition
                    this.tweens.add({
                        targets: animal.sprite,
                        x: targetX,
                        y: targetY,
                        duration: 300,
                        ease: "Power2",
                    });
                }
            }

            animal.queuePosition = { x: targetX, y: targetY };
        });
    }

    /**
     * Spawns a single animal and animates it to queue position
     * @param type - Type of animal to spawn (rabbit, pig, or turtle)
     */
    private spawnAnimal(type: "rabbit" | "pig" | "turtle"): void {
        // Create animal sprite at Mempool exit
        const animal = this.add.image(
            this.MEMPOOL_START_X,
            this.MEMPOOL_Y,
            type, // Use running sprite
        );
        animal.setDisplaySize(this.ANIMAL_SIZE, this.ANIMAL_SIZE);
        animal.setOrigin(0.5, 0.5);
        // Flip horizontally to face right (头朝右)
        animal.setFlipX(true);

        // Generate fixed random offset for this animal
        const randomOffset = this.generateRandomOffset();

        // Temporarily calculate a position as if the animal was already in queue
        // This is just for movement calculation, not affecting existing queue
        const tempQueue = [
            ...this.pendingQueue,
            {
                sprite: animal,
                type: type,
                queuePosition: { x: 0, y: 0 },
                randomOffset: randomOffset,
            },
        ];

        // Sort temp queue by priority
        const priorityMap: Record<string, number> = {
            rabbit: 1,
            pig: 2,
            turtle: 3,
        };
        tempQueue.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

        // Find where this animal would be in the sorted queue
        const tempIndex = tempQueue.findIndex((a) => a.sprite === animal);
        const basePosition = this.calculateBasePositionByIndex(tempIndex);
        const queuePosition = {
            x: basePosition.x + randomOffset.x,
            y: basePosition.y + randomOffset.y,
        };

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
            ease: "Linear",
            onComplete: () => {
                // Switch to queue sprite (背身图片)
                animal.setTexture(`${type}_b`);

                // Add to queue after arrival
                this.pendingQueue.push({
                    sprite: animal,
                    type: type,
                    queuePosition: queuePosition,
                    randomOffset: randomOffset,
                });

                // Sort queue by priority
                this.sortPendingByPriority();

                // Rearrange all animals in triangular formation
                this.arrangePendingTriangle();
            },
        });
    }

    /**
     * Sorts the pending queue by priority: rabbit > pig > turtle
     */
    private sortPendingByPriority(): void {
        const priorityMap: Record<string, number> = {
            rabbit: 1,
            pig: 2,
            turtle: 3,
        };

        this.pendingQueue.sort((a, b) => {
            return priorityMap[a.type] - priorityMap[b.type];
        });
    }

    /**
     * Calculates the base queue position (without random offset) based on queue index
     * @param index - Index in the sorted queue
     * @returns Base position coordinates
     */
    private calculateBasePositionByIndex(index: number): {
        x: number;
        y: number;
    } {
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
        const rowSpacing = 28; // 垂直间距
        const colSpacing = 30; // 横向间距

        // Calculate position with triangular offset (centered)
        const x = baseX + col * colSpacing - (row * colSpacing) / 2;
        const y = baseY + row * rowSpacing;

        return { x, y };
    }

    /**
     * Generates a random offset for natural positioning
     * @returns Random offset for x and y
     */
    private generateRandomOffset(): { x: number; y: number } {
        // 横向随机偏移 ±8px（增加横向波动，让三角形边缘更自然）
        // 垂直随机偏移 ±6px
        return {
            x: (Math.random() - 0.5) * 16, // -8 到 +8
            y: (Math.random() - 0.5) * 12, // -6 到 +6
        };
    }

    /**
     * Gets the movement speed for each animal type
     * Rabbit is fastest, turtle is slowest
     * @param type - Animal type
     * @returns Speed in pixels per second
     */
    private getAnimalSpeed(type: "rabbit" | "pig" | "turtle"): number {
        const speeds = {
            rabbit: 400, // Fastest (最快)
            pig: 300, // Medium (中速)
            turtle: 200, // Slowest (最慢)
        };
        return speeds[type];
    }

    /**
     * Arranges animals in a single triangular formation
     * All animals mixed together, forming one large triangle
     * Only moves animals whose index has changed
     * @param skipAnimation - If true, directly set positions without animation
     */
    private arrangePendingTriangle(skipAnimation: boolean = false): void {
        // Save old positions before rearranging
        const oldPositions = new Map<
            Phaser.GameObjects.Image,
            { x: number; y: number }
        >();
        this.pendingQueue.forEach((animal) => {
            oldPositions.set(animal.sprite, { ...animal.queuePosition });
        });

        // Arrange all animals in a single triangular formation
        this.pendingQueue.forEach((animal, index) => {
            // Calculate base position using the index
            const basePosition = this.calculateBasePositionByIndex(index);

            // Apply the animal's fixed random offset
            const targetX = basePosition.x + animal.randomOffset.x;
            const targetY = basePosition.y + animal.randomOffset.y;

            // Get old position
            const oldPos = oldPositions.get(animal.sprite);

            // Only animate if position actually changed
            if (
                !oldPos ||
                Math.abs(oldPos.x - targetX) > 0.1 ||
                Math.abs(oldPos.y - targetY) > 0.1
            ) {
                if (skipAnimation) {
                    // Directly set position without animation
                    animal.sprite.setPosition(targetX, targetY);
                } else {
                    // Smooth transition to new position
                    this.tweens.add({
                        targets: animal.sprite,
                        x: targetX,
                        y: targetY,
                        duration: 300,
                        ease: "Power2",
                    });
                }
            }

            // Update stored position
            animal.queuePosition = { x: targetX, y: targetY };
        });
    }

    /**
     * Launches the rocket with door closing and liftoff animation
     */
    private launchRocket(): void {
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
        this.platform_testnet.setTexture("platform_open_testnet");
        this.platform_testnet.setDisplaySize(232, 94);
        this.platform_testnet.setOrigin(0, 1);

        // Hide pow
        this.pow.setVisible(false);

        // Step 2: After door closes, show fire and start liftoff
        this.time.delayedCall(1000, () => {
            // Show and animate fire
            this.fire.setVisible(true);

            // Fire fade in and flicker animation
            this.tweens.add({
                targets: this.fire,
                alpha: 1,
                duration: 300,
                ease: "Power2",
            });

            // Fire flickering effect
            this.tweens.add({
                targets: this.fire,
                scaleX: { from: 0.9, to: 1.1 },
                scaleY: { from: 1.1, to: 0.9 },
                duration: 150,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });

            // Step 3: Rocket slowly lifts off
            this.time.delayedCall(500, () => {
                const liftoffDuration = 3000; // 3 seconds for liftoff
                const rocketStartY = 264 + 279 - 75 - 89; // 火箭初始Y坐标
                const targetY = -500; // Move rocket off screen
                
                // 计算火焰相对于火箭底部的偏移
                // 火箭锚点在左下角(0,1)，火焰锚点在顶部中心(0.5,0)
                // 火焰初始Y是火箭底部往上30像素的位置
                const fireOffsetFromRocketBottom = 30;
                const fireStartY = this.fire.y; // 当前火焰位置
                const fireTargetY = targetY + fireOffsetFromRocketBottom;

                // Animate rocket liftoff
                this.tweens.add({
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
                        this.time.delayedCall(2000, () => {
                            this.resetRocket();
                        });
                    },
                });

                // Animate fire with same duration and easing as rocket
                this.tweens.add({
                    targets: this.fire,
                    y: fireTargetY,
                    duration: liftoffDuration,
                    ease: "Power1", // Same easing as rocket
                });

                // Animate fire intensity during liftoff (separate tween for scale/alpha)
                this.tweens.add({
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
        // Reset positions
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
        this.platform_testnet.setTexture("platform_testnet");
        this.platform_testnet.setDisplaySize(232, 94);
        this.platform_testnet.setOrigin(0, 1);

        // Show pow again
        this.pow.setVisible(true);

        this.isRocketLaunching = false;
        console.log("火箭已重置");

        // Optional: Launch again after some time
        this.time.delayedCall(10000, () => {
            this.launchRocket();
        });
    }
}
