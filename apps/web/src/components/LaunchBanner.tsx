import { useEffect, useState } from 'react';
import { networkConfig } from '../config/network.config';
import './LaunchBanner.css';

interface BlockData {
  blockNumber: number;
  timestamp: string;
  transactionCount: number;
  miner: string;
  blockHash: string;
}

interface LaunchBannerProps {
  blockData: BlockData | null;
  show: boolean;
  onHide: () => void;
}

/**
 * Launch Banner 组件
 * 显示区块发射信息
 */
export function LaunchBanner({ blockData, show, onHide }: LaunchBannerProps) {
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
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

  useEffect(() => {
    if (show && blockData) {
      setVisible(true);
      setIsExiting(false);
      
      // 5秒后开始退出动画
      const timer = setTimeout(() => {
        setIsExiting(true);
        // 等待退出动画完成后隐藏并通知父组件
        setTimeout(() => {
          setVisible(false);
          onHide();
        }, 500); // 动画持续时间
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, blockData, onHide]);

  if (!blockData) return null;

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  };

  // 格式化矿工地址
  const formatMiner = (miner: string) => {
    if (!miner || miner === 'Unknown') return 'Unknown';
    return `${miner.substring(0, 6)}...${miner.substring(miner.length - 4)}`;
  };

  // 获取火箭图片路径
  const rocketImage = `/assets/rocket_${networkMode}.png`;

  // 获取区块浏览器 URL
  const getExplorerUrl = () => {
    const baseUrl = networkMode === 'mainnet' 
      ? 'https://explorer.nervos.org'
      : 'https://pudge.explorer.nervos.org';
    return `${baseUrl}/block/${blockData.blockHash}`;
  };

  return (
    <div className={`launch-banner-overlay ${visible && !isExiting ? 'show' : ''}`}>
      <div className={`launch-banner-container ${isExiting ? 'exiting' : ''}`}>
        {/* 顶部两个柱子 */}
        <div className="launch-banner-pillars">
          <div className="launch-banner-pillar" />
          <div className="launch-banner-pillar" />
        </div>
        
        {/* 主内容区域 */}
        <div className="launch-banner-content">
          {/* 火箭图片 */}
          <div className="launch-banner-rocket">
            <img src={rocketImage} alt="Rocket" />
          </div>
          
          {/* 信息区域 */}
          <div className="launch-banner-info">
            <div className="launch-banner-header-text">
              <span className="launch-banner-title text-h2">
                Block #{blockData.blockNumber} launched!
              </span>
              <span className="launch-banner-timestamp text-caption">
                {blockData.timestamp}
              </span>
            </div>
            
            <span className="launch-banner-tx-count text-h4">
              {blockData.transactionCount} lucky transaction{blockData.transactionCount !== 1 ? 's' : ''} made it on board!
            </span>
            
            <div className="launch-banner-miner-section">
              <span className="launch-banner-miner text-h4">
                Launched by <span className="launch-banner-miner-address">{formatMiner(blockData.miner)}</span>
              </span>
            </div>
            
            <a 
              href={getExplorerUrl()}
              className="launch-banner-explorer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/link.svg" alt="" className="launch-banner-link-icon" />
              <span className="launch-banner-link-text text-caption">View on Explorer</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
