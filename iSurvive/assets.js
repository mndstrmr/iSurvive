const assets = {
    blockTypes: [
        {
            biomes: {
                default: {
                    // path: 'assets/grass.jpg',
                    revert: Osmium.Color.nice.DARK_GREEN,
                    thickness: 1
                }
            },
            name: 'Grass',
        }, {
            biomes: {
                default: {
                    // path: 'assets/stone.jpg',
                    revert: Osmium.Color.nice.GREY,
                    thickness: 3
                }
            },
            name: 'Stone'
        }, {
            biomes: {
                default: {
                    // path: 'assets/dark-stone.jpg',
                    revert: Osmium.Color.nice.DARK_BLACK_BLUE,
                    thickness: 2
                }
            },
            name: 'Dark Stone'
        }, {
            biomes: {
                default: {
                    // path: 'assets/lava.jpg',
                    revert: Osmium.Color.nice.RUST,
                    thickness: 1
                }
            },
            name: 'Lava'
        }
    ],
    planets: {
        sun: {
            // path: 'assets/sun.jpg',
            revert: Osmium.Color.nice.SUN
        },
        moon: {
            // path: 'assets/moon.jpg',
            revert: Osmium.Color.nice.MOON
        }
    },
    cloud: {
        // path: 'assets/cloud.jpg',
        revert: Osmium.Color.nice.CLOUD
    },
    player: {
        // path: 'assets/player.jpg',
        revert: new Osmium.Color(142, 68, 173)
    }
};