/**
 * compare 2 array
 * ```js
 * isEqualArray([1,2,3,4],[1,2,3,4]) // true
 * isEqualArray([1,2,3,4],[1,2,3])   // false
 * isEqualArray([5,1,2,3],[1,2,3,5]) // false
 * isEqualArray([],[]) // true
 * ```
 * @param {any[]} before
 * @param {any[]} after
 * @returns {boolean}
 */
/**
 * Determine if the value is considered a function
 * @param {any} value
 */
const isFunction = (value) => typeof value == "function";

/**
 * Determines if the value is considered an object
 * @param {any} value
 */
const isObject = (value) => typeof value == "object";

const KEY = Symbol("");
const GLOBAL_ID = Symbol("");
const FROM_PROP = {
    id: 1,
    className: 1,
    checked: 1,
    value: 1,
    selected: 1,
};
const WITH_ATTR = {
    list: 1,
    type: 1,
    size: 1,
    form: 1,
    width: 1,
    height: 1,
    src: 1,
};
const EMPTY_PROPS = {};
const EMPTY_CHILDREN = [];
const TYPE_TEXT = 3;
const TYPE_ELEMENT = 1;
const $ = document;
const vdom = Symbol();
/**
 * @typedef {object} vdom
 * @property {any} type
 * @property {symbol} vdom
 * @property {Object.<string,any>} props
 * @property {import("./internal").flatParamMap} [children]
 * @property {any} [key]
 * @property {boolean} [raw]
 * @property {boolean} [shadow]
 */

/**
 * @param {any} type
 * @param {object} [p]
 * @param  {...any} children
 * @returns {vdom}
 */
function h(type, p, ...children) {
    let props = p || EMPTY_PROPS;

    children = flat(props.children || children, type == "style");

    if (!children.length) {
        children = EMPTY_CHILDREN;
    }

    return {
        vdom,
        type,
        props,
        children,
        key: props.key,
        shadow: props.shadowDom,
        //@ts-ignore
        raw: type.nodeType == TYPE_ELEMENT,
    };
}

/**
 * @param {vdom} vnode
 * @param {Element} node
 * @param {Symbol|string} [id]
 */
let render = (vnode, node, id = GLOBAL_ID) => diff(id, node, vnode);

/**
 * Create or update a node
 * Node: The declaration of types through JSDOC does not allow to compress
 * the exploration of the parameters
 * @param {any} id
 * @param {any} node
 * @param {any} vnode
 * @param {boolean} [isSvg]
 */
function diff(id, node, vnode, isSvg) {
    let isNewNode;
    // If the node maintains the source vnode it escapes from the update tree
    if (node && node[id] && node[id].vnode == vnode) return node;
    // Injecting object out of Atomico context
    if (vnode && vnode.type && vnode.vdom != vdom) return node;

    // The process only continues when you may need to create a node
    if (vnode != null || !node) {
        isSvg = isSvg || vnode.type == "svg";
        isNewNode =
            vnode.type != "host" &&
            (vnode.raw
                ? node != vnode.type
                : node
                ? node.localName != vnode.type
                : !node);

        if (isNewNode) {
            let nextNode;
            if (vnode.type != null) {
                nextNode = vnode.raw
                    ? vnode.type
                    : isSvg
                    ? $.createElementNS(
                          "http://www.w3.org/2000/svg",
                          vnode.type
                      )
                    : $.createElement(
                          vnode.type,
                          vnode.is ? { is: vnode.is } : null
                      );
            } else {
                return $.createTextNode(vnode + "");
            }

            node = nextNode;
        }
    }
    if (node.nodeType == TYPE_TEXT) {
        vnode += "";
        if (node.data != vnode) {
            node.data = vnode || "";
        }
        return node;
    }

    let oldVNode = node[id] ? node[id].vnode : EMPTY_PROPS;
    let oldVnodeProps = oldVNode.props || EMPTY_PROPS;
    let oldVnodeChildren = oldVNode.children || EMPTY_CHILDREN;
    let handlers = isNewNode || !node[id] ? {} : node[id].handlers;

    if (vnode.shadow) {
        if (!node.shadowRoot) {
            node.attachShadow({ mode: "open" });
        }
    }

    if (vnode.props != oldVnodeProps) {
        diffProps(node, oldVnodeProps, vnode.props, handlers, isSvg);
    }

    if (vnode.children != oldVnodeChildren) {
        let nextParent = vnode.shadow ? node.shadowRoot : node;
        diffChildren(id, nextParent, vnode.children, isSvg);
    }

    node[id] = { vnode, handlers };

    return node;
}
/**
 *
 * @param {any} id
 * @param {Element|Node} parent
 * @param {import("./internal").flatParamMap} children
 * @param {boolean} isSvg
 */
function diffChildren(id, parent, children, isSvg) {
    let keyes = children._;
    let childrenLenght = children.length;
    let childNodes = parent.childNodes;
    let childNodesLength = childNodes.length;
    let index = keyes
        ? 0
        : childNodesLength > childrenLenght
        ? childrenLenght
        : childNodesLength;

    for (; index < childNodesLength; index++) {
        let childNode = childNodes[index];

        if (keyes) {
            let key = childNode[KEY];
            if (keyes.has(key)) {
                keyes.set(key, childNode);
                continue;
            }
        }

        index--;
        childNodesLength--;
        childNode.remove();
    }
    for (let i = 0; i < childrenLenght; i++) {
        let child = children[i];
        let indexChildNode = childNodes[i];
        let key = keyes ? child.key : i;
        let childNode = keyes ? keyes.get(key) : indexChildNode;

        if (keyes && childNode) {
            if (childNode != indexChildNode) {
                parent.insertBefore(childNode, indexChildNode);
            }
        }

        if (keyes && child.key == null) continue;

        let nextChildNode = diff(id, childNode, child, isSvg);

        if (!childNode) {
            if (childNodes[i]) {
                parent.insertBefore(nextChildNode, childNodes[i]);
            } else {
                parent.appendChild(nextChildNode);
            }
        } else if (nextChildNode != childNode) {
            parent.replaceChild(nextChildNode, childNode);
        }
    }
}

/**
 *
 * @param {Node} node
 * @param {Object} props
 * @param {Object} nextProps
 * @param {boolean} isSvg
 * @param {Object} handlers
 **/
function diffProps(node, props, nextProps, handlers, isSvg) {
    for (let key in props) {
        if (!(key in nextProps)) {
            setProperty(node, key, props[key], null, isSvg, handlers);
        }
    }
    for (let key in nextProps) {
        setProperty(node, key, props[key], nextProps[key], isSvg, handlers);
    }
}

function setProperty(node, key, prevValue, nextValue, isSvg, handlers) {
    key = key == "class" && !isSvg ? "className" : key;
    // define empty value
    prevValue = prevValue == null ? null : prevValue;
    nextValue = nextValue == null ? null : nextValue;

    if (key in node && FROM_PROP[key]) {
        prevValue = node[key];
    }

    if (nextValue === prevValue || key == "shadowDom") return;

    if (
        key[0] == "o" &&
        key[1] == "n" &&
        (isFunction(nextValue) || isFunction(prevValue))
    ) {
        setEvent(node, key, nextValue, handlers);
    } else if (key == "key") {
        node[KEY] = nextValue;
    } else if (key == "ref") {
        if (nextValue) nextValue.current = node;
    } else if (key == "style") {
        let style = node.style;

        prevValue = prevValue || "";
        nextValue = nextValue || "";

        let prevIsObject = isObject(prevValue);
        let nextIsObject = isObject(nextValue);

        if (prevIsObject) {
            for (let key in prevValue) {
                if (nextIsObject) {
                    if (!(key in nextValue)) setPropertyStyle(style, key, null);
                } else {
                    break;
                }
            }
        }

        if (nextIsObject) {
            for (let key in nextValue) {
                let value = nextValue[key];
                if (prevIsObject && prevValue[key] === value) continue;
                setPropertyStyle(style, key, value);
            }
        } else {
            style.cssText = nextValue;
        }
    } else {
        if (
            (!isSvg && !WITH_ATTR[key] && key in node) ||
            isFunction(nextValue) ||
            isFunction(prevValue)
        ) {
            node[key] = nextValue == null ? "" : nextValue;
        } else if (nextValue == null) {
            node.removeAttribute(key);
        } else {
            node.setAttribute(
                key,
                isObject(nextValue) ? JSON.stringify(nextValue) : nextValue
            );
        }
    }
}

/**
 *
 * @param {Node} node
 * @param {string} type
 * @param {function} [nextHandler]
 * @param {object} handlers
 */
function setEvent(node, type, nextHandler, handlers) {
    // get the name of the event to use
    type = type.slice(type[2] == "-" ? 3 : 2);
    // add handleEvent to handlers
    if (!handlers.handleEvent) {
        /**
         * {@link https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener#The_value_of_this_within_the_handler}
         **/
        handlers.handleEvent = (event) =>
            handlers[event.type].call(node, event);
    }
    if (nextHandler) {
        // create the subscriber if it does not exist
        if (!handlers[type]) {
            node.addEventListener(type, handlers);
        }
        // update the associated event
        handlers[type] = nextHandler;
    } else {
        // 	delete the associated event
        if (handlers[type]) {
            node.removeEventListener(type, handlers);
            delete handlers[type];
        }
    }
}

function setPropertyStyle(style, key, value) {
    let method = "setProperty";
    if (value == null) {
        method = "removeProperty";
        value = null;
    }
    if (~key.indexOf("-")) {
        style[method](key, value);
    } else {
        style[key] = value;
    }
}
/**
 * @param {Array<any>} children
 * @param {boolean} saniate - If true, children only accept text strings
 * @param {import("./internal").flatParamMap} map
 * @returns {any[]}
 */
function flat(children, saniate, map = []) {
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child) {
            if (Array.isArray(child)) {
                flat(child, saniate, map);
                continue;
            }
            if (child.key != null) {
                if (!map._) map._ = new Map();

                map._.set(child.key, 0);
            }
        }
        let type = typeof child;
        child =
            child == null ||
            type == "boolean" ||
            type == "function" ||
            (type == "object" && (child.vdom != vdom || saniate))
                ? ""
                : child;
        if (saniate) {
            map[0] = (map[0] || "") + child;
        } else {
            map.push(child);
        }
    }
    return map;
}

const HOOK_MOUNT = 1;

const HOOK_MOUNTED = 2;

const HOOK_UPDATE = 3;

const HOOK_UPDATED = 4;

const HOOK_UNMOUNT = 5;

/**
 * @type {{index?:number,ref?:any}}
 */
const HOOK_CURRENT = {};

/**
 * @template T
 * @callback reducer
 * @param {T} state
 * @param {number} type
 * @returns {T}
 */

/**
 * @template T
 * @typedef {[(state:T,type:number )=>T,T]} hook
 */

/**
 * @template T
 * @param {hook<T>} hook
 * @param {number} type
 */
function update(hook, type) {
    hook[0] && (hook[1] = hook[0](hook[1], type));
}

/**
 * @template T
 * @param {Object.<number,hook<any>>} hooks
 * @param {number} type
 */
function updateAll(hooks, type) {
    for (let i in hooks) update(hooks[i], type);
}
/**
 * @template T
 * @param {reducer<any>|0} reducer
 * @param {T} [initialState]
 * @returns {T}
 */
function useHook(reducer, initialState) {
    if (HOOK_CURRENT.ref.hook) {
        return HOOK_CURRENT.ref.hook.use(reducer, initialState)[1];
    }
}
/**
 * @returns {()=>void}
 */
function useRender() {
    return HOOK_CURRENT.ref.render;
}
/**
 *
 * @param {()=>void} render
 * @param {any} host
 */
function createHooks(render, host) {
    /**
     * @type {Object.<number,hook<any>>}
     **/
    let hooks = {};

    let mounted;

    let hook = {
        use,
        load,
        updated,
        unmount,
    };

    let ref = { hook, host, render };
    /**
     * @template T,R
     * @param {(param:T)=>R} callback
     * @param {T} param
     * @returns {R}
     */
    function load(callback, param) {
        HOOK_CURRENT.index = 0;
        HOOK_CURRENT.ref = ref;
        let resolve = callback(param);
        HOOK_CURRENT.ref = 0;
        return resolve;
    }
    /**
     * @template T
     * @param {reducer<T>} reducer
     * @param {T} state
     */
    function use(reducer, state) {
        let index = HOOK_CURRENT.index++;
        let mount;
        // record the hook and the initial state of this
        if (!hooks[index]) {
            hooks[index] = [null, state];
            mount = 1;
        }
        // The hook always receives the last reduce.
        hooks[index][0] = reducer;

        update(hooks[index], mount ? HOOK_MOUNT : HOOK_UPDATE);

        return hooks[index];
    }
    function updated() {
        let type = mounted ? HOOK_UPDATED : HOOK_MOUNTED;
        mounted = 1;
        updateAll(hooks, type);
    }
    function unmount() {
        updateAll(hooks, HOOK_UNMOUNT);
    }
    return hook;
}

/**
 * The Any type avoids the validation of prop types
 * @type {null}
 **/
const Any = null;

/**
 * Attributes considered as valid boleanos
 * @type {Array<true|1|""|"1"|"true">}
 **/
const TRUE_VALUES = [true, 1, "", "1", "true"];

/**
 * Constructs the setter and getter of the associated property
 * only if it is not defined in the prototype
 * @param {Object} proto
 * @param {string} prop
 * @param {any} schema
 * @param {Object.<string,any>} attrs
 * @param {Object.<string,any>} values
 */
function setPrototype(proto, prop, schema, attrs, values) {
    if (!(prop in proto)) {
        /**@type {Schema} */
        let { type, reflect, event, value, attr = getAttr(prop) } =
            isObject(schema) && schema != Any ? schema : { type: schema };

        let isCallable = !(type == Function || type == Any);

        Object.defineProperty(proto, prop, {
            set(newValue) {
                let oldValue = this[prop];

                let { error, value } = filterValue(
                    type,
                    isCallable && isFunction(newValue)
                        ? newValue(oldValue)
                        : newValue
                );

                if (error && value != null) {
                    throw `The value defined for prop '${prop}' must be of type '${type.name}'`;
                }

                if (oldValue == value) return;

                this._props[prop] = value;

                this._update();

                this.updated.then(() => {
                    if (event) dispatchEvent(this, event);

                    if (reflect) {
                        this._ignoreAttr = attr;
                        reflectValue(this, type, attr, this[prop]);
                        this._ignoreAttr = null;
                    }
                });
            },
            get() {
                return this._props[prop];
            },
        });

        if (value != null) {
            values[prop] = value;
        }

        attrs[attr] = prop;
    }
}

/**
 * Dispatch an event
 * @param {Element} node - DOM node to dispatch the event
 * @param {Event} event - Event to dispatch on node
 */
const dispatchEvent = (node, { type, ...eventInit }) =>
    node.dispatchEvent(new CustomEvent(type, eventInit));

/**
 * Transform a Camel Case string to a Kebab case
 * @param {string} prop - string to apply the format
 * @returns {string}
 */
const getAttr = (prop) => prop.replace(/([A-Z])/g, "-$1").toLowerCase();

/**
 * reflects an attribute value of the given element as context
 * @param {Element} context
 * @param {any} type
 * @param {string} attr
 * @param {any} value
 */
const reflectValue = (context, type, attr, value) =>
    value == null || (type == Boolean && !value)
        ? context.removeAttribute(attr)
        : context.setAttribute(
              attr,
              isObject(value)
                  ? JSON.stringify(value)
                  : type == Boolean
                  ? ""
                  : value
          );

/**
 * Filter the values based on their type
 * @param {any} type
 * @param {any} value
 * @returns {{error?:boolean,value:any}}
 */
function filterValue(type, value) {
    if (type == Any) return { value };

    try {
        if (type == Boolean) {
            value = TRUE_VALUES.includes(value);
        } else if (typeof value == "string") {
            value =
                type == Number
                    ? Number(value)
                    : type == Object || type == Array
                    ? JSON.parse(value)
                    : value;
        }
        if ({}.toString.call(value) == `[object ${type.name}]`) {
            return { value, error: type == Number && Number.isNaN(value) };
        }
    } catch (e) {}

    return { value, error: true };
}

/**
 * Type any, used to avoid type validation.
 * @typedef {null} Any
 */

/**
 * Interface used by dispatchEvent to automate event firing
 * @typedef {Object} Event
 * @property {string} type - type of event to dispatch.
 * @property {boolean} [bubbles] - indicating whether the event bubbles. The default is false.
 * @property {boolean} [cancelable] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {boolean} [composed] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {boolean} [detail] - indicating whether the event will trigger listeners outside of a shadow root.
 */

/**
 * @typedef {Object} Schema
 * @property {any} [type] - data type to be worked as property and attribute
 * @property {string} [attr] - allows customizing the name as an attribute by skipping the camelCase format
 * @property {boolean} [reflect] - reflects property as attribute of node
 * @property {Event} [event] - Allows to emit an event every time the property changes
 * @property {any} [value] - defines a default value when instantiating the component
 */

/**
 *
 * @param {any} component
 * @param {typeof HTMLElement} [Base]
 */
function c(component, Base = HTMLElement) {
    /**
     * @type {Object.<string,string>}
     */
    let attrs = {};
    /**
     * @type {Object.<string,string>}
     */
    let values = {};

    let { props } = component;

    class Element extends Base {
        constructor() {
            super();

            this._ignoreAttr = null;
            /**
             * Stores the state of the values that will be consumed by this._update
             * @type {Object.<string,any>}
             */
            this._props = {};
            /**
             * Promise that will be when connectedCallback is executed
             * @type {Promise<null>}
             */
            this.mounted = new Promise((resolve) => (this.mount = resolve));
            /**
             * Promise that will be when disconnectedCallback is executed
             * @type {Promise<null>}
             */
            this.unmounted = new Promise((resolve) => (this.unmount = resolve));

            for (let prop in values) this[prop] = values[prop];

            this._setup();

            this._update();
        }
        async _setup() {
            let id = Symbol();
            let hooks = createHooks(() => this._update(), this);

            this.update = () => {
                render(hooks.load(component, { ...this._props }), this, id);
                hooks.updated();
            };

            await this.unmounted;

            hooks.unmount();
        }
        async _update() {
            if (!this._prevent) {
                this._prevent = true;
                /**@type {()=>void} */
                let resolveUpdate;
                this.updated = new Promise(
                    (resolve) => (resolveUpdate = resolve)
                );

                await this.mounted;

                this.update();

                this._prevent = false;

                resolveUpdate();
            }
        }

        connectedCallback() {
            this.mount();
        }
        disconnectedCallback() {
            this.unmount();
        }
        /**
         *
         * @param {string} attr
         * @param {(string|null)} oldValue
         * @param {(string|null)} value
         */
        attributeChangedCallback(attr, oldValue, value) {
            if (attr === this._ignoreAttr || oldValue === value) return;
            // Choose the property name to send the update
            this[attrs[attr]] = value;
        }
    }

    for (let prop in props) {
        setPrototype(Element.prototype, prop, props[prop], attrs, values);
    }

    Element.observedAttributes = Object.keys(attrs);

    return Element;
}

function useState(initialState) {
    let render = useRender();
    return useHook((state, type) => {
        if (HOOK_MOUNT == type) {
            state[0] = isFunction(initialState) ? initialState() : initialState;
            state[1] = (nextState) => {
                nextState = isFunction(nextState)
                    ? nextState(state[0])
                    : nextState;
                if (nextState != state[0]) {
                    state[0] = nextState;
                    render();
                }
            };
        }
        return state;
    }, []);
}

function e(e){for(var t,n=0,r=0,s=e.length;s>=4;++r,s-=4)t=1540483477*(65535&(t=255&e.charCodeAt(r)|(255&e.charCodeAt(++r))<<8|(255&e.charCodeAt(++r))<<16|(255&e.charCodeAt(++r))<<24))+(59797*(t>>>16)<<16),n=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&n)+(59797*(n>>>16)<<16);switch(s){case 3:n^=(255&e.charCodeAt(r+2))<<16;case 2:n^=(255&e.charCodeAt(r+1))<<8;case 1:n=1540483477*(65535&(n^=255&e.charCodeAt(r)))+(59797*(n>>>16)<<16);}return (((n=1540483477*(65535&(n^=n>>>13))+(59797*(n>>>16)<<16))^n>>>15)>>>0).toString(36)}var t=/^(br|hy|us|wr|text-si|scroll-snap-t)/,n=/^(ap|us|tab-|border-e|margin-e|margin-s|padding-e|padding-s|border-sta)/,r=/^(ap|br|hy|us|wr|mas|colu|clip-|box-de|font-k|text-e|font-fe|shape-i|text-or|text-si|border-e|margin-e|margin-s|padding-e|padding-s|border-sta|background-cl|scroll-snap-t|text-decoration-)/,s=/^(pos|background-cl)/,o={};const c$1="undefined"!=typeof window;function a(){let e=document.getElementById("__otion");return e||(e=document.createElement("style"),e.id="__otion",document.head.appendChild(e))}function l({nonce:e,target:t=a().sheet}){return t.ownerNode.nonce=e,{sheet:t,insert(e,n){try{return t.insertRule(e,n)}catch{return -1}}}}const f={insert:()=>0};function d(e){return e.trim().replace(/\s+/g," ")}const p=/^(-|f[lo].*?[^se]$|g.{6,}[^ps]$|z|o[pr]|(-w.{6})?li.*?(t|mp)$|an|(bo|s).{5}im|sca|m.{7}[ds]|ta|c.*?[st]$|wido|ini)/,h$1=/^(?:(border-(?!w|c|sty)|[tlbr].{2,4}m?$|c.{7}$)|([fl].{5}l|g.{8}$|pl))/,m=new Map([["nk",1],["sited",2],["pty",3],["cus-w",4],["ver",5],["cus",6],["cus-v",7],["tive",8],["sable",9]]);function g(e,t,n){let r=0;if(!("-"===e[1])){const t="-"===e[0]?e.slice(e.indexOf("-",1))+1:e,n=h$1.exec(t);r=(n?+!!n[1]||-!!n[2]:0)+1;let s=1;for(;s=t.indexOf("-",s)+1;)++r;}return r*=2*(t&&m.get(t.slice(3,8))||10),r+=+n,r}function y(e){return "-"+e.toLowerCase()}function b(){let a,h,m,b;function $(e){for(let t=e;t<=72;++t)++b[t];}function x(e,t){if(1===e.type){const{selectorText:n,style:r}=e,[,s,o]=/^..([0-9a-z]+)(:.*)?/.exec(n),c=r[0];c&&$(g(c,o,!!t)),m.set(s,m.size);}else x(e.cssRules[0],!0);}function A(e,t){const n="number"!=typeof t||p.test(e)?d(""+t):t+"px";return h(e,n)}function k(e,t){if("object"!=typeof t)return A(e,t);let n="";return t.forEach(t=>{n+=";"+A(e,t);}),n.slice(1)}return {setup(e){a=e.injector||(c$1?l({}):f),h=e.prefix||((e,c)=>{const i=`${e}:${function(e,t){return s.test(e)?t.replace(/(sticky|text)/,"-webkit-$1, $1"):t}(e,c)}`;let a=i;const l=function(e){return o[e]?o[e]:o[e]=1*t.test(e)|2*n.test(e)|4*r.test(e)}(e);return 1&l&&(a+=";-ms-"+i),2&l&&(a+=";-moz-"+i),4&l&&(a+=";-webkit-"+i),a}),m=new Map,b=new Uint16Array(72);},hydrate(){const{cssRules:e}=a.sheet;for(let t=0,{length:n}=e;t<n;++t){const n=e[t];7===n.type?m.set(n.name,m.size):x(n);}},css:t=>(function t(n,r,s,o,c){let i="";for(var l in n){const u=n[l];if(null!=u)if("object"!=typeof u||Array.isArray(u)){const t=l.replace(/^ms|[A-Z]/g,y),n=k(t,u),f="_"+e(r+n),d=s;let p=m.get(f);if(null==p||d){const e=g(t,null==c?"":r.slice(c),!!d);if(null==p||o[e]>p){const t="."+f;a.insert(`${r.slice(0,c)+t+(null!=c?r.slice(c).replace(/&/g,t)+"{":"{")}${n}}${s}`,b[e]),$(e),p=m.size,m.set(f,p),d&&(o[e]=Math.max(o[e],p));}}i+=" "+f;}else {let e,n=":"===l[0]||"@"===l[0]||"&"===l[0]?l:d(l).replace(/([([]) | ([)\]])| ?(:) ?/g,"$1$2$3"),a="",f=c;null==f&&(":"===n[0]||"&"===n[0]?(f=r.length,e=n.split(/,(?![^[]*?[^\\]["']\s*?\])/).map(e=>d(e).replace("&",""))):"selectors"===n?n="":"@"!==n[0]&&(n+="{",a="}")),(e||[n]).forEach(e=>{i+=t(u,r+e,a+s,o,f);});}}return i}(t,"","",new Uint16Array(72)).slice(1)),keyframes(t){let n;return {toString(){if(!n){let o="";for(var r in t){o+=r+"{";const e=t[r];for(var s in e){const t=e[s];null!=t&&(o+=k(s,t));}o+="}";}n="_"+e(o),m.has(n)||(a.insert(`@keyframes ${n}{${o}}`,m.size),m.set(n,m.size));}return n}}}}}const w=b();w.setup({});const A=w.css;

const BlockComponent = ({ header, attr, min, max }) => {
  const [maxInput] = useState(JSON.parse(max));
  const [minInput] = useState(JSON.parse(min));

  const maxAttributes = {};
  maxAttributes[attr] = maxInput.value;

  const minAttributes = {};
  minAttributes[attr] = minInput.value;

  return (
    h('host', null
      , h('style', null, `
      .cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
      }
      `)
      , h('div', { className: A({ paddingTop: 20 }),}
        , h('h2', null, header)
        , h('div', { class: "cols",}
          , h('div', null
            , h('span', null, maxInput.description)
            , h('text-component', { ...maxAttributes,})
          )

          , h('div', null
            , h('span', null, minInput.description)
            , h('text-component', { ...minAttributes,})
          )
        )
      )
    )
  )
};

BlockComponent.props = {
  header: String,
  attr: String,
  min: String,
  max: String
};

customElements.define("block-component", c(BlockComponent));

const Playground = () => {
  const [mono, setMono] = useState(0);
  const [casl, setCasl] = useState(0);
  const [wght, setWght] = useState(400);
  const [slnt, setSlnt] = useState(0);
  const [CRSV, setCRSV] = useState(0);

  return (
    h('host', null
      , h('text-component', {
        mono: mono,
        casl: casl,
        wght: wght,
        slnt: slnt,
        CRSV: CRSV,
        textStyle: "{\"fontSize\": 50, \"margin\": \"20px 0\"}"    ,}
      
      )

      , h('div', null, "font-variation-settings:"

        , h('playground-slider', {
          className: A({ flex: 3 }),
          name: "MONO",
          value: mono,
          oninput: (event) => setMono(event.target.value),}
        )

        , h('playground-slider', {
          className: A({ flex: 3 }),
          name: "CASL",
          value: casl,
          oninput: (event) => setCasl(event.target.value),}
        )

        , h('playground-slider', {
          className: A({ flex: 3 }),
          name: "wght",
          value: wght,
          min: "300",
          max: "1000",
          step: "100",
          oninput: (event) => setWght(event.target.value),}
        )

        , h('playground-slider', {
          className: A({ flex: 3 }),
          name: "slnt",
          value: slnt,
          min: "-15",
          max: "0",
          step: "1",
          oninput: (event) => setSlnt(event.target.value),}
        )

        , h('playground-slider', {
          className: A({ flex: 3 }),
          name: "CRSV",
          value: CRSV,
          oninput: (event) => setCRSV(event.target.value),}
        )
      )
    )
  )
};

customElements.define("playground-component", c(Playground));

let stylesheet = `
  .slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 60%;
    height: 15px; /* Specified height */
    background: #d3d3d3; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
    border-radius: 50px;
  }
  .slider-text {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .slider-text > span {
    flex: 1;
    margin: 10px 20px;
  }
`;
const PlaygroundSlider = ({ name, value, min, max, step, oninput }) => {
  return (
    h('host', null
      , h('style', null, stylesheet)
      , h('div', { class: "slider-text",}
        , h('span', null, "\"", name, "\" " , value
        , name === "CRSV" ? ';' : ','
        )

        , h('input', { type: "range", min: min, max: max, step: step, value: value, id: name, class: "slider", oninput: oninput,} )
      )
    )
  )
};

PlaygroundSlider.props = {
  name: String,
  value: Number,
  props: String,
  min: {
    type: Number,
    value: 0
  },
  max: {
    type: Number,
    value: 1
  },
  step: {
    type: Number,
    value: 0.05
  }
};

customElements.define("playground-slider", c(PlaygroundSlider));

const MyComponent = ({ mono, casl, wght, slnt, CRSV, textStyle }) => {
  return (
    h('host', null
      , h('div', { className: A({ 
          fontVariationSettings: `'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV}`,
          padding: 20,
          backgroundColor: "#eaeaea",
          borderRadius: "10px",
          fontSize: "24px",
          marginTop: 8,
          ...JSON.parse(textStyle)
        })
      ,}, "The quick brown fox jumps over the lazy dog"

      )
    )
  )
};


MyComponent.props = {
  mono: {
    type: Number,
    value: 0
  },
  casl: {
    type: Number,
    value: 0
  },
  wght: {
    type: Number,
    value: 400
  },
  slnt: {
    type: Number,
    value: 0
  },
  CRSV: {
    type: Number,
    value: 0
  },
  textStyle: {
    type: String,
    value: '{}'
  }
};

customElements.define("text-component", c(MyComponent));
