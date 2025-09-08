import { LucyState } from "../../lucy-state.js";

export class InventoryUI {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.isVisible = false;

    this.container = scene.add.container(0, 0).setDepth(10000).setScrollFactor(0).setVisible(false);

    // Background panel
    const bg = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, 300, 200, 0x000000, 0.8)
      .setOrigin(0.5);
    this.container.add(bg);

    // Title text
    const title = scene.add.text(bg.x, bg.y - 80, 'Inventory', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);
    this.container.add(title);

    this.toggleKey = scene.input.keyboard.addKey('I');
    this.itemDisplays = [];
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
      this.isVisible = !this.isVisible;
      this.container.setVisible(this.isVisible);

      if (this.isVisible) {
        this._refreshInventory();
      } else {
        this._clearItemDisplays();
      }
    }
  }

  _refreshInventory() {
    this._clearItemDisplays();

    const inventory = LucyState.inventory || {};
    const keys = Object.keys(inventory).filter(key => inventory[key] > 0);

    const startX = this.scene.scale.width / 2 - 120;
    const startY = this.scene.scale.height / 2 - 40;
    const spacing = 60;
    let col = 0;
    let row = 0;

    for (let key of keys) {
      const amount = inventory[key];
      const textureKey = key; // assumes texture key matches inventory key

      const x = startX + col * spacing;
      const y = startY + row * spacing;

      const image = this.scene.add.image(x, y, textureKey).setScale(1.5).setOrigin(0.5);
      const text = this.scene.add.text(x, y + 30, `x${amount}`, {
        fontSize: '14px',
        fill: '#fff'
      }).setOrigin(0.5);

      this.container.add(image);
      this.container.add(text);
      this.itemDisplays.push(image, text);

      col++;
      if (col >= 4) {
        col = 0;
        row++;
      }
    }
  }

  toggle() {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (this.visible) {
      this._refreshInventory();
    }
  }

  _clearItemDisplays() {
    for (let display of this.itemDisplays) {
      display.destroy();
    }
    this.itemDisplays = [];
  }

  destroy() {
    this.container.destroy();
  }
}
