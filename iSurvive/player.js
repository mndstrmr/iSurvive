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
        ]), {}, (element) => {
            return !element.isEnemy;
        });

        physicsEngine.add(this.physicsElement);

        this.speed = blockSize * speedInfo.speed;
        this.jumpSize = blockSize * speedInfo.jumpSize;
        this.range = blockSize * speedInfo.range;

        this.element.renderPosition = Infinity;

        this.inventory = [];
    }

    move(direction) {
        direction *= 1 - (this.physicsElement.isGrounded * 0.09);
        this.physicsElement.velocity.x += direction * 0.05;

        if (direction > 0) {
            this.element.scale.x = 1;
            this.element.offset.x = 0;
        } else {
            this.element.scale.x = -1;
            this.element.offset.x = -this.element.size.x;
        }        
    }

    jump() {
        if (this.physicsElement.isGrounded) this.physicsElement.velocity.y -= this.jumpSize;
    }

    kill(message) {
        document.querySelector('.death .message').innerHTML = message;
        document.querySelector('.death').classList.remove('hidden');

        game.cancelLoop();
    }

    attemptKill(enemies) {
        for (const enemy of enemies) {
            if (enemy.position.distanceTo(this.position) <= this.range) {
                enemy.kill(this);
            }
        }
    }
}