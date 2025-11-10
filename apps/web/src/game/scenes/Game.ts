import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import {
    CKBChainVizService,
    Block,
    EnhancedTransaction,
} from "../../services/CKBChainVizService";

// Renderers
import { BackgroundRenderer } from "./renderers/BackgroundRenderer";
import { RoadRenderer } from "./renderers/RoadRenderer";
import { BuildingRenderer } from "./renderers/BuildingRenderer";
import { RocketRenderer } from "./renderers/RocketRenderer";

// UI Managers
import { UIManager } from "./ui/UIManager";
import { TooltipManager } from "./ui/TooltipManager";
import { TransactionDetailManager } from "./ui/TransactionDetailManager";
import { BlockDetailManager } from "./ui/BlockDetailManager";

// Queue Managers
import { PendingQueueManager } from "./queues/PendingQueueManager";
import { ProposedQueueManager } from "./queues/ProposedQueueManager";

// Animators
import { AnimalAnimator } from "./animations/AnimalAnimator";
import { RocketAnimator } from "./animations/RocketAnimator";

// Utils
import { AnimalFactory } from "./utils/AnimalFactory";

// Types
import { AnimalQueueItem, GAME_CONSTANTS } from "./types/GameTypes";

export class Game extends Scene {
    // Renderers
    private backgroundRenderer!: BackgroundRenderer;
    private roadRenderer!: RoadRenderer;
    private buildingRenderer!: BuildingRenderer;
    private rocketRenderer!: RocketRenderer;
    
    // UI Managers
    private uiManager!: UIManager;
    private tooltipManager!: TooltipManager;
    private transactionDetailManager!: TransactionDetailManager;
    private blockDetailManager!: BlockDetailManager;
    
    // Queue Managers
    private pendingQueueManager!: PendingQueueManager;
    private proposedQueueManager!: ProposedQueueManager;
    
    // Animators
    private animalAnimator!: AnimalAnimator;
    private rocketAnimator!: RocketAnimator;
    
    // Services
    private chainVizService: CKBChainVizService;
    
    // Game state
    private readonly MAIN_GAME_AREA_WIDTH: number = 1440;
    private mainGameAreaLeftBound: number = 0;
    private mainGameAreaRightBound: number = 0;
    private currentBlock: Block | null = null;
    
    // Confirmed queue (metadata only, no sprites)
    private confirmQueue: AnimalQueueItem[] = [];

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
        
        // Load gate icons
        this.load.svg("gate-left", "gate-left.svg");
        this.load.svg("gate-bottom", "gate-bottom.svg");
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

        // Initialize tooltip manager first (needed by building renderer)
        this.tooltipManager = new TooltipManager();
        this.tooltipManager.createTooltip();
        
        // Initialize transaction detail manager
        this.transactionDetailManager = new TransactionDetailManager();
        this.transactionDetailManager.createTransactionDetail();
        
        // Initialize block detail manager
        this.blockDetailManager = new BlockDetailManager();
        this.blockDetailManager.createBlockDetail();

        // Initialize renderers
        this.backgroundRenderer = new BackgroundRenderer(this);
        this.roadRenderer = new RoadRenderer(this);
        this.buildingRenderer = new BuildingRenderer(
            this,
            (content, x, y, width, height) => {
                this.tooltipManager.showTooltip(content, x, y, width, height);
            },
        );
        this.rocketRenderer = new RocketRenderer(
            this,
            () => this.handleRocketClick(),
            () => this.handlePowClick()
        );

        // Render scene elements
        this.backgroundRenderer.renderSkyBackground();
        this.backgroundRenderer.renderGrassBackground();
        this.roadRenderer.renderMempool();
        this.roadRenderer.renderRoadPath();
        this.roadRenderer.renderRoadGrassBorders();
        this.roadRenderer.renderGate();
        this.roadRenderer.renderGrassBottomBorders();
        this.rocketRenderer.renderRocket();
        this.buildingRenderer.renderBuildings();

        // Initialize queue managers
        this.pendingQueueManager = new PendingQueueManager(this);
        this.proposedQueueManager = new ProposedQueueManager(this);

        // Initialize animators
        this.animalAnimator = new AnimalAnimator(
            this,
            this.pendingQueueManager,
            this.proposedQueueManager,
            (animal) => this.setupSingleAnimalClickListener(animal),
        );
        this.rocketAnimator = new RocketAnimator(
            this,
            this.rocketRenderer.getRocketElements(),
        );

        // Initialize UI managers
        this.uiManager = new UIManager(
            (network) => this.handleNetworkChange(network),
            (item) => this.handleAboutUsMenuClick(item),
            () => this.handleFeedbackClick(),
        );
        this.uiManager.createNetworkSelector();
        this.uiManager.createFeedbackButton();
        this.uiManager.createAboutUs();

        // Listen to canvas clicks to close dropdowns
        this.input.on("pointerdown", () => {
            EventBus.emit("canvas-clicked");
        });

        this.scale.on("resize", this.handleScreenResize, this);

        EventBus.emit("current-scene-ready", this);

        console.log("🎮 Game scene ready, waiting for snapshot data...");
    }

    /**
     * Public method to initialize game state from snapshot data
     * Called from App.tsx when snapshot data is loaded
     */
    public initializeFromSnapshot(data: {
        latestBlock: Block | null;
        pendingTransactions: EnhancedTransaction[];
        proposedTransactions: EnhancedTransaction[];
        confirmedTransactions: EnhancedTransaction[];
    }): void {
        console.log("🎮 Game.ts: Received snapshot data from App.tsx");
        console.log("   - latestBlock:", data.latestBlock?.blockNumber);
        console.log("   - pendingTransactions:", data.pendingTransactions);
        console.log(
            "   - pendingTransactions.length:",
            data.pendingTransactions?.length,
        );
        console.log("   - proposedTransactions:", data.proposedTransactions);
        console.log(
            "   - proposedTransactions.length:",
            data.proposedTransactions?.length,
        );
        console.log("   - confirmedTransactions:", data.confirmedTransactions);
        console.log(
            "   - confirmedTransactions.length:",
            data.confirmedTransactions?.length,
        );

        // Store current block
        if (data.latestBlock) {
            this.currentBlock = data.latestBlock;
            console.log("📦 Latest block:", data.latestBlock.blockNumber);
        }

        // Initialize pending queue
        if (data.pendingTransactions && data.pendingTransactions.length > 0) {
            console.log("🐇 Initializing pending queue...");
            this.pendingQueueManager.initializeFromSnapshot(data.pendingTransactions);
            this.setupAnimalClickListeners(this.pendingQueueManager.getQueue());
        } else {
            console.log(
                "⚠️ No pending transactions (data:",
                data.pendingTransactions,
                ")",
            );
        }

        // Initialize proposed queue
        if (data.proposedTransactions && data.proposedTransactions.length > 0) {
            console.log("🐷 Initializing proposed queue...");
            this.proposedQueueManager.initializeFromSnapshot(data.proposedTransactions);
            this.setupAnimalClickListeners(this.proposedQueueManager.getQueue());
        } else {
            console.log(
                "⚠️ No proposed transactions (data:",
                data.proposedTransactions,
                ")",
            );
        }

        // Store confirmed transactions for rocket click display
        if (
            data.confirmedTransactions &&
            data.confirmedTransactions.length > 0
        ) {
            console.log(
                "🚀 Storing confirmed transactions:",
                data.confirmedTransactions.length,
            );
            this.confirmQueue = data.confirmedTransactions.map((tx, index) => {
                const animalType = AnimalFactory.determineAnimalType(tx, index);
                
                return {
                    sprite: null as any,
                    type: animalType,
                    txHash: tx.txHash,
                    txType: tx.txType,
                    fee: tx.fee,
                    size: tx.size,
                    timestamp: tx.timestamp,
                    status: tx.status,
                    queuePosition: { x: 0, y: 0 },
                    randomOffset: { x: 0, y: 0 },
                };
            });
        } else {
            console.log("⚠️ No confirmed transactions");
            this.confirmQueue = [];
        }

        console.log("✅ Queues initialized:");
        console.log(`   - Pending: ${this.pendingQueueManager.getLength()}`);
        console.log(`   - Proposed: ${this.proposedQueueManager.getLength()}`);
        console.log(`   - Confirmed: ${this.confirmQueue.length}`);
    }

    /**
     * Sets up click listeners for animals in a queue
     */
    private setupAnimalClickListeners(queue: AnimalQueueItem[]): void {
        queue.forEach((animal) => {
            this.setupSingleAnimalClickListener(animal);
        });
    }

    /**
     * Sets up click listener for a single animal
     * Public method that can be called when new animals are added to queues
     */
    public setupSingleAnimalClickListener(animal: AnimalQueueItem): void {
        if (animal.sprite && animal.txHash) {
            animal.sprite.setInteractive({ useHandCursor: true });
            animal.sprite.on("pointerdown", () => {
                this.handleAnimalClick(animal);
            });
        }
    }

    /**
     * Handles animal click event - shows transaction detail popup
     */
    private handleAnimalClick(animal: AnimalQueueItem): void {
        if (!animal.txHash) return;

        console.log(`🐾 Animal clicked: ${animal.type}, txHash: ${animal.txHash}`);

        // Get current screen dimensions for boundary calculation
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Format timestamp
        let formattedTimestamp: string | undefined;
        if (animal.timestamp) {
            const date = new Date(animal.timestamp);
            formattedTimestamp = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC'
            }).replace(/(\/|,)/g, match => match === '/' ? '/' : '') + ' UTC';
        }
        
        // Format status
        const statusMap: Record<string, string> = {
            'PENDING': 'Pending',
            'PROPOSED': 'Proposed',
            'CONFIRMED': 'Confirmed',
            'REJECTED': 'Rejected'
        };
        const formattedStatus = animal.status ? statusMap[animal.status] || animal.status : undefined;
        
        // Format size (add Bytes suffix if not present)
        const formattedSize = animal.size ? 
            (animal.size.includes('Bytes') ? animal.size : `${animal.size} Bytes`) : 
            undefined;
        
        // Show transaction detail popup (x, y are animal center positions)
        this.transactionDetailManager.showDetail(
            {
                txHash: animal.txHash,
                animalType: animal.type,
                category: animal.txType || undefined,
                fee: animal.fee,
                status: formattedStatus,
                size: formattedSize,
                timestamp: formattedTimestamp,
            },
            animal.sprite.x,
            animal.sprite.y,
            screenWidth,
            screenHeight,
        );
    }

    /**
     * Handles rocket click event - shows block detail popup
     */
    private handleRocketClick(): void {
        console.log("🚀 Rocket clicked!");
        
        if (!this.currentBlock) {
            console.log("No block data available yet.");
            return;
        }
        
        // Get rocket position from renderer
        const rocketElements = this.rocketRenderer.getRocketElements();
        const rocketX = rocketElements.rocket.x;
        const rocketY = rocketElements.rocket.y;
        
        // Show block detail popup
        this.blockDetailManager.showDetail(
            {
                blockHash: this.currentBlock.blockHash,
                blockHeight: this.currentBlock.blockNumber,
                transactions: this.currentBlock.transactionCount,
                proposedTransactions: this.currentBlock.proposalsCount,
                uncleCount: this.currentBlock.unclesCount,
                timestamp: new Date(parseInt(this.currentBlock.timestamp)).toLocaleString(),
                confirmedTransactions: this.confirmQueue.map(item => ({
                    txHash: item.txHash || 'Unknown'
                })),
                // Mock data for demonstration
                occupation: '2,039 Bytes',
                size: '1,384 Bytes',
                minerReward: '0.000003038 CKB',
                difficulty: '4.98 EH',
                nonce: '0x403B07f4...094d51003',
            },
            rocketX,
            rocketY,
            this.scale.width,
            this.scale.height,
        );
    }
    
    /**
     * Handles POW click event - shows POW tooltip
     */
    private handlePowClick(): void {
        console.log("🔥 POW clicked!");
        
        // Get POW position from renderer
        const rocketElements = this.rocketRenderer.getRocketElements();
        const powX = rocketElements.pow.x;
        const powY = rocketElements.pow.y;
        
        // Show tooltip near POW image
        this.tooltipManager.showTooltip(
            {
                text: "⛽ CKB is powered by PoW (Proof of Work)!\n\nMiners burn real energy to solve puzzles & mint new blocks —\nit's like adding fuel to the rocket so it can launch!",
                highlightText: "PoW (Proof of Work)",
            },
            powX + 60,
            powY - 146,
            300,
            100
        );
    }

    /**
     * Handles screen resize events
     */
    private handleScreenResize(): void {
        const screenWidth = this.scale.width;
        const screenCenterX = screenWidth / 2;

        this.mainGameAreaLeftBound =
            screenCenterX - this.MAIN_GAME_AREA_WIDTH / 2;
        this.mainGameAreaRightBound =
            screenCenterX + this.MAIN_GAME_AREA_WIDTH / 2;

        // Re-render backgrounds
        this.backgroundRenderer.renderSkyBackground();
        this.backgroundRenderer.renderGrassBackground();
    }

    /**
     * Gets the boundaries of the main game area
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
     */
    private handleNetworkChange(network: string): void {
        console.log(`Network changed to: ${network}`);
        EventBus.emit("network-changed", network);
    }

    /**
     * Handles About Us menu item clicks
     */
    private handleAboutUsMenuClick(item: "about" | "tour"): void {
        console.log(`About Us menu clicked: ${item}`);
        EventBus.emit("about-menu-clicked", item);
    }

    /**
     * Handles Feedback button click
     */
    private handleFeedbackClick(): void {
        console.log("Feedback button clicked");
        EventBus.emit("feedback-clicked");
    }

    /**
     * Updates gate text with queue counts
     */
    public setGateCounts(pending: number, proposed: number): void {
        this.roadRenderer.setGateCounts(pending, proposed);
    }

    /**
     * Updates the current block data
     * Called when a new block is finalized
     */
    public updateCurrentBlock(block: Block): void {
        this.currentBlock = block;
        console.log(`📦 Current block updated to #${block.blockNumber}`);
    }

    /**
     * Shows the launch banner with block data
     */
    private showLaunchBanner(): void {
        if (!this.currentBlock) return;
        
        // Emit event to show React component
        EventBus.emit('show-launch-banner', {
            blockNumber: this.currentBlock.blockNumber,
            timestamp: this.currentBlock.timestamp,
            transactionCount: this.currentBlock.transactionCount,
            miner: this.currentBlock.miner || 'Unknown',
            blockHash: this.currentBlock.blockHash,
        });
    }

    /**
     * Launches the rocket
     */
    public launchRocket(): void {
        this.rocketAnimator.launchRocket();
        this.showLaunchBanner();
    }

    /**
     * Handles pending transaction event
     */
    public handleTransactionPending(tx: EnhancedTransaction): void {
        if (this.animalAnimator.getPendingInFlight() >= GAME_CONSTANTS.MAX_CONCURRENT_PENDING_ARRIVALS) {
            this.time.delayedCall(GAME_CONSTANTS.ARRIVAL_RETRY_DELAY_MS, () => 
                this.handleTransactionPending(tx)
            );
            return;
        }
        
        const type = AnimalFactory.determineAnimalType(tx, 0);
        this.animalAnimator.schedulePendingArrival(() => {
            this.animalAnimator.incrementPendingInFlight();
            this.animalAnimator.spawnAnimalToPending(type, tx.txHash, tx.txType, tx.fee, tx.size, tx.timestamp, tx.status);
        });
    }

    /**
     * Handles proposed transaction event
     */
    public handleTransactionProposed(tx: EnhancedTransaction): void {
        console.log(`📨 Proposed event received: txHash=${tx.txHash}, feeRate=${tx.feeRate}, fee=${tx.fee}, size=${tx.size}`);
        const inFlight = this.animalAnimator.getProposedInFlight();
        console.log(
            `   Proposed in-flight=${inFlight} / max=${GAME_CONSTANTS.MAX_CONCURRENT_PROPOSED_ARRIVALS}`,
        );
        if (inFlight >= GAME_CONSTANTS.MAX_CONCURRENT_PROPOSED_ARRIVALS) {
            console.log(
                `   Throttled. Rescheduling proposed for txHash=${tx.txHash}`,
            );
            this.time.delayedCall(GAME_CONSTANTS.ARRIVAL_RETRY_DELAY_MS, () =>
                this.handleTransactionProposed(tx),
            );
            return;
        }
        
        const pendingLen = this.pendingQueueManager.getLength();
        const idx = this.pendingQueueManager.findIndexByTxHash(tx.txHash);
        console.log(
            `   Initial pending lookup: idx=${idx}, pendingLen=${pendingLen}`,
        );
        this.pendingQueueManager.debugDump(`proposed ${tx.txHash} pending snapshot`, 25);
        if (idx !== -1) {
            console.log(
                `   Found in pending. Scheduling move for txHash=${tx.txHash}`,
            );
            this.animalAnimator.scheduleProposedArrival(() => {
                console.log(
                    `⏱️ Proposed arrival callback: recheck txHash=${tx.txHash}`,
                );
                const idx2 = this.pendingQueueManager.findIndexByTxHash(tx.txHash);
                console.log(`   Recheck pending idx2=${idx2}`);
                if (idx2 !== -1) {
                    console.log(
                        `✅ Moving existing pending item -> proposed: idx=${idx2}, txHash=${tx.txHash}`,
                    );
                    this.animalAnimator.moveAnimalToProposed(idx2);
                } else {
                    console.log(
                        `🔁 Not found on recheck. Using fallback animation for txHash=${tx.txHash}`,
                    );
                    this.animalAnimator.playProposedFallbackAnimation(tx);
                }
            });
        } else {
            console.log(
                `❌ Not in pending. Scheduling fallback for proposed: txHash=${tx.txHash}`,
            );
            this.animalAnimator.scheduleProposedArrival(() =>
                this.animalAnimator.playProposedFallbackAnimation(tx),
            );
        }
    }

    /**
     * Handles confirmed transaction event
     */
    public handleTransactionConfirmed(tx: EnhancedTransaction): void {
        const idx = this.proposedQueueManager.findIndexByTxHash(tx.txHash);
        if (idx !== -1) {
            const animal = this.proposedQueueManager.removeByIndex(idx);
            if (animal) {
                this.tweens.add({
                    targets: animal.sprite,
                    alpha: 0,
                    duration: 300,
                    ease: "Power2",
                    onComplete: () => {
                        animal.sprite.destroy();
                    },
                });
                
                this.proposedQueueManager.arrangeQueue();
                console.log(`✅ Transaction confirmed and removed from proposed queue: ${tx.txHash}`);
            }
        } else {
            console.log(`⚠️ Confirmed transaction not found in proposed queue: ${tx.txHash}`);
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

        // Clean up managers
        if (this.uiManager) this.uiManager.destroy();
        if (this.tooltipManager) this.tooltipManager.destroy();
        if (this.transactionDetailManager) this.transactionDetailManager.destroy();
        if (this.blockDetailManager) this.blockDetailManager.destroy();
        if (this.pendingQueueManager) this.pendingQueueManager.destroy();
        if (this.proposedQueueManager) this.proposedQueueManager.destroy();
        if (this.backgroundRenderer) this.backgroundRenderer.destroy();
        if (this.roadRenderer) this.roadRenderer.destroy();
        if (this.buildingRenderer) this.buildingRenderer.destroy();
        if (this.rocketRenderer) this.rocketRenderer.destroy();

        // Clean up confirmed queue
        this.confirmQueue = [];
    }
}
