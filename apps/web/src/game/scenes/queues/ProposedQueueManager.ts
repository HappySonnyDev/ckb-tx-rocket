/**
 * Proposed Queue Manager
 * Manages the proposed transaction queue (rectangular formation)
 */

import { Scene } from "phaser";
import { QueueManager } from "./QueueManager";
import { AnimalQueueItem, AnimalType, GAME_CONSTANTS } from "../types/GameTypes";
import { PositionCalculator } from "../utils/PositionCalculator";
import { EnhancedTransaction } from "../../../services/CKBChainVizService";
import { AnimalFactory } from "../utils/AnimalFactory";

export class ProposedQueueManager extends QueueManager {
    /**
     * Get the offset for the main game area
     */
    private getOffset(): number {
        return (this.scene as any).getMainGameAreaBounds().left;
    }
    
    /**
     * Initializes the proposed queue from snapshot data
     * @param transactions - Array of proposed transactions
     */
    public initializeFromSnapshot(transactions: EnhancedTransaction[]): void {
        console.log(
            `Initializing proposed queue with ${transactions.length} transactions`,
        );
        
        // Clear existing proposed queue first
        this.clear();
        
        const offset = this.getOffset();
        
        // Create animals for each transaction (cap to MAX_PROPOSED_CAPACITY)
        const toCreate = transactions.slice(0, GAME_CONSTANTS.MAX_PROPOSED_CAPACITY);
        toCreate.forEach((tx, index) => {
            const animalType = AnimalFactory.determineAnimalType(tx, index);
            const randomOffset = PositionCalculator.generateRandomOffset();
            const position = PositionCalculator.calculateProposedPosition(
                this.queue.length,
                offset,
            );
            const queuePosition = {
                x: position.x + randomOffset.x,
                y: position.y + randomOffset.y,
            };
            
            // Create animal sprite directly at proposed position (no animation)
            // Use left-facing sprite since animals in proposed queue face left
            const animalSize = AnimalFactory.determineAnimalSize(tx);
            const animal = AnimalFactory.createAnimalSprite(
                this.scene,
                queuePosition.x,
                queuePosition.y,
                animalType,
                animalType, // Use left-facing sprite
                tx.txType, // Pass transaction type for color tinting
                animalSize, // Pass animal size
            );
            animal.setFlipX(false); // Face left
            
            // Add to proposed queue
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
            `Proposed queue initialized with ${this.queue.length} animals`,
        );
    }
    
    /**
     * Arranges animals in rectangular formation (vertical filling)
     * @param skipAnimation - If true, directly set positions without animation
     */
    public arrangeQueue(skipAnimation: boolean = false): void {
        // Save old positions for comparison
        const oldPositions = new Map<
            Phaser.GameObjects.Image,
            { x: number; y: number }
        >();
        this.queue.forEach((animal) => {
            oldPositions.set(animal.sprite, { ...animal.queuePosition });
        });
        
        const offset = this.getOffset();
        
        // Arrange animals based on their current sorted index (vertical filling)
        this.queue.forEach((animal, index) => {
            const position = PositionCalculator.calculateProposedPosition(index, offset);
            const targetX = position.x + animal.randomOffset.x;
            const targetY = position.y + animal.randomOffset.y;
            
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
                    this.scene.tweens.add({
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
}
