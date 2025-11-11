import { useState, useRef, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import { networkConfig } from '../config/network.config';
import './NetworkSelector.css';

interface NetworkSelectorProps {
  onNetworkChange?: (network: string) => void;
  defaultNetwork?: 'Mainnet' | 'Testnet';
}

/**
 * Network selector dropdown component
 * Reusable React component that can be used in both regular React context
 * or integrated into Phaser scenes via React Portal
 */
export function NetworkSelector({ onNetworkChange, defaultNetwork = 'Testnet' }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Initialize from network config to maintain state across scene restarts
  const initialNetwork = networkConfig.getMode() === 'mainnet' ? 'Mainnet' : 'Testnet';
  const [selectedNetwork, setSelectedNetwork] = useState<'Mainnet' | 'Testnet'>(initialNetwork);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Listen to canvas click event from Phaser
    const handleCanvasClick = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    EventBus.on('canvas-clicked', handleCanvasClick);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      EventBus.off('canvas-clicked', handleCanvasClick);
    };
  }, []);
  
  // Sync with network config changes
  useEffect(() => {
    const handleNetworkConfigChange = () => {
      const mode = networkConfig.getMode();
      const network = mode === 'mainnet' ? 'Mainnet' : 'Testnet';
      setSelectedNetwork(network);
    };
    
    networkConfig.subscribe(handleNetworkConfigChange);
    
    return () => {
      networkConfig.unsubscribe(handleNetworkConfigChange);
    };
  }, []);

  const handleSelect = (network: 'Mainnet' | 'Testnet') => {
    setSelectedNetwork(network);
    setIsOpen(false);
    
    // Update network config
    const mode = network.toLowerCase() as 'mainnet' | 'testnet';
    networkConfig.setMode(mode);
    
    // Notify parent component
    onNetworkChange?.(network);
  };

  // Get network-specific asset paths
  const networkMode = selectedNetwork.toLowerCase();
  const arrowIcon = `/assets/arrow_${networkMode}.svg`;
  const checkIcon = `/assets/check_${networkMode}.svg`;

  return (
    <div 
      ref={containerRef} 
      className="network-selector-wrapper"
      data-network={selectedNetwork.toLowerCase()}
    >
      <div className="network-main-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="network-selected-text text-body1">{selectedNetwork}</span>
        <img
          className={`network-arrow-icon ${isOpen ? 'open' : ''}`}
          src={arrowIcon}
          alt="arrow"
        />
      </div>

      <div className={`network-options-container ${isOpen ? 'open' : ''}`}>
        <div className="network-option-item" onClick={() => handleSelect('Mainnet')}>
          <span className="network-option-text text-body1">Mainnet</span>
          <img
            className={`network-check-icon ${selectedNetwork !== 'Mainnet' ? 'hidden' : ''}`}
            src={checkIcon}
            alt="check"
          />
        </div>
        <div className="network-option-item" onClick={() => handleSelect('Testnet')}>
          <span className="network-option-text text-body1">Testnet</span>
          <img
            className={`network-check-icon ${selectedNetwork !== 'Testnet' ? 'hidden' : ''}`}
            src={checkIcon}
            alt="check"
          />
        </div>
      </div>

      <div className={`network-bottom-bar ${!isOpen ? 'collapsed' : ''}`}></div>
    </div>
  );
}
