import { drawCover, grades, panelCount, clamp } from './cover.js';
import { formats, shotSettings, samplePanels } from './shots.js';

const byId = id => document.getElementById(id);
const canvas = byId('cover');
const status = byId('status');
const settings = shotSettings(new URLSearchParams(location.search));
const state = { layout:'collage', grade:'Classic Sunset', title:settings.title, tagline:byId('tagline').value, panels:[] };
const samples = {};
let active = 0, hits = [], frame, drag;
const sliders = ['zoom','panX','panY'];

function loadImage(url) {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

function render() {
  const [w,h] = formats[byId('format').value];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  canvas.style.setProperty('--ratio',w/h);
  byId('dimensions').textContent = w + ' × ' + h + ' PX';
  hits = drawCover(canvas,state);
}
function update() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(render);
}

const tabs = byId('panel-tabs');
const sections = byId('panels');
function syncPanel(i) {
  const section = sections.children[i];
  sliders.forEach(key => {
    section.querySelector('[name="' + key + '"]').value = state.panels[i][key];
    section.querySelector('[data-value="' + key + '"]').textContent = state.panels[i][key].toFixed(2);
  });
}
function selectPanel(i) {
  active = i;
  Array.from(tabs.children).forEach((tab,j) => {
    tab.hidden = j >= panelCount[state.layout];
    tab.setAttribute('aria-pressed',String(i === j));
    sections.children[j].hidden = i !== j;
  });
}
function makePanels() {
  state.panels.forEach((p,i) => {
    const tab = document.createElement('button');
    tab.textContent = i ? String(i+1).padStart(2,'0') : 'Hero';
    tab.setAttribute('aria-controls','panel-' + i);
    tab.onclick = () => selectPanel(i);
    tabs.append(tab);

    const section = document.createElement('section');
    section.id = 'panel-' + i;
    section.innerHTML = '<label><span class="panel-name">' + (i ? 'Panel ' + (i+1) : 'Hero panel') + '</span><input type="file" accept="image/*"></label><div class="sample-buttons"><button data-sample="pier">Pier Sample</button><button data-sample="boulevard">Boulevard Sample</button></div>' +
      sliders.map((key,j) => '<label class="slider"><span>' + ['Zoom','Pan X','Pan Y'][j] + '</span><input name="' + key + '" type="range" min="' + (j ? 0 : .5) + '" max="' + (j ? 1 : 3) + '" step="' + (j ? .01 : .05) + '"><output data-value="' + key + '" aria-hidden="true"></output></label>').join('');
    const file = section.querySelector('[type=file]');
    let revision = 0;
    file.onchange = async () => {
      if (!file.files[0]) return;
      const id = ++revision;
      const url = URL.createObjectURL(file.files[0]);
      try {
        const image = await loadImage(url);
        if (id === revision) replace(image,true);
      } catch {
        if (id === revision) status.textContent = 'Could not open that image.';
      } finally { URL.revokeObjectURL(url); }
    };
    function replace(image,upload) {
      Object.assign(p,{ image, zoom:1, panX:.5, panY:upload ? .5 : .2 });
      if (!upload) file.value = '';
      status.textContent = '';
      syncPanel(i);
      update();
    }
    section.querySelectorAll('[data-sample]').forEach(button => {
      button.onclick = () => {
        revision++;
        replace(samples[button.dataset.sample],false);
      };
    });
    section.querySelectorAll('[type=range]').forEach(input => {
      input.oninput = () => {
        p[input.name] = input.valueAsNumber;
        syncPanel(i);
        update();
      };
    });
    sections.append(section);
    syncPanel(i);
  });
  selectPanel(0);
}

function pointer(event) {
  const box = canvas.getBoundingClientRect();
  return [(event.clientX-box.left)*canvas.width/box.width,(event.clientY-box.top)*canvas.height/box.height];
}
function local(x,y,hit) {
  const dx=x-hit.cx, dy=y-hit.cy, cos=Math.cos(hit.a), sin=Math.sin(hit.a);
  return [dx*cos+dy*sin,dy*cos-dx*sin];
}
canvas.addEventListener('pointerdown',event => {
  if (settings.cover || event.button !== 0 || drag) return;
  const [x,y] = pointer(event);
  const hit = hits.findLast(item => {
    const [u,v] = local(x,y,item);
    return Math.abs(u) <= item.pw/2 && Math.abs(v) <= item.ph/2;
  });
  if (!hit || hit.id < 0) return;
  selectPanel(hit.id);
  const p = state.panels[hit.id];
  drag = { hit, p, from:local(x,y,hit), x:p.panX, y:p.panY, id:event.pointerId };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event => {
  if (drag?.id !== event.pointerId) return;
  const { hit,p,from,x,y } = drag;
  const [u,v] = local(...pointer(event),hit);
  const { naturalWidth:iw, naturalHeight:ih } = p.image;
  const scale = Math.max(hit.pw/iw,hit.ph/ih)*p.zoom;
  const dx = iw*scale-hit.pw, dy = ih*scale-hit.ph;
  p.panX = clamp(x-(u-from[0])/Math.max(dx,1));
  p.panY = clamp(y-(v-from[1])/Math.max(dy,1));
  syncPanel(hit.id);
  update();
});
canvas.addEventListener('lostpointercapture',event => {
  if (drag?.id === event.pointerId) drag = null;
});

function swatches() {
  byId('swatches').replaceChildren(...grades[state.grade].slice(0,3).map(color => {
    const dot = document.createElement('i');
    dot.style.background = color;
    return dot;
  }));
}

async function start() {
  if (settings.cover) document.body.classList.add('shot-cover');
  byId('title').value = state.title;
  byId('format').value = settings.size;
  await Promise.all([
    document.fonts.load('20px Anton'),
    ...['pier','boulevard'].map(async key => { samples[key] = await loadImage('./samples/' + key + '.jpg'); })
  ]);
  state.panels = samplePanels(samples,settings.sample);
  makePanels();
  swatches();
  byId('format').onchange = update;
  byId('layout').onchange = event => {
    state.layout = event.target.value;
    selectPanel(Math.min(active,panelCount[state.layout]-1));
    update();
  };
  byId('grade').onchange = event => {
    state.grade = event.target.value;
    swatches();
    update();
  };
  for (const key of ['title','tagline']) byId(key).oninput = event => {
    state[key] = event.target.value;
    update();
  };
  document.querySelectorAll('[data-size]').forEach(button => {
    const [w,h] = formats[button.dataset.size];
    button.title = w + ' × ' + h + ' PNG';
    button.onclick = () => {
      const output = document.createElement('canvas');
      output.width = w;
      output.height = h;
      drawCover(output,state);
      output.toBlob(blob => {
        if (!blob) { status.textContent = 'PNG export failed.'; return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vice-city-' + w + 'x' + h + '.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href),1000);
        status.textContent = 'Exported ' + w + ' × ' + h + ' PNG.';
      },'image/png');
    };
  });
  render();
  requestAnimationFrame(() => { window.__shotReady = true; });
}
start().catch(error => {
  status.textContent = 'Unable to load the cover assets.';
  console.error(error);
});
