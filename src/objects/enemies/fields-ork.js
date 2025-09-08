export class FieldsOrk extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fields-ork');
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(20 , 22);
        this.body.setOffset(14, 16);
        this.body.setImmovable(false);
        this.body.setMaxVelocity(60);
        this.body.setAllowDrag(false);

        this.hp = 100;
        this.speed = 20;
        this.attackRange = 15;
        this.attackDamage = 5;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;

        this.target = null;

        this.isKnockedBack = false;
        this.isDead = false;
        this.isAttacking = false;
    }

    update() {
        if (this.isKnockedBack || this.isAttacking || this.isDead) return;

        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 200) {
                this.playAnimation('walk');
                const angle = Math.atan2(dy, dx);
                this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);   
            } else {
                this.body.setVelocity(0, 0);
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
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;

        if (vx === 0 && vy === 0) return;

        const angle = Phaser.Math.RadToDeg(Math.atan2(vy, vx));

        if (angle >= 45 && angle < 135) {
            this.anims.play(`fields-ork-${pose}-down`, true);
        } else if (angle >= -45 && angle < 45) {
            this.anims.play(`fields-ork-${pose}-right`, true);
        } else if (angle >= -135 && angle < -45) {
            this.anims.play(`fields-ork-${pose}-up`, true);
        } else {
            this.anims.play(`fields-ork-${pose}-left`, true);
        }
    }

    attackTarget() {
        if (!this.target || !this.target.stats) return;

        this.isAttacking = true;
        this.playAnimation('attack');
        this.scene.time.delayedCall(500, () => {
            this.isAttacking = false;
        })

        // play animation for hitting
        if (typeof this.target.takeDamage === 'function') {
            this.scene.time.delayedCall(400, () => {
                this.target.takeDamage(this.attackDamage, this);
            })
        }
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
            });

            // hurt-animation
        };

    }
}