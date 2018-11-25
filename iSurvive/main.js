const blockSize = Math.min(window.innerWidth, window.innerHeight) / 30;
let worldSize = new Osmium.Vector(window.innerWidth, window.innerHeight).divideScalar(blockSize);

const grid = new Osmium.Utils.Grid(worldSize.width + 1, worldSize.height + 1);
const game = new Osmium.WebGame2D(worldSize.width * blockSize, worldSize.height * blockSize, document.body);
const physicsEngine = new Osmium.Utils.PhysicsEngine.Engine(0.005);

const world = new World(grid, Math.random(), game, physicsEngine, assets.planets.sun, assets.planets.moon);

const cloudHandler = new CloudHandler(game, grid, assets.cloud);
cloudHandler.genClouds(5, blockSize);

class Player {
    constructor() {
        if (assets.player.path != null) {
            this.element = new Osmium.CTXElement.Image(
                new Osmium.Image(assets.player.path),
                null, null,
                new Osmium.Vector(blockSize * window.devicePixelRatio, blockSize * 2 * window.devicePixelRatio)
            );
        } else {
            this.element = new Osmium.CTXElement.Simple.Rectangle(blockSize * window.devicePixelRatio, blockSize * 2 * window.devicePixelRatio);
            this.element.fill.color = assets.player.revert;
        }

        this.element.position.set(
            game.width * 0.5,
            game.height * 0.7
        );

        game.add(this.element);

        this.position = new Osmium.Vector(0, -100);

        this.physicsElement = new Osmium.Utils.PhysicsEngine.PhysicsElement({
            position: this.position,
            rotation: 0
        }, new Osmium.Polygon([
            new Osmium.Vector(0, 0),
            new Osmium.Vector(0, blockSize * 2),
            new Osmium.Vector(blockSize, blockSize * 2),
            new Osmium.Vector(blockSize, 0)
        ]));

        physicsEngine.add(this.physicsElement);

        this.speed = blockSize / 4;
        this.jumpSize = blockSize / 4;
    }

    move(direction) {
        if (this.physicsElement.canMoveBy({x: direction, y: 0}, physicsEngine.physicsElements))
            this.position.x += direction;
    }

    jump() {
        if (this.physicsElement.isGrounded) this.physicsElement.velocity.y -= this.jumpSize;
    }

    getDeath() {
        if (this.element.position.y > game.height) {
            document.querySelector('.death .message').innerHTML = 'You fell into the eternal void and died a relatively quick and painless death.';
            document.querySelector('.death').classList.remove('hidden');

            game.cancelLoop();
        }
        // } else if (this.element.position.x < 0 || this.element.position.x > game.width) {
        //     const deaths = ['eaten by wolves', 'terminated', 'deleted from the matrix to conserve processing power', 'cut into peices', 'slimed', 'pecked to death'];

        //     document.querySelector('.death .message').innerHTML = 'You wandered into the great unknown and were soon ' + deaths[parseInt(Math.random() * deaths.length)] + '.';
        //     document.querySelector('.death').classList.remove('hidden');

        //     game.cancelLoop();
        // }
    }
}
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
        world.updateChunksAround(new Osmium.Vector(player.position.x - (game.width / 2), player.position.y), new Osmium.Vector(0, player.element.position.y), assets.blockTypes, blockSize);
    })();

    (async function() {
        physicsEngine.update(timeElapsed);
    })();
}, 0), false);

game.startLoop(() => {});