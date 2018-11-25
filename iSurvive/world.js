class Chunk {
    constructor(position, biome) {
        this.position = position;
        this.biomeID = biome;
        console.log(this.biomeID)

        this.group = new Osmium.CTXElement.Group();
        this.physicsElements = [];
    }

    setActive(active) {
        for (const element of this.physicsElements) element.active = active;
    }

    getHeightAt(xPosition) {
        return Chunk.noise.getVal(xPosition * 0.09) * 10;
    }

    getBlockData(block) {
        return block.biomes[this.biomeID] || block.biomes.default;
    }

    getLayers(blockTypes) {
        const layers = [];

        for (const type of blockTypes) {
            const size = this.getBlockData(type).thickness;
            for (let i = 0; i < size; i++) layers.push(type);
        }

        return layers;
    }

    generateBlocks(grid, physicsEngine, blockSize, blockTypes) {
        const pixelSize = blockSize * window.devicePixelRatio;
        const layers = this.getLayers(blockTypes);

        const relativeY = this.position.y * Chunk.height;

        for (let x = 0; x < Chunk.width; x++) {
            const offsetPosition = new Osmium.Vector(x + (this.position.x * Chunk.width), relativeY);
            offsetPosition.y += this.getHeightAt(offsetPosition.x);

            for (let y = 0; y < Chunk.height; y++) {
                const layer = Math.min(relativeY + y, layers.length - 1);
                const blockType = layers[layer];
                if (blockType == null) continue;
                const blockData = this.getBlockData(blockType);

                const thisOffset = new Osmium.Vector(offsetPosition.x, offsetPosition.y + y).round();

                const graphicPosition = thisOffset.multiplyScalar(blockSize);

                let block;
                if (blockData.path != null) {
                    block = new Osmium.CTXElement.Image(
                        new Osmium.Image(blockData.path),
                        null, null,
                        new Osmium.Vector(pixelSize, pixelSize)
                    );
                } else {
                    block = new Osmium.CTXElement.Simple.Rectangle(pixelSize, pixelSize);

                    block.fill.color = blockData.revert.randomise(10);
                    block.stroke.match(block.fill);
                }

                block.position.set(graphicPosition);

                if (layer == 0) {
                    const physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement(block, block.getPolygon().scale(1 / window.devicePixelRatio), {density: 0});
                    physicsEngine.add(physicsElement);
                    this.physicsElements.push(physicsElement)
                }

                grid.set(thisOffset.x, thisOffset.y, block);
                this.group.add(block);
            }
        }
    }
}
Chunk.width = 40;
Chunk.height = 10;
Chunk.noise = new Osmium.Utils.SimplexNoise();

class World {
    constructor(grid, game, physicsEngine, sun, moon) {
        this.grid = grid;
        this.game = game;
        this.physicsEngine = physicsEngine;
        this.chunks = [];

        this.clouds = [];

        this.sun = this.createPlanet(sun, 200);
        this.moon = this.createPlanet(moon, 100);

        this.tick = 2500;
        this.speed = 1000;

        this.loadRadius = new Osmium.Vector(3, 0.5);
    }

    async update() {
        this.tick += 1;
        const sin = Math.sin(this.tick / this.speed);
        const time = (sin + 1) / 2;
        const day = Math.cos(this.tick / this.speed) < 0;

        (async () => {
            const end = new Osmium.Color(214, 234, 248);
            const start = new Osmium.Color(28, 40, 51);
            this.game.setBackground(start.merge(end, time));
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
            if (chunk.position.equals(position)) return chunk;
        }

        return null;
    }

    updateChunksAround(vector, graphicalOffset, blockTypes, blockSize, biomes) {
        const chunkPosition = new Osmium.Vector(((vector.x - graphicalOffset.x) / blockSize) / Chunk.width, ((vector.y - graphicalOffset.x) / blockSize) / Chunk.height).round();

        for (const chunk of this.chunks) {
            chunk.group.hide();

            chunk.group.position.set(-vector.x + graphicalOffset.x, -vector.y + graphicalOffset.y);
        }

        for (let x = -this.loadRadius.x; x < this.loadRadius.x; x++) {
            for (let y = -this.loadRadius.y; y < this.loadRadius.y; y++) {
                const position = new Osmium.Vector(chunkPosition.x + x, chunkPosition.y + y);

                let chunk = this.chunkAt(position) || (() => {
                    const temporary = new Chunk(position, Osmium.Random.choice(biomes));
                    game.add(temporary.group);
                    temporary.generateBlocks(this.grid, this.physicsEngine, blockSize, blockTypes);

                    this.chunks.push(temporary);

                    return temporary;
                }).call(this);

                chunk.group.show();
                chunk.setActive(true);
            }
        }
    }
}