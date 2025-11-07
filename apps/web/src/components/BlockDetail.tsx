import { useRef, useEffect, useState } from 'react';
import { EventBus } from '../game/EventBus';
import './BlockDetail.css';

export interface BlockDetailData {
  /** 区块哈希 */
  blockHash: string;
  /** 区块高度 */
  blockHeight: string;
  /** 交易数量 */
  transactions: number;
  /** Occupation */
  occupation?: string;
  /** Size */
  size?: string;
  /** Proposed Transactions */
  proposedTransactions?: number;
  /** Miner reward */
  minerReward?: string;
  /** Difficulty */
  difficulty?: string;
  /** Nonce */
  nonce?: string;
  /** Uncle Count */
  uncleCount?: number;
  /** Timestamp */
  timestamp?: string;
  /** 已确认的交易列表 */
  confirmedTransactions?: Array<{
    txHash: string;
  }>;
}

interface BlockDetailProps {
  /** 是否显示 */
  visible: boolean;
  /** 区块数据 */
  data: BlockDetailData;
  /** 位置 x 坐标 */
  x: number;
  /** 位置 y 坐标 */
  y: number;
  /** 屏幕宽度 */
  screenWidth: number;
  /** 屏幕高度 */
  screenHeight: number;
  /** 点击外部关闭的回调 */
  onClose?: () => void;
}

/**
 * Block Detail 区块详情弹框组件
 * 用于显示点击 rocket 后的区块详细信息
 */
export function BlockDetail({ visible, data, x, y, screenWidth, screenHeight, onClose }: BlockDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'transactions'>('info');

  // 点击外部区域关闭
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    // Listen to canvas click event from Phaser
    const handleCanvasClick = () => {
      onClose?.();
    };

    document.addEventListener('mousedown', handleClickOutside);
    EventBus.on('canvas-clicked', handleCanvasClick);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      EventBus.off('canvas-clicked', handleCanvasClick);
    };
  }, [visible, onClose]);

  // 重置 tab 状态
  useEffect(() => {
    if (visible) {
      setActiveTab('info');
    }
  }, [visible]);

  if (!visible) return null;

  // 截取区块哈希显示前6位和后6位
  const formatBlockHash = (hash: string) => {
    if (hash.length <= 18) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  // 计算弹框位置
  const POPUP_WIDTH = 360;
  const POPUP_HEIGHT = 450;
  const POPUP_OFFSET = 50;
  const SCREEN_PADDING = 20;

  // 默认在 rocket 右边显示
  let popupX = x + POPUP_OFFSET;
  let popupY = y - POPUP_HEIGHT / 2;

  // 水平方向边界检测
  if (popupX + POPUP_WIDTH + SCREEN_PADDING > screenWidth) {
    popupX = x - POPUP_WIDTH - POPUP_OFFSET;
    if (popupX < SCREEN_PADDING) {
      popupX = screenWidth - POPUP_WIDTH - SCREEN_PADDING;
    }
  }

  if (popupX < SCREEN_PADDING) {
    popupX = SCREEN_PADDING;
  }

  // 垂直方向边界检测
  if (popupY < SCREEN_PADDING) {
    popupY = SCREEN_PADDING;
  }

  if (popupY + POPUP_HEIGHT + SCREEN_PADDING > screenHeight) {
    popupY = screenHeight - POPUP_HEIGHT - SCREEN_PADDING;
  }

  const confirmedTxs = data.confirmedTransactions || [];

  return (
    <div
      ref={containerRef}
      className="block-detail-wrapper"
      style={{
        left: `${popupX}px`,
        top: `${popupY}px`,
      }}
    >
      <div className="block-detail-content">
        {/* 头部：图标和区块哈希 */}
        <div className="block-detail-header">
          <div className="block-detail-icon">🚀</div>
          <div className="block-detail-hash-section">
            <div className="block-detail-hash">{formatBlockHash(data.blockHash)}</div>
            <div className="block-detail-height">Block height: {data.blockHeight}</div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="block-detail-tabs">
          <button
            className={`block-detail-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`block-detail-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions ({confirmedTxs.length})
          </button>
        </div>

        {/* Tab 内容 */}
        <div className="block-detail-tab-content">
          {activeTab === 'info' ? (
            <div className="block-detail-info-list">
              <div className="block-detail-info-item">
                <span className="info-label">Transactions</span>
                <span className="info-value">{data.transactions}</span>
              </div>
              {data.occupation !== undefined && (
                <div className="block-detail-info-item">
                  <span className="info-label">Occupation</span>
                  <span className="info-value">{data.occupation}</span>
                </div>
              )}
              {data.size && (
                <div className="block-detail-info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">{data.size}</span>
                </div>
              )}
              {data.proposedTransactions !== undefined && (
                <div className="block-detail-info-item">
                  <span className="info-label">Proposed Transactions</span>
                  <span className="info-value">{data.proposedTransactions}</span>
                </div>
              )}
              {data.minerReward && (
                <div className="block-detail-info-item">
                  <span className="info-label">Miner reward</span>
                  <span className="info-value">{data.minerReward}</span>
                </div>
              )}
              {data.difficulty && (
                <div className="block-detail-info-item">
                  <span className="info-label">Difficulty</span>
                  <span className="info-value">{data.difficulty}</span>
                </div>
              )}
              {data.nonce && (
                <div className="block-detail-info-item">
                  <span className="info-label">Nonce</span>
                  <span className="info-value">{data.nonce}</span>
                </div>
              )}
              {data.uncleCount !== undefined && (
                <div className="block-detail-info-item">
                  <span className="info-label">Uncle Count</span>
                  <span className="info-value">{data.uncleCount}</span>
                </div>
              )}
              {data.timestamp && (
                <div className="block-detail-info-item">
                  <span className="info-label">Timestamp</span>
                  <span className="info-value">{data.timestamp}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="block-detail-tx-list">
              {confirmedTxs.length === 0 ? (
                <div className="block-detail-empty">No confirmed transactions</div>
              ) : (
                confirmedTxs.map((tx, index) => (
                  <div key={index} className="block-detail-tx-item">
                    <span className="tx-item-number">#{index + 1}</span>
                    <span className="tx-item-hash">{formatBlockHash(tx.txHash)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
