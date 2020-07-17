const renderComponent = (vdom, dom = null) => {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    return render(vdom.type(props), dom);
}

const mount = (element, dom) => dom.appendChild(element);
const replace = (new_el, old_el, dom) => (dom.replaceChild(new_el, old_el) && new_el);

const setAttribute = (dom, key, value) => {
    if (typeof value == 'function' && key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        dom.__mrHandlers = dom.__mrHandlers || {};
        dom.removeEventListener(eventType, dom.__mrHandlers[eventType]);
        dom.__mrHandlers[eventType] = value;
        dom.addEventListener(eventType, dom.__mrHandlers[eventType]);
    } else if (key == 'checked' || key == 'value' || key == 'className') {
        dom[key] = value;
    } else if (key == 'style' && typeof value == 'object') {
        Object.assign(dom.style, value);
    } else if (key == 'ref' && typeof value == 'function') {
        value(dom);
    } else if (key == 'key') {
        dom.__mrkey = value;
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(key, value);
    }
};

const createTextElement = (text) => {
    return {
        type: 'TEXT',
        props: {
            nodeValue: text
        }
    }
}

const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
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
    if (typeof value == 'function' && prop.startsWith('on')) {
        const eventType = prop.slice(2).toLowerCase();
        dom.__mrHandlers = dom.__mrHandlers || {};
        dom.removeEventListener(eventType, dom.__mrHandlers[eventType]);
        dom.__mrHandlers[eventType] = value;
        dom.addEventListener(eventType, dom.__mrHandlers[eventType]);
    } else if (prop == 'checked' || prop == 'value' || prop == 'className') {
        dom[prop] = value;
    } else if (prop == 'style' && typeof value == 'object') {
        Object.assign(dom.style, value);
    } else if (prop == 'ref' && typeof value == 'function') {
        value(dom);
    } else if (prop == 'key') {
        dom.__mrkey = value;
    } else if (typeof value != 'object' && typeof value != 'function') {
        dom.setAttribute(prop, value);
    }
}

const render = (vdom, dom) => {
    if(typeof vdom == 'object') {
        if(vdom.type == 'TEXT') {
            return mount(document.createTextNode(vdom.props.nodeValue), dom);
        } else {
            if(typeof vdom.type == 'function') {
                return renderComponent(vdom, dom);
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

export default {
    createTextElement,
    createElement,
    setDomAttribute,
    render
}