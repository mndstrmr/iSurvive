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

        this.mainThread = null;
        this.renderSleep = 0;
        this.threads = [];

        const that = this;
        window.addEventListener('resize', () => that.resize());

        this.background = null;
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

        this.renderedElements.sort(function(a, b) {
            return a.renderPosition - b.renderPosition;
        });

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

        if (this.background != null) {
            this.ctx.fillStyle = this.background.toString();
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
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
        if (interval != null) this.renderSleep = interval;

        this.mainThread = new Osmium.Thread(async function(time) {
            callback.apply(that, [time]);
            that.render(time);
        }, this.renderSleep);
        this.mainThread.start();

        for (const thread of this.threads) thread.start();
    }

    cancelLoop() {
        this.mainThread.cancel();

        for (const thread of this.threads) thread.cancel();
    }

    appendThread(thread, start) {
        this.threads.push(thread);

        if (start) thread.start();
    }
}