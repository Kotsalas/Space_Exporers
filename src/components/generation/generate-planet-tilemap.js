import Phaser from "../../lib/phaser.js";

export function generatePlanetTilemap({
    width = 50,
    height = 40,
    maxTilesToFill = 100,
    maxWalkers = 10,
    objectSpawnChance = 0.05,
    floorTileVariants = [0, 1, 2],
    objectTileVariants = [4, 5, 6],
    uniqueObjectVariants = [],
    uniqueObjectSpawnChance = 0.1
} = {}) {
    const floorMap = Array.from({ length: height}, () => Array(width).fill(-1));
    const objectMap = Array.from({ length: height}, () => Array(width).fill(-1));
    const uniqueObjects = [];

    let walkers = [{
        x: Math.floor(width/2),
        y: Math.floor(height/2),
        life: 100
    }];

    let filledTiles = 0;

    while (walkers.length > 0 && filledTiles < maxTilesToFill) {
        const newWalkers = [];

        for (let i = walkers.length - 1; i >= 0; i--) {
            const walker = walkers[i];

            if (floorMap[walker.y][walker.x] === -1) {
                floorMap[walker.y][walker.x] = Phaser.Math.RND.pick(floorTileVariants);
                filledTiles++;
            }

            const dir = Phaser.Math.RND.pick([
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ]);

            const newX = walker.x + dir.x;
            const newY = walker.y + dir.y;

            if (
                newX < 1 || newX >= width - 1 ||
                newY < 1 || newY >= height - 1
            ) {
                walkers.splice(i, 1);
                continue;
            }

            walker.x = newX;
            walker.y = newY;
            walker.life--;

            if (walker.life <= 0) {
                walkers.splice(i, 1);
                continue
            }

            if (Phaser.Math.Between(0, 100) < 10 && walkers.length < maxWalkers) {
                newWalkers.push({
                    x: walker.x,
                    y: walker.y,
                    life: 100
                });
            }
        }

        walkers.push(...newWalkers);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (floorMap[y][x] >= 0 && Math.random() < objectSpawnChance) {
                objectMap[y][x] = Phaser.Math.RND.pick(objectTileVariants);
            }
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (
                floorMap[y][x] >= 0 &&
                objectMap[y][x] === -1 &&
                Math.random() < uniqueObjectSpawnChance
            ) {
                const pickWeighted = (items) => {
                    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
                    let rand = Phaser.Math.Between(1, totalWeight);
                    for (const item of items) {
                        rand -= item.weight;
                        if (rand <= 0) return item.objectClass;
                    }
                };

                const ObjClass = pickWeighted(uniqueObjectVariants);
                uniqueObjects.push({ x, y, objectClass: ObjClass });
            }
        }
    }

    return {
        floorMap,
        objectMap,
        uniqueObjects
    };
}