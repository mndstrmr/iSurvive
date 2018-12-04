class Enemy {
    constructor(game, blockSize, data, x, close, physicsEngine, name) {
        this.element = new Osmium.CTXElement.Image(
            data.image,
            null, null,
            new Osmium.Vector(blockSize * window.devicePixelRatio * data.width, blockSize * data.height * window.devicePixelRatio)
        );

        this.element.position.set(x * blockSize, 0);
        this.element.renderPosition = 1;
        game.add(this.element);

        this.position = this.element.position.clone();
        this.physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement({
            position: this.position,
            rotation: 0
        }, new Osmium.Polygon([
            new Osmium.Vector(0, 0),
            new Osmium.Vector(0, blockSize * data.height),
            new Osmium.Vector(blockSize * data.width, blockSize * data.height),
            new Osmium.Vector(blockSize * data.width, 0)
        ]));

        physicsEngine.add(this.physicsElement);

        this.speed = blockSize * data.speed;
        this.jumpSize = blockSize * data.jumpSize;

        this.inventory = [];
        this.followRadius = data.followRadius;
        Enemy.loaded.push(this);
        this.close = close;
        this.name = name;

        Enemy.group.add(this.element);
    }

    update(player, offset) {
        const distance = player.position.distanceTo(this.position) / blockSize;
        const close = distance < this.followRadius;

        if (Math.abs(distance - this.followRadius) > 0.5) { 
            let direction = 1 - (this.physicsElement.isGrounded * 0.09);
            direction *= this.position.x > player.position.x? -1:1;
            direction *= close? -1:1;

            if (this.physicsElement.canMoveBy({x: direction, y: 0}, physicsEngine.physicsElements)) {
                this.element.position.x += direction;
                this.position.x += direction;
            } else if (this.physicsElement.isGrounded) {
                this.physicsElement.velocity.y -= this.jumpSize;
            }
        } else this.close();

        this.element.position.y = this.position.y + offset.y;
        this.element.position.x = this.position.x + offset.x;
    }

    kill(player) {
        Enemy.loaded.splice(Enemy.loaded.indexOf(this), 1);
        player.inventory.push(Osmium.Random.choice(this.inventory));
        this.element.requestDelete();
    }
}
Enemy.group = new Osmium.CTXElement.Group();
Enemy.loaded = [];

Enemy.update = function(player, worldSize, blockSize, game, physicsEngine, offset) {
    for (const enemy of Enemy.loaded) {
        enemy.update(player, offset);
    }

    for (const type of Enemy.types) {
        if (type.shouldGenerate()) type.generate(worldSize, blockSize, game, physicsEngine);
    }
}

Enemy.EnemyType = class {
    shouldGenerate() {}
    generate(worldSize, blockSize, game, physicsEngine) {}
}

Enemy.types = [
    class extends Enemy.EnemyType { // Zombie
        constructor(assets, data) {
            super();

            this.data = data.enemies[0];
            this.data.image = new Osmium.Image(assets.enemies.zombie.path); 
        }

        shouldGenerate() {
            let count = 0;

            for (const enemy of Enemy.loaded) {
                if (enemy.name == 'zombie') count++;
            }

            if (count < this.data.max) return Math.random() <= this.data.chance;
        }

        generate(worldSize, blockSize, game, physicsEngine) {
            return new Enemy(game, blockSize, this.data, parseInt(Math.random() * worldSize.width), function() {}, physicsEngine, 'zombie');
        }
    }   
]

Enemy.types.init = function(assets, data) {
    for (let i = 0; i < Enemy.types.length; i++)
        Enemy.types[i] = new (Enemy.types[i])(assets, data);
}