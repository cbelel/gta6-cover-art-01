export const grades = {
  'Classic Sunset': ['#fb976d', '#97487c', 'saturate(1.24) contrast(1.08) sepia(0.16)'],
  'Cyber Neon': ['#fa58b6', '#42baca', 'saturate(1.6) contrast(1.15) hue-rotate(320deg)'],
  'Miami Gold': ['#ffcc68', '#c67842', 'sepia(0.35) saturate(1.4) contrast(1.08)'],
  'Vice Nights': ['#9976cf', '#30667c', 'saturate(1.1) brightness(0.72) contrast(1.2)'],
};

export function panelLayout(layout, width, height) {
  const bottom = height * 0.76;
  if (layout === 'Filmstrip 5') {
    return [
      [0.025, 0.07, 0.95, 0.4, -1],
      ...Array.from({ length: 4 }, (_, i) => [0.025 + i * 0.24, 0.49, 0.23, 0.24, i % 2 ? 2 : -2]),
      [0.72, 0.27, 0.24, 0.2, 3],
    ].map(([x, y, w, h, angle]) => ({ x: x * width, y: y * height, w: w * width, h: h * height, angle }));
  }
  if (layout === 'Classic 3') {
    return [[0.02, 0.07, 0.61, 0.66, -2], [0.65, 0.07, 0.33, 0.31, 2], [0.65, 0.4, 0.33, 0.32, -2], [0.4, 0.5, 0.28, 0.23, 3]]
      .map(([x, y, w, h, angle]) => ({ x: x * width, y: y * height, w: w * width, h: h * height, angle }));
  }
  const wide = width / height > 1.4;
  const positions = wide ? [
    [0.015, 0.08, 0.29, 0.39, -3], [0.69, 0.06, 0.3, 0.4, 3],
    [0.025, 0.44, 0.27, 0.3, 2], [0.73, 0.44, 0.25, 0.3, -3],
    [0.29, 0.46, 0.22, 0.29, -4], [0.51, 0.46, 0.23, 0.29, 3],
    [0.29, 0.07, 0.41, 0.43, -2],
  ] : [
    [0.025, 0.07, 0.38, 0.3, -3], [0.64, 0.07, 0.34, 0.3, 3],
    [0.015, 0.37, 0.35, 0.35, -3], [0.68, 0.38, 0.3, 0.33, 3],
    [0.33, 0.49, 0.35, 0.24, 2], [0.62, 0.26, 0.34, 0.22, -4],
    [0.27, 0.095, 0.43, 0.41, -2],
  ];
  return positions.map(([x, y, w, h, angle], index) => ({
    x: x * width,
    y: y * height,
    w: w * width,
    h: h * height,
    angle,
    photoIndex: [1, 2, 3, 4, 0, 5, 0][index],
    scene: index === 4,
    bottom,
  }));
}

function star(ctx, x, y, radius, points = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = i * Math.PI / points - Math.PI / 2;
    const r = i % 2 ? radius * inner : radius;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
}

function palm(ctx, x, y, size) {
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y + size);
  ctx.quadraticCurveTo(x - size * 0.12, y + size * 0.4, x, y);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI + i * Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5 - size * 0.2, x + Math.cos(angle) * size * 0.7, y + Math.sin(angle) * size * 0.3 + size * 0.15);
    ctx.stroke();
  }
}

function city(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#39254c');
  sky.addColorStop(0.65, '#ee7582');
  sky.addColorStop(1, '#e5aa77');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd68a';
  ctx.beginPath();
  ctx.arc(w * 0.51, h * 0.52, h * 0.29, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 12; i++) {
    const x = i * w / 11;
    const bh = h * (0.17 + (i * 7 % 9) / 40);
    ctx.fillStyle = '#28203e';
    ctx.fillRect(x, h * 0.85 - bh, w / 12, bh);
    ctx.fillStyle = i % 2 ? '#ef70bc' : '#83ded6';
    for (let wy = h * 0.88 - bh; wy < h * 0.79; wy += 12) {
      for (let wx = x + 5; wx < x + w / 14; wx += 11) {
        ctx.fillRect(wx, wy, 3, 5);
      }
    }
  }
  ctx.strokeStyle = '#171b30';
  palm(ctx, w * 0.15, h * 0.34, h * 0.43);
  palm(ctx, w * 0.86, h * 0.36, h * 0.41);
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const bx = w * (0.35 + i * 0.09);
    ctx.beginPath();
    ctx.moveTo(bx - 6, h * 0.2 + i * 4);
    ctx.quadraticCurveTo(bx, h * 0.17 + i * 4, bx + 6, h * 0.2 + i * 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#171b30';
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
  ctx.fillStyle = '#fce5b6';
  ctx.font = `${Math.max(9, w * 0.038)}px Anton`;
  ctx.textAlign = 'center';
  ctx.fillText('OCEAN DRIVE • 11:47 PM', w / 2, h * 0.955);
}

function photoPanel(ctx, rect, panel, grade, index) {
  ctx.save();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate(rect.angle * Math.PI / 180);
  ctx.shadowColor = '#150f2c99';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#f9ecd3';
  ctx.fillRect(-rect.w / 2 - 6, -rect.h / 2 - 6, rect.w + 12, rect.h + 22);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.translate(-rect.w / 2, -rect.h / 2);
  ctx.beginPath();
  ctx.rect(0, 0, rect.w, rect.h);
  ctx.clip();
  if (rect.scene) {
    city(ctx, rect.w, rect.h);
  } else {
    const image = panel.image;
    const scale = Math.max(rect.w / image.width, rect.h / image.height) * panel.zoom;
    const dw = image.width * scale;
    const dh = image.height * scale;
    ctx.filter = grades[grade][2];
    ctx.drawImage(image, -(dw - rect.w) * panel.panX, -(dh - rect.h) * panel.panY, dw, dh);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = grades[grade][0];
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, rect.w, rect.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#251b3f';
  ctx.globalAlpha = 0.22;
  for (let y = 3; y < rect.h; y += 7) {
    for (let x = 3; x < rect.w; x += 7) {
      ctx.beginPath();
      ctx.arc(x + (Math.floor(y / 7) % 2) * 3, y, 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function sticker(ctx, x, y, size, type, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#fff2d9';
  ctx.lineWidth = size * 0.14;
  ctx.lineJoin = 'round';
  ctx.fillStyle = type === 'bolt' ? '#f7da76' : '#fa967d';
  if (type === 'bolt') {
    ctx.beginPath();
    ctx.moveTo(size * 0.15, -size);
    ctx.lineTo(-size * 0.55, size * 0.15);
    ctx.lineTo(0, size * 0.1);
    ctx.lineTo(-size * 0.15, size);
    ctx.lineTo(size * 0.65, -size * 0.25);
    ctx.lineTo(size * 0.12, -size * 0.18);
    ctx.closePath();
  } else {
    star(ctx, 0, 0, size, type === 'sun' ? 14 : 5, type === 'sun' ? 0.78 : 0.48);
  }
  ctx.stroke();
  ctx.fill();
  if (type === 'sun') {
    ctx.strokeStyle = '#a74a60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const unit = Math.min(w, h);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#ba6586');
  bg.addColorStop(0.45, '#e7aa8b');
  bg.addColorStop(1, '#514161');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const rects = panelLayout(state.layout, w, h);
  rects.forEach((rect, index) => {
    if (state.layout !== 'Collage') {
      rect.scene = index === rects.length - 1;
      rect.photoIndex = index;
    }
    photoPanel(ctx, rect, state.panels[(rect.photoIndex || 0) % 6], state.grade, index);
  });
  const vignette = ctx.createRadialGradient(w / 2, h * 0.35, unit * 0.2, w / 2, h / 2, w * 0.75);
  vignette.addColorStop(0, '#100f2600');
  vignette.addColorStop(1, '#100f2666');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff0d5';
  ctx.save();
  ctx.translate(w * 0.025, h * 0.025);
  ctx.rotate(-0.025);
  ctx.fillRect(0, 0, unit * 0.18, unit * 0.04);
  ctx.fillStyle = '#302238';
  ctx.font = `${unit * 0.024}px Anton`;
  ctx.textAlign = 'center';
  ctx.fillText('TOP STORY', unit * 0.09, unit * 0.029);
  ctx.restore();
  ctx.fillStyle = '#302338';
  ctx.fillRect(w * 0.5 - unit * 0.12, h * 0.022, unit * 0.24, unit * 0.032);
  ctx.fillStyle = '#fff0d5';
  ctx.font = `${unit * 0.014}px Anton`;
  ctx.textAlign = 'center';
  ctx.fillText('VOL. 01 • ISSUE 06', w / 2, h * 0.022 + unit * 0.023);
  sticker(ctx, w * 0.25, h * 0.38, unit * 0.045, 'sun', -0.15);
  sticker(ctx, w * 0.76, h * 0.4, unit * 0.043, 'bolt', 0.2);
  sticker(ctx, w * 0.87, h * 0.67, unit * 0.041, 'star', 0.2);
  const bandY = h * 0.755;
  const band = ctx.createLinearGradient(0, bandY - 35, 0, h);
  band.addColorStop(0, '#231c3400');
  band.addColorStop(0.23, '#231c34');
  band.addColorStop(1, '#171e2b');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY - 35, w, h - bandY + 35);
  let fontSize = h * 0.132;
  ctx.font = `${fontSize}px Anton`;
  while (ctx.measureText(state.title.toUpperCase()).width > w * 0.92) {
    fontSize -= 1;
    ctx.font = `${fontSize}px Anton`;
  }
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#101b2a';
  ctx.lineWidth = 8;
  ctx.strokeText(state.title.toUpperCase(), w / 2 + 3, h * 0.885 + 4);
  ctx.fillStyle = '#ffdfac';
  ctx.fillText(state.title.toUpperCase(), w / 2, h * 0.885);
  ctx.font = `${unit * 0.023}px Anton`;
  ctx.fillStyle = '#f7d8b6';
  ctx.fillText(state.tagline.toUpperCase(), w / 2, h * 0.922);
  ctx.fillStyle = '#0e1623';
  for (let i = 0; i < 55; i++) {
    const bh = (0.012 + (i * 13 % 17) / 450) * h;
    ctx.fillRect(i * w / 54, h - bh, w / 55, bh);
  }
  const radius = Math.max(12, h * 0.015);
  ctx.fillStyle = '#f3b791';
  for (let i = 0; i < 5; i++) {
    star(ctx, w / 2 + (i - 2) * radius * 2.8, h * 0.963, radius);
    ctx.fill();
  }
  ctx.textAlign = 'right';
  ctx.font = `${unit * 0.016}px Anton`;
  ctx.fillStyle = '#eedbc3';
  ctx.fillText('VICE CITY • 2026', w * 0.97, h * 0.975);
  ctx.fillStyle = '#fff5cf';
  ctx.globalAlpha = 0.055;
  for (let i = 0; i < 13000; i++) {
    const x = (i * 127.37) % w;
    const y = (i * 73.91) % h;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
  return rects;
}
