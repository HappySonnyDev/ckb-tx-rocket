/**
 * Queue Manager Base Class
 * Abstract base class for managing animal queues
 */

import { Scene } from "phaser";
import { AnimalQueueItem, AnimalType } from "../types/GameTypes";

export abstract class QueueManager {
    protected scene: Scene;
    protected queue: AnimalQueueItem[] = [];
    
    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    /**
     * Gets the current queue
     */
    public getQueue(): AnimalQueueItem[] {
        return this.queue;
    }
    
    /**
     * Gets the queue length
     */
    public getLength(): number {
        return this.queue.length;
    }
    
    /**
     * Debug dump of current queue state (types and txHash)
     */
    public debugDump(label: string, limit: number = 20): void {
        try {
            // console.log(`🐛 [${label}] queueLen=${this.queue.length}`);
            // const items = this.queue.slice(0, Math.max(0, Math.min(limit, this.queue.length)));
            // items.forEach((a, i) => {
            //     console.log(
            //         `   [${i}] type=${a.type}, txHash=${a.txHash ?? "N/A"}`,
            //     );
            // });
        } catch (e) {
            console.warn(`debugDump failed:`, e);
        }
    }
    
    /**
     * Clears the queue
     */
    public clear(): void {
        this.queue.forEach((animal) => {
            if (animal.sprite) {
                animal.sprite.destroy();
            }
        });
        this.queue = [];
    }
    
    /**
     * Finds an animal by transaction hash
     */
    public findByTxHash(txHash: string): AnimalQueueItem | undefined {
        return this.queue.find((animal) => animal.txHash === txHash);
    }
    
    /**
     * Finds the index of an animal by transaction hash
     */
    public findIndexByTxHash(txHash: string): number {
        return this.queue.findIndex((animal) => animal.txHash === txHash);
    }
    
    /**
     * Removes an animal from the queue by index
     */
    public removeByIndex(index: number): AnimalQueueItem | undefined {
        if (index < 0 || index >= this.queue.length) {
            return undefined;
        }
        return this.queue.splice(index, 1)[0];
    }
    
    /**
     * Adds an animal to the queue
     */
    public add(animal: AnimalQueueItem): void {
        this.queue.push(animal);
    }
    
    /**
     * Finds the correct insertion index for a new animal based on priority
     * Returns the index where the animal should be inserted to maintain sorted order
     */
    public findInsertionIndex(type: AnimalType): number {
        const priorityMap: Record<AnimalType, number> = {
            rabbit: 1,
            pig: 2,
            turtle: 3,
        };
        
        const newPriority = priorityMap[type];
        
        // Find first position where current animal has higher priority (larger number)
        for (let i = 0; i < this.queue.length; i++) {
            if (priorityMap[this.queue[i].type] > newPriority) {
                return i;
            }
        }
        
        // If not found, insert at end
        return this.queue.length;
    }
    
    /**
     * Inserts an animal at a specific position in the queue
     */
    public insertAtPosition(animal: AnimalQueueItem, index: number): void {
        this.queue.splice(index, 0, animal);
    }
    
    /**
     * Sorts the queue by priority
     */
    protected sortByPriority(): void {
        const priorityMap: Record<AnimalType, number> = {
            rabbit: 1,
            pig: 2,
            turtle: 3,
        };
        
        this.queue.sort((a, b) => {
            return priorityMap[a.type] - priorityMap[b.type];
        });
    }
    
    /**
     * Abstract method to arrange queue - must be implemented by subclasses
     */
    public abstract arrangeQueue(skipAnimation?: boolean): void;
    
    /**
     * Clean up resources
     */
    public destroy(): void {
        this.clear();
    }
}
