import { useRef, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import './TransactionDetail.css';

export interface TransactionDetailData {
  /** 交易哈希 */
  txHash: string;
  /** 动物类型（用于显示图标） */
  animalType?: 'rabbit' | 'pig' | 'turtle';
  /** 交易类别 */
  category?: string;
  /** 交易费率 */
  fee?: string;
  /** 状态 */
  status?: string;
  /** 大小 */
  size?: string;
  /** 循环数 */
  cycles?: string;
  /** 时间戳 */
  timestamp?: string;
}

interface TransactionDetailProps {
  /** 是否显示 */
  visible: boolean;
  /** 交易数据 */
  data: TransactionDetailData;
  /** 位置 x 坐标(动物中心位置) */
  x: number;
  /** 位置 y 坐标(动物中心位置) */
  y: number;
  /** 屏幕宽度 */
  screenWidth: number;
  /** 屏幕高度 */
  screenHeight: number;
  /** 点击外部关闭的回调 */
  onClose?: () => void;
}

const TxTypeColor={
  "secp256k1_blake160_sighash_all":"#BFE0EA",
  "dao":"#EDCFD3",
  "secp256k1_blake160_multisig_all":"#BFE0EA",
  "sudt":"#7A5699",
  "xudt":"#8A5C32"
}

/**
 * Transaction Detail 交易详情弹框组件
 * 用于显示点击小动物后的交易详细信息
 */
export function TransactionDetail({ visible, data, x, y, screenWidth, screenHeight, onClose }: TransactionDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!visible) return null;

  // 截取交易哈希显示前6位和后6位
  const formatTxHash = (hash: string) => {
    if (hash.length <= 18) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  // 计算弹框位置,考虑屏幕边界
  const POPUP_WIDTH = 405; // 弹框宽度(与 CSS 中的 width 一致)
  const POPUP_HEIGHT = 250; // 弹框预估高度(根据内容动态变化,这里取一个合理值)
  const POPUP_OFFSET = 50; // 弹框与动物的水平间距
  const VERTICAL_GAP = -10; // 弹框与动物边缘的垂直间隙
  const SCREEN_PADDING = 20; // 屏幕边缘留白

  // 默认在动物右边显示
  let popupX = x + POPUP_OFFSET;
  let popupY = y; // 默认与动物垂直对齐

  // ========== 水平方向边界检测 ==========
  // 检查右边是否有足够空间
  if (popupX + POPUP_WIDTH + SCREEN_PADDING > screenWidth) {
    // 右边空间不够,显示在左边
    popupX = x - POPUP_WIDTH - POPUP_OFFSET;
    
    // 如果左边也没有足够空间,则靠右对齐
    if (popupX < SCREEN_PADDING) {
      popupX = screenWidth - POPUP_WIDTH - SCREEN_PADDING;
    }
  }

  // 确保不超出左边界
  if (popupX < SCREEN_PADDING) {
    popupX = SCREEN_PADDING;
  }

  // ========== 垂直方向边界检测 ==========
  // 优先在动物上方显示(y是动物中心,这里简化为直接在上方一点)
  popupY = y - POPUP_HEIGHT - VERTICAL_GAP;
  
  // 如果上方空间不够,则在动物下方显示
  if (popupY < SCREEN_PADDING) {
    popupY = y + VERTICAL_GAP;
  }
  
  // 如果下方也超出边界,则尽量靠近动物同时保证不超出屏幕
  if (popupY + POPUP_HEIGHT + SCREEN_PADDING > screenHeight) {
    // 尝试向上调整,但保持与动物有一定距离
    popupY = Math.max(
      SCREEN_PADDING, // 不能超出上边界
      Math.min(
        y - POPUP_HEIGHT - VERTICAL_GAP, // 优先在动物上方
        screenHeight - POPUP_HEIGHT - SCREEN_PADDING // 不能超出下边界
      )
    );
  }

  // 根据动物类型获取图标路径
  const getAnimalIcon = (animalType?: 'rabbit' | 'pig' | 'turtle') => {
    if (!animalType) return '🐢'; // 默认图标
    const iconMap = {
      rabbit: '/assets/rabbit.svg',
      pig: '/assets/pig.svg',
      turtle: '/assets/turtle.svg',
    };
    return iconMap[animalType];
  };

  return (
    <div
      ref={containerRef}
      className="tx-detail-wrapper"
      style={{
        left: `${popupX}px`,
        top: `${popupY}px`,
      }}
    >
      <div className="tx-detail-content">
        {/* 头部：图标和交易哈希 */}
        <div className="tx-detail-header">
          {data.animalType ? (
            <img src={getAnimalIcon(data.animalType)} alt={data.animalType} className="tx-detail-icon-img" />
          ) : (
            <div className="tx-detail-icon">🐢</div>
          )}
          <div className="tx-detail-hash-section">
            <div className="tx-detail-hash text-h2">{formatTxHash(data.txHash)}</div>
            {data.category && (
              <div className="tx-detail-category">
                <div 
                  className="category-color-block" 
                  style={{ 
                    backgroundColor: data.category in TxTypeColor 
                      ? TxTypeColor[data.category as keyof typeof TxTypeColor] 
                      : '#F8F0DC' 
                  }}
                ></div>
                <div 
                  className="category-label"
                  style={{
                    color: data.category in TxTypeColor 
                      ? TxTypeColor[data.category as keyof typeof TxTypeColor] 
                      : '#F8F0DC'
                  }}
                >
                  {data.category in TxTypeColor ? data.category : 'Other'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 详细信息列表 */}
        <div className="tx-detail-info-list">
          {data.fee !== undefined && (
            <div className="tx-detail-info-item">
              <span className="info-label">Transaction fee</span>
              <span className="info-value">{data.fee}</span>
            </div>
          )}
          {data.status && (
            <div className="tx-detail-info-item">
              <span className="info-label">Status</span>
              <span className="info-value">{data.status}</span>
            </div>
          )}
          {data.size && (
            <div className="tx-detail-info-item">
              <span className="info-label">Size</span>
              <span className="info-value">{data.size}</span>
            </div>
          )}
          {data.cycles && (
            <div className="tx-detail-info-item">
              <span className="info-label">Cycles</span>
              <span className="info-value">{data.cycles}</span>
            </div>
          )}
          {data.timestamp && (
            <div className="tx-detail-info-item">
              <span className="info-label">Timestamp</span>
              <span className="info-value">{data.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
