/**
 * Game scene common type definitions
 */

import { EnhancedTransaction } from "../../../services/CKBChainVizService";

/**
 * Animal type
 */
export type AnimalType = "rabbit" | "pig" | "turtle";

/**
 * Animal queue item
 */
export interface AnimalQueueItem {
    sprite: Phaser.GameObjects.Image;
    type: AnimalType;
    queuePosition: { x: number; y: number };
    randomOffset: { x: number; y: number };
    txHash?: string;
    txType?: string | null;
    fee?: string;
    size?: string;
    timestamp?: string;
    status?: 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'REJECTED';
}

/**
 * Position coordinates
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
    // Queue capacity limits
    MAX_PENDING_CAPACITY: 135,
    MAX_PROPOSED_CAPACITY: 44,
    MAX_CONCURRENT_PENDING_ARRIVALS: 8,
    MAX_CONCURRENT_PROPOSED_ARRIVALS: 6,
    
    // Timing
    ARRIVAL_RETRY_DELAY_MS: 250,
    ARRIVAL_INTERVAL_MS: 1000,
    
    // Main game area
    MAIN_GAME_AREA_WIDTH: 1440,
    
    // Animal
    ANIMAL_SIZE: 40,
    
    // Mempool
    MEMPOOL_START_X: 80,
    MEMPOOL_Y: 800,
    
    // Pending queue
    QUEUE_START_X: 930,
    QUEUE_BASE_Y: 580,
    
    // Proposed queue (checkpoint)
    CHECKPOINT_START_X: 380,
    CHECKPOINT_BASE_Y: 390,
    
    // Layout spacing
    PENDING_ROW_SPACING: 28,
    PENDING_COL_SPACING: 30,
    PROPOSED_COL_SPACING: 35,
    PROPOSED_ROW_SPACING: 35,
    PROPOSED_ROWS_PER_COLUMN: 2,
} as const;

/**
 * Animal speed configuration
 */
export const ANIMAL_SPEEDS: Record<AnimalType, number> = {
    rabbit: 400,
    pig: 300,
    turtle: 200,
};
