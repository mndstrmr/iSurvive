let worldData = {
    clouds: 3,
    sky: [[214, 234, 248], [28, 40, 51]],
    gravity: 0.005,
    player: {
        speed: 0.1,
        jumpSize: 0.1111111111111111
    },
    enemies: [
        { // Zombie
            width: 1, height: 2,
            speed: 0.1,
            jumpSize: 0.111111111111,
            followRadius: 5,
            max: 1,
            chance: 1
        }
    ]
};

// Defaults, in case you mess something up:
/*
    let worldData = {
        clouds: 3,
        sky: [[214, 234, 248], [28, 40, 51]],
        gravity: 0.005,
        player: {
            speed: 0.1,
            jumpSize: 0.1111111111111111
        }
    };
*/