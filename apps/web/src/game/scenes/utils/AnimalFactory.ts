/**
 * Animal Factory
 * Utility class for creating and determining animal types
 */

import { Scene } from "phaser";
import {
    AnimalType,
    ANIMAL_SPEEDS,
    GAME_CONSTANTS,
} from "../types/GameTypes";
import { EnhancedTransaction } from "../../../services/CKBChainVizService";
import { getAnimalTypeByFeeRate, getAnimalSize, AnimalSize } from "../../../utils/feeRateUtils";
import { TX_TYPE_COLORS } from "../../../config/transaction.config";

/**
 * Transaction type color mapping
 * Colors are applied as tint to animal sprites
 * @see TX_TYPE_COLORS in transaction.config.ts
 */


export class AnimalFactory {
    /**
     * Determines animal type based on transaction data
     * @param tx - Transaction data
     * @param index - Index in the transaction array (fallback)
     * @returns Animal type
     */
    public static determineAnimalType(
        tx: EnhancedTransaction,
        index: number,
    ): AnimalType {
        // If transaction has feeRate, use it to determine animal type
        if (tx.feeRate) {
            const feeRate = parseFloat(tx.feeRate);
            if (!isNaN(feeRate)) {
                const animalType = getAnimalTypeByFeeRate(feeRate);
                console.log(`🎯 Animal type determined: feeRate=${feeRate} -> ${animalType} (tx=${tx.txHash?.substring(0, 10)})`);
                return animalType as AnimalType;
            }
        }
        
        // Fallback: distribute evenly by index
        console.log(`⚠️ Using fallback (no feeRate) for tx ${tx.txHash?.substring(0, 10)}, index=${index}`);
        const types: AnimalType[] = ["rabbit", "pig", "turtle"];
        return types[index % 3];
    }
    
    /**
     * Creates an animal sprite at specified position
     * @param scene - Phaser scene
     * @param x - X position
     * @param y - Y position
     * @param type - Animal type
     * @param texture - Texture key (optional, defaults to type)
     * @param txType - Transaction type for color tinting (optional)
     * @param size - Animal size in pixels (optional, uses default if not provided)
     * @returns Created sprite
     */
    public static createAnimalSprite(
        scene: Scene,
        x: number,
        y: number,
        type: AnimalType,
        texture?: string,
        txType?: string | null,
        size?: number,
    ): Phaser.GameObjects.Image {
        const animal = scene.add.image(x, y, texture || type);
        const displaySize = size ?? GAME_CONSTANTS.ANIMAL_SIZE;
        animal.setDisplaySize(displaySize, displaySize);
        animal.setOrigin(0.5, 0.5);
        
        // Apply color tint based on transaction type
        if (txType && TX_TYPE_COLORS[txType]) {
            // Convert hex color to Phaser color number
            const color = parseInt(TX_TYPE_COLORS[txType].replace('#', ''), 16);
            animal.setTint(color);
        }
        // If no txType or not in config, use default (no tint)
        
        return animal;
    }
    
    /**
     * Determines animal size based on transaction data
     * @param tx - Transaction data
     * @returns Animal size in pixels, or default size if feeRate is not available
     */
    public static determineAnimalSize(
        tx: EnhancedTransaction,
    ): number {
        // If transaction has feeRate, use it to determine size
        if (tx.feeRate) {
            const feeRate = parseFloat(tx.feeRate);
            if (!isNaN(feeRate)) {
                const animalType = getAnimalTypeByFeeRate(feeRate);
                const size = getAnimalSize(animalType as any, feeRate);
                return size;
            }
        }
        
        // Fallback: use default size
        return GAME_CONSTANTS.ANIMAL_SIZE;
    }
    
    /**
     * Gets the movement speed for each animal type
     * @param type - Animal type
     * @returns Speed in pixels per second
     */
    public static getAnimalSpeed(type: AnimalType): number {
        return ANIMAL_SPEEDS[type];
    }
    

}
