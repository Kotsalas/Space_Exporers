export class ItemCollector {
  constructor(scene, player, itemGroup) {
    this.scene = scene;
    this.player = player;
    this.itemGroup = itemGroup;

    this.collectKey = scene.input.keyboard.addKey('E');
    this.nearItem = null;
    this.pickupText = null;
  }

  update() {
    let closestItem = null;
    const maxDistance = 32;

    this.itemGroup.children.iterate((item) => {
      if (!item || !item.active) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        item.x,
        item.y
      );

      if (distance < maxDistance) {
        closestItem = item;
      }
    });

    if (closestItem) {
      if (this.nearItem !== closestItem) {
        // first time near this item
      }

      this.nearItem = closestItem;
      closestItem.setCollectable(true);

      this._showPickupText();

      if (Phaser.Input.Keyboard.JustDown(this.collectKey)) {
        closestItem.collect(this.player);
        this.nearItem = null;
        this._hidePickupText();

        this.itemGroup.clear(true, true);
      }

    } else {
      this.nearItem = null;
      this._hidePickupText();
    }
  }

  _showPickupText() {
    if (!this.collectButton) {
      this.collectButton = this.scene.add.text(this.scene.scale.width / 2 - 80, this.scene.scale.height - 180, 'Collect', {
        fontSize: '18px',
        fill: '#fff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(10000)
        .setInteractive();

      this.collectButton.on('pointerdown', () => {
        if (this.nearItem) {
          this.nearItem.collect(this.player);
          this.nearItem = null;
          this._hidePickupText();
        }
      });
    }

    this.collectButton.setVisible(true);
  }

  _hidePickupText() {
    if (this.collectButton) {
      this.collectButton.destroy();
      this.collectButton = null;
    }
  }
}
