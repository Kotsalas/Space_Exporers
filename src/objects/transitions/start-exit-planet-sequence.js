export function StartExitPlanetSequence(scene, options = {}) {
    const {
        fadeDuration = 1000,
        onComplete = () => {},
        lockCamera = true,
        freezePlayer = true
    } = options;

    if (freezePlayer && scene.lucy?.body); {
        scene.lucy.body.setVelocity(0);
        scene.lucy.body.moves = false;
        scene.lucy.setVisible(false);
        scene.exit.sprite.play('planet-exit-open');
    }

    if (lockCamera) {
        scene.cameras.main.stopFollow();
    }

    scene.cameras.main.fadeOut(fadeDuration, 0, 0, 0);

    scene.time.delayedCall(fadeDuration, () => {
        onComplete();
    })
}