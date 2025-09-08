export class Crystal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, color) {
    super(scene, x+16, y+16, `crystal-${color}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);

    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
    this.body.setBounce(0);
    this.body.setDrag(0)

    this.type = `crystal-${color}`;

    this.isCollectable = false;
  }

  setCollectable(collectable) {
    this.isCollectable = collectable;
  }

  collect(player) {
    player.addToInventory(this);
    this.destroy();
  }
}