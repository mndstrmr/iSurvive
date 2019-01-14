const Osmium = {
    Vector: class {
        constructor(x, y) {
            this.x = x != null? x:0;
            this.y = y != null? y:0;
        }

        get width() { return this.x; }
        set width(value) { this.x = value; }

        get height() { return this.y; }
        set height(value) { this.y = value; }

        distanceToSquared(vector) {
            return ((this.x - vector.x) ** 2) + ((this.y - vector.y) ** 2);
        }

        distanceTo(vector) {
            return Math.sqrt(this.distanceToSquared(vector));
        }

        apply(func, ctx) {
            return func.call(ctx, this.x, this.y);
        }

        set(x, y) {
            if (x.constructor == Osmium.Vector) {
                this.x = x.x;
                this.y = x.y;
            } else {
                this.x = x;
                this.y = y;
            }
        }

        multiplyScalar(scalar) {
            return new Osmium.Vector(this.x * scalar, this.y * scalar);
        }

        divideScalar(scalar) {
            return new Osmium.Vector(this.x / scalar, this.y / scalar);
        }

        minusScalar(scalar) {
            return new Osmium.Vector(this.x - scalar, this.y - scalar);
        }

        withinRect(x, y, w, h) {
            return this.x >= x && this.y >= y && this.x <= w && this.y <= h;
        }

        add(vector) {
            return new Osmium.Vector(this.x + vector.x, this.y + vector.y);
        }

        angleTo(point) {
            return Math.atan(this.x - point.x, this.y - point.y);
        }

        clone() {
            return new Osmium.Vector(this.x, this.y);
        }

        floor() {
            return new Osmium.Vector(Math.floor(this.x), Math.floor(this.y));
        }

        ceil() {
            return new Osmium.Vector(Math.ceil(this.x), Math.ceil(this.y));
        }

        round() {
            return new Osmium.Vector(parseInt(this.x), parseInt(this.y));
        }

        equals(vector) {
            return this.x == vector.x && this.y == vector.y;
        }
    },
    Math: {
        toDegrees: function(theta) {
            return (theta / Math.PI) * 180;
        },
        toRadians: function(theta) {
            return (theta / 180) * Math.PI;
        }
    },
    Color: class {
        constructor(r, g, b, a) {
            this.r = r == null? 0:r;
            this.g = g == null? 0:g;
            this.b = b == null? 0:b;
            this.a = a == null? 1:a;
        }

        toString(a) {
            if (a == false) return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';

            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
        }

        randomise(scalar) {
            return new Osmium.Color(this.r + parseInt(Math.random() * scalar), this.g + parseInt(Math.random() * scalar), this.b + parseInt(Math.random() * scalar), this.a);
        }

        merge(color, amount) {
            amount -= 1;
            
            return new Osmium.Color(
                this.r + ((this.r - color.r) * amount),
                this.g + ((this.g - color.g) * amount),
                this.b + ((this.b - color.b) * amount)
            );
        }
    },
    Image: class {
        constructor(path) {
            this.path = path;
            
            if (Osmium.Image.loaded[this.path] == null) {
                const domElement = document.createElement('img');
                domElement.src = this.path;
                Osmium.Image.loaded[this.path] = domElement;
                domElement.onerror = () => {
                    Osmium.Image.loaded[this.path].error = true;
                }
            }
        }

        getWidth() {
            return this.getDomElement().width;
        }

        getHeight() {
            return this.getDomElement().height;
        }

        getDomElement() {
            return Osmium.Image.loaded[this.path];
        }

        getPolygon() {
            return new Osmium.Polygon([
                new Osmium.Vector(0, 0),
                new Osmium.Vector(0, this.getWidth()),
                new Osmium.Vector(this.getHeight(), this.getWidth()),
                new Osmium.Vector(this.getHeight(), 0)
            ]);
        }

        isError() {
            return this.getDomElement().error == true;
        }

        getPromise() {
            return new Promise((resolve) => {
                const i = setInterval(() => {
                    if (this.getWidth() != 0 || this.isError()) {
                        resolve();

                        window.clearInterval(i);
                    }
                })
            });
        }

        wait(cb) {
            this.getDomElement().onload = cb;
        }
    },
    Utils: {},
    Element: class {
        constructor() {
            this.position = new Osmium.Vector();
            this.rotation = 0;
            this.scale = new Osmium.Vector(1, 1);

            this.animations = [];
            this.deleteRequested = false;

            this.notVisibleCallback = null;
            this.visible = true;

            this.event = new Osmium.EventEmitter();
            this.renderPosition = 0;
        }
        
        addAnimation(animation) {
            this.animations.push(animation);
        }

        animate(timeElapsed) {
            for (const animation of this.animations) {
                animation.apply(this, timeElapsed);
            }
        }

        requestDelete() {
            this.deleteRequested = true;
        }

        updateEvents(dt) {
            this.animate(dt);

            this.event.trigger('update', dt);
        }

        hide() {
            if (this.visible) this.visible = false;
        }

        show() {
            if (!this.visible) this.visible = true;
        }

        loop(dt, game) {
            this.updateEvents(dt);

            if (this.isCTXElement) {
                this.render(game.ctx);
            } else if (this.isHTMLElement) {
                this.update();
            } else if (this.isGroupedRenderer) {
                this.render(this, dt);
            }

            if (this.notVisibleCallback != null && !this.position.withinRect(0, 0, game.width, game.height)) {
                this.notVisibleCallback.call(this, [this]);
            }
        }
    },
    EventEmitter: class {
        constructor() {
            this.listeners = {};
        }

        on(type, callback, passive) {
            if (this.listeners[type] == null) this.listeners[type] = [];

            this.listeners[type].push({callback: callback, passive: passive == false});
        }

        removeListener(type, callback) {
            const array = this.listeners[type];

            if (array == null) throw new Error('Cannot remove inexistant listener');

            for (let i = 0; i < array.length; i++) {
                const listener = array[i];

                if (listener.callback == callback) {
                    array.splice(i, 1);
                    return;
                }
            }

            throw new Error('Cannot remove inexistant listener');
        }

        trigger(type, json) {
            if (this.listeners[type] == null) return;

            for (const listener of this.listeners[type]) {
                listener.callback(json);

                if (!listener.passive) return;
            }
        }
    },
    Polygon: class {
        constructor(vertices) {
            this.vertices = vertices == null? []:vertices;
        }

        getCTXElement() {
            return new Osmium.CTXElement.Simple.Polygon(this.vertices);
        }

        intersects(polygon) {
            for (const point of polygon.vertices) {
                if (this.intersectsPoint(point)) {
                    return true;
                }
            }

            return false;
        }

        intersectsPoint(point) {
            var x = point.x, y = point.y;
        
            var inside = false;
            for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
                var xi = this.vertices[i].x, yi = this.vertices[i].y;
                var xj = this.vertices[j].x, yj = this.vertices[j].y;
        
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
        
            return inside;
        }

        translate(vector) {
            const vertices = [];

            for (const vertex of this.vertices) {
                vertices.push(vertex.add(vector));
            }

            return new Osmium.Polygon(vertices);
        }

        rotate(angle) {
            const vertices = [];

            for (const vertex of this.vertices) {
                const radius = vertex.distanceTo({x: 0, y: 0});
                const toVertex = Math.atan2(vertex.x, vertex.y);

                vertices.push(new Osmium.Vector(
                    Math.sin(toVertex + angle) * radius,
                    Math.cos(toVertex + angle) * radius
                ));
            }

            return new Osmium.Polygon(vertices);
        }

        scale(x, y) {
            if (y == null) y = x;

            const vertices = [];

            for (const vertex of this.vertices) {
                vertices.push(new Osmium.Vector(vertex.x * x, vertex.y * y));
            }

            return new Osmium.Polygon(vertices);
        }
    },
    Thread: class {
        constructor(callback, sleep) {
            this.callback = callback;
            this.sleep = sleep;
            this.maxGap = 20 * 1000;

            this.interval = null;
        }

        cancel() {
            if (this.interval == null) console.warn('Cannot stop already stopped interval');

            window.clearInterval(this.interval);
            this.interval = null;
        }

        start() {
            const that = this;
            let start = new Date().getTime();

            this.interval = window.setInterval(function() {
                const now = new Date().getTime();
                that.callback.apply(that, [Math.min(now - start, that.maxGap)]);
                start = now;
            }, this.sleep);
        }
    },
    Random: {
        integer: function(min, max) {
            return parseInt(Math.random() * (max - min + 1)) + min;
        },
        choice: function(list) {
            return list[Osmium.Random.integer(0, list.length - 1)];
        },
        uniform: function(min, max) {
            return Math.random() * (max - min + 1) + min;
        }
    },
    Audio: Audio
};
Osmium.KeyHandler = class extends Osmium.EventEmitter {
    constructor(element) {
        super();

        this.element = element;
        this.data = {};

        const that = this;
        this.element.addEventListener('keydown', function(event) {
            that.data[event.keyCode] = true;

            that.trigger('down:' + event.keyCode, event);
        });

        this.element.addEventListener('keyup', function(event) {
            that.close(event.keyCode);

            that.trigger('up:' + event.keyCode, event);
        });
    }

    isKeyPressed(code) {
        return this.data[code] != null;
    }

    close(code) {
        delete this.data[code];
    }

    tick() {
        for (const key in this.data) {
            this.trigger('tick:' + key);
        }
    }
}
Osmium.MouseHandler = class extends Osmium.EventEmitter {
    constructor(element) {
        super();

        this.element = element;
        this.data = {};

        const that = this;
        this.element.addEventListener('mousedown', function(event) {
            that.data[event.button] = true;

            that.trigger('down:' + event.button, event);
        });

        this.element.addEventListener('mouseup', function(event) {
            that.close(event.button);

            that.trigger('up:' + event.button, event);
        });
    }

    isButtonPressed(code) {
        return this.data[code] != null;
    }

    close(code) {
        delete this.data[code];
    }

    tick() {
        for (const key in this.data) {
            this.trigger('tick:' + key);
        }
    }
}

Osmium.Image.loaded = {};

Object.extend = function(obj1, obj2) {
    for (const key in obj2) {
        obj1[key] = obj2[key];
    }

    return obj1;
}

Osmium.Color.RED = new Osmium.Color(255, 0, 0);
Osmium.Color.BLACK = new Osmium.Color(0, 0, 0);
Osmium.Color.WHITE = new Osmium.Color(255, 255, 255);
Osmium.Color.GREEN = new Osmium.Color(0, 255, 0);
Osmium.Color.BLUE = new Osmium.Color(0, 0, 255);
Osmium.Color.TRANSPARENT = new Osmium.Color(0, 0, 0, 0);

Osmium.Color.from = function(x) {
    return new Osmium.Color(x, x, x);
}

Osmium.Color.fromArray = function(array) {
    return new Osmium.Color(array[0], array[1], array[2], array[3]);
}

Osmium.Color.nice = {
    DARK_GREEN: new Osmium.Color(30, 132, 73),
    GREY: new Osmium.Color(112, 123, 124),
    RUST: new Osmium.Color(191, 54, 12),
    DARK_BLACK_BLUE: new Osmium.Color(38, 50, 56),
    CLOUD: new Osmium.Color(248, 249, 249),
    SUN: new Osmium.Color(245, 176, 65),
    MOON: new Osmium.Color(229, 231, 233),
    SKIN: new Osmium.Color(255, 205, 148),
    SAND: new Osmium.Color(211, 199, 162),
    DARK_SAND: new Osmium.Color(195, 173, 127),
    DARK_GREY: new Osmium.Color(98, 101, 103)
};