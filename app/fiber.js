export class Component {
    constructor(props) {
        this.props = props || {};
        this.state = null;
    }

    static render(vdom, parent = null) {
        const props = Object.assign({}, vdom.props);
        if (Component.isPrototypeOf(vdom.type)) {
            const instance = new (vdom.type)(props);
            instance.componentWillMount();
            instance.base = render(instance.render(), parent);
            instance.base._instance = instance;
            instance.base._key      = vdom.props ? vdom.props.key : null;
            instance.componentDidMount();
            return instance.base;
        } else {
            return render(vdom.type(props), parent);
        }
    }

    static rerender(dom, vdom, parent = dom.parentNode) {
        const props = Object.assign({}, vdom.props);
        console.log(props);
        if (dom._instance && dom._instance.constructor == vdom.type) {
            dom._instance.componentWillReceiveProps(props);
            dom._instance.props = props;
            return rerender(dom, dom._instance.render(), parent);
        } else if (Component.isPrototypeOf(vdom.type)) {
            const ndom = Component.render(vdom, parent);
            return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
        } else if (!Component.isPrototypeOf(vdom.type)) {
            return rerender(dom, vdom.type(props), parent);
        }
    }

    setState(next) {
        const compat = (a) => typeof this.state == 'object' && typeof a == 'object';
        if (this.base && this.shouldComponentUpdate(this.props, next)) {
            const prevState = this.state;
            this.componentWillUpdate(this.props, next);
            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
            rerender(this.base, this.render());
            this.componentDidUpdate(this.props, prevState);
        } else {
            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps != this.props || nextState != this.state;
    }

    componentWillReceiveProps(nextProps) {
        return nextProps;
    }

    componentWillUpdate(nextProps, nextState) {
        return [nextProps, nextState];
    }

    componentDidUpdate(prevProps, prevState) {
        return [prevProps, prevState];
    }

    componentWillMount() {
        return true;
    }

    componentDidMount() {
        return true;
    }

    componentWillUnmount() {
        return true;
    }
};

const mount = (element, dom) => dom.appendChild(element);
const replace = (new_el, old_el, dom = new_el.parentNode) => (dom.replaceChild(new_el, old_el) && new_el);

export const createTextElement = (text) => {
    return {
        type: 'TEXT',
        props: {
            nodeValue: text
        }
    }
}

export const createElement = (type, props, ...children) => {
    return {
        type,
        props : {
            ...props,
            children: children.map(child => {
                return typeof child == 'object'
                    ? child
                    : createTextElement(child)
            })
        }
    }
}

const setDomAttribute = (dom, prop, value) => {
    if(prop.startsWith('on')) {
        if(typeof value == 'function') {
            const eventType = prop.slice(2).toLowerCase();
            dom._handlers = dom._handlers || {};
            dom.removeEventListener(event, dom._handlers[eventType]);
            dom._handlers[eventType] = value;
            dom.addEventListener(eventType, dom._handlers[eventType]);
        }
    } else if(['checked', 'value', 'className'].includes(prop)) {
        dom[prop] = value;
    } else if(prop == 'style') {
        if(typeof value == 'object')
            Object.assign(dom.style, value);
    } else if(prop == 'ref') {
        if(typeof value == 'function')
            value(dom);
    } else if(prop == 'key') {
        dom._key = value;
    } else if(typeof value != 'object') {
        if(typeof value != 'function')
            dom.setAttribute(prop, value);
    }
}

export const render = (vdom, dom) => {
    if(typeof vdom == 'object') {
        if(vdom.type == 'TEXT') {
            return mount(document.createTextNode(vdom.props.nodeValue), dom);
        } else {
            if(typeof vdom.type == 'function') {
                return Component.render(vdom, dom);
            } else if(typeof vdom.type == 'string') {
                let element = document.createElement(vdom.type);
                if(vdom.props) {
                    for(const prop in vdom.props) 
                        setDomAttribute(element, prop, vdom.props[prop]);
                    if(vdom.props.children)
                        for(const child of [].concat(...vdom.props.children))
                            render(child, element);
                }
    
                return mount(element, dom);
            }
        }
    } else if (typeof vdom == 'boolean' || vdom === null) {
        return mount(document.createTextNode(''));
    }
}

const patch_tree = (dom, vdom) => {
    const pool   = {};
    const active = document.activeElement;
    [].concat(...dom.childNodes).map((c, i) => {
        const key = c._key || `_index_${i}`;
        pool[key] = c;
    });
    [].concat(...vdom.props.children).map((c, i) => {
        const key = c.props && c.props.key || `_index_${i}`;
        pool[key] ? rerender(pool[key], c) : render(c, dom);
        delete pool[key];
    })

    for (const key in pool) {
        const instance = pool[key]._instance;
        if (instance) instance.componentWillUnmount();
        pool[key].remove();
    }

    for (const attr of dom.attributes) dom.removeAttribute(attr.name);
    for (const prop in vdom.props) setDomAttribute(dom, prop, vdom.props[prop]);
    active.focus();
    return dom;
}

const rerender = (dom, vdom, parent = dom.parentNode) => {
    if(typeof vdom == 'object')
        if(typeof vdom.type == 'function')
            return Component.rerender(dom, vdom, parent);
        else if(dom.nodeName != vdom.type.toUpperCase())
            return replace(render(vdom, parent), dom);
        else if(dom.nodeName == vdom.type.toUpperCase())
            return patch_tree(dom, vdom);
    else if(dom instanceof Text)
        if(dom.textContent != vdom.props.nodeValue)
            return replace(render(vdom, parent), dom);
}

export default {
    createTextElement,
    createElement,
    setDomAttribute,
    render,
    Component,
}