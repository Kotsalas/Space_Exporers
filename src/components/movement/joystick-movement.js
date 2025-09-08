export class JoystickMovement {
    #scene;
    #joyStick;
    #cursorKeys;
    #base;
    #thumb;

    constructor(scene) {
        this.#scene = scene;

        this.text = this.#scene.add.text(0, 0, '', { fontSize: '14px', color: '#000' });

        this.#base = this.#scene.add.circle(0, 0, 50, 0x888888, 0.5).setScrollFactor(0);
        this.#thumb = this.#scene.add.circle(0, 0, 20, 0xcccccc, 0.8).setScrollFactor(0);

        // 🛠 Set depth higher than anything in the game
        this.#base.setDepth(10000);
        this.#thumb.setDepth(10001);

        this.#joyStick = this.#scene.plugins.get('rexvirtualjoystickplugin').add(this.#scene, {
            x: this.#scene.scale.width * 70/100,
            y: this.#scene.scale.height * 75/100,
            radius: 50,
            base: this.#base,
            thumb: this.#thumb,
        })
        .on('update', this.update, this);
        
        this.#cursorKeys = this.#joyStick.createCursorKeys();
    };

    get force() {
        return Phaser.Math.Clamp(this.#joyStick.force / this.#joyStick.radius, 0, 10);
    }

    get angle() {
        return this.#joyStick.angle;
    }

    update() {
        if (!this.#cursorKeys) return;

        var s = 'Key down: ';
        for (var name in this.#cursorKeys) {
            if (this.#cursorKeys[name].isDown) {
                s += `${name} `;
            }
        }

        s += `
            Force: ${Math.floor(this.#joyStick.force * 100) / 100}
            Angle: ${Math.floor(this.#joyStick.angle * 100) / 100}
        `;

        s += '\nTimestamp:\n';
        for (var name in this.#cursorKeys) {
            var key = this.#cursorKeys[name];
            s += `${name}: duration=${key.duration / 1000}\n`;
        }

        // show info on 0,0 of the canvas
        // this.text.setText(s);
    }
}