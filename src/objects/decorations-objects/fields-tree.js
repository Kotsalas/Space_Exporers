export class FieldsTree extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'fields-tree');

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setOrigin(0.5, 1);
    
    this.body.setSize(32, 16);
    this.body.setOffset(16, 61);
    
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setVelocity(0, 0);
    this.body.setBounce(0);
    this.body.setDrag(0);

    this.body.moves = false; // CRUCIAL

    scene.time.delayedCall(Phaser.Math.Between(0, 1000), () => {
        this.play('fields-tree-idle', true);
    })
  }

  brake() {
    // empty for now
  }
}