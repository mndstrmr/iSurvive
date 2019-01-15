console.log('%cWARNING', 'color: red; font-family: \'Work Sans\', Futura, sans-serif; font-size: 500%;');
console.log('%cMake sure you make a backup of the game before you change anything in here', 'color: rgb(41, 128, 185); font-family: \'Work Sans\', Futura, sans-serif; font-size: 150%;');
console.log('');

if ((!/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    document.querySelector('.not-chrome').classList.remove('hidden');
    document.querySelector('.before').classList.add('hidden');
    throw new Error('Not chrome');
}

let game, physicsEngine, player, blockSize;
const keyHandler = new Osmium.KeyHandler(window);

keyHandler.on('down:13', () => {
    if (game == null) {
        document.querySelector('.before .button').click();
    } else if (!game.mainThread.isAlive()) {
        document.querySelector('.death .button').click();
    }
});

function load() {
    blockSize = window.innerHeight / 30;
    let worldSize = new Osmium.Vector(window.innerWidth, window.innerHeight).divideScalar(blockSize);

    game = new Osmium.WebGame2D(worldSize.width * blockSize, worldSize.height * blockSize, document.body);
    physicsEngine = new Osmium.Utils.PhysicsEngine.Engine(worldData.gravity);

    const world = new World(game, physicsEngine, assets.planets.sun, assets.planets.moon, worldData.sky);

    if (worldData.clouds != 0) {
        const cloudHandler = new CloudHandler(game, assets.cloud);
        cloudHandler.genClouds(worldData.clouds, blockSize);
    }

    player = new Player(game, blockSize, assets.player, worldData.player, () => {
        keyHandler.on('down:32', () => player.jump());
        keyHandler.on('down:16', () => player.boost());

        keyHandler.on('down:81', () => player.attemptKill(Enemy.loaded));

        keyHandler.on('tick:65', () => player.move(-player.speed));
        keyHandler.on('tick:68', () => player.move(player.speed));

        const ambient = new Audio('assets/music1.m4a');
        ambient.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        document.body.appendChild(ambient);
        ambient.play();

        const mouseHandler = new Osmium.MouseHandler(window);

        let last = Date.now();
        mouseHandler.on('down:0', () => {
            if (Date.now() - last > 150) {
                player.attemptKill(Enemy.loaded)
                last = Date.now();
            }
        });

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

        document.querySelector('.before').classList.add('hidden');
    });
}