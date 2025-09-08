import Phaser from '../lib/phaser.js';
import { Lucy } from '../objects/lucy.js';
import { SpaceshipExit } from '../objects/exits/spaceship-exit.js';
import { StartExitSpaceshipSequence } from '../objects/transitions/start-exit-spaceship-sequence.js';
import { InventoryUI } from '../objects/inventory/inventory-ui.js';
import { Upgrader } from '../objects/spaceship-interactive-objects/upgrader/upgrader.js';
import { isOverlapping } from '../components/overlap/check-overlap.js';
import { UpgraderUI } from '../objects/spaceship-interactive-objects/upgrader/upgrader-ui.js';
import { YSorter } from '../components/sort-by-y/sort-by-y.js';

export class SpaceshipScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SpaceshipScene' });
  };

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');

    var url;
  
    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
    this.load.plugin('rexvirtualjoystickplugin', url, true);
  };

  create() {
    // have 3 total pointers (touches in the same time)
    this.input.addPointer(2);

    // background
    this.bg = this.add.tileSprite(
      0, 0,
      this.scale.width * 2,
      this.scale.height * 2,
      'galaxy-bg'
    ).setOrigin(0, 0)
     .setScrollFactor(0);

     // map
    const map = this.make.tilemap({ key: 'map' });
    const tileset1 = map.addTilesetImage('spaceship-tileset', 'spaceship-tileset');
    const tileset2 = map.addTilesetImage('free-spaceship-interior-tileset', 'free-spaceship-interior-tileset');

    const floor = map.createLayer('floor', [tileset1, tileset2], -12*32, 0);
    floor.setCollisionByProperty({ collides: true });
    const objectsBelow = map.createLayer('objects-below-parts', [tileset1, tileset2], -12 * 32, 0);
    objectsBelow.setCollisionByProperty({ collides: true });
    const objectsOnTop = map.createLayer('objects-onTop-parts', [tileset1, tileset2], -12 * 32, 0);

    // create objects
    this.lucy = new Lucy(this);
    this.exit = new SpaceshipExit(this, 5*32+16, 35*32-16);
    this.exiting = false;
    this.inventoryUI = new InventoryUI(this);
    this.upgrader = this.physics.add.staticSprite(5*32+16, 27*32+16, 'chest');
    this.upgraderUI = new UpgraderUI(this, this.lucy);
    this.upgraderInteractor = new Upgrader(this, this.lucy, this.upgrader, this.upgraderUI);
    this.inventoryButton = this.add.text(this.scale.width - 60, 20, 'Inventory', {
      fontSize: '14px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(1000)
      .setInteractive();
    this.ySorter = new YSorter(this);
    this.ySorter.add(this.lucy);
    this.ySorter.add(this.upgrader);

    this.inventoryButton.on('pointerdown', () => {
      this.inventoryUI.toggle();
    });

    // colliders
    this.physics.add.collider(this.lucy, floor);
    this.physics.add.collider(this.lucy, objectsBelow);

    // camera
    this.cameras.main.startFollow(this.lucy);

    // depths
    objectsOnTop.setDepth(100);

//     const debugGraphics = this.add.graphics().setAlpha(0.75);
//     objectsBelow.renderDebug(debugGraphics, {
//         tileColor: null, // Don't color every tile
//         collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
//         faceColor: new Phaser.Display.Color(0, 255, 0, 255)
//     });
  }

  update(ts, dt) {
    if (this.exiting) return;

    this.lucy.update(ts, dt);
    this.inventoryUI.update();
    this.upgraderInteractor.update();
    this.ySorter.update();

    const camera = this.cameras.main;
    this.bg.tilePositionX = camera.scrollX * 0.05;
    this.bg.tilePositionY = camera.scrollY * 0.05;

    if (isOverlapping(this.lucy.body, this.exit.body, 0.8)) {
      this.exiting = true;
      this.exit.sprite.play('spaceship-exit-open', true);
      StartExitSpaceshipSequence(this, {
        onComplete: () => {
          this.scene.start('PlanetSelectionScene');
        }
      });
    }
  }
}