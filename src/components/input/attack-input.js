export class AttackInput {
    constructor(scene, lucy, enemiesGroup, uniqueObjects) {
        this.scene = scene;
        this.lucy = lucy;
        this.enemiesGroup = enemiesGroup;
        this.uniqueObjects = uniqueObjects;

        // keyboard input
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //mobile input
        this.punchButton = scene.add.text(50, scene.scale.height - 100, 'Punch', {
            fontSize: '20px',
            backgroundColor: '#000',
            color: '#fff',
            padding: { x: 10, y:5 }
        })
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(100000);

        this.punchButton.on('pointerdown', () => {
            this.lucy.attack(this.enemiesGroup, this.uniqueObjects);
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.lucy.attack(this.enemiesGroup, this.uniqueObjects);
        }
    }
}