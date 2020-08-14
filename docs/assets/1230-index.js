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

function AtomicoBrand({ color, width }) {
  return (
    h('host', null
      , h('svg', {
        width: width,
        style: "display:inline-block",
        viewBox: "0 0 287.407 86.961"   ,}
      
        , h('g', { transform: "translate(-331.97 -291.125)" ,}
          , h('g', { transform: "translate(321.97 336.23) rotate(-45)"  ,}
            , h('path', {
              d: "M12.46,13.481a13.426,13.426,0,0,1-1.819-.124L1.962,4.681c.92.19,1.862.341,2.8.447L13.1,13.466C12.888,13.476,12.672,13.481,12.46,13.481Zm2.554-.246L7.084,5.3c.406.016.821.024,1.234.024.373,0,.75-.006,1.121-.02l7.425,7.425a13.343,13.343,0,0,1-1.851.5ZM7.763,12.63A13.206,13.206,0,0,1,3.047,9.583,13.212,13.212,0,0,1,0,4.866L7.764,12.63Zm10.612-.53L11.45,5.175c.692-.069,1.389-.162,2.075-.277l6.339,6.339a13.261,13.261,0,0,1-1.488.865Zm2.709-1.788L15.316,4.543c.623-.143,1.25-.307,1.863-.488l5.1,5.1c-.13.143-.268.287-.408.427-.253.253-.519.5-.788.728Zm2.162-2.334h0L18.8,3.529c.565-.2,1.135-.423,1.692-.66l3.666,3.666a13.279,13.279,0,0,1-.908,1.441Zm1.594-2.9h0L21.965,2.2c.519-.252,1.038-.524,1.545-.807L25.4,3.286a13.317,13.317,0,0,1-.562,1.787Zm.871-3.627h0L24.859.594c.3-.19.611-.389.913-.594a13.435,13.435,0,0,1-.06,1.447Z",
              transform: "translate(21.134 55.622)" ,
              fill: color,}
            )
            , h('path', {
              d: "M29.6,59.192a29.813,29.813,0,0,1-5.966-.6,29.434,29.434,0,0,1-10.583-4.453A29.685,29.685,0,0,1,2.326,41.117,29.444,29.444,0,0,1,.6,35.562a29.891,29.891,0,0,1,0-11.939A29.429,29.429,0,0,1,5.055,13.048,29.685,29.685,0,0,1,18.076,2.326,29.447,29.447,0,0,1,23.631.6,29.859,29.859,0,0,1,36.69.856,29.505,29.505,0,0,1,48.814,7.088a29.805,29.805,0,0,1,4.625,4.971,18.694,18.694,0,0,0,0,35.078,29.734,29.734,0,0,1-10.273,8.77A29.464,29.464,0,0,1,29.6,59.192Z",
              transform: "translate(0 0)" ,
              fill: color,}
            )
            , h('path', {
              d: "M9.792,31.852H23.54a16.714,16.714,0,0,1-13.748,0ZM6.6,29.953a16.774,16.774,0,0,1-2.275-2.082H29a16.774,16.774,0,0,1-2.275,2.082ZM2.838,25.971a16.655,16.655,0,0,1-1.2-2.082H31.688a16.641,16.641,0,0,1-1.2,2.082ZM.869,21.989a16.534,16.534,0,0,1-.553-2.082h32.7a16.563,16.563,0,0,1-.553,2.082ZM.053,18.008Q0,17.344,0,16.666q0-.372.016-.739h33.3q.016.367.016.739,0,.677-.053,1.342Zm.154-3.982a16.579,16.579,0,0,1,.47-2.082H32.653a16.57,16.57,0,0,1,.47,2.082Zm1.159-3.982A16.614,16.614,0,0,1,2.447,7.963H30.879a16.645,16.645,0,0,1,1.081,2.082Zm2.44-3.982A16.771,16.771,0,0,1,5.855,3.982H27.476a16.759,16.759,0,0,1,2.048,2.082ZM8.593,2.082a16.692,16.692,0,0,1,16.144,0Z",
              transform: "translate(43.232 12.774)" ,
              fill: color,}
            )
          )
          , h('path', {
            d: "M27.725-47.09h4.524L20.421-79.745H15.473L3.6-47.09H8.122L10.759-54.4H25.086ZM23.861-57.881H11.987l5.937-16.587Zm14.514,3.723c0,5.183,2.594,7.068,7.163,7.068H49.4v-3.628H46.245c-2.637,0-3.581-.9-3.581-3.44v-15.22H49.4v-3.534h-6.74v-6.5H38.375v6.5H35.029v3.534h3.346Zm40.713-5.89c0-8.152-5.7-13.288-13.053-13.288-7.306,0-13.053,5.136-13.053,13.288,0,8.2,5.56,13.383,12.864,13.383C73.2-46.666,79.088-51.849,79.088-60.048Zm-21.723,0c0-6.5,4.1-9.566,8.623-9.566,4.429,0,8.718,3.063,8.718,9.566,0,6.55-4.382,9.613-8.859,9.613s-8.482-3.063-8.482-9.613ZM122.016-47.09h4.241V-62.31c0-7.4-4.571-11.074-10.462-11.074a9.559,9.559,0,0,0-9.142,5.75c-1.7-3.864-5.231-5.75-9.471-5.75A9.336,9.336,0,0,0,89.03-69.19v-3.723H84.742V-47.09H89.03V-61.321c0-5.56,2.969-8.341,7.306-8.341,4.241,0,7.068,2.686,7.068,7.964V-47.09h4.241V-61.321c0-5.56,2.969-8.341,7.306-8.341,4.241,0,7.068,2.686,7.068,7.964Zm11.262,0h4.288V-72.913h-4.288Zm2.215-30.017a2.857,2.857,0,0,0,2.024-.87,2.857,2.857,0,0,0,.8-2.051,2.857,2.857,0,0,0-.8-2.051,2.857,2.857,0,0,0-2.024-.87,2.877,2.877,0,0,0-2.079.842,2.877,2.877,0,0,0-.842,2.079,2.877,2.877,0,0,0,.842,2.079A2.877,2.877,0,0,0,135.493-77.106Zm7.775,17.058c0,8.2,5.231,13.383,12.58,13.383,6.41,0,10.6-3.58,11.923-8.718h-4.618c-.942,3.251-3.487,5.089-7.3,5.089-4.712,0-8.2-3.346-8.2-9.754,0-6.314,3.487-9.66,8.2-9.66,3.817,0,6.409,1.979,7.3,5.089h4.618c-1.32-5.419-5.513-8.718-11.922-8.718-7.351,0-12.582,5.183-12.582,13.288Zm54.708,0c0-8.152-5.7-13.288-13.053-13.288-7.306,0-13.053,5.136-13.053,13.288,0,8.2,5.561,13.383,12.864,13.383C192.087-46.666,197.976-51.849,197.976-60.048Zm-21.723,0c0-6.5,4.1-9.566,8.623-9.566,4.429,0,8.718,3.063,8.718,9.566,0,6.55-4.382,9.613-8.859,9.613S176.253-53.5,176.253-60.048Z",
            transform: "translate(411.401 397.056)" ,
            fill: color,}
          )
        )
      )
    )
  );
}

AtomicoBrand.props = {
  color: {
    type: String,
    value: "#fff",
  },
  width: {
    type: String,
    value: "280px",
  },
};

customElements.define("atomico-brand", c(AtomicoBrand));

function e(e){for(var t,n=0,r=0,s=e.length;s>=4;++r,s-=4)t=1540483477*(65535&(t=255&e.charCodeAt(r)|(255&e.charCodeAt(++r))<<8|(255&e.charCodeAt(++r))<<16|(255&e.charCodeAt(++r))<<24))+(59797*(t>>>16)<<16),n=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&n)+(59797*(n>>>16)<<16);switch(s){case 3:n^=(255&e.charCodeAt(r+2))<<16;case 2:n^=(255&e.charCodeAt(r+1))<<8;case 1:n=1540483477*(65535&(n^=255&e.charCodeAt(r)))+(59797*(n>>>16)<<16);}return (((n=1540483477*(65535&(n^=n>>>13))+(59797*(n>>>16)<<16))^n>>>15)>>>0).toString(36)}var t=/^(br|hy|us|wr|text-si|scroll-snap-t)/,n=/^(ap|us|tab-|border-e|margin-e|margin-s|padding-e|padding-s|border-sta)/,r=/^(ap|br|hy|us|wr|mas|colu|clip-|box-de|font-k|text-e|font-fe|shape-i|text-or|text-si|border-e|margin-e|margin-s|padding-e|padding-s|border-sta|background-cl|scroll-snap-t|text-decoration-)/,s=/^(pos|background-cl)/,o={};const c$1="undefined"!=typeof window;function a(){let e=document.getElementById("__otion");return e||(e=document.createElement("style"),e.id="__otion",document.head.appendChild(e))}function l({nonce:e,target:t=a().sheet}){return t.ownerNode.nonce=e,{sheet:t,insert(e,n){try{return t.insertRule(e,n)}catch{return -1}}}}const f={insert:()=>0};function d(e){return e.trim().replace(/\s+/g," ")}const p=/^(-|f[lo].*?[^se]$|g.{6,}[^ps]$|z|o[pr]|(-w.{6})?li.*?(t|mp)$|an|(bo|s).{5}im|sca|m.{7}[ds]|ta|c.*?[st]$|wido|ini)/,h$1=/^(?:(border-(?!w|c|sty)|[tlbr].{2,4}m?$|c.{7}$)|([fl].{5}l|g.{8}$|pl))/,m=new Map([["nk",1],["sited",2],["pty",3],["cus-w",4],["ver",5],["cus",6],["cus-v",7],["tive",8],["sable",9]]);function g(e,t,n){let r=0;if(!("-"===e[1])){const t="-"===e[0]?e.slice(e.indexOf("-",1))+1:e,n=h$1.exec(t);r=(n?+!!n[1]||-!!n[2]:0)+1;let s=1;for(;s=t.indexOf("-",s)+1;)++r;}return r*=2*(t&&m.get(t.slice(3,8))||10),r+=+n,r}function y(e){return "-"+e.toLowerCase()}function b(){let a,h,m,b;function $(e){for(let t=e;t<=72;++t)++b[t];}function x(e,t){if(1===e.type){const{selectorText:n,style:r}=e,[,s,o]=/^..([0-9a-z]+)(:.*)?/.exec(n),c=r[0];c&&$(g(c,o,!!t)),m.set(s,m.size);}else x(e.cssRules[0],!0);}function A(e,t){const n="number"!=typeof t||p.test(e)?d(""+t):t+"px";return h(e,n)}function k(e,t){if("object"!=typeof t)return A(e,t);let n="";return t.forEach(t=>{n+=";"+A(e,t);}),n.slice(1)}return {setup(e){a=e.injector||(c$1?l({}):f),h=e.prefix||((e,c)=>{const i=`${e}:${function(e,t){return s.test(e)?t.replace(/(sticky|text)/,"-webkit-$1, $1"):t}(e,c)}`;let a=i;const l=function(e){return o[e]?o[e]:o[e]=1*t.test(e)|2*n.test(e)|4*r.test(e)}(e);return 1&l&&(a+=";-ms-"+i),2&l&&(a+=";-moz-"+i),4&l&&(a+=";-webkit-"+i),a}),m=new Map,b=new Uint16Array(72);},hydrate(){const{cssRules:e}=a.sheet;for(let t=0,{length:n}=e;t<n;++t){const n=e[t];7===n.type?m.set(n.name,m.size):x(n);}},css:t=>(function t(n,r,s,o,c){let i="";for(var l in n){const u=n[l];if(null!=u)if("object"!=typeof u||Array.isArray(u)){const t=l.replace(/^ms|[A-Z]/g,y),n=k(t,u),f="_"+e(r+n),d=s;let p=m.get(f);if(null==p||d){const e=g(t,null==c?"":r.slice(c),!!d);if(null==p||o[e]>p){const t="."+f;a.insert(`${r.slice(0,c)+t+(null!=c?r.slice(c).replace(/&/g,t)+"{":"{")}${n}}${s}`,b[e]),$(e),p=m.size,m.set(f,p),d&&(o[e]=Math.max(o[e],p));}}i+=" "+f;}else {let e,n=":"===l[0]||"@"===l[0]||"&"===l[0]?l:d(l).replace(/([([]) | ([)\]])| ?(:) ?/g,"$1$2$3"),a="",f=c;null==f&&(":"===n[0]||"&"===n[0]?(f=r.length,e=n.split(/,(?![^[]*?[^\\]["']\s*?\])/).map(e=>d(e).replace("&",""))):"selectors"===n?n="":"@"!==n[0]&&(n+="{",a="}")),(e||[n]).forEach(e=>{i+=t(u,r+e,a+s,o,f);});}}return i}(t,"","",new Uint16Array(72)).slice(1)),keyframes(t){let n;return {toString(){if(!n){let o="";for(var r in t){o+=r+"{";const e=t[r];for(var s in e){const t=e[s];null!=t&&(o+=k(s,t));}o+="}";}n="_"+e(o),m.has(n)||(a.insert(`@keyframes ${n}{${o}}`,m.size),m.set(n,m.size));}return n}}}}}const w=b();w.setup({});const A=w.css;

const MyComponent = ({ mono, casl, wght, slnt, CRSV }) => {
  return (
    h('host', null
      , h('h3', { className: A({ 
          fontVariationSettings: `'MONO' ${mono}, 'CASL' ${casl}, 'wght' ${wght}, 'slnt' ${slnt}, 'CRSV' ${CRSV}`,
          padding: 20,
          backgroundColor: "lightgrey",
          borderRadius: "10px",
          fontSize: "20px"
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
  }
};

customElements.define("text-component", c(MyComponent));

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
      , h('div', null
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
