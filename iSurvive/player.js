class Player {
    constructor() {
        if (assets.player.path != null) {
            this.element = new Osmium.CTXElement.Image(
                new Osmium.Image(assets.player.path),
                null, null,
                new Osmium.Vector(blockSize * window.devicePixelRatio, blockSize * 2 * window.devicePixelRatio)
            );
        } else {
            this.element = new Osmium.CTXElement.Simple.Rectangle(blockSize * window.devicePixelRatio, blockSize * 2 * window.devicePixelRatio);
            this.element.fill.color = assets.player.revert;
        }

        this.element.position.set(
            game.width * 0.5,
            game.height * 0.7
        );

        game.add(this.element);

        this.position = new Osmium.Vector(0, -100);

        this.physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement({
            position: this.position,
            rotation: 0
        }, new Osmium.Polygon([
            new Osmium.Vector(0, 0),
            new Osmium.Vector(0, blockSize * 2),
            new Osmium.Vector(blockSize, blockSize * 2),
            new Osmium.Vector(blockSize, 0)
        ]));

        physicsEngine.add(this.physicsElement);

        this.speed = blockSize / 4;
        this.jumpSize = blockSize / 3;
    }

    move(direction) {
        if (this.physicsElement.canMoveBy({x: direction, y: 0}, physicsEngine.physicsElements))
            this.position.x += direction;
    }

    jump() {
        if (this.physicsElement.isGrounded) this.physicsElement.velocity.y -= this.jumpSize;
    }

    getDeath() {
        if (this.element.position.y > game.height) {
            document.querySelector('.death .message').innerHTML = 'You fell into the eternal void and died a relatively quick and painless death.';
            document.querySelector('.death').classList.remove('hidden');

            game.cancelLoop();
        }
    }
}