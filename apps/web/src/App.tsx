import { useRef, useEffect, useState, useCallback } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { useCKBChainViz } from './hooks/useCKBChainViz';
import { chainVizConfig } from './config/chainviz.config';
import { networkConfig } from './config/network.config';
import { Game } from './game/scenes/Game';
import { EventBus } from './game/EventBus';
import { AboutUsPopup } from './components/AboutUsPopup';
import { LaunchBanner } from './components/LaunchBanner';

/**
 * Main application component that integrates Phaser game with CKB ChainViz
 */
function App() {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const chainViz = useCKBChainViz();
  const [showControls, setShowControls] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Track if already initialized
  const [showAboutUsPopup, setShowAboutUsPopup] = useState(false);
  const [launchBannerData, setLaunchBannerData] = useState<{
    blockNumber: number;
    timestamp: string;
    transactionCount: number;
    miner: string;
    blockHash: string;
  } | null>(null);
  const [showLaunchBanner, setShowLaunchBanner] = useState(false);
  const hasAutoConnectedRef = useRef(false); // Track if auto-connect has run

  // 在 App 侧维护门框计数（以 snapshot 初始化，再按事件增量）
  const pendingCountRef = useRef<number>(0);
  const proposedCountRef = useRef<number>(0);

  // Handle network change
  const handleNetworkChange = useCallback(async (network: 'Mainnet' | 'Testnet') => {
    console.log(`🌐 Network changed to: ${network}`);
    
    // Get new endpoints
    const mode = network.toLowerCase() as 'mainnet' | 'testnet';
    const endpoints = networkConfig.getEndpointsForNetwork(mode);
    console.log(`🔗 New endpoints:`, endpoints);
    
    // Reset counts and state
    pendingCountRef.current = 0;
    proposedCountRef.current = 0;
    setIsInitialized(false);
    
    // Reconnect to new network
    try {
      await chainViz.reconnect(endpoints.apiUrl);
      console.log(`✅ Successfully reconnected to ${network}`);
    } catch (error) {
      console.error(`❌ Failed to reconnect to ${network}:`, error);
    }
  }, [chainViz]);

  // Initialize network config on mount
  useEffect(() => {
    networkConfig.initialize();
  }, []);

  // 封装：更新门框文案（优先调用 Game 的公开方法；否则直接设置私有字段）
  const updateGateLabels = (gameScene: any, pending: number, proposed: number) => {
    if (typeof gameScene.setGateCounts === 'function') {
      gameScene.setGateCounts(pending, proposed);
      return;
    }
    if (gameScene.gateText1) {
      gameScene.gateText1.setText(`↑ PROPOSED QUEUE:${proposed}`);
    }
    if (gameScene.gateText2) {
      gameScene.gateText2.setText(`↓ PENDING QUEUE:${pending}`);
    }
  };

  // Auto-connect on mount (only once)
  useEffect(() => {
    if (chainVizConfig.autoConnect && !hasAutoConnectedRef.current) {
      console.log('🔌 Initial auto-connect...');
      hasAutoConnectedRef.current = true;
      chainViz.connect();
    }
  }, []); // Only run once on mount
  
  // 使用 ref 保存最新的 chainViz 状态
  const chainVizRef = useRef(chainViz);
  useEffect(() => {
    chainVizRef.current = chainViz;
  }, [chainViz]);

  // Listen for scene restart (network change) and re-initialize
  useEffect(() => {
    const handleSceneReady = (scene: Game) => {
      // Use ref to get latest chainViz state
      const currentChainViz = chainVizRef.current;
      
      // Only initialize if connected
      if (!currentChainViz.isConnected) {
        console.log('⏸️ Scene ready but not connected yet, waiting...');
        return;
      }
      
      console.log('🔄 Scene ready, initializing with current data...');
      console.log('   - Pending:', currentChainViz.pendingTransactions?.length);
      console.log('   - Proposed:', currentChainViz.proposedTransactions?.length);
      
      // Update counts from current state
      const pendingCount = (currentChainViz as any).pendingTransactionCount || currentChainViz.pendingTransactions?.length || 0;
      const proposedCount = (currentChainViz as any).proposedTransactionCount || currentChainViz.proposedTransactions?.length || 0;
      
      pendingCountRef.current = pendingCount;
      proposedCountRef.current = proposedCount;
      
      // Update gate labels
      updateGateLabels(scene as any, pendingCount, proposedCount);
      
      // Initialize game state
      if (scene.initializeFromSnapshot) {
        scene.initializeFromSnapshot({
          latestBlock: currentChainViz.latestBlock,
          pendingTransactions: currentChainViz.pendingTransactions,
          proposedTransactions: currentChainViz.proposedTransactions,
          confirmedTransactions: currentChainViz.confirmedTransactions,
        });
      }
      
      // Mark as initialized
      setIsInitialized(true);
    };
    
    EventBus.on('current-scene-ready', handleSceneReady);
    
    return () => {
      EventBus.off('current-scene-ready', handleSceneReady);
    };
  }, []); // Empty dependency array - only set up once

  // Monitor connection state changes and re-initialize scene when reconnected
  useEffect(() => {
    if (chainViz.isConnected && phaserRef.current?.scene) {
      const scene = phaserRef.current.scene as any;
      
      // Check if this is a reconnection (scene already exists but needs re-init)
      if (scene && typeof scene.initializeFromSnapshot === 'function') {
        console.log('✅ Reconnected! Re-initializing scene with new data...');
        console.log('   - Pending:', chainViz.pendingTransactions?.length);
        console.log('   - Proposed:', chainViz.proposedTransactions?.length);
        
        // Update counts
        const pendingCount = (chainViz as any).pendingTransactionCount || chainViz.pendingTransactions?.length || 0;
        const proposedCount = (chainViz as any).proposedTransactionCount || chainViz.proposedTransactions?.length || 0;
        
        pendingCountRef.current = pendingCount;
        proposedCountRef.current = proposedCount;
        
        // Update gate labels
        updateGateLabels(scene, pendingCount, proposedCount);
        
        // Re-initialize game state
        scene.initializeFromSnapshot({
          latestBlock: chainViz.latestBlock,
          pendingTransactions: chainViz.pendingTransactions,
          proposedTransactions: chainViz.proposedTransactions,
          confirmedTransactions: chainViz.confirmedTransactions,
        });
        
        setIsInitialized(true);
      }
    }
  }, [chainViz.isConnected, chainViz.latestBlock]);

  // 订阅 WebSocket 事务事件：更新计数+触发动画（若方法存在）
  useEffect(() => {
    if (!isInitialized || !phaserRef.current?.scene) return;
    const gameScene = phaserRef.current.scene as any;

    const onTxPending = (tx: any) => {
      pendingCountRef.current += 1;
      updateGateLabels(gameScene, pendingCountRef.current, proposedCountRef.current);
      if (typeof gameScene.handleTransactionPending === 'function') {
        gameScene.handleTransactionPending(tx);
      }
    };

    const onTxProposed = (tx: any) => {
      // proposed 事件发生时，pending 要 -1（交易从 pending 变为 proposed）
      pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
      proposedCountRef.current += 1;
      updateGateLabels(gameScene, pendingCountRef.current, proposedCountRef.current);
      if (typeof gameScene.handleTransactionProposed === 'function') {
        gameScene.handleTransactionProposed(tx);
      }
    };

    const onTxConfirmed = (tx: any) => {
      // confirmed 事件发生时，proposed 要 -1（交易从 proposed 变为 confirmed）
      proposedCountRef.current = Math.max(0, proposedCountRef.current - 1);
      updateGateLabels(gameScene, pendingCountRef.current, proposedCountRef.current);
      if (typeof gameScene.handleTransactionConfirmed === 'function') {
        gameScene.handleTransactionConfirmed(tx);
      }
    };

    const onBlockFinalized = (block: any) => {
      console.log(block,'block====');
      // block.finalized 事件发生时，先移除 proposed queue 中匹配的交易
      console.log(`🚀 Block finalized: #${block.blockNumber}, 准备处理交易和发射火箭...`);
      
      // 处理区块确认，移除 proposed queue 中的交易
      if (typeof gameScene.handleBlockFinalized === 'function') {
        gameScene.handleBlockFinalized(block);
      }
      
      // 更新 proposed count(减去 block 中的交易数量)
      if (block.transactions && Array.isArray(block.transactions)) {
        proposedCountRef.current = Math.max(0, proposedCountRef.current - block.transactions.length);
        updateGateLabels(gameScene, pendingCountRef.current, proposedCountRef.current);
      }
      
      // 更新 Game 场景的当前区块数据
      if (typeof gameScene.updateCurrentBlock === 'function') {
        gameScene.updateCurrentBlock(block);
      }
      
      // 触发火箭发射动画
      if (typeof gameScene.launchRocket === 'function') {
        gameScene.launchRocket();
      }
    };

    const onTxRejected = (tx: any) => {
      console.log(`❌ Transaction rejected: ${tx.txHash}, reason: ${tx.reason}`);
      
      // 调用游戏场景的处理方法来删除交易
      if (typeof gameScene.handleTransactionRejected === 'function') {
        const { removedFromPending, removedFromProposed } = gameScene.handleTransactionRejected(tx);
        
        // 更新计数
        if (removedFromPending) {
          pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
        }
        if (removedFromProposed) {
          proposedCountRef.current = Math.max(0, proposedCountRef.current - 1);
        }
        
        if (removedFromPending || removedFromProposed) {
          updateGateLabels(gameScene, pendingCountRef.current, proposedCountRef.current);
        }
      }
    };

    EventBus.on('transaction-pending', onTxPending);
    EventBus.on('transaction-proposed', onTxProposed);
    EventBus.on('transaction-confirmed', onTxConfirmed);
    EventBus.on('transaction-rejected', onTxRejected);
    EventBus.on('block-finalized', onBlockFinalized);

    return () => {
      EventBus.off('transaction-pending', onTxPending);
      EventBus.off('transaction-proposed', onTxProposed);
      EventBus.off('transaction-confirmed', onTxConfirmed);
      EventBus.off('transaction-rejected', onTxRejected);
      EventBus.off('block-finalized', onBlockFinalized);
    };
  }, [isInitialized, phaserRef.current?.scene]);

  // 监听 Launch Banner 显示事件
  useEffect(() => {
    const handleShowLaunchBanner = (blockData: any) => {
      console.log('📢 Launch banner event received:', blockData);
      setLaunchBannerData(blockData);
      setShowLaunchBanner(true);
    };

    EventBus.on('show-launch-banner', handleShowLaunchBanner);

    return () => {
      EventBus.off('show-launch-banner', handleShowLaunchBanner);
    };
  }, []);

  // 监听 About Us 菜单点击事件
  useEffect(() => {
    const handleAboutMenuClick = (item: 'about' | 'tour') => {
      console.log(`About menu item clicked: ${item}`);
      if (item === 'about') {
        setShowAboutUsPopup(true);
      }
      // TODO: Handle 'tour' action
    };

    EventBus.on('about-menu-clicked', handleAboutMenuClick);

    return () => {
      EventBus.off('about-menu-clicked', handleAboutMenuClick);
    };
  }, []);

  // 监听网络切换事件
  useEffect(() => {
    const handleNetworkChanged = (network: string) => {
      console.log(`🔔 App: Received network-changed event: ${network}`);
      handleNetworkChange(network as 'Mainnet' | 'Testnet');
    };

    EventBus.on('network-changed', handleNetworkChanged);

    return () => {
      EventBus.off('network-changed', handleNetworkChanged);
    };
  }, [handleNetworkChange]);

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} />
      {showAboutUsPopup && (
        <AboutUsPopup onClose={() => setShowAboutUsPopup(false)} />
      )}
      <LaunchBanner 
        blockData={launchBannerData}
        show={showLaunchBanner}
        onHide={() => setShowLaunchBanner(false)}
      />
    </div>
  );
}

export default App;
