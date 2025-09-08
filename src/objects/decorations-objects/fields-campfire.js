import { YSorter } from "../../components/sort-by-y/sort-by-y.js";

export class FieldsCampfire extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, player) {

    super(scene, x, y, 'fields-campfire');

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setOrigin(0.5, 1);
    
    this.body.setSize(2, 2);
    this.body.setOffset(15, 18);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false; // CRUCIAL

    this.player = player;
    this.ySorter = new YSorter(this.scene);

    scene.time.delayedCall(Phaser.Math.Between(0, 1000), () => {
        this.play('fields-campfire-idle', true);
    })

    scene.physics.add.overlap(player, this, () => {
      player.takeDamage(1, this);
    });
  }

  brake() {
  }
}