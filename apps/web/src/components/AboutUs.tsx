import { useState, useRef, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import { networkConfig } from '../config/network.config';
import './AboutUs.css';

interface AboutUsProps {
  onMenuItemClick?: (item: 'about' | 'tour') => void;
}

/**
 * About Us 菜单组件
 * 显示 "About us" 和 "Take a tour" 两个菜单项
 */
export function AboutUs({ onMenuItemClick }: AboutUsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkMode, setNetworkMode] = useState(networkConfig.getMode());

  // Subscribe to network changes
  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkMode(networkConfig.getMode());
    };
    
    networkConfig.subscribe(handleNetworkChange);
    
    return () => {
      networkConfig.unsubscribe(handleNetworkChange);
    };
  }, []);

  // 点击外部区域收起面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Listen to canvas click event from Phaser
    const handleCanvasClick = () => {
      setIsExpanded(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    EventBus.on('canvas-clicked', handleCanvasClick);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      EventBus.off('canvas-clicked', handleCanvasClick);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleMenuItemClick = (item: 'about' | 'tour') => {
    setIsExpanded(false);
    onMenuItemClick?.(item);
  };

  const aboutUsIcon = `/assets/about_us_${networkMode}.svg`;

  return (
    <div ref={containerRef} className="about-us-wrapper">
      <img
        src={aboutUsIcon}
        alt="Menu"
        className="about-toggle-icon"
        onClick={handleToggle}
      />

      <div className={`about-panel ${!isExpanded ? 'collapsed' : ''}`}>
        <div className="about-panel-content">
          <div className="about-menu-item" onClick={() => handleMenuItemClick('about')}>
            <span className="about-menu-text text-body1">About us</span>
          </div>
          <div className="about-menu-item" onClick={() => handleMenuItemClick('tour')}>
            <span className="about-menu-text text-body1">Take a tour</span>
          </div>
        </div>
        <div className="about-bottom-bar"></div>
      </div>
    </div>
  );
}
