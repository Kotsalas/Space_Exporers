export class PlanetExit extends Phaser.GameObjects.Container{
    constructor(scene, x, y) {
        super(scene,x, y, [])

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.physics.world.enable(this);

        this.body.setSize(16, 30);
        this.body.setOffset(-8, -26);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
        this.body.setBounce(0);
        this.body.setDrag(0)

        this.sprite = scene.add.sprite(0, -10, 'planet-exit');
        this.sprite.play('planet-exit-idle', true);
        this.add([this.sprite]);
    }
}