if ((!/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    document.querySelector('.not-chrome').classList.remove('hidden');
    throw new Error('Not chrome');
}

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
keyHandler.on('down:16', () => player.boost());

keyHandler.on('tick:81', () => player.attemptKill(Enemy.loaded));

keyHandler.on('tick:65', () => player.move(-player.speed));
keyHandler.on('tick:68', () => player.move(player.speed));

const ambient = new Audio('assets/music1.m4a');
ambient.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
document.body.appendChild(ambient);
document.addEventListener('keydown', function() {
    if (ambient.paused) ambient.play();
})

const mouseHandler = new Osmium.MouseHandler(window);
mouseHandler.on('tick:0', () => player.attemptKill(Enemy.loaded));

Enemy.init(assets, worldData);
game.appendThread(new Osmium.Thread(async function(timeElapsed) {
    world.update();
    keyHandler.tick();
    mouseHandler.tick();

    const primary = new Osmium.Vector(player.position.x - (game.width / 2), player.position.y);
    const secondary = new Osmium.Vector(-primary.x, -primary.y + player.element.position.y);

    Enemy.update(player, worldSize, blockSize, game, physicsEngine, secondary, worldData.difficulty);

    (async function() {
        world.updateChunksAround(primary, secondary, blockSize);
    })();

    (async function() {
        physicsEngine.update(timeElapsed, true);
    })();
}, 0), false);

game.startLoop(() => {});