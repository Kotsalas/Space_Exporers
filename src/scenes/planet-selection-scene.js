import Phaser from '../lib/phaser.js';

export class PlanetSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlanetSelectionScene' });
  };

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
  };

  create() {
    // this.add.text(...) for simple clickable text buttons
    // this.add.image(...) for sprite buttons

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const returnButton = this.add.text(centerX, centerY, 'Return to spaceship', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333',
        padding: {x: 10, y: 5},
        align: 'center'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    const samePlanetButton = this.add.text(centerX, centerY - 40, 'Go to the old planet', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333',
        padding: {x: 10, y: 5},
        align: 'center'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    const newPlanetButton = this.add.text(centerX, centerY + 40, 'Go to a new planet', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 },
        align: 'center'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // Handle clicks
    returnButton.on('pointerdown', () => {
        this.scene.start('SpaceshipScene');
    });

    samePlanetButton.on('pointerdown', () => {
        this.scene.start('PlanetScene', {
            generateNew: false
        });
    });

    newPlanetButton.on('pointerdown', () => {
        this.scene.start('PlanetScene', {
            generateNew: true
        });
    });

    // Optional: add hover feedback
    // [returnButton, nextButton].forEach(button => {
    //     button.on('pointerover', () => button.setStyle({ backgroundColor: '#555' }));
    //     button.on('pointerout', () => button.setStyle({ backgroundColor: '#333' }));
    // });
  }
}