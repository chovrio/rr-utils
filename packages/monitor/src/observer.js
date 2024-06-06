"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserverDOM = exports.ObserverElem = void 0;
const utils_1 = require("./utils");
function ObserverElem(elem, options, callback) {
    if (!(0, utils_1.isElement)(elem)) {
        console.error('IntersectionObserver Error: 只能监听元素节点');
        return;
    }
    const { visiblePercent = 1, hiddenPercent = 0, ...restOptions } = options || {};
    const threshold = [visiblePercent, hiddenPercent];
    const intersectionObserver = new IntersectionObserver(function (entries) {
        const ratio = entries[0].intersectionRatio;
        callback(ratio, entries);
    }, {
        ...restOptions,
        threshold
    });
    intersectionObserver.observe(elem);
    return intersectionObserver;
}
exports.ObserverElem = ObserverElem;
function ObserverDOM(callback) {
    const observer = new MutationObserver((0, utils_1.debounce)(function (mutations) {
        if (!mutations.length)
            return;
        const nodes = Array.from(document.querySelectorAll('[data-monitor-name]'));
        nodes.map(node => {
            if (node.hasAttribute('data-monitor-id')) {
                const key = node.getAttribute('data-monitor-id');
                const name = node.getAttribute('data-monitor-name');
                callback?.({
                    node,
                    name,
                    key
                }, false);
                return;
            }
            const uuid = (0, utils_1.generateUUID)();
            const name = node.getAttribute('data-monitor-name') || '';
            node.setAttribute('data-monitor-id', uuid);
            const realNode = node?.tagName?.toLowerCase() === 'monitor' ? node.children?.[0] : node;
            if (realNode) {
                callback?.({
                    node: realNode,
                    key: uuid,
                    name
                }, true);
            }
        });
    }));
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
    });
    return observer;
}
exports.ObserverDOM = ObserverDOM;
