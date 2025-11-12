/**
 * Boarding Queue Manager
 * Manages animals that are boarding the rocket when a block is finalized
 * This queue is temporary and animals move quickly into the rocket
 */

import { Scene } from "phaser";
import { QueueManager } from "./QueueManager";
import { AnimalQueueItem, GAME_CONSTANTS } from "../types/GameTypes";

export class BoardingQueueManager extends QueueManager {
    /**
     * Get the offset for the main game area
     */
    private getOffset(): number {
        return (this.scene as any).getMainGameAreaBounds().left;
    }
    
    /**
     * Get the rocket center position for animals to board
     */
    private getRocketPosition(): { x: number; y: number } {
        const offset = this.getOffset();
        // Rocket is at offset + 153, width 116, center is at offset + 153 + 58
        const rocketX = offset + 153 + 58;
        // Rocket Y position (center of door entrance) - adjusted 10px lower
        const rocketY = 264 + 279 - 75 - 59 - 90; // Changed from -100 to -90 (10px lower)
        return { x: rocketX, y: rocketY };
    }
    
    /**
     * Adds animals to boarding queue and animates them into the rocket
     * @param animals - Array of animals to board the rocket
     * @param onComplete - Callback when all animals have boarded
     */
    public boardAnimals(animals: AnimalQueueItem[], onComplete: () => void): void {
        if (animals.length === 0) {
            onComplete();
            return;
        }
        
        console.log(`🚀 Starting boarding animation for ${animals.length} animals`);
        
        const rocketPos = this.getRocketPosition();
        let completedCount = 0;
        
        // Animate each animal moving to the rocket
        animals.forEach((animal, index) => {
            if (!animal.sprite) {
                completedCount++;
                if (completedCount === animals.length) {
                    onComplete();
                }
                return;
            }
            
            // Add to queue
            this.queue.push(animal);
            
            // Calculate delay based on index (stagger the animation slightly)
            const delay = index * 50; // 50ms stagger for visual effect
            
            this.scene.time.delayedCall(delay, () => {
                // Animate animal moving to rocket
                this.scene.tweens.add({
                    targets: animal.sprite,
                    x: rocketPos.x,
                    y: rocketPos.y,
                    scale: 0.8, // Slightly smaller as they enter
                    duration: 500, // 500ms to reach the rocket
                    ease: 'Power2',
                    onComplete: () => {
                        // Fade out as they enter the rocket
                        this.scene.tweens.add({
                            targets: animal.sprite,
                            alpha: 0,
                            scale: 0.3,
                            duration: 200,
                            ease: 'Power2',
                            onComplete: () => {
                                animal.sprite.destroy();
                                completedCount++;
                                
                                // When all animals have boarded, call the callback
                                if (completedCount === animals.length) {
                                    this.clear();
                                    console.log(`✅ All ${animals.length} animals boarded the rocket`);
                                    onComplete();
                                }
                            },
                        });
                    },
                });
            });
        });
    }
    
    /**
     * Arranges queue (not used for boarding queue as animals move directly to rocket)
     */
    public arrangeQueue(skipAnimation: boolean = false): void {
        // Not needed for boarding queue
    }
}
