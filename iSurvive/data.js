/*
                                      __                    
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
        jumpSize: 1 / 9,
        range: 7
    },
    enemies: {
        skeleton: {
            width: 0.5, height: 2,
            speed: 0.1,
            jumpSize: 1 / 9,
            followRadius: 0,
            max: 5,
            chance: 0.7,
            theme: [229, 231, 233],
            message: 'You were smashed to pieces by a skeleton'
        },
        dragon: {
            width: 5, height: 4,
            speed: 0.2,
            jumpSize: 1 / 9,
            followRadius: 0,
            max: 2,
            chance: 0.3,
            theme: [244, 67, 54],
            message: 'You were burnt to death by a dragon'
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
        jumpSize: 1 / 9,
        range: 7
    },
    enemies: {
        skeleton: {
            width: 0.5, height: 2,
            speed: 0.1,
            jumpSize: 1 / 9,
            followRadius: 0,
            max: 5,
            chance: 0.7,
            theme: [229, 231, 233]
        },
        dragon: {
            width: 5, height: 4,
            speed: 0.2,
            jumpSize: 1 / 9,
            followRadius: 0,
            max: 2,
            chance: 0.3,
            theme: [244, 67, 54]
        }
    },
    difficulty: 0.0007
};
*/