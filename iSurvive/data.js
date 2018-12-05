/*
                                     .__                    
__  _  __ _____    _______    ____   |__|   ____      ____  
\ \/ \/ / \__  \   \_  __ \  /    \  |  |  /    \    / ___\ 
 \     /   / __ \_  |  | \/ |   |  \ |  | |   |  \  / /_/  >
  \/\_/   (____  /  |__|    |___|  / |__| |___|  /  \___  / 
               \/                \/            \/  /_____/  

DO NOT CHANGE THIS FILE, or any other, but this one is kind of important. If you understand JSON and think you can figure out what you are doing, then fine. But back it up first.

 - Louis-Emile Ploix
*/

let worldData = {
    clouds: 3,
    sky: [[214, 234, 248], [28, 40, 51]],
    gravity: 0.005,
    player: {
        speed: 0.1,
        jumpSize: 0.1111111111111111,
        range: 5
    },
    enemies: {
        zombie: {
            width: 1, height: 2,
            speed: 0.1,
            jumpSize: 0.111111111111,
            followRadius: 0,
            max: 2,
            chance: 1,
            theme: [255, 165, 0]
        },
        dragon: {
            width: 2, height: 2,
            speed: 0.2,
            jumpSize: 0.111111111111,
            followRadius: 0,
            max: 1,
            chance: 1,
            theme: [244, 67, 54]
        }
    },
    difficulty: 0.0007
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