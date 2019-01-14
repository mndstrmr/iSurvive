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
    clouds: 3, // How many clouds to generate
    sky: [[214, 234, 248], [28, 40, 51]], // What colour is the sky in day? At night? (Use RGB colour values)
    gravity: 0.005, // Strength of gravity
    player: {
        speed: 0.1, // Speed of the player
        jumpSize: 1 / 9, // Jump size of the player
        range: 7 // How far the player can kill from
    },
    enemies: {
        skeleton: {
            width: 0.5, height: 2, // How wide and tall is it (in blocks)
            speed: 0.1, // Its speed
            jumpSize: 1 / 9, // Its jump size
            followRadius: 0, // How far it gets towards the player before stopping
            max: 5, // How many per world max at a time
            chance: 0.7, // Probability of spawning (assuming other things are met)
            theme: [229, 231, 233], // RGB color used when it is killed
            message: 'You were smashed to pieces by a skeleton' // Message displayed when it kills you
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
        },
        serpent: {
            width: 2.5, height: 1,
            speed: 0.2,
            jumpSize: 1 / 9,
            followRadius: 0,
            max: 2,
            chance: 0.4,
            theme: [67, 160, 71],
            message: 'You were bitten by a serpent'
        }
    },
    difficulty: 0.0007 // Chance of spawning something at any given update
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