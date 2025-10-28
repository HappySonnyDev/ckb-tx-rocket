import { Game as MainGame } from "./scenes/Game";
import { ChainVisualizationScene } from "./scenes/ChainVisualizationScene";
import { AUTO, Game, Types } from "phaser";

/**
 * Phaser game configuration
 */
const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    width: 1440,
    height: 1024,
    backgroundColor: "#1a1a2e",
    scale: {
        mode: Phaser.Scale.FIT,
        // mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        // width: '100%',
        // height: '100%',
        parent: "game-container",
    },
    // Enable DOM plugin for HTML element support
    dom: {
        createContainer: true,
    },
    scene: [MainGame, ChainVisualizationScene],
};

/**
 * Creates and starts a new Phaser game instance
 * @param parent - DOM element ID to mount the game to
 * @returns Phaser Game instance
 */
const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

