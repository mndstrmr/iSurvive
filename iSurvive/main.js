const blockSize = window.innerHeight / 30;
let worldSize = new Osmium.Vector(window.innerWidth, window.innerHeight).divideScalar(blockSize);

const game = new Osmium.WebGame2D(worldSize.width * blockSize, worldSize.height * blockSize, document.body);
const physicsEngine = new Osmium.Utils.PhysicsEngine.Engine(worldData.gravity);

const world = new World(game, physicsEngine, assets.planets.sun, assets.planets.moon, worldData.sky);

if (worldData.clouds != 0) {
    const cloudHandler = new CloudHandler(game, assets.cloud);
    cloudHandler.genClouds(worldData.clouds, blockSize);
}

const player = new Player(game, blockSize, assets.player, worldData.player);

const keyHandler = new Osmium.KeyHandler(window);
keyHandler.on('down:32', () => player.jump());
keyHandler.on('tick:65', () => player.move(-player.speed));
keyHandler.on('tick:68', () => player.move(player.speed));

game.appendThread(new Osmium.Thread(async function(timeElapsed) {
    world.update();
    keyHandler.tick();
    player.getDeath();

    (async function() {
        world.updateChunksAround(new Osmium.Vector(player.position.x - (game.width / 2), player.position.y), new Osmium.Vector(0, player.element.position.y), blockSize);
    })();

    (async function() {
        physicsEngine.update(timeElapsed);
    })();
}, 0), false);

game.startLoop(() => {});