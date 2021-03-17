export const scrollToBottom = (wrapElement: HTMLElement, listElement: HTMLElement) => {
  wrapElement.scrollTop = listElement?.offsetHeight > wrapElement?.offsetHeight ? listElement?.offsetHeight - Math.ceil(wrapElement?.offsetHeight) : 0;
};