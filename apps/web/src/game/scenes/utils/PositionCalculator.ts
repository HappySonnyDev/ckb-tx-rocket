/**
 * Position Calculator
 * Utility class for calculating positions in the game scene
 */

import { Position, GAME_CONSTANTS } from "../types/GameTypes";

export class PositionCalculator {
    /**
     * Calculates the base queue position (without random offset) based on queue index
     * Uses triangular formation for pending queue with max 40 animals per bottom row
     * @param index - Index in the sorted queue
     * @param offsetX - Optional X offset for main game area (default: 0)
     * @returns Base position coordinates
     */
    public static calculatePendingBasePosition(index: number, offsetX: number = 0): Position {
        const baseX = GAME_CONSTANTS.QUEUE_START_X;
        const baseY = GAME_CONSTANTS.QUEUE_BASE_Y;
        const maxBottomRowWidth = GAME_CONSTANTS.MAX_BOTTOM_ROW_WIDTH;
        
        // Calculate total animals in triangle part (before reaching max width)
        // Sum: 1 + 2 + 3 + ... + maxBottomRowWidth = maxBottomRowWidth * (maxBottomRowWidth + 1) / 2
        const triangleCapacity = (maxBottomRowWidth * (maxBottomRowWidth + 1)) / 2;
        
        let row = 0;
        let col = 0;
        let animalsPerRow = 1;
        
        if (index < triangleCapacity) {
            // Triangle part: row width increases from 1 to maxBottomRowWidth
            let countSoFar = 0;
            row = 0;
            while (countSoFar + row + 1 <= index) {
                countSoFar += row + 1;
                row++;
            }
            col = index - countSoFar;
            animalsPerRow = row + 1;
        } else {
            // Rectangle part: all rows have maxBottomRowWidth animals
            const rectangleIndex = index - triangleCapacity;
            row = maxBottomRowWidth + Math.floor(rectangleIndex / maxBottomRowWidth);
            col = rectangleIndex % maxBottomRowWidth;
            animalsPerRow = maxBottomRowWidth;
        }
        
        const rowSpacing = GAME_CONSTANTS.PENDING_ROW_SPACING;
        const colSpacing = GAME_CONSTANTS.PENDING_COL_SPACING;
        
        // Calculate position with centering based on row width
        const x = offsetX + baseX + col * colSpacing - ((animalsPerRow - 1) * colSpacing) / 2;
        const y = baseY + row * rowSpacing;
        
        return { x, y };
    }
    
    /**
     * Calculates proposed queue position for an animal
     * Arranged by arrival order in vertical columns
     * Fill vertically: column 1 fills top to bottom, then column 2, etc.
     * @param queueIndex - Current queue length (arrival order)
     * @param offsetX - Optional X offset for main game area (default: 0)
     * @returns Position coordinates
     */
    public static calculateProposedPosition(queueIndex: number, offsetX: number = 0): Position {
        const colSpacing = GAME_CONSTANTS.PROPOSED_COL_SPACING;
        const rowSpacing = GAME_CONSTANTS.PROPOSED_ROW_SPACING;
        const rowsPerColumn = GAME_CONSTANTS.PROPOSED_ROWS_PER_COLUMN;
        
        // Calculate column and row based on queue index (vertical filling)
        const col = Math.floor(queueIndex / rowsPerColumn);
        const row = queueIndex % rowsPerColumn;
        
        // Calculate position
        const baseX = GAME_CONSTANTS.CHECKPOINT_START_X;
        const baseY = GAME_CONSTANTS.CHECKPOINT_BASE_Y;
        
        const x = offsetX + baseX + col * colSpacing;
        const y = baseY + row * rowSpacing;
        
        return { x, y };
    }
    
    /**
     * Calculates a pending staging position (temporary starting point for fallback animation)
     * @param queueLength - Current queue length
     * @param offsetX - Optional X offset for main game area (default: 0)
     * @returns Position coordinates
     */
    public static calculatePendingStagingPosition(queueLength: number, offsetX: number = 0): Position {
        const indexForStaging = Math.max(
            0,
            Math.min(queueLength, GAME_CONSTANTS.MAX_PENDING_CAPACITY - 1),
        );
        return this.calculatePendingBasePosition(indexForStaging, offsetX);
    }
    
    /**
     * Generates a random offset for natural positioning
     * @returns Random offset for x and y
     */
    public static generateRandomOffset(): Position {
        // Horizontal random offset ±4px
        // Vertical random offset ±6px
        return {
            x: (Math.random() - 0.5) * 8, // -4 to +4
            y: (Math.random() - 0.5) * 12, // -6 to +6
        };
    }
}
