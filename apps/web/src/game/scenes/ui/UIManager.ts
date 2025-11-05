/**
 * UI Manager
 * Manages all React components (NetworkSelector, AboutUs, FeedbackButton)
 */

import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { NetworkSelector } from "../../../components/NetworkSelector";
import { AboutUs } from "../../../components/AboutUs";
import { FeedbackButton } from "../../../components/FeedbackButton";
import { EventBus } from "../../EventBus";

export class UIManager {
    private networkSelector!: HTMLElement;
    private networkSelectorRoot!: Root;
    
    private aboutUs!: HTMLElement;
    private aboutUsRoot!: Root;
    
    private feedbackButton!: HTMLElement;
    private feedbackButtonRoot!: Root;
    
    private onNetworkChange?: (network: string) => void;
    private onAboutMenuClick?: (item: "about" | "tour") => void;
    private onFeedbackClick?: () => void;
    
    constructor(
        onNetworkChange?: (network: string) => void,
        onAboutMenuClick?: (item: "about" | "tour") => void,
        onFeedbackClick?: () => void,
    ) {
        this.onNetworkChange = onNetworkChange;
        this.onAboutMenuClick = onAboutMenuClick;
        this.onFeedbackClick = onFeedbackClick;
    }
    
    /**
     * Creates network selector dropdown
     */
    public createNetworkSelector(): void {
        const container = document.createElement("div");
        container.id = "network-selector-container";
        container.style.cssText = `
            position: absolute;
            top: 10px;
            left: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
        
        this.networkSelectorRoot = createRoot(container);
        this.networkSelectorRoot.render(
            createElement(NetworkSelector, {
                defaultNetwork: "Mainnet",
                onNetworkChange: (network: string) => {
                    if (this.onNetworkChange) {
                        this.onNetworkChange(network);
                    }
                },
            }),
        );
        
        this.networkSelector = container;
    }
    
    /**
     * Creates feedback button
     */
    public createFeedbackButton(): void {
        const container = document.createElement("div");
        container.id = "feedback-button-container";
        container.style.cssText = `
            position: absolute;
            top: 10px;
            right: 70px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
        
        this.feedbackButtonRoot = createRoot(container);
        this.feedbackButtonRoot.render(
            createElement(FeedbackButton, {
                onClick: () => {
                    if (this.onFeedbackClick) {
                        this.onFeedbackClick();
                    }
                },
            }),
        );
        
        this.feedbackButton = container;
    }
    
    /**
     * Creates About Us menu
     */
    public createAboutUs(): void {
        const container = document.createElement("div");
        container.id = "about-us-container";
        container.style.cssText = `
            position: absolute;
            top: 14px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
        
        this.aboutUsRoot = createRoot(container);
        this.aboutUsRoot.render(
            createElement(AboutUs, {
                onMenuItemClick: (item: "about" | "tour") => {
                    if (this.onAboutMenuClick) {
                        this.onAboutMenuClick(item);
                    }
                },
            }),
        );
        
        this.aboutUs = container;
    }
    
    /**
     * Clean up all UI components
     */
    public destroy(): void {
        // Clean up network selector
        if (this.networkSelectorRoot) {
            this.networkSelectorRoot.unmount();
        }
        if (this.networkSelector && this.networkSelector.parentNode) {
            this.networkSelector.parentNode.removeChild(this.networkSelector);
        }
        
        // Clean up about us menu
        if (this.aboutUsRoot) {
            this.aboutUsRoot.unmount();
        }
        if (this.aboutUs && this.aboutUs.parentNode) {
            this.aboutUs.parentNode.removeChild(this.aboutUs);
        }
        
        // Clean up feedback button
        if (this.feedbackButtonRoot) {
            this.feedbackButtonRoot.unmount();
        }
        if (this.feedbackButton && this.feedbackButton.parentNode) {
            this.feedbackButton.parentNode.removeChild(this.feedbackButton);
        }
    }
}
