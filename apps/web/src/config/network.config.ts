/**
 * Network mode configuration
 * Manages network-specific resources and settings
 */

export type NetworkMode = 'mainnet' | 'testnet';

/**
 * Network mode state manager
 */
class NetworkConfig {
  private currentMode: NetworkMode = 'testnet';
  private listeners: ((mode: NetworkMode) => void)[] = [];

  /**
   * Get current network mode
   */
  getMode(): NetworkMode {
    return this.currentMode;
  }

  /**
   * Set network mode
   */
  setMode(mode: NetworkMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      console.log(`🌐 Network mode changed to: ${mode}`);
      this.updateDOMAttribute();
      this.notifyListeners();
    }
  }

  /**
   * Update DOM root element with current network mode
   */
  private updateDOMAttribute(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-network', this.currentMode);
    }
  }

  /**
   * Initialize DOM attribute (call this on app startup)
   */
  initialize(): void {
    this.updateDOMAttribute();
  }

  /**
   * Get resource name with network suffix
   */
  getResourceName(baseName: string): string {
    return `${baseName}_${this.currentMode}`;
  }

  /**
   * Subscribe to network mode changes
   */
  subscribe(listener: (mode: NetworkMode) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from network mode changes
   */
  unsubscribe(listener: (mode: NetworkMode) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of mode change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentMode));
  }
}

// Export singleton instance
export const networkConfig = new NetworkConfig();

/**
 * List of resource names that have network-specific versions
 */
export const NETWORK_SPECIFIC_RESOURCES = [
  'king',
  'king_next',
  'platform',
  'platform_open',
  'pow',
  'rocket',
  'rocket_close',
  'tizi',
] as const;

export type NetworkSpecificResource = typeof NETWORK_SPECIFIC_RESOURCES[number];
