import { useRef, useEffect } from 'react';
import { EventBus } from '../game/EventBus';
import './Tooltip.css';

export interface TooltipContent {
  /** 图标（emoji） */
  icon?: string;
  /** 文本内容 */
  text: string;
  /** 高亮文本（支持单个或多个） */
  highlightText?: string | string[];
  /** 高亮背景色（默认为黄色，支持单个或多个） */
  highlightColor?: string | string[];
}

interface TooltipProps {
  /** 是否显示 */
  visible: boolean;
  /** tooltip 内容 */
  content: TooltipContent;
  /** 位置 x 坐标 */
  x: number;
  /** 位置 y 坐标 */
  y: number;
  /** 宽度（可选） */
  width?: number | string;
  /** 高度（可选） */
  height?: number | string;
  /** 点击外部关闭的回调 */
  onClose?: () => void;
}

/**
 * Tooltip 提示框组件
 * 可复用的提示框，支持自定义位置、内容和高亮文本
 */
export function Tooltip({ visible, content, x, y, width, height, onClose }: TooltipProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isShowingRef = useRef(false);

  console.log('🎨 Tooltip render, visible:', visible, 'x:', x, 'y:', y);

  // 点击外部区域关闭
  useEffect(() => {
    if (!visible) {
      isShowingRef.current = false;
      return;
    }

    // 设置一个标志，防止在显示 tooltip 的同一次点击事件中立即关闭它
    isShowingRef.current = true;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    // Listen to canvas click event from Phaser
    const handleCanvasClick = () => {
      onClose?.();
    };

    // 使用 setTimeout 延迟注册事件监听器，防止同一次点击事件立即触发关闭
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      EventBus.on('canvas-clicked', handleCanvasClick);
    }, 100); // 100ms 延迟，等待 DOM 渲染完成和事件冒泡结束

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      EventBus.off('canvas-clicked', handleCanvasClick);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // 渲染文本内容，如果有高亮文本则添加高亮样式
  const renderText = () => {
    if (!content.highlightText) {
      return content.text;
    }

    // 支持单个或多个高亮文本
    const highlights = Array.isArray(content.highlightText) 
      ? content.highlightText 
      : [content.highlightText];
    
    const colors = Array.isArray(content.highlightColor)
      ? content.highlightColor
      : Array(highlights.length).fill(content.highlightColor || 'var(--color-brand-accent)');

    let parts: (string | { text: string; color: string })[] = [content.text];

    // 依次处理每个高亮文本
    highlights.forEach((highlight, highlightIndex) => {
      const color = colors[highlightIndex] || 'var(--color-brand-accent)';
      const newParts: (string | { text: string; color: string })[] = [];

      parts.forEach((part) => {
        if (typeof part === 'string') {
          const segments = part.split(highlight);
          segments.forEach((segment, segmentIndex) => {
            if (segment) newParts.push(segment);
            if (segmentIndex < segments.length - 1) {
              newParts.push({ text: highlight, color });
            }
          });
        } else {
          newParts.push(part);
        }
      });

      parts = newParts;
    });

    return (
      <>
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index}>{part}</span>;
          } else {
            return (
              <span
                key={index}
                style={{
                  backgroundColor: part.color,
                  paddingLeft: '2px',
                  paddingRight: '2px',
                }}
              >
                {part.text}
              </span>
            );
          }
        })}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="tooltip-wrapper"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    >
      <div className="tooltip-content">
        <span className="tooltip-text">
          {content.icon && <>{content.icon} </>}
          {renderText()}
        </span>
      </div>
    </div>
  );
}
