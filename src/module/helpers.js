export function log(...args) {
  const devMode = true;
  if (devMode) {
    console.log(...args);
  }
}
