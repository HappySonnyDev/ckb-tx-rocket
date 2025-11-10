import { useRef, useEffect } from 'react';
import './AboutUsPopup.css';

interface AboutUsPopupProps {
  onClose: () => void;
}

/**
 * About Us 弹窗组件
 * 显示项目介绍内容
 */
export function AboutUsPopup({ onClose }: AboutUsPopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="about-us-popup-overlay">
      <div ref={containerRef} className="about-us-popup-container">
        {/* 关闭按钮 */}
        <button className="about-us-popup-close" onClick={onClose}>
          <img src="/assets/close.svg" alt="Close" />
        </button>

        {/* 弹窗内容 */}
        <div className="about-us-popup-content">
          <h2 className="about-us-popup-title">A Letter from the Creators</h2>
          
          <div className="about-us-popup-description">
            <h3>Why We Build This?</h3>
            <p>
              We created this visualization to make the invisible visible: how CKB transactions enter the mempool, wait their turn, and get picked up into blocks.
            </p>
            <p>
              You don't need to read numbers or understand hash functions. Just watch the rocket — and you'll intuitively understand how Nervos CKB works, and why CKB is different.
            </p>
            <p>
              Web3 loves to call itself permissionless — meaning anyone can participate without gatekeepers — but if getting started requires mastering wallets, private keys, UTXOs, and other technical jargon, is it truly open?
            </p>
            <p>
              Because sometimes, the barrier is the permission.
            </p>
            <p>
              We believe exploring blockchain shouldn't require a crypto degree. This project is our way of holding that door open — with color, motion, and a little fun.
            </p>
            
            <h3>Why a Rocket?</h3>
            <p>
              Because every block is a launch.
            </p>
            <p>
              On CKB, new blocks are created through something called **Proof-of-Work** — an approach that uses real energy and time to ensure security and trust. When a block is mined, it's not just an announcement — it's a result of real effort. A rocket launch is the perfect way to show that moment: earned, powered, and irreversible.
            </p>
            <p>
              And the passengers? They're the transactions — lining up, waiting their turn, and blasting off when the moment comes.
            </p>
            <p>
              This rocket isn't just a visual. It also marks a shift – from Web2 to Web3, and toward a world called <strong>Web5</strong>.
            </p>
            
            <h3>You Are Invited</h3>
            <p>
              This isn't just another explorer.
            </p>
            <p>
              It's an invitation — to peek inside the engine room of the CKB blockchain, get curious about what's really happening under the hood, and maybe even join us in shaping the future evolution of the entire Nervos ecosystem.
            </p>
            <p>
              We hope it makes you smile, and we hope it makes you think. And if it makes you want to stick around and help build something better — well, welcome aboard. Let's launch. 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
