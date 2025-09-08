export class Direction8Movement {
    #gameObject;
    #sprite;
    #speed;
    #lastAngle;

    constructor(gameObject, sprite, speed) {
        this.#gameObject = gameObject;
        this.#speed = speed;
        this.#sprite = sprite;
    }

    update(angle, force) {
        const body = this.#gameObject.body;

        if (!body) return;

        if (this.#gameObject.isTakingDamage) {
            return;
        }

        if (angle) {
            this.#lastAngle = angle; // to get the direction the player is looking
        }

        if (force > 0 && force < 10) {
            const rad = Phaser.Math.DegToRad(angle);
            const vx = Math.round(Math.cos(rad) * force * this.#speed);
            const vy = Math.round(Math.sin(rad) * force * this.#speed);
            body.setVelocity(vx, vy);

            if (this.#gameObject.isAttacking) {
                return;
            }

            if (angle<135 && angle>45) {
                force > 0.75 ?
                  this.#sprite.play('lucy-run-down', true) : this.#sprite.play('lucy-walk-down', true);
            } else if (angle<45 && angle>-45) {
                force > 0.75 ?
                  this.#sprite.play('lucy-run-right', true) : this.#sprite.play('lucy-walk-right', true);
            } else if (angle>-135 && angle<-45) {
                force > 0.75 ?
                  this.#sprite.play('lucy-run-up', true) : this.#sprite.play('lucy-walk-up', true);
            } else if (angle>135 && angle>-135) {
                force > 0.75 ?
                  this.#sprite.play('lucy-run-left', true) : this.#sprite.play('lucy-walk-left', true);
            }
        } else {
            body.setVelocity(0, 0);

            if (this.#gameObject.isAttacking) {
                return;
            }
            
            if (this.#lastAngle<135 && this.#lastAngle>45) {
                this.#sprite.play('lucy-idle-down', true);
            } else if (this.#lastAngle<45 && this.#lastAngle>-45) {
                this.#sprite.play('lucy-idle-right', true);
            } else if (this.#lastAngle>-135 && this.#lastAngle<-45) {
                this.#sprite.play('lucy-idle-up', true);
            } else if (this.#lastAngle>135 && this.#lastAngle>-135) {
                this.#sprite.play('lucy-idle-left', true);
            }
        }
    }

    getFacingDirection() {
        if (this.#lastAngle == null) return 'down';

        const angle = this.#lastAngle;
        if (angle >= 45 && angle < 135) return 'down';
        if (angle >= -45 && angle < 45) return 'right';
        if (angle >= -135 && angle < -45) return 'up';
        return 'left';
    }
}