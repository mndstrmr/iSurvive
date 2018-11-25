Osmium.WebGame2D = class {
    constructor(width, height, parent) {
        this.width = width;
        this.height = height;
        
        this.parent = null;
        this.canvas = document.createElement('canvas');

        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;

        this.ctx = this.canvas.getContext('2d');

        this.renderedElements = [];
        
        if (parent != null) this.setParent(parent);

        this.renderSleep = 0;
        this.loop = null;

        const that = this;
        window.addEventListener('resize', () => that.resize());
    }

    setBackground(color) {
        this.canvas.style.backgroundColor = color.toString(true);
    }

    resize(width, height) {
        this.width = width == null? window.innerWidth:width;
        this.height = height == null? window.innerHeight:height;

        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
    }

    add(element) {
        this.renderedElements.push(element);

        if (element.isHTMLElement) element.add(this.parent);
    }

    remove(element) {
        const index = this.renderedElements.indexOf(element);

        if (index == -1) throw new Error('Cannot remove element not in render array');
        this.renderedElements.splice(index, 1);

        if (element.isHTMLElement) element.remove();
    }

    setParent(parent) {
        this.parent = parent;
        parent.appendChild(this.canvas);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(timeElapsed) {
        this.clearCanvas();

        for (let i = 0; i < this.renderedElements.length; i++) {
            const element = this.renderedElements[i];

            element.loop(timeElapsed, game);

            if (element.deleteRequested) {
                this.renderedElements.splice(i, 1);
                i -= 1;
            }
        }
    }

    startLoop(callback, interval) {
        const that = this;
        let start = new Date();

        if (interval != null) this.renderSleep = interval;

        this.loop = setInterval(async function() {
            const now = new Date();
            const passed = now.getTime() - start.getTime();

            callback.apply(that, [passed]);
            that.render(passed);

            start = now;
        }, this.renderSleep);
    }

    cancelLoop() {
        if (this.loop == null) {
            console.warn('Cannot stop inexistant loop');
            return;
        }

        window.clearInterval(this.loop);
        this.loop = null;
    }
}