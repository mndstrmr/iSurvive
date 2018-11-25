Osmium.BatchRenderer = class {
    constructor(addCallback, prepare, elements) {
        this.elements = [];

        this.prepare = prepare;
        this.addCallback = addCallback;

        if (elements != null) this.addAll(elements);
    }

    addAll(array) {
        this.add.bind(null, array);
    }

    add() {
        for (const element of arguments) {
            if (this.addCallback(element) == false) {
                this.elements.push(element);
            }
        }
    }

    get isGroupedRenderer() {
        return true;
    }

    loop(dt, game) {
        this.prepare(game.ctx);

        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];

            element.loop(dt, game);

            if (element.deleteRequested) {
                this.elements.splice(i, 1);
                i -= 1;
            }
        }
    }
}