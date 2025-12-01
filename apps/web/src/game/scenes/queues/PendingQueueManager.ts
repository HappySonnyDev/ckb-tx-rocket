/**
 * Pending Queue Manager
 * Manages the pending transaction queue (triangular formation)
 */

import { Scene } from "phaser";
import { QueueManager } from "./QueueManager";
import { AnimalQueueItem, GAME_CONSTANTS } from "../types/GameTypes";
import { PositionCalculator } from "../utils/PositionCalculator";
import { EnhancedTransaction } from "../../../services/CKBChainVizService";
import { AnimalFactory } from "../utils/AnimalFactory";

export class PendingQueueManager extends QueueManager {
    /**
     * Get the offset for the main game area
     */
    private getOffset(): number {
        return (this.scene as any).getMainGameAreaBounds().left;
    }
    
    /**
     * Initializes the pending queue from snapshot data
     * @param transactions - Array of pending transactions
     */
    public initializeFromSnapshot(transactions: EnhancedTransaction[]): void {
        console.log(
            `Initializing pending queue with ${transactions.length} transactions`,
        );
        
        // Clear existing queue first
        this.clear();
        
        const offset = this.getOffset();
        
        // Create animals for each transaction (cap to MAX_PENDING_CAPACITY)
        const toCreate = transactions.slice(0, GAME_CONSTANTS.MAX_PENDING_CAPACITY);
        toCreate.forEach((tx, index) => {
            const animalType = AnimalFactory.determineAnimalType(tx, index);
            const randomOffset = PositionCalculator.generateRandomOffset();
            const basePosition = PositionCalculator.calculatePendingBasePosition(
                this.queue.length,
                offset,
            );
            const queuePosition = {
                x: basePosition.x + randomOffset.x,
                y: basePosition.y + randomOffset.y,
            };
            
            // Create animal sprite directly at queue position (no animation)
            const animalSize = AnimalFactory.determineAnimalSize(tx);
            const animal = AnimalFactory.createAnimalSprite(
                this.scene,
                queuePosition.x,
                queuePosition.y,
                animalType,
                `${animalType}_b`, // Use queue sprite (背身图片)
                tx.txType, // Pass transaction type for color tinting
                animalSize, // Pass animal size
            );
            
            // Add to pending queue
            this.add({
                sprite: animal,
                type: animalType,
                queuePosition: queuePosition,
                randomOffset: randomOffset,
                txHash: tx.txHash,
                txType: tx.txType,
                fee: tx.fee,
                size: tx.size,
                timestamp: tx.timestamp,
                status: tx.status,
            });
        });
        
        // Sort and arrange queue (without animation for initial load)
        this.sortByPriority();
        this.arrangeQueue(true);
        
        console.log(
            `Pending queue initialized with ${this.queue.length} animals`,
        );
    }
    
    /**
     * Arranges animals in triangular formation
     * @param skipAnimation - If true, directly set positions without animation
     */
    public arrangeQueue(skipAnimation: boolean = false): void {
        this.arrangeQueueFromIndex(0, skipAnimation);
    }
    
    /**
     * Arranges animals in triangular formation starting from a specific index
     * @param startIndex - Index to start rearranging from
     * @param skipAnimation - If true, directly set positions without animation
     */
    public arrangeQueueFromIndex(startIndex: number, skipAnimation: boolean = false): void {
        // Save old positions before rearranging
        const oldPositions = new Map<
            Phaser.GameObjects.Image,
            { x: number; y: number }
        >();
        this.queue.forEach((animal) => {
            oldPositions.set(animal.sprite, { ...animal.queuePosition });
        });
        
        const offset = this.getOffset();
        
        // Arrange animals starting from startIndex in a single triangular formation
        for (let i = startIndex; i < this.queue.length; i++) {
            const animal = this.queue[i];
            // Calculate base position using the index
            const basePosition = PositionCalculator.calculatePendingBasePosition(i, offset);
            
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
                    this.scene.tweens.add({
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
        }
    }
}
