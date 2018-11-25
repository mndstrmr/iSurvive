Osmium.Animation = {};

Osmium.Animation.Animation = class {
    constructor(key) {
        this.key = key;
    }

    apply(object, dt) {
        const parts = this.key.split('.');

        for (let i = 0; i < parts.length - 1; i++) object = object[parts[i]]

        this.final(object, parts[parts.length - 1], dt);
    }

    final(object, key, dt) {}
}

Osmium.Animation.EndlessAnimation = class extends Osmium.Animation.Animation {
    constructor(key, speed) {
        super(key);

        this.speed = speed;
    }

    final(object, key, dt) {
        object[key] += this.speed * dt;
    }
}

Osmium.Animation.RestartAnimation = class extends Osmium.Animation.Animation {
    constructor(key, speed, start, shouldRestart) {
        super(key);

        this.speed = speed;
        this.shouldRestart = shouldRestart;
        this.start = start;
    }

    final(object, key, dt) {
        object[key] += this.speed * dt;

        if (this.shouldRestart(object[key])) {
            object[key] = this.start;
        }
    }
}