import { useState, useRef, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
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
export function NetworkSelector({ onNetworkChange, defaultNetwork = 'Mainnet' }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetwork);
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

  const handleSelect = (network: 'Mainnet' | 'Testnet') => {
    setSelectedNetwork(network);
    setIsOpen(false);
    onNetworkChange?.(network);
  };

  return (
    <div ref={containerRef} className="network-selector-wrapper">
      <div className="network-main-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="network-selected-text">{selectedNetwork}</span>
        <img
          className={`network-arrow-icon ${isOpen ? 'open' : ''}`}
          src="/assets/arrow.svg"
          alt="arrow"
        />
      </div>

      <div className={`network-options-container ${isOpen ? 'open' : ''}`}>
        <div className="network-option-item" onClick={() => handleSelect('Mainnet')}>
          <span className="network-option-text">Mainnet</span>
          <img
            className={`network-check-icon ${selectedNetwork !== 'Mainnet' ? 'hidden' : ''}`}
            src="/assets/check.svg"
            alt="check"
          />
        </div>
        <div className="network-option-item" onClick={() => handleSelect('Testnet')}>
          <span className="network-option-text">Testnet</span>
          <img
            className={`network-check-icon ${selectedNetwork !== 'Testnet' ? 'hidden' : ''}`}
            src="/assets/check.svg"
            alt="check"
          />
        </div>
      </div>

      <div className={`network-bottom-bar ${!isOpen ? 'collapsed' : ''}`}></div>
    </div>
  );
}
