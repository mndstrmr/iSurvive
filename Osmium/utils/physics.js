Osmium.Utils.PhysicsEngine = {};
Osmium.Utils.PhysicsEngine.Engine = class {
    constructor(gravity) {
        this.gravity = gravity;
        this.physicsElements = [];
    }

    update(dt) {
        for (const element of this.physicsElements)
            element.update(this.gravity, this.physicsElements, dt);
    }

    add() {
        Array.prototype.push.apply(this.physicsElements, arguments);
    }

    isPointTaken(vector) {
        for (const element of this.physicsElements) {
            if (element.getFullHitbox().intersectsPoint(vector)) return element;
        }

        return false;
    }
}

Osmium.Utils.PhysicsEngine.PhysicsElement = class {
    constructor(element, hitbox, data) {
        this.element = element;

        this.velocity = new Osmium.Vector();
        this.density = 1;
        this.hitbox = hitbox;
        this.isGrounded = false;
        
        this.contactElements = null;

        if (data != null) Object.extend(this, data);

        this.active = true;
    }

    getFullHitbox(offset) {
        return this.hitbox.rotate(this.element.rotation).translate(offset == null? this.element.position:this.element.position.add(offset));
    }

    intersects(hitbox) {
        return this.getFullHitbox().intersects(hitbox);
    }

    angleTo(element) {
        return element.position.angleTo(this.element.position);
    }

    canMoveBy(vector, elements) {
        const hitbox = this.getFullHitbox(vector);

        for (const element of elements) {
            if (element == this || !element.active) continue;
            
            if (element.intersects(hitbox)) {
                return false;
            }
        }

        return true;
    }

    update(gravity, elements, dt) {
        if (!this.active) return;

        if (this.density != 0) {
            const gravityVelocity = this.velocity.add({x: 0, y: gravity * this.density * dt});

            if (this.canMoveBy(gravityVelocity, this.contactElements == null? elements:this.contactElements)) {
                this.velocity = gravityVelocity;
                this.isGrounded = false;
            } else {
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        }

        this.element.position.set(this.element.position.add(this.velocity));
    }

    getTest(split) {
        const element = new Osmium.CTXElement.Simple.Polygon(this.hitbox.scale(window.devicePixelRatio).vertices);
        element.fill.color = Osmium.Color.RED;
        element.stroke.color = Osmium.Color.BLUE;
        element.stroke.enable();
        element.stroke.width = 2;
        element.renderPosition = 2;

        element.position = split? this.element.position.clone():this.element.position;

        return element; 
    }
}