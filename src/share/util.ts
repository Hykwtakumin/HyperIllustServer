export function debounce(interval: number, fn: Function) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    const context = this;
    timerId = setTimeout(() => {
      fn.apply(context, args);
    }, interval);
  };
}

export function throttle(delay: number, fn: Function) {
  let timerId;
  let lastExecTime = 0;
  return (...args) => {
    const context = this;
    let elapsedTime = performance.now() - lastExecTime;
    const execute = () => {
      fn.apply(context, args);
      lastExecTime = performance.now();
    };
    if (!timerId) {
      // execute();
    }
    if (timerId) {
      clearTimeout(timerId);
    }
    if (elapsedTime > delay) {
      execute();
    } else {
      //timerId = setTimeout(execute, delay);
    }
  };
}
