import { FieldsArcherArrow } from "./fields-archer-arrow.js";

export class FieldsArcher extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fields-archer');
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(18 , 22);
        this.body.setOffset(15, 8);
        this.body.setImmovable(true);
        this.body.setAllowDrag(false);

        this.hp = 10;
        this.attackRange = 250;
        this.attackDamage = 15;
        this.attackCooldown = 5000;
        this.lastAttackTime = 0;

        this.target = null;

        this.isKnockedBack = false;
        this.isDead = false;
        this.isAttacking = false;

        this.facing = 'down';
    }

    update() {
        if (this.isKnockedBack || this.isAttacking || this.isDead) return;

        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.hypot(dx, dy);

            this.facing = angleToDir(Phaser.Math.RadToDeg(Math.atan2(dy, dx)));

            if (distance < 300) {
                this.playAnimation('idle');
            }

            if (distance <= this.attackRange) {
                const now = this.scene.time.now;
                if (now - this.lastAttackTime > this.attackCooldown) {
                    this.lastAttackTime = now;
                    this.attackTarget();
                }
            }
        }
    }

    playAnimation(pose) {
        if (this.isDead) return;

        const dir = this.facing || 'down';
        const animDir = `fields-archer-${pose}-${dir}`;

        if (this.scene.anims.exists(animDir)) {
            this.anims.play(animDir, true);
        }
    }

    attackTarget() {
        if (!this.target || !this.target.stats) return;

        this.isAttacking = true;
        this.playAnimation('attack');
        // this.scene.time.delayedCall(500, () => {
        //     this.isAttacking = false;
        // })

        // // play animation for hitting
        // if (typeof this.target.takeDamage === 'function') {
        //     this.scene.time.delayedCall(500, () => {
        //         this.target.takeDamage(this.attackDamage, this);
        //     })
        // }
        // small delay to sync with attack anim
        this.scene.time.delayedCall(400, () => {
            // Spawn arrow towards player's current position
            new FieldsArcherArrow(this.scene, this, this.target);
        });

        this.scene.time.delayedCall(500, () => {
            this.isAttacking = false;
        });
    }
    
    takeDamage(amount,) {
        this.hp -= amount;

        if (this.hp <= 0) {
            this.playAnimation('death');
            this.isDead = true;
            this.setVelocity(0, 0);
            this.scene.time.delayedCall(1200, () => {
                this.destroy();
            });
            // maybe grant xp
        }

        if (!this.isKnockedBack && !this.isDead) {
            const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
            const knockbackForce = 100;
            const knockbackX = Math.cos(angle) * knockbackForce;
            const knockbackY = Math.sin(angle) * knockbackForce;
            this.body.setVelocity(knockbackX, knockbackY);

            this.isKnockedBack = true;
            this.scene.time.delayedCall(150, () => {
                this.isKnockedBack = false;
                this.body.setVelocity(0, 0);
            });
        };

    }
}

function angleToDir(angleDeg) {
    if (angleDeg >= 45 && angleDeg < 135)   return 'down';
    if (angleDeg >= -45 && angleDeg < 45)  return 'right';
    if (angleDeg >= -135 && angleDeg < -45) return 'up';
    return 'left';
}