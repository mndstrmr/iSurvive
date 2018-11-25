const blockSize = Math.min(window.innerWidth, window.innerHeight) / 30;
let worldSize = new Osmium.Vector(window.innerWidth, window.innerHeight).divideScalar(blockSize);

const grid = new Osmium.Utils.Grid(worldSize.width + 1, worldSize.height + 1);
const game = new Osmium.WebGame2D(worldSize.width * blockSize, worldSize.height * blockSize, document.body);
const physicsEngine = new Osmium.Utils.PhysicsEngine.Engine(0.005);

const world = new World(grid, game, physicsEngine, assets.planets.sun, assets.planets.moon);

const cloudHandler = new CloudHandler(game, grid, assets.cloud);
cloudHandler.genClouds(5, blockSize);

const player = new Player();

const keyHandler = new Osmium.KeyHandler(window);
keyHandler.on('down:32', () => player.jump());
keyHandler.on('tick:65', () => player.move(-player.speed));
keyHandler.on('tick:68', () => player.move(player.speed));

window.addEventListener('resize', function() {
    worldSize = new Osmium.Vector(window.innerWidth, window.innerHeight).divideScalar(blockSize);
    world.loadRadius.set(parseInt((worldSize.x / Chunk.width) * 2.5), parseInt(worldSize.y / Chunk.height));
});

world.loadRadius.set(parseInt((worldSize.x / Chunk.width) * 2.5), parseInt(worldSize.y / Chunk.height));

game.appendThread(new Osmium.Thread(async function(timeElapsed) {
    world.update();
    keyHandler.tick();
    player.getDeath();

    (async function() {
        world.updateChunksAround(new Osmium.Vector(player.position.x - (game.width / 2), player.position.y), new Osmium.Vector(0, player.element.position.y), assets.blockTypes, blockSize, assets.biomes);
    })();

    (async function() {
        physicsEngine.update(timeElapsed);
    })();
}, 0), false);

game.startLoop(() => {});