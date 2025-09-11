import Phaser from '../lib/phaser.js';
import { Lucy } from '../objects/lucy.js';
import { generatePlanetTilemap } from '../components/generation/generate-planet-tilemap.js';
import { ItemCollector } from '../components/interaction/item-collector.js';
import { InventoryUI } from '../objects/inventory/inventory-ui.js';
import { Crystal } from '../objects/items/crystal.js';
import { isOverlapping } from '../components/overlap/check-overlap.js';
import { AttackInput } from '../components/input/attack-input.js';
import { FieldsOrk } from '../objects/enemies/fields-ork.js';
import { PlanetExit } from '../objects/exits/planet-exit.js';
import { StartExitPlanetSequence } from '../objects/transitions/start-exit-planet-sequence.js';
import { YSorter } from '../components/sort-by-y/sort-by-y.js';
import { PlanetTilesets } from '../../assets/data/planet-tilesets.js';
import { FieldsArcher } from '../objects/enemies/fields-archer/fields-archer.js';

export class PlanetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetScene' });
  };

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');

    var url;
  
    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
    this.load.plugin('rexvirtualjoystickplugin', url, true);
  };

  create() {
    // depth sorter
    this.ySorter = new YSorter(this);

    // have 3 total pointers (touches in the same time)
    this.input.addPointer(2);

    // background img
    this.bg = this.add.tileSprite(
      0, 0,
      this.scale.width * 2,
      this.scale.height * 2,
      'galaxy-bg'
    ).setOrigin(0, 0)
     .setScrollFactor(0);

    // map layers
    planetKey = 'fieldsPlanet'; // change this dynamically later // create new file just to save planet data
    const planetTiles = PlanetTilesets[planetKey];

    const tileSize = 32;
    const width = 100;
    const height = 100;
    const { floorMap, objectMap, uniqueObjects } = generatePlanetTilemap({
        width, 
        height,
        maxTilesToFill: 5000,
        floorTileVariants: planetTiles.floorTileVariants,
        objectTileVariants: planetTiles.objectTileVariants,
        uniqueObjectVariants: planetTiles.uniqueObjectVariants
    });
    const mapOffsetX = -Math.floor((width * tileSize) / 2);
    const mapOffsetY = -Math.floor((height * tileSize) / 2);
    const VOID_TILE_INDEX = planetTiles.voidTileIndex;

    const map = this.make.tilemap({
        tileWidth: tileSize,
        tileHeight: tileSize,
        width,
        height
    });

    const tileset = map.addTilesetImage(planetTiles.tilesetKey, planetTiles.tilesetKey);
    const groundLayer = map.createBlankLayer('ground', tileset, mapOffsetX, mapOffsetY);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tileIndex = floorMap[y][x];
            if (tileIndex >= 0) {
                groundLayer.putTileAt(tileIndex, x, y);
            } else {
                groundLayer.putTileAt(VOID_TILE_INDEX, x, y);
            }
        }
    };
    const objectLayer = map.createBlankLayer('objects', tileset, mapOffsetX, mapOffsetY);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tileIndex = objectMap[y][x];
            if (tileIndex >= 0) {
                objectLayer.putTileAt(tileIndex, x, y);
            }
        }
    }

    groundLayer.setCullPadding(2);
    objectLayer.setCullPadding(2);

    // items spawning
    const validItemPositions = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const isFloor = floorMap[y][x] >= 0;
            const isEmpty = objectMap[y][x] === -1;
            let isFreeFromUniqueObjects = true;
            for(let obj of uniqueObjects) {
                if (obj.x === x && obj.y === y) {
                    isFreeFromUniqueObjects = false;
                }
            };

            if (isFloor && isEmpty && isFreeFromUniqueObjects) {
                validItemPositions.push({ x, y });
            }
        }
    }
    Phaser.Utils.Array.Shuffle(validItemPositions);

    const itemsToSpawn = 100;
    this.items = this.physics.add.group();

    for (let i = 0; i < itemsToSpawn && validItemPositions.length > 0; i++) {
        const { x, y } = validItemPositions.pop();

        const worldX = x * tileSize + mapOffsetX;
        const worldY = y * tileSize + mapOffsetY;

        const itemsClass = Phaser.Math.RND.pick([Crystal]);
        const item = new itemsClass(this, worldX, worldY, PlanetTilesets[planetKey].crystals);

        this.ySorter.add(item);

        this.items.add(item);
    }

    // player spawning
    const validPositions = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const isFloor = floorMap[y][x] >= 0;
            const isEmpty = objectMap[y][x] === -1;
            let isFreeFromUniqueObjects = true;
            for(let obj of uniqueObjects) {
                if (obj.x === x && obj.y === y) {
                    isFreeFromUniqueObjects = false;
                }
            };

            if (isFloor && isEmpty && isFreeFromUniqueObjects) {
                validPositions.push({ x, y });
            }
        }
    }
    Phaser.Utils.Array.Shuffle(validPositions);

    const spawnTile = validPositions.pop();
    const spawnX = spawnTile.x * tileSize + mapOffsetX + tileSize / 2;
    const spawnY = spawnTile.y * tileSize + mapOffsetY + tileSize / 2;

    this.playerCords = this.add.text(0, 40, `Player: ${spawnX/32}, ${spawnY/32}`, {
        fontSize: '10px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#00000057'
    });
    this.playerCords.setScrollFactor(0);
    this.playerCords.setDepth(1000);

    // exit spawning
    const directions = [
        { dx:  1, dy:  0 },
        { dx: -1, dy:  0 },
        { dx:  0, dy:  1 },
        { dx:  0, dy: -1 },
        { dx:  2, dy:  0 },
        { dx: -2, dy:  0 },
        { dx:  0, dy:  2 },
        { dx:  0, dy: -2 },
    ];

    let exitTile = null;

    for (let dir of directions) {
        const ex = spawnTile.x + dir.dx;
        const ey = spawnTile.y + dir.dy;

        const withinBounds = ex >= 0 && ex < width && ey >= 0 && ey < height;
        let isFreeFromUniqueObjects = true;
        for(let obj of uniqueObjects) {
            if (obj.x === ex && obj.y === ey) {
                isFreeFromUniqueObjects = false;
            }
        };
        if (withinBounds && floorMap[ey][ex] >= 0 && objectMap[ey][ex] === -1 && isFreeFromUniqueObjects) {
            exitTile = { x: ex, y: ey };
        }
    }

    if (!exitTile) {
        exitTile = validPositions.find(({ x, y }) => {
            return (
                x >= 0 && x < width &&
                y >= 0 && y < height &&
                floorMap[y][x] >= 0 &&
                objectMap[y][x] === -1
            );
        });

        if (!exitTile) {
            console.warn('No valid exit tile found!');
        }
    }

    const exitX = exitTile.x * tileSize + mapOffsetX + tileSize / 2;
    const exitY = exitTile.y * tileSize + mapOffsetY + tileSize / 2;

    const exitCords = this.add.text(0, 52, `Exit: ${Math.round(exitX/32)}, ${Math.round(exitY/32)}`, {
        fontSize: '10px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#00000057'
    });
    exitCords.setScrollFactor(0);
    exitCords.setDepth(1000);

    // enemy spawning
    const minDistanceFromPlayer = 6;

    function tileDistance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y -b.y) ** 2);
    }

    const enemySpawnPositions = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (floorMap[y][x] < 0) continue;

            if (objectMap[y][x] >= 0 && planetTiles.objectsWithCollide.includes(objectMap[y][x])) continue;

            let occupiedByUnique = false;
            for (let obj of uniqueObjects) {
                if (obj.x === x && obj.y === y) {
                    occupiedByUnique = true;
                    break;
                }
            }
            if (occupiedByUnique) continue;

            if (exitTile && exitTile.x === x && exitTile.y === y) continue;

            if (tileDistance({x, y}, spawnTile) < minDistanceFromPlayer) continue;

            enemySpawnPositions.push({x, y});
        }
    }

    Phaser.Utils.Array.Shuffle(enemySpawnPositions); // Shuffle the positions so spawn is random

    // create objects
    this.lucy = new Lucy(this, spawnX, spawnY);
    this.ySorter.add(this.lucy);
    this.exit = new PlanetExit(this, exitX, exitY);
    this.exiting = false;
    this.itemCollectors = [];
    this.itemCollector = new ItemCollector(this, this.lucy, this.items);
    this.inventoryUI = new InventoryUI(this, this.lucy);
    this.inventoryButton = this.add.text(this.scale.width - 60, 20, 'Inventory', {
      fontSize: '14px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(1000)
      .setInteractive();
    this.inventoryButton.on('pointerdown', () => {
      this.inventoryUI.toggle();
    });
    this.uniqueObjectsGroup = this.physics.add.group();
    for (let { x, y, objectClass } of uniqueObjects) {
        const worldX = x * tileSize + mapOffsetX + tileSize / 2;
        const worldY = y * tileSize + mapOffsetY + tileSize;

        const obj = new objectClass(this, worldX, worldY, this.lucy);
        if (obj) {
            this.ySorter.add(obj);

            this.uniqueObjectsGroup.add(obj);
        }
    }
    const numberOfEnemiesToSpawn = 100;
    this.enemiesGroup = this.add.group();
    for (let i = 0; i < numberOfEnemiesToSpawn && enemySpawnPositions.length > 0; i++) {
        const pos = enemySpawnPositions.pop();

        // Convert tile coords to world coords
        const enemyX = pos.x * tileSize + mapOffsetX + tileSize / 2;
        const enemyY = pos.y * tileSize + mapOffsetY + tileSize / 2;

        const EnemyClass = Math.random() < 0.5 ? FieldsOrk : FieldsArcher;

        const enemy = new EnemyClass(this, enemyX, enemyY);
        enemy.target = this.lucy;

        this.physics.add.collider(enemy, groundLayer);
        this.physics.add.collider(enemy, objectLayer);
        this.physics.add.collider(enemy, this.uniqueObjectsGroup);

        this.ySorter.add(enemy);

        this.enemiesGroup.add(enemy);
    }
    this.attackInput = new AttackInput(this, this.lucy, this.enemiesGroup, this.uniqueObjectsGroup);

    // collisions
    groundLayer.setCollision([VOID_TILE_INDEX]);
    objectLayer.setCollision(planetTiles.objectsWithCollide);
    this.physics.add.collider(this.lucy, groundLayer);
    this.physics.add.collider(this.lucy, objectLayer);
    this.physics.add.collider(this.lucy, this.uniqueObjectsGroup);

    // camera
    this.cameras.main.startFollow(this.lucy);

    // depths
  }

  update(ts, dt) {
    if (this.exiting) return;

    this.lucy.update(ts, dt);
    this.itemCollector.update();
    for (let i = this.itemCollectors.length - 1; i >= 0; i--) {
        const collector = this.itemCollectors[i];
        collector.update();

        if (!collector.nearItem && collector.itemGroup.countActive(true) === 0) {
            this.itemCollectors.splice(i, 1);
        }
    }
    this.inventoryUI.update();
    this.enemiesGroup.children.iterate(enemy => {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.lucy.x, this.lucy.y);
        if (dist <= 600) {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.body.enable = true;
            enemy.update();
        } else {
            enemy.setActive(false);
            enemy.setVisible(false);
            enemy.body.enable = false;
        }
        // if (enemy.active && enemy.anims) {
        //     enemy.play(`${enemy.texture.key}-idle`, true);
        // } else {
        //     enemy.anims.stop();
        // }
    });
    this.uniqueObjectsGroup.children.iterate(obj => {
        const dist = Phaser.Math.Distance.Between(obj.x, obj.y, this.lucy.x, this.lucy.y);
        if (dist <= 600) {
            obj.setActive(true);
            obj.setVisible(true);
            obj.body.enable = true;
            if (obj.anims && obj.anims.animationManager.exists(`${obj.texture.key}-idle`)) {
                obj.anims.play(`${obj.texture.key}-idle`, true);
            }
        } else {
            obj.setActive(false);
            obj.setVisible(false);
            obj.body.enable = false;
            if (obj.anims && obj.anims.animationManager.exists(`${obj.texture.key}-idle`)) {
               obj.anims.stop();
            }
        }
    });
    this.ySorter.update();

    const camera = this.cameras.main;
    this.bg.tilePositionX = camera.scrollX * 0.05;
    this.bg.tilePositionY = camera.scrollY * 0.05;

    if (isOverlapping(this.lucy.body, this.exit.body, 0.5)) {
      this.exiting = true;
      StartExitPlanetSequence(this, {
        onComplete: () => {
          this.scene.start('PlanetSelectionScene');
        }
      });
    }

    this.playerCords.setText(`Player: ${Math.round(this.lucy.x/32+1)}, ${Math.round(this.lucy.y/32+1)}`)
  }
}