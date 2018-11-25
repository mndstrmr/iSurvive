Osmium.Utils.Grid = class {
    constructor(width, height, defaultValue) {
        this.width = parseInt(width);
        this.height = parseInt(height);

        this.rawData = [];
        this.fill(defaultValue);
    }

    size() {
        return this.width * this.height;
    }

    getPosition(index) {
        const x = index % this.width;
        const y = (index - x) / this.width;

        return new Osmium.Vector(x, y);
    }

    getIndex(x, y) {
        if (x.constructor == Osmium.Vector) {
            y = x.y;
            x = x.x;
        }

        return (y * this.width) + x;
    }

    get(x, y) {
        return this.rawData[this.getIndex(x, y)];
    }

    set(x, y, value) {
        this.rawData[this.getIndex(x, y)] = value;
    }

    fill(value, callback) {
        for (let i = 0; i < this.size(); i++) {
            this.rawData[i] = callback == null? value:callback(this.getPosition(i));
        }
    }

    clear() {
        this.fill();
    }

    firstEmptyInColumn(column) {
        for (let i = 0; i < this.height; i++) {
            if (this.get(column, i) == null) return i;
        }

        return null;
    }

    lastEmptyInColumn(column) {
        for (let i = this.height - 1; i >= 0; i--) {
            if (this.get(column, i) == null) return i;
        }

        return null;
    }

    isTaken(x, y) {
        return this.get(x, y) != null;
    }
}