import { ItemCollector } from "../../components/interaction/item-collector.js";
import { YSorter } from "../../components/sort-by-y/sort-by-y.js";
import { Crystal } from "../items/crystal.js";

export class FieldsBox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, player) {
    super(scene, x, y, 'fields-box');

    this.scene = scene;
    this.lootDropChance = 1;
    this.lootClass = [Crystal];
    this.isBroken = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setOrigin(0.5, 1);
    
    this.body.setSize(17, 16);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.body.moves = false; // CRUCIAL

    this.player = player;
    this.ySorter = new YSorter(this.scene);

    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.onBreakComplete();
    })
  }

  brake() {
    if (this.isBroken) return;

    this.isBroken = true;

    this.play('fields-box-brake', true);
  }

  onBreakComplete() {
    if (this.lootClass && Math.random() < this.lootDropChance) {
        const LootClass = Phaser.Math.RND.pick(this.lootClass);
        const loot = new LootClass(this.scene, this.x-16, this.y-32, 'green');
        const lootGroup = this.scene.add.group();
        lootGroup.add(loot);
        this.ySorter.add(loot);
        const collectorInput = new ItemCollector(this.scene, this.player, lootGroup);
        this.scene.itemCollectors.push(collectorInput);
    }

    this.destroy();

  }
}