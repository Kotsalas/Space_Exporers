import Phaser from './lib/phaser.js';
import { BootScene } from './scenes/boot-scene.js';
import {SpaceshipScene } from './scenes/spaceship-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { PlanetSelectionScene } from './scenes/planet-selection-scene.js';
import { PlanetScene } from './scenes/planet-scene.js';

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  roundPixels: true,
  pixelArt: true,
  scale: {
    parent: 'game-container',
    width: 350,
    height: 640,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
  },
  backgroundColor: '#00aeff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true,
    },
  },
});

game.scene.add('BootScene', BootScene);
game.scene.add('PreloadScene', PreloadScene);
game.scene.add('SpaceshipScene', SpaceshipScene);
game.scene.add('PlanetSelectionScene', PlanetSelectionScene);
game.scene.add('PlanetScene', PlanetScene);
game.scene.start('BootScene');