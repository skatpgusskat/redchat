export async function wait(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(() => {
      return resolve();
    }, milliseconds));
}

export async function waitUntil<T>(conditionFunction: () => Promise<T> | T, interval = 100) {
  while (true) {
    let result = conditionFunction();
    if (result instanceof Promise) {
      result = await result;
    }
    if (result) {
      return result;
    }
    await wait(interval);
  }
}
