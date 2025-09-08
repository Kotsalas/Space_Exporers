import { LucyState } from "../../../lucy-state.js";
import { GameState } from "../../../game-state.js";

export class UpgraderUI {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.container = null;
    this.visible = false;

    this.requiredItems = GameState.requiredItems || this._generateRequiredItems();
    GameState.requiredItems = this.requiredItems;

    this._createUI();
    this._updateUpgradeText();
  }

  _createUI() {
    const { width, height } = this.scene.scale;

    this.container = this.scene.add.container(width / 2, height / 2).setDepth(1000).setScrollFactor(0);
    
    const bg = this.scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.8).setOrigin(0.5).setDepth(0);
    this.upgradeText = this.scene.add.text(0, -60, 'Upgrade Ship (Cost: 3 x bullets)', {
      fontSize: '16px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.statusText = this.scene.add.text(0, 0, '', {
      fontSize: '14px',
      fill: '#fff'
    }).setOrigin(0.5);

    const upgradeButton = this.scene.add.text(0, 60, '[Click] Upgrade', {
      fontSize: '16px',
      fill: '#0f0',
      backgroundColor: '#222',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);

    upgradeButton.on('pointerdown', () => this._attemptUpgrade());

    this.container.add([bg, this.upgradeText, this.statusText, upgradeButton]);
    this.container.setVisible(false).setDepth(1000).setScrollFactor(0);
  }

  toggle() {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
  }

  _attemptUpgrade() {
    console.log(LucyState.inventory)
    const inventory = LucyState.inventory;
    const cost = this.requiredItems;

    for (let item in cost) {
      if (!inventory[item] || inventory[item] < cost[item]) {
        this.statusText.setText(`Not enough ${item}`);
        return;
      }
    }

    // Deduct items
    for (let item in cost) {
      inventory[item] -= cost[item];
    }

    this.statusText.setText('Upgrade successful!');
    this.requiredItems = this._generateRequiredItems();
    GameState.requiredItems = this.requiredItems;
    this._updateUpgradeText();
    // TODO: Apply the upgrade effect (e.g., increase ship stats)
  }

  _generateRequiredItems() {
    const possibleItems = ['crystal-green', 'chest'];
    const newRequirements = {};

    // Choose how many different item types to require (1 to 3 for example)
    const itemCount = Phaser.Math.Between(1, 2);
    const chosenItems = Phaser.Utils.Array.Shuffle(possibleItems).slice(0, itemCount);

    for (const item of chosenItems) {
      newRequirements[item] = Phaser.Math.Between(1, 5); // Require 1–5 of each item
    }

    return newRequirements;
  }

  _updateUpgradeText() {
    const parts = [];
    for (let key in this.requiredItems) {
      parts.push(`${this.requiredItems[key]} x ${key}`);
    }
    this.upgradeText.setText('Upgrade Ship (Cost: ' + parts.join(', ') + ')');
  }

  close() {
    this.visible = false;
    this.container.setVisible(false);
  }
}
