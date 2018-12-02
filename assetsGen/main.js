let assets = null;
let extras = [];
let biomes = ['grass', 'rock', 'desert', 'forest', 'savana', 'concrete', 'default'];
let mobile = false;
let resize = function() {
    mobile = window.getComputedStyle(document.body).getPropertyValue('--mobile') == 1;
};

const hamburger = document.querySelector('.hamburger');
const toggle = function(specific) {
    const target = document.querySelector('.sidebar');
    if (target.classList.contains('force-open') || specific == false) {
        target.classList.remove('force-open');

        hamburger.classList.remove('light-theme');
        hamburger.classList.add('dark-theme');
    } else {
        target.classList.add('force-open');

        hamburger.classList.add('light-theme');
        hamburger.classList.remove('dark-theme');
    }
}

hamburger.addEventListener('click', () => toggle(null));
window.addEventListener('resize', resize);
resize();

const Utils = {};
Utils.css = function(element, name, value) {
    var rules = {};
    if (element.hasAttribute('style')) {
        var style = element.getAttribute('style');
        if (!style.endsWith(';')) style += ';';

        const regex = /([a-zA-Z\-0-9]*) ?: ?([^;^:]+);/g;

        var match;
        do {
            match = regex.exec(style);

            if (match != null) {
                rules[match[1]] = match[2];
            }
        } while (match != null);
    }

    rules[name] = value;

    var string = '';
    for (const rule in rules) {
        string += rule + ':' + rules[rule] + ';';
    }

    element.setAttribute('style', string);
}

Element.prototype.css = function(name, value) {
    Utils.css(this, name, value);
}

Utils.createElement = function(type, data, callback) {
    const element = document.createElement(type);

    if (data == null) return element;

    if ('html' in data) {
        element.innerHTML = data.html;
    }

    if ('text' in data) {
        element.innerHTML = data.text;
    }

    if ('parent' in data) {
        data.parent.appendChild(element);
    }

    if ('children' in data) {
        if (data.children.constructor.name == 'Array') {
            for (const child of data.children) element.appendChild(child)
        } else element.appendChild(data.children);
    }

    if ('class' in data) {
        if (data['class'].constructor.name == 'Array') {
            for (const className of data['class']) element.classList.add(className)
        } else element.className = data['class'];
    }

    if ('attr' in data) {
        for (const key in data.attr) {
            element.setAttribute(key, data.attr[key]);
        }
    }

    if ('listeners' in data) {
        for (const item in data.listeners) {
            element.addEventListener(item, data.listeners[item]);
        }
    }

    if ('css' in data) {
        var string = '';
        for (const item in data.css) {
            string += item + ':' + data.css[item] + ';';
        }
        element.setAttribute('style', (element.hasAttribute('style')? element.getAttribute('style'):'') + string);
    }

    if (callback != null) callback.call(element);

    return element;
}

function openFilePanel(callback) {
    Utils.createElement('input', {
        attr: {
            type: 'file',
            webkitdirectory: true,
            multiple: true,
            directory: true
        },
        css: {
            display: 'none'
        },
        parent: document.body,
        listeners: {
            'input': callback
        }
    }, function() {
        this.click();
    })
}

String.prototype.captilise = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function loadImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
}

function stringSize(size) {
    if (size > 1024) {
        return Math.round(size / 1024) + 'KB';
    }

    return size + 'B';
}

function loadAssetsUI() {
    if (mobile) toggle(false);

    document.querySelector('.no-select').classList.add('hidden');
    document.querySelector('.opened').classList.remove('hidden');

    let parent = document.querySelector('.extras');
    for (let i = 0; i < extras.length && i < 4; i++) {
        const extra = extras[0];

        const element = Utils.createElement('div', {
            class: 'flex-row',
            parent: parent,
            css: {
                'padding-top': '0.2em'
            }
        });

        if (extra.type.indexOf('image') != -1) {
            loadImage(extra, function(data) {
                element.appendChild(Utils.createElement('div', {
                    class: ['image', 'flex-keep'],
                    css: {
                        'background-image': 'url(' + data + ')',
                        width: '10%',
                        height: '3em'
                    }
                }))

                let type = extra.type.split('/');
                type = type[0].captilise() + ' [' + type[1].toUpperCase() + ']';

                element.appendChild(Utils.createElement('div', {
                    class: 'flex-remaining',
                    children: [
                        Utils.createElement('p', {
                            class: 'center-y',
                            css: {
                                'padding-left': '1em'
                            },
                            text: extra.name + ' : ' + type + ' : ' + stringSize(extra.size)
                        })
                    ],
                    css: {
                        position: 'relative'
                    }
                }))
            })
        } else {
            console.warn('Unknown file type: ' + extra.type)
        }
    }

    parent = document.querySelector('.biomes');
    let found = null;
    let used = [];

    const createCheckbox = (name, checked) => {
        let classes = ['checkbox', 'flex-keep'];
        if (checked) classes.push('checked');

        return Utils.createElement('div', {
            class: 'flex-row',
            css: {
                'padding-top': '0.3em'
            },
            children: [
                Utils.createElement('div', {
                    class: classes
                }),
                Utils.createElement('div', {
                    class: ['flex-remaining'],
                    css: {
                        position: 'relative'
                    },
                    children: [
                        Utils.createElement('p', {
                            class: ['center-y'],
                            css: {
                                'padding-left': '1em'
                            },
                            text: name.captilise()
                        })
                    ]
                })
            ]
        });
    }

    for (found = 0; found < assets.biomes.length && found < 10; found++) {
        const biome = assets.biomes[found] || 'grass';
        if (used.indexOf(biome) != -1) continue;
        used.push(biome);

        parent.appendChild(createCheckbox(biome, true));
    }

    for (const biome of biomes) {
        if (found >= 10) break;
        if (used.indexOf(biome) != -1) continue;

        found += 1;
        used.push(biome);
        parent.appendChild(createCheckbox(biome, false));
    }

    let index = -1;
    const createBlockElement = (block) => {
        index += 1;
        return Utils.createElement('div', {
            class: ['card', 'flex-column', 'title'],
            css: {
                'grid-area': (parseInt(index / 2) + 3) + ' / ' + ((index % 2) + 1) + ' / span 1 / span 1'
            },
            children: [
                Utils.createElement('h3', {
                    class: 'flex-keep',
                    text: 'Layer ' + (index + 1) + ': ' + block.name
                }),
                Utils.createElement('div', {
                    class: 'hr'
                }),
                Utils.createElement('div', {
                    class: ['element', 'flex-remaining', 'inner'],
                    children: [
                        Utils.createElement('p', {
                            css: {
                                'text-align': 'center'
                            },
                            children: [
                                Utils.createElement('b', {
                                    text: 'Supported Biomes'
                                })
                            ]
                        })
                    ]
                }, function() {
                    let used = [];

                    for (let biome in block.biomes) {
                        biome = biome || 'default';
                        if (used.indexOf(biome) != -1) continue;
                        used.push(biome);

                        this.appendChild(createCheckbox(biome, true));
                    }

                    for (let biome of assets.biomes) {
                        biome = biome || 'default';
                        if (used.indexOf(biome) != -1) continue;
                        used.push(biome);

                        this.appendChild(createCheckbox(biome, false));
                    }
                })
            ]
        })
    }

    parent = document.querySelector('.cards');
    for (const block of assets.blockTypes) {
        parent.appendChild(createBlockElement(block));
    }
}

document.getElementById('restore').addEventListener('click', function() {

});

document.getElementById('loadjs').addEventListener('click', function() {
    openFilePanel(function(event) {
        let loaded = false;
        for (const asset of event.target.files) {
            if (asset.name == 'assets.js') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    assets = new Function(e.target.result.toString() + 'return assets;').call();
                    loaded = true;
                };
                reader.readAsBinaryString(asset);
            } else {
                extras.push(asset);
            }
        }

        const interval = setInterval(() => {
            if (loaded) {
                window.clearInterval(interval);
                loadAssetsUI();
            }
        }, 10);
    })
});

document.getElementById('new').addEventListener('click', function() {
    assets = {biomes: [], blockTypes: []};
    loadAssetsUI();
});