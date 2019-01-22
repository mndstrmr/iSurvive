class Chunk {
    constructor(position) {
        this.position = position;

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
Chunk.seedName = window.location.hash == ''? 15:window.location.href.split('#')[1].split('?')[0];
Chunk.seed = Chunk.seedName == '15'? 0.000005317031307436771:Math.sin(Chunk.seedName * 2821123.129183);
Chunk.width = 40;
Chunk.noise = new Osmium.Utils.SimplexNoise(Chunk.seed);

class World {
    constructor(game, physicsEngine, sun, moon, sky) {
        this.game = game;
        this.physicsEngine = physicsEngine;
        this.chunks = [];

        this.clouds = [];

        this.sun = this.createPlanet(sun, 200);
        this.moon = this.createPlanet(moon, 100);

        this.tick = 25000;
        this.speed = 10000;

        this.loadRadius = 5;

        this.layers = [];

        this.initLayers();

        if (Chunk.test) game.add(Chunk.testGroup);

        this.end = Osmium.Color.fromArray(sky[0]);
        this.start = Osmium.Color.fromArray(sky[1]);
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
                img.renderPosition = -i;
                
                this.layers.push(img);
            } else {
                console.log('%cAlso, this ⬆ net::ERR_FILE_NOT_FOUND error is totally normal, it should be there', 'color: rgb(41, 128, 185); font-family: \'Work Sans\', Futura, sans-serif; font-size: 150%;');
                break;
            };
        }

        for (let i = this.layers.length - 1; i >= 0; i--) game.add(this.layers[i]);
    }

    async update() {
        this.tick += 1;
        const sin = Math.sin(this.tick / this.speed);
        const time = (sin + 1) / 2;
        const day = Math.cos(this.tick / this.speed) < 0;

        this.game.background = this.start.merge(this.end, time);
        
        if (day) this.moon.hide();
        else this.sun.hide();
        
        const planet = day? this.sun:this.moon;
        planet.show();
        planet.position.y = (time * (this.game.height + planet.height)) - planet.height;
    }

    createPlanet(data, size) {
        const width = size * window.devicePixelRatio;

        let planet = new Osmium.CTXElement.Image(
            new Osmium.Image(data.path),
            null, null,
            new Osmium.Vector(width, width)
        );
        planet.width = planet.height = width;
        planet.position.set(this.game.width * 0.75, this.game.height + (planet.height / 2));
        planet.renderPosition = -Infinity;

        this.game.add(planet);

        return planet;
    }

    chunkAt(position) {
        for (const chunk of this.chunks) {
            if (chunk.position == position) return chunk;
        }

        return null;
    }

    updateChunksAround(vector, translation, blockSize) {
        const chunkPosition = Math.round((vector.x / blockSize) / Chunk.width);

        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            layer.position = translation.multiplyScalar(0.6 ** i).add({x: 0, y: 50 * i});
        }

        if (Chunk.test) Chunk.testGroup.position = translation;

        for (const chunk of this.chunks) chunk.setActive(false);

        for (let x = -this.loadRadius; x < this.loadRadius; x++) {
            const position = chunkPosition + x;

            let chunk = this.chunkAt(position) || (() => {
                const temporary = new Chunk(position);
                temporary.generateBlocks(this.physicsEngine, blockSize);
                this.chunks.push(temporary);

                return temporary;
            }).call(this);

            chunk.setActive(true);
        }
    }
}
