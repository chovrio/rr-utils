import { ElementInfo, ObserverElemOptions } from './types';
import { debounce, generateUUID, isElement } from './utils';

export function ObserverElem(
  elem: Element,
  options: ObserverElemOptions,
  callback: (ratio: number, elementInfo: Record<string, any>) => void,
) {
  if (!isElement(elem)) {
    console.error('IntersectionObserver Error: 只能监听元素节点');
    return;
  }
  const { visiblePercent = 1, hiddenPercent = 0, ...restOptions } = options || {};
  const threshold = [visiblePercent, hiddenPercent];
  const intersectionObserver = new IntersectionObserver(
    function (entries) {
      const ratio = entries[0].intersectionRatio;
      callback(ratio, entries);
    },
    {
      ...restOptions,
      threshold,
    },
  );
  intersectionObserver.observe(elem);
  return intersectionObserver;
}

export function ObserverDOM(callback: (elementInfo: ElementInfo, isNew: boolean) => void) {
  const observer = new MutationObserver(
    debounce(function (mutations) {
      if (!mutations.length) return;
      const nodes = Array.from(document.querySelectorAll('[data-monitor-name]'));
      nodes.map(node => {
        if (node.hasAttribute('data-monitor-id') && node.getAttribute('data-monitor-id')) {
          const key = node.getAttribute('data-monitor-id') as string;
          const name = node.getAttribute('data-monitor-name') as string;
          callback?.(
            {
              node,
              name,
              key,
            },
            false,
          );
          return;
        }
        const uuid = generateUUID();
        const name = node.getAttribute('data-monitor-name') || '';

        node.setAttribute('data-monitor-id', uuid);
        const realNode = node?.tagName?.toLowerCase() === 'monitor' ? node.children?.[0] : node;

        if (realNode) {
          callback?.(
            {
              node: realNode,
              key: uuid,
              name,
            },
            true,
          );
        }
      });
    }),
  );
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  return observer;
}
