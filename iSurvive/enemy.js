class Enemy {
    constructor(game, blockSize, data, x, close, physicsEngine, name) {
        this.element = new Osmium.CTXElement.Group();

        this.element.position.set(x * blockSize, 0);
        this.image = new Osmium.CTXElement.Image(
            data.image,
            null, null,
            new Osmium.Vector(blockSize * window.devicePixelRatio * data.width, blockSize * data.height * window.devicePixelRatio)
        );
        this.element.add(this.image);
        this.element.renderPosition = 2;

        this.position = this.element.position.clone();
        this.physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement({
            position: this.position,
            rotation: 0
        }, new Osmium.Polygon([
            new Osmium.Vector(0, 0),
            new Osmium.Vector(0, blockSize * data.height),
            new Osmium.Vector(blockSize * data.width, blockSize * data.height),
            new Osmium.Vector(blockSize * data.width, 0)
        ]), {}, (element) => {
            return !element.isEnemy;
        });
        this.physicsElement.isEnemy = true;

        physicsEngine.add(this.physicsElement);

        this.speed = blockSize * data.speed;
        this.jumpSize = blockSize * data.jumpSize;

        this.inventory = [];
        this.followRadius = data.followRadius;
        Enemy.loaded.push(this);
        this.close = close;
        this.name = name;
        this.dead = false;

        this.data = data;
        this.physicsEngine = physicsEngine;

        this.element.hide();
        game.add(this.element);
    }

    update(player, offset) {
        if (!this.dead && window.location.href.indexOf('nodeath') == -1) {
            const distance = player.position.distanceTo(this.position) / blockSize;
            const close = distance < this.followRadius;

            if (Math.abs(distance - this.followRadius) > 0.5) { 
                let direction = 1 - (this.physicsElement.isGrounded * 0.09);
                direction *= this.position.x > player.position.x? -1:1;
                direction *= close? -1:1;

                if (this.physicsElement.canMoveBy({x: direction, y: 0}, physicsEngine.physicsElements)) {
                    this.physicsElement.velocity.x += direction * 0.05;
                } else if (this.physicsElement.isGrounded) {
                    this.physicsElement.velocity.y -= this.jumpSize;
                }

                if (this.position.x < player.position.x) {
                    this.image.scale.x = 1;
                    this.image.offset.x = 0;
                } else {
                    this.image.scale.x = -1;
                    this.image.offset.x = -this.image.size.x;
                }
            }

            if (this.physicsElement.getFullHitbox().intersects(player.physicsElement.getFullHitbox())) {
                this.close(player);
            }
        }

        this.element.position.y = this.position.y + offset.y;
        this.element.position.x = this.position.x + offset.x;
        this.element.show();
    }

    kill(player) {
        if (this.dead) return;

        player.inventory.push(Osmium.Random.choice(this.inventory));
        this.element.elements.splice(0, 1);
        this.dead = true;
        this.physicsElement.active = false;

        const smallSize = 5;

        for (let x = 0; x < this.data.width * smallSize; x++) {
            for (let y = 0; y < this.data.height * smallSize; y++) {
                if (Math.random() >= 0.8) {
                    const pixel = new Osmium.CTXElement.Simple.Rectangle((blockSize / smallSize) * window.devicePixelRatio, (blockSize / smallSize) * window.devicePixelRatio);
                    pixel.position.set((blockSize / smallSize) * x, (blockSize / smallSize) * y);
                    pixel.fill.color = Osmium.Color.fromArray(this.data.theme).randomise(30);
                    pixel.stroke.match(pixel.fill);
                    this.element.add(pixel);

                    const physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement(
                        pixel,
                        pixel.getPolygon().scale(1 / window.devicePixelRatio),
                        {
                            density: (Math.random() + 0.5) / 2
                        },
                        (element) => false
                    );                    
                    physicsElement.velocity.y = this.physicsElement.velocity.y * (player.range * 0.001);
                    physicsElement.velocity.x = this.physicsElement.velocity.x * (player.range * 0.05);
                    this.physicsEngine.add(physicsElement);

                    pixel.physicsElement = physicsElement;
                }
            }
        }

        setTimeout(() => {
            this.element.requestDelete();
            Enemy.loaded.splice(Enemy.loaded.indexOf(this), 1);
            
            for (const element of this.element.elements) {
                this.physicsEngine.physicsElements.splice(this.physicsEngine.physicsElements.indexOf(element.physicsElement), 1);
            }

            this.physicsEngine.physicsElements.splice(this.physicsEngine.physicsElements.indexOf(this.physicsElement), 1);
        }, 3000);
    }
}
Enemy.loaded = [];

Enemy.update = function(player, worldSize, blockSize, game, physicsEngine, offset, difficulty) {
    for (const enemy of Enemy.loaded) {
        enemy.update(player, offset);
    }

    for (const type of Enemy.types) {
        if (Math.random() < difficulty && type.shouldGenerate()) type.generate(worldSize, blockSize, game, physicsEngine);
    }
}

Enemy.EnemyType = class {
    shouldGenerate() {}
    generate(worldSize, blockSize, game, physicsEngine) {}
}

function simpleEnemyType(name, close) {
    return class extends Enemy.EnemyType {
        constructor(assets, data) {
            super();

            this.data = data.enemies[name];
            this.data.image = new Osmium.Image(assets.enemies[name].path); 
        }

        shouldGenerate() {
            let count = 0;

            for (const enemy of Enemy.loaded) {
                if (enemy.name == name) count++;
            }

            if (count < this.data.max) return Math.random() <= this.data.chance;
        }

        generate(worldSize, blockSize, game, physicsEngine) {
            return new Enemy(game, blockSize, this.data, (parseInt(Math.random() * worldSize.width) - (worldSize.width / 2)) + (player.position.x / blockSize), close || (() => {}), physicsEngine, name);
        }
    }
}

Enemy.types = [];

Enemy.init = function(assets, data) {
    for (let i = 0; i < Object.keys(data.enemies).length; i++) {
        const key = Object.keys(data.enemies)[i];

        Enemy.types[i] = new (simpleEnemyType(key, (player) => {
            player.kill(data.enemies[key].message);
        }))(assets, data);
    }
}