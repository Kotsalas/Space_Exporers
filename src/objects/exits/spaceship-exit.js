export class SpaceshipExit extends Phaser.GameObjects.Container{
    constructor(scene, x, y) {
        super(scene,x, y, [])

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.physics.world.enable(this);

        this.setSize(96, 96);
        this.setScale(1.02);

        this.body.setSize(32, 32);
        this.body.setOffset((96 - 32) / 2, (96 - 32) / 2);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
        this.body.setBounce(0);
        this.body.setDrag(0)

        this.sprite = scene.add.sprite(0, 0, 'spaceship-exit');
        this.sprite.play('spaceship-exit-idle', true);
        this.add([this.sprite]);
    }
}