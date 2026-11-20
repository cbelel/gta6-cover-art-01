export const formats = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1920, 1080],
};

export function configureShot(state, query, samples) {
  const first = query.get('photo') === 'boulevard' ? 'boulevard' : 'pier';
  const second = first === 'pier' ? 'boulevard' : 'pier';
  state.format = formats[query.get('size')] ? query.get('size') : 'square';
  state.title = query.get('caption') || 'SUNSET HEIST';
  state.panels = Array.from({ length: 6 }, (_, index) => ({
    image: samples[index % 2 === 0 ? first : second],
    zoom: [1.04, 1.12, 1.03, 1.08, 1.15, 1.02][index],
    panX: [0.55, 0.72, 0.4, 0.65, 0.3, 0.58][index],
    panY: [0.2, 0.15, 0.28, 0.12, 0.25, 0.32][index],
  }));
  if (query.get('shot') === 'cover') {
    document.body.classList.add('shot-cover');
  }
}

export async function signalReady() {
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
