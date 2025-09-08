import { UpgraderUI } from "./upgrader-ui.js";

export class Upgrader {
  constructor(scene, player, upgraderSprite) {
    this.scene = scene;
    this.player = player;
    this.upgrader = upgraderSprite;
    this.inRange = false;
    this.upgraderUI = new UpgraderUI(scene, player);

    this.interactButton = null;
  }

  update() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.upgrader.x,
      this.upgrader.y
    );

    const inRangeNow = distance < 30;

    if (inRangeNow && !this.inRange) {
      this._showInteractButton();
    } else if (!inRangeNow && this.inRange) {
      this._hideInteractButton();
      this.upgraderUI.close();
    }

    this.inRange = inRangeNow;
  }

  _showInteractButton() {
    if (!this.interactButton) {
      this.interactButton = this.scene.add.text(
        this.scene.scale.width / 2,
        this.scene.scale.height - 80,
        'Upgrade',
        {
          fontSize: '18px',
          fill: '#fff',
          backgroundColor: '#000',
          padding: { x: 10, y: 5 }
        }
      ).setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000)
        .setInteractive();

      this.interactButton.on('pointerdown', () => {
        this.upgraderUI.toggle();
      });
    }

    this.interactButton.setVisible(true);
  }

  _hideInteractButton() {
    if (this.interactButton) {
      this.interactButton.destroy();
      this.interactButton = null;
    }
  }
}
