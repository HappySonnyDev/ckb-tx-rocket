/**
 * Position Calculator
 * Utility class for calculating positions in the game scene
 */

import { Position, GAME_CONSTANTS } from "../types/GameTypes";

export class PositionCalculator {
    /**
     * Calculates the base queue position (without random offset) based on queue index
     * Uses triangular formation for pending queue
     * @param index - Index in the sorted queue
     * @returns Base position coordinates
     */
    public static calculatePendingBasePosition(index: number): Position {
        const baseX = GAME_CONSTANTS.QUEUE_START_X;
        const baseY = GAME_CONSTANTS.QUEUE_BASE_Y;
        
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
        
        const rowSpacing = GAME_CONSTANTS.PENDING_ROW_SPACING;
        const colSpacing = GAME_CONSTANTS.PENDING_COL_SPACING;
        
        // Calculate position with triangular offset (centered)
        const x = baseX + col * colSpacing - (row * colSpacing) / 2;
        const y = baseY + row * rowSpacing;
        
        return { x, y };
    }
    
    /**
     * Calculates proposed queue position for an animal
     * Arranged by arrival order in vertical columns
     * Fill vertically: column 1 fills top to bottom, then column 2, etc.
     * @param queueIndex - Current queue length (arrival order)
     * @returns Position coordinates
     */
    public static calculateProposedPosition(queueIndex: number): Position {
        const colSpacing = GAME_CONSTANTS.PROPOSED_COL_SPACING;
        const rowSpacing = GAME_CONSTANTS.PROPOSED_ROW_SPACING;
        const rowsPerColumn = GAME_CONSTANTS.PROPOSED_ROWS_PER_COLUMN;
        
        // Calculate column and row based on queue index (vertical filling)
        const col = Math.floor(queueIndex / rowsPerColumn);
        const row = queueIndex % rowsPerColumn;
        
        // Calculate position
        const baseX = GAME_CONSTANTS.CHECKPOINT_START_X;
        const baseY = GAME_CONSTANTS.CHECKPOINT_BASE_Y;
        
        const x = baseX + col * colSpacing;
        const y = baseY + row * rowSpacing;
        
        return { x, y };
    }
    
    /**
     * Calculates a pending staging position (temporary starting point for fallback animation)
     * @param queueLength - Current queue length
     * @returns Position coordinates
     */
    public static calculatePendingStagingPosition(queueLength: number): Position {
        const indexForStaging = Math.max(
            0,
            Math.min(queueLength, GAME_CONSTANTS.MAX_PENDING_CAPACITY - 1),
        );
        return this.calculatePendingBasePosition(indexForStaging);
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
