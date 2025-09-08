import { FieldsBox } from "../../src/objects/decorations-objects/fields-box.js";
import { FieldsCampfire } from "../../src/objects/decorations-objects/fields-campfire.js";
import { FieldsTree } from "../../src/objects/decorations-objects/fields-tree.js";

export const PlanetTilesets = {
  fieldsPlanet: {
    tilesetKey: 'fields-planet-tileset', // used when adding the tileset image to the tilemap
    floorTileVariants: [10, 17, 18, 19, 26],
    objectTileVariants: [64, 65, 66, 67, 68, 69, 70, 71],
    objectsWithCollide: [64, 65, 66, 67],
    uniqueObjectVariants: [
      { objectClass: FieldsTree, weight: 80 },
      { objectClass: FieldsBox, weight: 15 },
      { objectClass: FieldsCampfire, weight: 5 }
    ],
    voidTileIndex: 63,
    crystals: ['green']
  },
  // Add more planets here...
};