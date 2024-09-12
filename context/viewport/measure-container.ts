export const measureContainer = () => {
  const container = document.createElement('div');
  container.className = 'container';
  document.body.appendChild(container);
  const width = container.clientWidth;
  const isDimensions = typeof width !== 'undefined';
  document.body.removeChild(container);
  return isDimensions
    ? { width, isDimensions: true }
    : { isDimensions };
};
