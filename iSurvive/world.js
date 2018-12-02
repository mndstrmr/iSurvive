class Chunk {
    constructor(position, biome) {
        this.position = position;
        this.biomeID = biome;

        this.physicsElements = [];
    }

    setActive(active) {
        for (const element of this.physicsElements) element.active = active;
    }

    getHeightAt(xPosition) {
        return Chunk.noise.getVal(xPosition * 0.09);
    }

    generateBlocks(physicsEngine, blockSize) {
        for (let x = 0; x < Chunk.width; x++) {
            const offsetPosition = new Osmium.Vector(x + (this.position * Chunk.width), 21);
            offsetPosition.y += this.getHeightAt(offsetPosition.x) * 10;

            const physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement({
                position: new Osmium.Vector(offsetPosition.x, offsetPosition.y).round().multiplyScalar(blockSize),
                rotation: 0
            }, new Osmium.Polygon([
                new Osmium.Vector(0, 0),
                new Osmium.Vector(0, blockSize),
                new Osmium.Vector(blockSize, blockSize),
                new Osmium.Vector(blockSize, 0)
            ]).scale(1), {density: 0});
            physicsEngine.add(physicsElement);
            this.physicsElements.push(physicsElement);

            if (Chunk.test) {
                Chunk.testGroup.add(physicsElement.getTest(true));
            }
        }
    }
}

String.prototype.hashCode = function() {
    if (this.match(/^[0-9\.]+$/) != null) return parseFloat(this);
    
    let result = 0;
    for (let i = 0; i < this.length; i++)
        result += this.charCodeAt(i) * (10 ** i);

    return result;
}

Chunk.test = window.location.href.indexOf('show') != -1;
Chunk.testGroup = Chunk.test == false? null:new Osmium.CTXElement.Group();
Chunk.seedName = window.location.hash == ''? 15:window.location.hash.slice(1);
Chunk.seed = (Chunk.seedName / 2821123.129183) % 1;
Chunk.width = 40;
Chunk.noise = new Osmium.Utils.SimplexNoise(Chunk.seed);

class World {
    constructor(game, physicsEngine, sun, moon, blockSize) {
        this.game = game;
        this.physicsEngine = physicsEngine;
        this.chunks = [];

        this.clouds = [];

        this.sun = this.createPlanet(sun, 200);
        this.moon = this.createPlanet(moon, 100);

        this.tick = 2500;
        this.speed = 1000;

        this.loadRadius = 5;

        this.layers = [];

        this.initLayers();

        if (Chunk.test) game.add(Chunk.testGroup);
    }

    async initLayers() {
        for (let i = 0; true; i++) {
            const image = new Osmium.Image('assets/' + Chunk.seedName + '_' + i + '.png');
            await image.getPromise();

            if (!image.isError()) {
                const img = new Osmium.CTXElement.Image(image);

                const ratio = (window.innerHeight * window.devicePixelRatio * 1.5) / image.getHeight();
                img.size = new Osmium.Vector(ratio * image.getWidth(), ratio * image.getHeight());

                img.offset.x -= img.size.x * 0.5;
                
                this.layers.push(img);
            } else break;
        }

        for (let i = this.layers.length - 1; i >= 0; i--) game.add(this.layers[i]);
    }

    async update() {
        this.tick += 1;
        const sin = Math.sin(this.tick / this.speed);
        const time = (sin + 1) / 2;
        const day = Math.cos(this.tick / this.speed) < 0;

        (async () => {
            const end = new Osmium.Color(214, 234, 248);
            const start = new Osmium.Color(28, 40, 51);
            this.game.background = start.merge(end, time);
        })();

        if (day) {
            this.sun.position.y = (((-this.sun.height / 2) + (this.game.height + (this.sun.height * 1.5))) * time) - (this.sun.height / 2);
            this.moon.hide(); this.sun.show();
        } else {
            this.moon.position.y = (((-this.moon.height / 2) + (this.game.height + (this.moon.height * 1.5))) * time) - (this.moon.height / 2);
            this.sun.hide(); this.moon.show();
        }
    }

    createPlanet(data, size) {
        let planet;

        const width = size * window.devicePixelRatio;

        if (data.path != null) {
            planet = new Osmium.CTXElement.Image(
                new Osmium.Image(data.path),
                null, null,
                new Osmium.Vector(width, width)
            );

            planet.width = planet.height = width;
        } else {
            planet = new Osmium.CTXElement.Simple.Rectangle(width, width, 0.5);

            planet.fill.color = data.revert;
            planet.stroke.color = planet.fill.color;
            planet.stroke.enabled = true;
        }

        planet.position.set(
            this.game.width * 0.75, this.game.height + (planet.height / 2)
        );

        this.game.add(planet);

        return planet;
    }

    chunkAt(position) {
        for (const chunk of this.chunks) {
            if (chunk.position == position) return chunk;
        }

        return null;
    }

    updateChunksAround(vector, graphicalOffset, blockSize, biomes) {
        const chunkPosition = Math.round(((vector.x - graphicalOffset.x) / blockSize) / Chunk.width);

        const translation = new Osmium.Vector(-vector.x, -vector.y + (game.height * 0.7));

        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            layer.position = translation.multiplyScalar(0.6 ** i).add({x: 0, y: 50 * i});
        }

        if (Chunk.test) Chunk.testGroup.position = translation;

        for (const chunk of this.chunks) chunk.setActive(false);
        for (let x = -this.loadRadius; x < this.loadRadius; x++) {
            const position = chunkPosition + x;

            let chunk = this.chunkAt(position) || (() => {
                const temporary = new Chunk(position, Osmium.Random.choice(biomes));
                temporary.generateBlocks(this.physicsEngine, blockSize);
                this.chunks.push(temporary);

                return temporary;
            }).call(this);

            chunk.setActive(true);
        }
    }
}
World.width = 53;