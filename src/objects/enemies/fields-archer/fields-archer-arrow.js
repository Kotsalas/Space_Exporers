export class FieldsArcherArrow extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, archer, target) {
        super(scene, archer.x, archer.y, 'fields-archer-arrow');

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(3, 3);
        this.setOrigin(1, 0.5);
        this.body.setOffset(
            Math.round(this.width - this.body.width / 2),
            Math.round((this.height - this.body.height) / 2)
        );
        this.body.setAllowGravity(false);

        const dx = target.x - archer.x;
        const dy = target.y - archer.y;
        const angle = Math.atan2(dy, dx);
        this.setRotation(angle);

        // Only apply tilt if angle is not near vertical
        const verticalThreshold = 0.3; // radians (~17°)
        const horizontalThreshold = 0.3;
        const nearVertical =
            Math.abs(Math.abs(angle) - Math.PI / 2) < verticalThreshold;
        const nearHorizontal =
            Math.abs(angle) < horizontalThreshold || Math.abs(Math.abs(angle) - Math.PI) < horizontalThreshold;
        if (nearVertical || nearHorizontal) {
            this.enableTilt = false;
        } else {
            this.enableTilt = true;
            this.side = dx >= 0 ? 'right' : 'left';
        }

        const speed = 200;
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.deceleration = 50;
        this.minSpeed = 10;

        scene.physics.add.overlap(this, target, (arrow, player) => {
            if (typeof player.takeDamage === 'function') {
                player.takeDamage(archer.attackDamage, this);
            }
            this.destroy();
        });

        scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;
        let speed = Math.sqrt(vx * vx + vy * vy);

        if (speed > 0) {
            const decel = this.deceleration * (delta / 1000);
            speed = Math.max(0, speed - decel);

            if (speed <= this.minSpeed) {
                this.destroy();
                return;
            }

            let velocityAngle = Math.atan2(vy, vx);

            if (this.enableTilt) {
                const TILT = 0.3;
                const targetRotation = velocityAngle + (this.side === 'right' ? TILT : -TILT);
                const ROTATE_SPEED = 1;
                this.rotation += (targetRotation - this.rotation) * (ROTATE_SPEED * delta / 1000);

                const ALIGN_SPEED = 2;
                velocityAngle += (this.rotation - velocityAngle) * (ALIGN_SPEED * delta / 1000);
            }

            this.body.setVelocity(Math.cos(velocityAngle) * speed, Math.sin(velocityAngle) * speed);
        }
    }
}
