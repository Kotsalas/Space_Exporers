import { Direction8Movement } from "../components/movement/direction-8-movement.js";
import { JoystickMovement } from "../components/movement/joystick-movement.js";
import { LucyState } from "../lucy-state.js";

export class Lucy extends Phaser.GameObjects.Container {
    #sprite;
    #joystickMovement;
    #movement;

    constructor(scene, x, y) {
        super(scene, x ?? 32*5+16, y ?? 30*32, []);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.physics.world.enable(this);
        this.body.setSize(16, 26);
        this.body.setOffset(-8, -12);

        this.body.setAllowGravity(false);
        this.body.setImmovable(false);
        this.body.setVelocity(0, 0);
        this.body.setBounce(0);
        this.body.setDrag(0);

        this.body.setMaxVelocity(125);

        this.#sprite = scene.add.sprite(0, 0, 'lucy');
        this.#sprite.play('lucy-idle-down', true);
        this.add([this.#sprite]);

        this.stats = {
            get hp() { return LucyState.hp; },
            set hp(val) { LucyState.hp = val; },

            get maxHp() { return LucyState.maxHp; },
            set maxHp(val) { LucyState.maxHp = val; },

            get attack() { return LucyState.attack; },
            set attack(val) { LucyState.attack = val; },
        };

        this.facing;

        this.attackCooldown = 500;
        this.lastAttackTime = 0;
        this.isKnockedBack = false;
        this.isAttacking = false;
        this.isTakingDamage = false; // used inside direction-8-movement.js

        this.comboStage = 0;
        this.lastComboTime = 0;
        this.comboResetDelay = 1500;

        this.#joystickMovement = new JoystickMovement(this.scene);

        this.#movement = new Direction8Movement(this, this.#sprite, 75);
    }

    update(ts, dt) {
        if (this.isKnockedBack) return;

        this.#joystickMovement.update();
        this.#movement.update(
            this.#joystickMovement.angle,
            this.#joystickMovement.force
        );
        this.facing = this.#movement.getFacingDirection();
    }

    addToInventory(item) {
        if (!LucyState.inventory) LucyState.inventory = {};

        const key = item.type;
        LucyState.inventory[key] = (LucyState.inventory[key] || 0) + 1;
    }

    getInventory() {
        return LucyState.inventory;
    }

    attack(enemiesGroup, breakablesGroup) {
        const now = this.scene.time.now;

        if (now - this.lastComboTime > this.comboResetDelay) {
            this.comboStage = 0;
        }
        
        if (now - this.lastAttackTime < this.attackCooldown) return;

        this.lastAttackTime = now;
        this.lastComboTime = now;

        this.comboStage++;
        if (this.comboStage > 3) {
            this.comboStage = 1;
            this.attackCooldown = 1000;
            this.scene.time.delayedCall(this.attackCooldown, () => {
                this.attackCooldown = 500;
            })
        }

        const facing = this.facing;

        this.isAttacking = true;
        this.#sprite.play(`lucy-punch-${facing}-${this.comboStage}`, true);
        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.isAttacking = false;
        })

        const range = 40;
        const angleThreshold = 90;

        const facingAngle = {
            up: -90,
            down: 90,
            left: 180,
            right: 0
        }[facing];

        let hit = false;

        enemiesGroup?.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist <= range) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const angleToEnemy = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

                let delta = Phaser.Math.Angle.WrapDegrees(angleToEnemy - facingAngle);
                delta = Math.abs(delta);

                if (this.comboStage === 3) {
                    hit = true;
                    const baseDamage = LucyState.attack;
                    const bonus = this.comboStage === 3 ? LucyState.attack * 1.5 : 0;
                    const totalDamage = baseDamage + bonus;
                    enemy.takeDamage(totalDamage, this);
                }
                if (delta <= angleThreshold) {
                    hit = true;
                    enemy.takeDamage(LucyState.attack, this);
                    // play animation
                }
            }
        });

        breakablesGroup?.getChildren().forEach(box => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, box.x, box.y);
            if (dist <= range) {
                const dx = box.x - this.x;
                const dy = box.y - this.y;
                const angleToBox = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
                let delta = Phaser.Math.Angle.WrapDegrees(angleToBox - facingAngle);
                delta = Math.abs(delta);

                if (delta <= angleThreshold) {
                    box?.brake();
                }
            }
        });

        if (!hit) this.comboStage = 0;
    }

    takeDamage(damage, attacker) {
        this.stats.hp -= damage;

        // take damage animation
        const damagedAnimKey = `lucy-damaged-${this.facing}`;
        this.isTakingDamage = true;
        this.#sprite.play(damagedAnimKey, true);
        this.#sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + damagedAnimKey, () => {
            this.isTakingDamage = false;
        });

        this.scene.cameras.main.shake(100, 0.01);

        if (this.stats.hp <= 0) {
            console.log('Lucy died');
            // handle death here
            return;
        }

        // Knockback logic
        const baseKnockback = 300; // max knockback force
        const ratio = damage / this.stats.maxHp;
        let knockbackForce = baseKnockback * ratio;
        knockbackForce = Phaser.Math.Clamp(knockbackForce, 50, baseKnockback);

        const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, this.x, this.y);
        const vx = Math.cos(angle) * knockbackForce;
        const vy = Math.sin(angle) * knockbackForce;

        this.body.setVelocity(vx, vy);
        this.isKnockedBack = true;

        // Disable input for a short time
        this.scene.time.delayedCall(250, () => {
            this.isKnockedBack = false;
        });
    }
}