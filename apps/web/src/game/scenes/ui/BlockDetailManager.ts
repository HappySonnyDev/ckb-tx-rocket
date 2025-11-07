/**
 * Block Detail Manager
 * Manages block detail popup display
 */

import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { BlockDetail, BlockDetailData } from "../../../components/BlockDetail";

export class BlockDetailManager {
    private container!: HTMLElement;
    private root!: Root;
    
    private currentDetail: {
        visible: boolean;
        data: BlockDetailData;
        x: number;
        y: number;
        screenWidth: number;
        screenHeight: number;
    } = {
        visible: false,
        data: { 
            blockHash: "", 
            blockHeight: "",
            transactions: 0
        },
        x: 0,
        y: 0,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
    };
    
    /**
     * Creates block detail component
     */
    public createBlockDetail(): void {
        const container = document.createElement("div");
        container.id = "block-detail-container";
        document.body.appendChild(container);
        
        this.root = createRoot(container);
        this.updateDetail();
        
        this.container = container;
    }
    
    /**
     * Updates the block detail display
     */
    private updateDetail(): void {
        if (this.root) {
            this.root.render(
                createElement(BlockDetail, {
                    visible: this.currentDetail.visible,
                    data: this.currentDetail.data,
                    x: this.currentDetail.x,
                    y: this.currentDetail.y,
                    screenWidth: this.currentDetail.screenWidth,
                    screenHeight: this.currentDetail.screenHeight,
                    onClose: () => this.hideDetail(),
                }),
            );
        }
    }
    
    /**
     * Shows a block detail popup at specified position
     * @param data Block data to display
     * @param x Rocket center x position
     * @param y Rocket center y position  
     * @param screenWidth Current screen width for boundary calculation
     * @param screenHeight Current screen height for boundary calculation
     */
    public showDetail(
        data: BlockDetailData,
        x: number,
        y: number,
        screenWidth: number = window.innerWidth,
        screenHeight: number = window.innerHeight,
    ): void {
        this.currentDetail = { visible: true, data, x, y, screenWidth, screenHeight };
        this.updateDetail();
    }
    
    /**
     * Hides the current block detail popup
     */
    public hideDetail(): void {
        this.currentDetail.visible = false;
        this.updateDetail();
    }
    
    /**
     * Clean up block detail
     */
    public destroy(): void {
        if (this.root) {
            this.root.unmount();
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
