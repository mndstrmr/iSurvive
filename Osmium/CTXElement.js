Osmium.CTXElement = {}

Osmium.CTXElement.CTXElement = class extends Osmium.Element {
    constructor() {
        super();
    }

    get isCTXElement() {
        return true;
    }

    setupMatrix(ctx) {
        ctx.rotate(this.rotation);
        this.position.multiplyScalar(window.devicePixelRatio).apply(ctx.translate, ctx);
        this.scale.apply(ctx.scale, ctx);
    }

    clearMatrix(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    render(ctx) {
        if (!this.visible) return;

        this.setupMatrix(ctx);
        this.finalRender(ctx);
        this.clearMatrix(ctx);
    }

    finalRender(ctx) {}
}

Osmium.CTXElement.Stroke = class {
    constructor(color, width, enabled) {
        this.color = color == null? Osmium.Color.BLACK:color;
        this.width = width == null? 1:width;

        this.open = enabled != false;
        this.close = this.open;
    }

    disable() {
        this.open = false;
        this.close = false;
    }

    enable() {
        this.open = true;
        this.close = true;
    }

    apply(ctx) {
        if (!this.open) return;

        ctx.strokeStyle = this.color.toString(true);
        ctx.strokeWidth = this.width;
    }

    complete(ctx) {
        if (this.close) ctx.stroke();
    }

    match(fill) {
        this.color = fill.color;
        this.width = 1;

        this.enable();
    }
};

Osmium.CTXElement.Fill = class {
    constructor(color, enabled) {
        this.color = color == null? Osmium.Color.BLACK:color;

        this.open = enabled != false;
        this.close = this.open;
    }

    apply(ctx) {
        if (!this.open) return;

        ctx.fillStyle = this.color.toString(true);
    }

    complete(ctx) {
        if (this.close) ctx.fill();
    }
};

Osmium.CTXElement.Simple = {};

Osmium.CTXElement.Simple.Polygon = class extends Osmium.CTXElement.CTXElement {
    constructor(vertices) {
        super();

        this.vertices = vertices == null? []:vertices;

        this.fill = new Osmium.CTXElement.Fill(Osmium.Color.BLACK, true);
        this.stroke = new Osmium.CTXElement.Stroke(Osmium.Color.BLACK, 1, false);
    }

    finalRender(ctx) {
        this.fill.apply(ctx);
        this.stroke.apply(ctx);

        ctx.beginPath();

        this.vertices[0].apply(ctx.moveTo, ctx);
        for (let i = 1; i < this.vertices.length; i++) this.vertices[i].apply(ctx.lineTo, ctx);

        ctx.closePath();
        
        this.fill.complete(ctx);
        this.stroke.complete(ctx);
    }

    getPolygon() {
        return new Osmium.Polygon(this.vertices);
    }
}

Osmium.CTXElement.Simple.Rectangle = function(width, height, anchorX, anchorY) {
    width = width == null? 1:width;
    height = height == null? 1:height;

    anchorY = anchorY == null? (anchorX == null? 0:anchorX):anchorY;
    anchorX = anchorX == null? 0:anchorX;

    const polygon = new Osmium.CTXElement.Simple.Polygon();
    polygon.vertices = [
        new Osmium.Vector(0, 0),
        new Osmium.Vector(0, height),
        new Osmium.Vector(width, height),
        new Osmium.Vector(width, 0)
    ];

    for (const vertex of polygon.vertices) {
        vertex.x -= width * anchorX;
        vertex.y -= height * anchorY;
    }

    polygon.width = width;
    polygon.height = height;

    return polygon;
}

Osmium.CTXElement.Arc = class extends Osmium.CTXElement.CTXElement {
    constructor() {
        super();

        this.radius = 1;

        this.startAngle = 0;
        this.endAngle = 2 * Math.PI;

        this.fill = new Osmium.CTXElement.Fill(Osmium.Color.BLACK, true);
        this.stroke = new Osmium.CTXElement.Stroke(Osmium.Color.BLACK, 1, false);
    }

    finalRender(ctx) {
        this.fill.apply(ctx);
        this.stroke.apply(ctx);

        ctx.beginPath();

        ctx.arc(0, 0, this.radius, this.startAngle, this.endAngle);
    
        ctx.closePath();
        
        this.fill.complete(ctx);
        this.stroke.complete(ctx);
    }
}

Osmium.CTXElement.Image = class extends Osmium.CTXElement.CTXElement {
    constructor(image, clipStart, clipEnd, size) {
        super();

        this.image = image;

        this.clipStart = clipStart;
        this.clipEnd = clipEnd;

        this.size = size;
    }

    finalRender(ctx) {
        if (this.clipStart == null && this.clipEnd == null && this.size != null) {
            ctx.drawImage(
                this.image.getDomElement(),
                0, 0,
                this.size.width, this.size.height
            )
        } else if (this.clipStart != null && this.clipEnd != null && this.size == null) {
            ctx.drawImage(
                this.image.getDomElement(),
                this.clipStart.x,
                this.clipStart.y,
                this.clipEnd.x,
                this.clipEnd.y
            );
        } else if (this.clipStart != null && this.clipEnd != null && this.size != null) {
            ctx.drawImage(
                this.image.getDomElement(),
                this.clipStart.x,
                this.clipStart.y,
                this.clipEnd.x,
                this.clipEnd.y,
                0, 0,
                this.size.x,
                this.size.y
            );
        } else if (this.clipStart == null && this.clipEnd == null && this.size == null) {
            ctx.drawImage(
                this.image.getDomElement(),
                0, 0
            )
        }
    }
}

Osmium.CTXElement.Group = class extends Osmium.CTXElement.CTXElement {
    constructor(elements) {
        super();

        this.elements = elements == null? []:elements
    }

    finalRender(ctx) {
        this.clearMatrix(ctx);

        for (const element of this.elements) {
            this.setupMatrix(ctx);
            element.render(ctx, true);
            this.clearMatrix(ctx);
        }
    }

    add() {
        Array.prototype.push.apply(this.elements, arguments);
    }
}