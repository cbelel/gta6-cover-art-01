import { drawCover, grades } from './cover.js';
import { configureShot, formats, signalReady } from './shots.js';

const canvas = document.getElementById('cover');
const state = {
  layout: 'Collage',
  grade: 'Classic Sunset',
  title: 'SUNSET HEIST',
  tagline: 'NO RULES • ONLY HORIZONS',
  format: 'square',
  panels: [],
};
let rectangles = [];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${url}`));
    image.src = url;
  });
}

function redraw() {
  [canvas.width, canvas.height] = formats[state.format];
  rectangles = drawCover(canvas, state);
  document.getElementById('dimensions').textContent = `${canvas.width} × ${canvas.height} PX`;
}

function setStatus(message) {
  document.getElementById('status').textContent = message;
}

async function initialize() {
  const [pier, boulevard] = await Promise.all([
    loadImage('./samples/pier.jpg'),
    loadImage('./samples/boulevard.jpg'),
  ]);
  await document.fonts.load('24px Anton');
  const samples = { pier, boulevard };
  configureShot(state, new URLSearchParams(location.search), samples);
  for (const key of ['format', 'layout', 'title', 'tagline']) {
    const input = document.getElementById(key);
    input.value = state[key];
    input.addEventListener('input', () => {
      state[key] = input.value;
      redraw();
    });
  }
  Object.entries(grades).forEach(([name, colors]) => {
    const button = document.createElement('button');
    button.className = `grade${name === state.grade ? ' active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<b style="--a:${colors[0]};--b:${colors[1]}"></b>${name}`;
    button.addEventListener('click', () => {
      state.grade = name;
      document.querySelectorAll('.grade').forEach(item => item.classList.toggle('active', item === button));
      redraw();
    });
    document.getElementById('grades').append(button);
  });
  state.panels.forEach((panel, index) => {
    const details = document.createElement('details');
    details.open = index === 0;
    const summary = document.createElement('summary');
    summary.textContent = `${String(index + 1).padStart(2, '0')} / ${index === 0 ? 'Hero photograph' : 'Supporting photograph'}`;
    details.append(summary);
    const body = document.createElement('div');
    body.className = 'panel-body';
    const uploadLabel = document.createElement('label');
    uploadLabel.textContent = 'UPLOAD YOUR PHOTO';
    const upload = document.createElement('input');
    upload.type = 'file';
    upload.accept = 'image/*';
    upload.addEventListener('change', async () => {
      const file = upload.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      try {
        panel.image = await loadImage(url);
        redraw();
        setStatus(`Panel ${index + 1} updated.`);
      } catch {
        setStatus('Could not read this image. Try another photo.');
      } finally {
        URL.revokeObjectURL(url);
      }
    });
    uploadLabel.append(upload);
    body.append(uploadLabel);
    const buttons = document.createElement('div');
    buttons.className = 'sample-buttons';
    for (const name of ['pier', 'boulevard']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${name === 'pier' ? 'Pier' : 'Boulevard'} Sample`;
      button.addEventListener('click', () => {
        panel.image = samples[name];
        redraw();
      });
      buttons.append(button);
    }
    body.append(buttons);
    for (const [key, text] of [['zoom', 'ZOOM'], ['panX', 'PAN X'], ['panY', 'PAN Y']]) {
      const label = document.createElement('label');
      const value = document.createElement('span');
      value.textContent = `${text} · ${panel[key].toFixed(2)}`;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = key === 'zoom' ? '0.5' : '0';
      slider.max = key === 'zoom' ? '3' : '1';
      slider.step = key === 'zoom' ? '0.05' : '0.01';
      slider.value = panel[key];
      slider.dataset.panel = index;
      slider.dataset.key = key;
      slider.addEventListener('input', () => {
        panel[key] = Number(slider.value);
        value.textContent = `${text} · ${panel[key].toFixed(2)}`;
        redraw();
      });
      label.append(value, slider);
      body.append(label);
    }
    details.append(body);
    document.getElementById('panels').append(details);
  });
  for (const [name, [width, height]] of Object.entries(formats)) {
    const button = document.createElement('button');
    button.textContent = `↓ Export ${name} · ${width} × ${height}`;
    button.addEventListener('click', () => {
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      drawCover(output, state);
      output.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vice-city-${width}x${height}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus(`Exported ${width} × ${height} PNG.`);
      }, 'image/png');
    });
    document.getElementById('exports').append(button);
  }
  let drag = null;
  canvas.addEventListener('pointerdown', event => {
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) * canvas.width / box.width;
    const y = (event.clientY - box.top) * canvas.height / box.height;
    const rect = [...rectangles].reverse().find(item => !item.scene && x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h);
    if (!rect || y > canvas.height * 0.755) return;
    const index = (rect.photoIndex || 0) % 6;
    drag = { index, x: event.clientX, y: event.clientY, panX: state.panels[index].panX, panY: state.panels[index].panY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag) return;
    const panel = state.panels[drag.index];
    panel.panX = Math.max(0, Math.min(1, drag.panX - (event.clientX - drag.x) / 200));
    panel.panY = Math.max(0, Math.min(1, drag.panY - (event.clientY - drag.y) / 200));
    for (const key of ['panX', 'panY']) {
      const input = document.querySelector(`[data-panel="${drag.index}"][data-key="${key}"]`);
      input.value = panel[key];
      input.previousSibling.textContent = `${key === 'panX' ? 'PAN X' : 'PAN Y'} · ${panel[key].toFixed(2)}`;
    }
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  redraw();
  await signalReady();
}

initialize().catch(error => {
  setStatus(error.message);
  console.error(error);
});
