Osmium.HTMLElement = {};
Osmium.HTMLElement.HTMLElement = class extends Osmium.Element {
    constructor(domElement) {
        super();
        
        this.domElement = domElement;
        this.domElement.classList.add('sprite');
    }

    get isHTMLElement() {
        return true;
    }

    update() {
        this.domElement.style.transform =
            'translate(calc(' + this.position.x + 'px - 50%),calc(' + this.position.y + 'px - 100%))' +
            'rotate(' + this.rotation + 'rad)' +
            'scale(' + this.scale.x + ',' + this.scale.y + ')';

        const current = this.domElement.style.display;
        if (!this.visible && current != 'none') {
            this.domElement.style.display = 'none';
        } else if (this.visible && current == 'none') {
            this.domElement.style.display = '';
        }
    }

    add(parent) {
        parent.appendChild(this.domElement);
    }

    remove() {
        this.domElement.parentElement.removeChild(this.domElement);
    }
}


Osmium.HTMLElement.Para = class extends Osmium.HTMLElement.HTMLElement {
    constructor(text) {
        super(document.createElement('p'));

        this.domElement.style.margin = '0';
        this.domElement.style.display = 'inline-block';

        this.setHTML(text);
    }

    setHTML(html) {
        this.domElement.innerHTML = html;
    }

    setText(text) {
        this.domElement.innerText = text;
    }
}