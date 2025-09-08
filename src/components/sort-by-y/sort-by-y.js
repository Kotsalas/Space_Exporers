export class YSorter {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
  }

  add(gameObject) {
    if (gameObject.getChildren) {
      gameObject.getChildren().forEach(child => {
        if (child.setDepth && child.y !== undefined) {
          this.objects.push(child);
        }
      });
    } else if (gameObject.setDepth && gameObject.y !== undefined) {
      this.objects.push(gameObject);
    }
  }

  update() {
    this.objects.sort((a, b) => a.y - b.y);
    this.objects.forEach((obj, index) => {
      obj.setDepth(index);
    });
  }
}
