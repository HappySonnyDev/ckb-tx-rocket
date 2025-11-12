/**
 * Animal Animator
 * Handles all animal movement animations
 */

import { Scene } from "phaser";
import { AnimalType, GAME_CONSTANTS, Position, AnimalQueueItem } from "../types/GameTypes";
import { AnimalFactory } from "../utils/AnimalFactory";
import { PositionCalculator } from "../utils/PositionCalculator";
import { PendingQueueManager } from "../queues/PendingQueueManager";
import { ProposedQueueManager } from "../queues/ProposedQueueManager";
import { EnhancedTransaction } from "../../../services/CKBChainVizService";

export class AnimalAnimator {
    private scene: any; // Game scene with getMainGameAreaBounds()
    private pendingQueue: PendingQueueManager;
    private proposedQueue: ProposedQueueManager;
    private onAnimalAdded?: (animal: AnimalQueueItem) => void;
    
    private pendingInFlight: number = 0;
    private proposedInFlight: number = 0;
    private nextPendingArrivalTimeMs: number = 0;
    private nextProposedArrivalTimeMs: number = 0;
    
    constructor(
        scene: any,
        pendingQueue: PendingQueueManager,
        proposedQueue: ProposedQueueManager,
        onAnimalAdded?: (animal: AnimalQueueItem) => void,
    ) {
        this.scene = scene;
        this.pendingQueue = pendingQueue;
        this.proposedQueue = proposedQueue;
        this.onAnimalAdded = onAnimalAdded;
    }
    
    /**
     * Get the offset for the main game area
     */
    private getOffset(): number {
        return this.scene.getMainGameAreaBounds().left;
    }
    
    /**
     * Spawns a single animal and animates it to pending queue position
     */
    public spawnAnimalToPending(type: AnimalType, animalSize: number, txHash?: string, txType?: string | null, fee?: string, size?: string, timestamp?: string, status?: 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED'): void {
        console.log(`🐾 Spawn to pending: type=${type}, size=${animalSize}px, txHash=${txHash ?? "N/A"}`);
        
        const offset = this.getOffset();
        const mempoolY = this.scene.getMempoolY();
        
        // Create animal sprite at Mempool exit
        const animal = AnimalFactory.createAnimalSprite(
            this.scene,
            GAME_CONSTANTS.MEMPOOL_START_X,
            mempoolY,
            type,
            type, // Use running sprite
            txType, // Pass transaction type for color tinting
            animalSize, // Pass animal size
        );
        animal.setFlipX(true);
        
        // Set interactive immediately for in-flight animals
        animal.setInteractive({ useHandCursor: true }); // Face right
        
        // Generate fixed random offset
        const randomOffset = PositionCalculator.generateRandomOffset();
        
        // Calculate target position in pending queue
        const tempQueueLength = this.pendingQueue.getLength();
        const basePosition = PositionCalculator.calculatePendingBasePosition(tempQueueLength, offset);
        console.log(
            `   Planned pending target index=${tempQueueLength}, base=(${basePosition.x},${basePosition.y})`,
        );
        const queuePosition = {
            x: basePosition.x + randomOffset.x,
            y: basePosition.y + randomOffset.y,
        };
        
        // Setup temporary click listener for in-flight animal
        const tempClickHandler = () => {
            if (txHash && this.onAnimalAdded) {
                // Create a temporary queue item for the in-flight animal
                const tempItem: AnimalQueueItem = {
                    sprite: animal,
                    type: type,
                    queuePosition: { x: animal.x, y: animal.y },
                    randomOffset: randomOffset,
                    txHash,
                    txType,
                    fee,
                    size,
                    timestamp,
                    status,
                };
                // Trigger the same click handler as queue animals
                this.scene.handleAnimalClick?.(tempItem);
            }
        };
        animal.on('pointerdown', tempClickHandler);
        
        // Calculate movement duration based on animal speed
        const speed = AnimalFactory.getAnimalSpeed(type);
        const distance = queuePosition.x - GAME_CONSTANTS.MEMPOOL_START_X;
        const duration = (distance / speed) * 1000;
        
        // Animate movement to queue position
        this.scene.tweens.add({
            targets: animal,
            x: queuePosition.x,
            y: queuePosition.y,
            duration: duration,
            ease: "Linear",
            onComplete: () => {
                this.pendingInFlight = Math.max(0, this.pendingInFlight - 1);
                console.log(
                    `➡️ Arrived at pending spot: txHash=${txHash ?? "N/A"}, queueLen=${this.pendingQueue.getLength()}`,
                );
                console.log(this.pendingQueue,'pendingQueue')
                
                // Check capacity
                if (this.pendingQueue.getLength() >= GAME_CONSTANTS.MAX_PENDING_CAPACITY) {
                    console.log(
                        `⚠️ Pending capacity full (${GAME_CONSTANTS.MAX_PENDING_CAPACITY}). Fading out txHash=${txHash ?? "N/A"}`,
                    );
                    this.scene.tweens.add({
                        targets: animal,
                        alpha: 0,
                        duration: 150,
                        ease: "Power2",
                        onComplete: () => animal.destroy(),
                    });
                    return;
                }
                
                // Switch to queue sprite
                animal.setTexture(`${type}_b`);
                
                console.log(`➕ Adding to pending: txHash=${txHash ?? "N/A"}, type=${type}`);
                // Add to queue
                const queueItem = {
                    sprite: animal,
                    type: type,
                    queuePosition: queuePosition,
                    randomOffset: randomOffset,
                    txHash,
                    txType,
                    fee,
                    size,
                    timestamp,
                    status,
                };
                this.pendingQueue.add(queueItem);
                
                // Remove temporary click listener and setup permanent one
                animal.off('pointerdown');
                if (this.onAnimalAdded) {
                    this.onAnimalAdded(queueItem);
                }
                
                // Sort and rearrange
                this.pendingQueue["sortByPriority"]();
                this.pendingQueue.arrangeQueue();
                console.log(
                    `📐 Pending rearranged; new length=${this.pendingQueue.getLength()}`,
                );
            },
        });
    }
    
    /**
     * Moves an animal from pending to proposed queue by index
     */
    public moveAnimalToProposed(index: number): void {
        const selectedAnimal = this.pendingQueue.removeByIndex(index);
        if (!selectedAnimal) {
            console.log(`❌ moveAnimalToProposed: no animal at index=${index}`);
            return;
        }
        console.log(
            `🚚 Move pending->proposed: index=${index}, txHash=${selectedAnimal.txHash ?? "N/A"}, type=${selectedAnimal.type}`,
        );
        
        const offset = this.getOffset();
        const proposedPosition = PositionCalculator.calculateProposedPosition(
            this.proposedQueue.getLength(),
            offset,
        );
        const speed = AnimalFactory.getAnimalSpeed(selectedAnimal.type);
        const upwardY = 400;
        const upDistance = Math.abs(selectedAnimal.sprite.y - upwardY);
        const upDuration = (upDistance / speed) * 1000;
        
        // Setup temporary click listener for in-flight animal during transition
        const tempClickHandler = () => {
            // Create a temporary queue item for the in-flight animal
            const tempItem: AnimalQueueItem = {
                sprite: selectedAnimal.sprite,
                type: selectedAnimal.type,
                queuePosition: { x: selectedAnimal.sprite.x, y: selectedAnimal.sprite.y },
                randomOffset: selectedAnimal.randomOffset,
                txHash: selectedAnimal.txHash,
                txType: selectedAnimal.txType,
                fee: selectedAnimal.fee,
                size: selectedAnimal.size,
                timestamp: selectedAnimal.timestamp,
                status: 'PROPOSED' as 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED',
            };
            // Trigger the same click handler as queue animals
            this.scene.handleAnimalClick?.(tempItem);
        };
        // Remove old listeners and add temporary one
        selectedAnimal.sprite.removeAllListeners('pointerdown');
        selectedAnimal.sprite.on('pointerdown', tempClickHandler);
        
        // Step 1: Move upward
        this.scene.tweens.add({
            targets: selectedAnimal.sprite,
            y: upwardY,
            duration: upDuration,
            ease: "Linear",
            onComplete: () => {
                // Step 2: Move left and change sprite
                selectedAnimal.sprite.setTexture(selectedAnimal.type);
                selectedAnimal.sprite.setFlipX(false);
                
                const leftDistance = selectedAnimal.sprite.x - proposedPosition.x;
                const leftDuration = (leftDistance / speed) * 1000;
                
                this.scene.tweens.add({
                    targets: selectedAnimal.sprite,
                    x: proposedPosition.x,
                    y: proposedPosition.y,
                    duration: leftDuration,
                    ease: "Linear",
                    onComplete: () => {
                        if (this.proposedQueue.getLength() >= GAME_CONSTANTS.MAX_PROPOSED_CAPACITY) {
                            console.log(
                                `⚠️ Proposed capacity full (${GAME_CONSTANTS.MAX_PROPOSED_CAPACITY}). Fading out txHash=${selectedAnimal.txHash ?? "N/A"}`,
                            );
                            this.scene.tweens.add({
                                targets: selectedAnimal.sprite,
                                alpha: 0,
                                duration: 150,
                                ease: "Power2",
                                onComplete: () => selectedAnimal.sprite.destroy(),
                            });
                            return;
                        }
                        
                        const queueItem = {
                            sprite: selectedAnimal.sprite,
                            type: selectedAnimal.type,
                            queuePosition: proposedPosition,
                            randomOffset: selectedAnimal.randomOffset,
                            txHash: selectedAnimal.txHash,
                            txType: selectedAnimal.txType,
                            fee: selectedAnimal.fee,
                            size: selectedAnimal.size,
                            timestamp: selectedAnimal.timestamp,
                            status: 'PROPOSED' as 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED',
                        };
                        this.proposedQueue.add(queueItem);
                        console.log(
                            `➕ Added to proposed: txHash=${selectedAnimal.txHash ?? "N/A"}, type=${selectedAnimal.type}`,
                        );
                        
                        // Remove temporary click listener and setup permanent one
                        selectedAnimal.sprite.off('pointerdown');
                        if (this.onAnimalAdded) {
                            this.onAnimalAdded(queueItem);
                        }
                        
                        this.proposedQueue["sortByPriority"]();
                        this.proposedQueue.arrangeQueue();
                    },
                });
            },
        });
        
        this.pendingQueue.arrangeQueue();
        console.log(
            `📐 Pending rearranged after move; len=${this.pendingQueue.getLength()}`,
        );
    }
    
    /**
     * Plays fallback animation for proposed transactions not in pending queue
     */
    public playProposedFallbackAnimation(tx: EnhancedTransaction): void {
        console.log(`🛰️ Proposed fallback start: txHash=${tx.txHash}`);
        this.proposedInFlight++;
        
        const offset = this.getOffset();
        const type = AnimalFactory.determineAnimalType(tx, 0);
        const animalSize = AnimalFactory.determineAnimalSize(tx);
        const randomOffset = PositionCalculator.generateRandomOffset();
        const stagingPos = PositionCalculator.calculatePendingStagingPosition(
            this.pendingQueue.getLength(),
            offset,
        );
        
        const ghost = AnimalFactory.createAnimalSprite(
            this.scene,
            stagingPos.x + randomOffset.x,
            stagingPos.y + randomOffset.y,
            type,
            `${type}_b`,
            tx.txType, // Pass transaction type for color tinting
            animalSize, // Pass animal size
        );
        ghost.setFlipX(true);
        ghost.setAlpha(0);
        
        // Set interactive immediately for in-flight ghost animal
        ghost.setInteractive({ useHandCursor: true });
        
        // Setup temporary click listener for in-flight ghost animal
        const tempClickHandler = () => {
            // Create a temporary queue item for the in-flight ghost animal
            const tempItem: AnimalQueueItem = {
                sprite: ghost,
                type,
                queuePosition: { x: ghost.x, y: ghost.y },
                randomOffset,
                txHash: tx.txHash,
                txType: tx.txType,
                fee: tx.fee,
                size: tx.size,
                timestamp: tx.timestamp,
                status: 'PROPOSED' as 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED',
            };
            // Trigger the same click handler as queue animals
            this.scene.handleAnimalClick?.(tempItem);
        };
        ghost.on('pointerdown', tempClickHandler);
        
        const speed = AnimalFactory.getAnimalSpeed(type);
        const upwardY = 400;
        const upDistance = Math.abs(ghost.y - upwardY);
        const upDuration = (upDistance / speed) * 1000;
        
        this.scene.tweens.add({
            targets: ghost,
            alpha: 1,
            duration: 150,
            ease: "Power2",
            onComplete: () => {
                this.scene.tweens.add({
                    targets: ghost,
                    y: upwardY,
                    duration: upDuration,
                    ease: "Linear",
                    onComplete: () => {
                        ghost.setTexture(type);
                        ghost.setFlipX(false);
                        
                        const baseProposed = PositionCalculator.calculateProposedPosition(
                            this.proposedQueue.getLength(),
                            offset,
                        );
                        const targetX = baseProposed.x + randomOffset.x;
                        const targetY = baseProposed.y + randomOffset.y;
                        const leftDistance = Math.abs(ghost.x - targetX);
                        const leftDuration = (leftDistance / speed) * 1000;
                        
                        this.scene.tweens.add({
                            targets: ghost,
                            x: targetX,
                            y: targetY,
                            duration: leftDuration,
                            ease: "Linear",
                            onComplete: () => {
                                if (this.proposedQueue.getLength() >= GAME_CONSTANTS.MAX_PROPOSED_CAPACITY) {
                                    console.log(
                                        `⚠️ Proposed capacity full. Fallback fade out: txHash=${tx.txHash}`,
                                    );
                                    this.scene.tweens.add({
                                        targets: ghost,
                                        alpha: 0,
                                        duration: 150,
                                        ease: "Power2",
                                        onComplete: () => {
                                            this.proposedInFlight = Math.max(0, this.proposedInFlight - 1);
                                            ghost.destroy();
                                        },
                                    });
                                    return;
                                }
                                
                                this.proposedInFlight = Math.max(0, this.proposedInFlight - 1);
                                const queueItem = {
                                    sprite: ghost,
                                    type,
                                    queuePosition: { x: targetX, y: targetY },
                                    randomOffset,
                                    txHash: tx.txHash,
                                    txType: tx.txType,
                                    fee: tx.fee,
                                    size: tx.size,
                                    timestamp: tx.timestamp,
                                    status: 'PROPOSED' as 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED',
                                };
                                this.proposedQueue.add(queueItem);
                                console.log(
                                    `➕ Fallback added to proposed: txHash=${tx.txHash}, type=${type}`,
                                );
                                
                                // Remove temporary click listener and setup permanent one
                                ghost.off('pointerdown');
                                if (this.onAnimalAdded) {
                                    this.onAnimalAdded(queueItem);
                                }
                                
                                this.proposedQueue["sortByPriority"]();
                                this.proposedQueue.arrangeQueue();
                            },
                        });
                    },
                });
            },
        });
    }
    
    /**
     * Schedules pending arrival with rate limiting
     */
    public schedulePendingArrival(startFn: () => void): void {
        const now = Date.now();
        const delay = Math.max(0, this.nextPendingArrivalTimeMs - now);
        this.nextPendingArrivalTimeMs = Math.max(this.nextPendingArrivalTimeMs, now) + GAME_CONSTANTS.ARRIVAL_INTERVAL_MS;
        this.scene.time.delayedCall(delay, () => startFn());
    }
    
    /**
     * Schedules proposed arrival with rate limiting
     */
    public scheduleProposedArrival(startFn: () => void): void {
        const now = Date.now();
        const delay = Math.max(0, this.nextProposedArrivalTimeMs - now);
        this.nextProposedArrivalTimeMs = Math.max(this.nextProposedArrivalTimeMs, now) + GAME_CONSTANTS.ARRIVAL_INTERVAL_MS;
        this.scene.time.delayedCall(delay, () => startFn());
    }
    
    /**
     * Gets pending in-flight count
     */
    public getPendingInFlight(): number {
        return this.pendingInFlight;
    }
    
    /**
     * Gets proposed in-flight count
     */
    public getProposedInFlight(): number {
        return this.proposedInFlight;
    }
    
    /**
     * Increments pending in-flight count
     */
    public incrementPendingInFlight(): void {
        this.pendingInFlight++;
    }
    
    /**
     * Increments proposed in-flight count
     */
    public incrementProposedInFlight(): void {
        this.proposedInFlight++;
    }
}
