export const formats = { square: [1080,1080], portrait: [1080,1350], landscape: [1920,1080] };

export function shotSettings(query) {
  const shot = query.get('shot');
  return {
    cover: shot === 'cover',
    sample: query.get('photo') === 'boulevard' ? 'boulevard' : 'pier',
    title: query.get('caption') ?? 'SUNSET HEIST',
    size: Object.keys(formats).find(key => key === query.get('size') || formats[key].join('x') === query.get('size')) ?? 'square'
  };
}

export function samplePanels(images, first) {
  const second = first === 'pier' ? 'boulevard' : 'pier';
  return Array.from({length:6}, (_,i) => ({
    image: images[i%2 ? second : first],
    zoom: [1.1,1.15,1.2,1.25,1.3,1.2][i],
    panX: [.54,.69,.32,.75,.42,.58][i],
    panY: [.20,.14,.18,.10,.29,.12][i]
  }));
}
