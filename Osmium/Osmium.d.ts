declare module Osmium {
    class Vector {
        x: Number;
        y: Number;
        width: Number;
        height: Number;

        constructor(x?: Number, y?: Number);

        distanceToSquared(vector: Vector): Number;
        distanceTo(vector: Vector): Number;

        apply(func: Function, ctx: any): any;

        set(x: Number | Vector, y?: Number): void;

        multiplyScalar(scalar: Number): Vector;
        divideScalar(scalar: Number): Vector;
        minusScalar(scalar: Number): Vector;
        add(vector: Vector): Vector;

        withinRect(x: Number, y: Number, w: Number, h: Number): Boolean;

        angleTo(vector: Vector): Number;

        clone(): Vector;

        floor(): Vector;
        ceil(): Vector;
        round(): Vector;

        equals(vector: Vector): Boolean;
    }

    class Thread {
        callback: Function;
        sleep: Number;
        interval: Number;

        constructor(callback: Function, sleep: Number);

        cancel(): void;
        start(): void;
    }

    class Math {
        static toDegrees(angle: Number): Number;
        static toRadians(angle: Number): Number;
    }

    class Color {
        r: Number;
        g: Number;
        b: Number;
        a: Number;

        constructor(r?: Number, g?: Number, b?: Number, a?: Number);

        toString(showAlpha?: Boolean): String;

        randomise(amount: Number): Color;
        merge(other: Color, amount: Number): Color;

        static RED: Color;
        static BLACK: Color;
        static WHITE: Color;
        static GREEN: Color;
        static BLUE: Color;
        static TRANSPARENT: Color;

        static nice: {
            DARK_GREEN: Color,
            GREY: Color,
            RUST: Color,
            DARK_BLACK_BLUE: Color,
            CLOUD: Color,
            SUN: Color,
            MOON: Color,
            SKIN: Color
        }

        static from(value: Number): Color;
        static fromArray(array: Number[]): Color;
    }

    class Image {
        readonly path: String;

        constructor(path: String);

        getWidth(): Number;
        getHeight(): Number;

        getDomElement(): HTMLElement;
        getPolygon(): Polygon;

        isError(): Boolean;

        static loaded: Object;
    }

    namespace Utils {
        class Grid {
            width: Number;
            height: Number;
            rawData: any;

            constructor(width: Number, height: Number, defaultValue?: any);

            size(): Number;

            getPosition(index: Number): Vector;
            getIndex(x: Number, y: Number): Number;

            get(x: Number, y: Number): any;
            set(x: Number, y: Number, value: any): void;

            fill(value?: any, callback?: Function): void;
            clear(): void;

            firstEmptyInColumn(index: Number): Number;
            lastEmptyInColumn(index: Number): Number;

            isTaken(x: Number, y: Number): Boolean;
        }

        namespace PhysicsEngine {
            class Engine {
                gravity: Number;
                physicsElements: PhysicsElement;

                constructor(gravity: Number);

                update(timeElapsed: Number): void;

                add(...elements: PhysicsElement[]): void;

                isPointTaken(vector: Vector): Boolean;
            }

            class PhysicsElement {
                element: Osmium.Element;
                velocity: Vector;
                density: Number;
                hitbox: Polygon;
                isGrounded: Boolean;
                active: Boolean;
                doesTouch: Function;

                constructor(element: Osmium.Element, hitbox: Polygon, data?: Object);

                getFullHitbox(offset?: Vector): Polygon;
                intersects(hitbox: Polygon): Boolean;
                angleTo(element: PhysicsElement): Number;

                canMoveBy(vector: Vector, elements: PhysicsElement[]): Boolean;
                update(gravity: Number, elements: PhysicsElement[], timeElapsed: Number): void;

                getTest(): CTXElement.Simple.Polygon;
            }

            class SimplexNoise {
                constructor();

                getVal(x: Number): Number;
                setAmplitude(x: Number): void;
                setScale(x: Number): void;
            }
        }
    }

    class Random {
        static integer(min: Number, max: Number): Number;
        static choice<T>(array: T[]): T;
        static uniform(min: Number, max: Number): Number;
    }

    class Element {
        position: Vector;
        rotation: Number;
        scale: Vector;
        animations: Osmium.Animation.Animation[];
        deleteRequested: Boolean;
        notVisibleCallback: Function;
        visible: Boolean;
        event: EventEmitter;
        renderPosition: Number;

        constructor();

        addAnimation(animation: Osmium.Animation.Animation): void;
        animate(timeElapsed: Number): void;

        requestDelete(): void;

        updateEvent(timeElapsed: Number): void;

        hide(): void;
        show(): void;

        loop(timeElapsed: Number): void;
    }

    class EventEmitter {
        listeners: Object;

        constructor();

        on(type: String, callback: Function, passive?: Boolean): void;
        removeListener(type: String, callback: Function): void;
        trigger(type: String, json: any): void;
    }

    class Polygon {
        vertices: Vector[];

        constructor(vertices?: Vector[]);

        getCTXElement(): Osmium.CTXElement.CTXElement;

        intersects(polygon: Polygon): Boolean;
        intersectsPoint(vector: Vector): Boolean;

        translate(vector: Vector): Polygon;
        rotate(angle: Number): Polygon;
        scale(x: Number, y?: Number): Polygon;
    }

    class KeyHandler extends EventEmitter {
        readonly element: HTMLElement;
        data: Object;

        constructor(element?: HTMLElement);

        isKeyPressed(code: Number): Boolean;
        close(code: Number): void;
        tick(): void;
    }

    module Animation {
        abstract class Animation {
            key: String;

            constructor(key: String);
    
            apply(object: Object, dt: Number): void;
            final(object: Object, key: String, dt: Number): void;
        }

        class EndlessAnimation extends Animation {
            speed: Number;

            constructor(key: String, speed: Number);
        }

        class RestartAnimation extends Animation {
            speed: Number;
            start: Number;
            shouldRestart: Function;

            constructor(key: String, speed: Number, start: Number, shouldRestart: Function);
        }
    }

    module CTXElement {
        abstract class CTXElement extends Element {
            constructor();

            readonly isCTXElement: Boolean;

            setupMatrix(ctx: CanvasRenderingContext2D): void;
            clearMatrix(ctx: CanvasRenderingContext2D): void;

            render(ctx: CanvasRenderingContext2D): void;
            finalRender(ctx: CanvasRenderingContext2D): void;
        }

        class Stroke {
            color: Color;
            width: Number;
            open: Boolean;
            close: Boolean;

            constructor(color?: Color, width?: Number, enabled?: Boolean);

            disable(): void;
            enable(): void;

            apply(ctx: CanvasRenderingContext2D): void;
            complete(): void;

            match(fill: Fill): void;
        }

        class Fill {
            color: Color; 
            open: Boolean;
            close: Boolean;

            constructor(color?: Color, enabled?: Boolean);

            apply(ctx: CanvasRenderingContext2D): void;
            complete(): void;
        }

        module Simple {
            export class Polygon extends CTXElement {
                vertices: Vector[];
                fill: Fill;
                stroke: Stroke;

                constructor(vertices?: Vector[]);

                getPolygon(): Osmium.Polygon;
            }

            export class Rectangle extends Osmium.CTXElement.Simple.Polygon {
                readonly width: Number;
                readonly height: Number;

                constructor(width?: Number, height?: Number, anchorX?: Number, anchorY?: Number);
            }
        }

        class Arc extends CTXElement {
            radius: Number;
            startAngle: Number;
            endAngle: Number;

            fill: Fill;
            stroke: Stroke;

            constructor();
        }

        class Image extends CTXElement {
            image: Osmium.Image;
            clipStart?: Vector;
            clipEnd?: Vector;
            size?: Vector;
            offset: Vector;

            constructor(image: Osmium.Image, clipStart?: Vector, clipEnd?: Vector, size?: Vector);
        }

        class Group extends CTXElement {
            elements: CTXElement[];

            constructor(elements?: CTXElement[]);

            add(...elements: CTXElement[]): void;
        }
    }

    module HTMLElement {
        class HTMLElement extends Osmium.Element {
            domElement: HTMLElement;

            readonly isHTMLElement: Boolean;

            constructor(domElement: HTMLElement);

            update(): void;

            add(parent: HTMLElement): void;
            remove(): void;
        }

        class Para extends HTMLElement.HTMLElement {
            constructor(text: String);

            setHTML(html: String): void;
            setText(text: String): void;
        }
    }

    class BatchRenderer {
        elements: Osmium.Element[];
        prepare: Function;
        addCallback: Function;

        readonly isGroupedRenderer: Boolean;

        constructor(addCallback: Function, prepare: Function, elements?: Osmium.Element[]);

        addAll(elements: Osmium.Element[]): void;
        add(...elements: Element[]): void;

        loop(dt: Number, game: WebGame2D): void;
    }

    class WebGame2D {
        width: Number;
        height: Number;
        parent: HTMLElement;
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        renderedElements: (Element | BatchRenderer)[];
        renderSleep: Number;
        mainThread: Thread;
        threads: Thread[];
        background?: Color;

        constructor(width: Number, height: Number, parent: HTMLElement);

        setBackground(color: Color): void;
        resize(width?: Number, height?: Number): void;

        add(element: Element): void;
        remove(element: Element): void;

        setParent(parent: HTMLElement): void;

        render(timeElapsed: Number): void;
        startLoop(callback: Function, interval?: Number): void;
        cancelLoop(): void;

        appendThread(thread: Thread, start?: Boolean): void;
    }
}