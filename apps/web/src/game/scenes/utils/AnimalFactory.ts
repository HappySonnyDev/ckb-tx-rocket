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
import { getAnimalTypeByFeeRate } from "../../../utils/feeRateUtils";

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
     * @returns Created sprite
     */
    public static createAnimalSprite(
        scene: Scene,
        x: number,
        y: number,
        type: AnimalType,
        texture?: string,
    ): Phaser.GameObjects.Image {
        const animal = scene.add.image(x, y, texture || type);
        animal.setDisplaySize(GAME_CONSTANTS.ANIMAL_SIZE, GAME_CONSTANTS.ANIMAL_SIZE);
        animal.setOrigin(0.5, 0.5);
        return animal;
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
