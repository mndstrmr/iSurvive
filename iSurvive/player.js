class Player {
    constructor(game, blockSize, playerData, speedInfo) {
        this.element = new Osmium.CTXElement.Image(
            new Osmium.Image(playerData.path),
            null, null,
            new Osmium.Vector(blockSize * window.devicePixelRatio, blockSize * 2 * window.devicePixelRatio)
        );

        this.element.position.set(
            game.width * 0.5,
            game.height * 0.7
        );

        game.add(this.element);

        this.position = new Osmium.Vector(0, 0);
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

        this.speed = blockSize * speedInfo.speed;
        this.jumpSize = blockSize * speedInfo.jumpSize;

        this.element.renderPosition = Infinity;

        this.inventory = [];
    }

    move(direction) {
        direction *= 1 - (this.physicsElement.isGrounded * 0.09);

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