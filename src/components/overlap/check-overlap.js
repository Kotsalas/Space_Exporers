export function isOverlapping(bodyA, bodyB, percent = 0.5) {
    if (!bodyA || !bodyB) {
        console.log('error1') 
        return false};

    const rectA = new Phaser.Geom.Rectangle(bodyA.x, bodyA.y, bodyA.width, bodyA.height);
    const rectB = new Phaser.Geom.Rectangle(bodyB.x, bodyB.y, bodyB.width, bodyB.height);

    const intersection = Phaser.Geom.Rectangle.Intersection(rectA, rectB);

    if (!intersection.width || !intersection.height) return false;

    const overlapArea = intersection.width * intersection.height;
    const areaA = bodyA.width * bodyA.height;

    return overlapArea >= areaA * percent;
}