/**
 * Transaction Detail Manager
 * Manages transaction detail popup display
 */

import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { TransactionDetail, TransactionDetailData } from "../../../components/TransactionDetail";

export class TransactionDetailManager {
    private container!: HTMLElement;
    private root!: Root;
    
    private currentDetail: {
        visible: boolean;
        data: TransactionDetailData;
        x: number;
        y: number;
        screenWidth: number;
        screenHeight: number;
    } = {
        visible: false,
        data: { txHash: "" },
        x: 0,
        y: 0,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
    };
    
    /**
     * Creates transaction detail component
     */
    public createTransactionDetail(): void {
        const container = document.createElement("div");
        container.id = "transaction-detail-container";
        document.body.appendChild(container);
        
        this.root = createRoot(container);
        this.updateDetail();
        
        this.container = container;
    }
    
    /**
     * Updates the transaction detail display
     */
    private updateDetail(): void {
        if (this.root) {
            this.root.render(
                createElement(TransactionDetail, {
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
     * Shows a transaction detail popup at specified position
     * @param data Transaction data to display
     * @param x Animal center x position
     * @param y Animal center y position  
     * @param screenWidth Current screen width for boundary calculation
     * @param screenHeight Current screen height for boundary calculation
     */
    public showDetail(
        data: TransactionDetailData,
        x: number,
        y: number,
        screenWidth: number = window.innerWidth,
        screenHeight: number = window.innerHeight,
    ): void {
        this.currentDetail = { visible: true, data, x, y, screenWidth, screenHeight };
        this.updateDetail();
    }
    
    /**
     * Hides the current transaction detail popup
     */
    public hideDetail(): void {
        this.currentDetail.visible = false;
        this.updateDetail();
    }
    
    /**
     * Clean up transaction detail
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
