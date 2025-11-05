/**
 * Tooltip Manager
 * Manages tooltip display and interactions
 */

import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { Tooltip, TooltipContent } from "../../../components/Tooltip";

export class TooltipManager {
    private tooltip!: HTMLElement;
    private tooltipRoot!: Root;
    
    private currentTooltip: {
        visible: boolean;
        content: TooltipContent;
        x: number;
        y: number;
        width?: number | string;
        height?: number | string;
    } = {
        visible: false,
        content: { text: "" },
        x: 0,
        y: 0,
    };
    
    /**
     * Creates tooltip component
     */
    public createTooltip(): void {
        const container = document.createElement("div");
        container.id = "tooltip-container";
        document.body.appendChild(container);
        
        this.tooltipRoot = createRoot(container);
        this.updateTooltip();
        
        this.tooltip = container;
    }
    
    /**
     * Updates the tooltip display
     */
    private updateTooltip(): void {
        if (this.tooltipRoot) {
            this.tooltipRoot.render(
                createElement(Tooltip, {
                    visible: this.currentTooltip.visible,
                    content: this.currentTooltip.content,
                    x: this.currentTooltip.x,
                    y: this.currentTooltip.y,
                    width: this.currentTooltip.width,
                    height: this.currentTooltip.height,
                    onClose: () => this.hideTooltip(),
                }),
            );
        }
    }
    
    /**
     * Shows a tooltip at specified position with content
     */
    public showTooltip(
        content: TooltipContent,
        x: number,
        y: number,
        width?: number | string,
        height?: number | string,
    ): void {
        this.currentTooltip = { visible: true, content, x, y, width, height };
        this.updateTooltip();
    }
    
    /**
     * Hides the current tooltip
     */
    public hideTooltip(): void {
        this.currentTooltip.visible = false;
        this.updateTooltip();
    }
    
    /**
     * Clean up tooltip
     */
    public destroy(): void {
        if (this.tooltipRoot) {
            this.tooltipRoot.unmount();
        }
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}
