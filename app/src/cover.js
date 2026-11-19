export const grades = {
  'Classic Sunset': ['#2c1736', '#e34f7b', '#ffc075', 'saturate(1.22) contrast(1.1)'],
  'Cyber Neon': ['#20134d', '#e739c6', '#68f9e1', 'saturate(1.5) hue-rotate(19deg) contrast(1.12)'],
  'Miami Gold': ['#533046', '#f47855', '#ffe394', 'sepia(.29) saturate(1.45) contrast(1.08)'],
  'Vice Nights': ['#111432', '#6951a9', '#7be3ef', 'saturate(1.25) brightness(.79) hue-rotate(-14deg)']
};

// Positions are relative to the artboard width and the photo area height.
const layouts = {
  collage: [
    [.035,.08,.31,.47,-4,1], [.035,.52,.31,.45,3,2],
    [.666,.07,.296,.34,4,3], [.683,.38,.285,.33,-3,4],
    [.658,.67,.30,.30,3,5], [.319,.64,.36,.34,2,-1],
    [.315,.07,.37,.62,-2,0]
  ],
  filmstrip: [
    [.025,.04,.95,.61,0,0], [.025,.67,.228,.31,0,1],
    [.266,.67,.228,.31,0,2], [.507,.67,.228,.31,0,3],
    [.748,.67,.227,.31,0,4]
  ],
  classic: [
    [.025,.04,.95,.60,0,0], [.025,.66,.465,.32,0,1], [.51,.66,.465,.32,0,2]
  ]
};
export const panelCount = { collage: 6, filmstrip: 5, classic: 3 };
export const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const cream = '#fff4df';
const ink = '#221429';
const tau = Math.PI * 2;
const noise = n => (Math.sin(n * 127.1 + 7.3) * 43758.5453) % 1 + 1;

function rect(c, color, x, y, w, h) {
  c.fillStyle = color;
  c.fillRect(x,y,w,h);
}
function disk(c,x,y,r) {
  c.beginPath(); c.arc(x,y,r,0,tau); c.fill();
}
function path(c, points) {
  c.beginPath();
  points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
  c.closePath();
}
function star(c, r, inner, points = 5) {
  path(c, Array.from({length: points * 2}, (_,i) => {
    const a = i * Math.PI / points - Math.PI / 2;
    const d = i % 2 ? inner : r;
    return [Math.cos(a) * d, Math.sin(a) * d];
  }));
}
function text(c, value, x, y, size, color, max, font = 'Anton') {
  c.font = `${size}px ${font}`;
  c.fillStyle = color;
  c.fillText(value,x,y,max);
}
function gradient(c,x,y,x2,y2,colors) {
  const g = c.createLinearGradient(x,y,x2,y2);
  colors.forEach((color,i) => g.addColorStop(i/(colors.length-1),color));
  return g;
}
function palm(c, x, y, s, flip = false) {
  c.save();
  c.translate(x,y);
  c.scale(flip ? -s : s,s);
  c.beginPath();
  c.moveTo(-5,0);
  c.quadraticCurveTo(-2,-29,10,-55);
  c.lineTo(15,-54);
  c.quadraticCurveTo(6,-28,5,0);
  c.closePath(); c.fill();
  for (const [a,b,d,e] of [[-20,-74,-34,-50],[-4,-83,-24,-71],[22,-83,32,-68],[46,-75,54,-48],[34,-55,36,-35],[-6,-54,-12,-36]]) {
    c.beginPath(); c.moveTo(12,-56); c.quadraticCurveTo(a,b,d,e);
    c.quadraticCurveTo(a+5,b+12,12,-51); c.closePath(); c.fill();
  }
  c.restore();
}

function city(c,w,h,[dark,pink,gold]) {
  rect(c,gradient(c,0,0,0,h,[dark,pink,'#ff875d',dark]),0,0,w,h);
  c.fillStyle = gradient(c,0,h*.07,0,h*.68,[cream,gold,'#ff745d']);
  disk(c,w*.53,h*.43,h*.34);
  for(let i=0;i<5;i++) rect(c,pink,w*.53-h*.35,h*(.47+i*.044),h*.7,h*.011);
  for(let i=0;i<3;i++){
    const x=w*(.25+i*.071), y=h*(.23+i%2*.055), k=h*.025;
    c.strokeStyle=dark; c.lineWidth=h*.009;
    c.beginPath(); c.moveTo(x-k,y); c.quadraticCurveTo(x-k*.33,y-k,x,y);
    c.quadraticCurveTo(x+k*.33,y-k,x+k,y); c.stroke();
  }
  for(let i=0;i<17;i++){
    const x=w*i/17, bw=w/17+1, top=h*(.42+(noise(i)%1)*.30);
    rect(c,i%3 ? dark : '#422040',x,top,bw,h-top);
    for(let j=1;j<5;j++) for(let k=0;k<3;k++){
      if(noise(i*43+j*4+k)%1 < .65){
        c.shadowColor=gold; c.shadowBlur=h*.025;
        rect(c,(j+k)%3 ? gold : '#f799c7',x+bw*(.15+k*.255),top+j*h*.051,bw*.13,h*.018);
        c.shadowBlur=0;
      }
    }
  }
  c.fillStyle='#171124';
  palm(c,w*.12,h*.83,h/95); palm(c,w*.89,h*.86,h/104,true);
  rect(c,'#1c1328',0,h*.82,w,h*.18);
  rect(c,gold,0,h*.82,w,h*.009);
  c.textBaseline='middle'; c.textAlign='center';
  text(c,'OCEAN DRIVE • 11:47 PM',w/2,h*.914,h*.105,cream,w*.91,'monospace');
  c.textAlign='left'; c.textBaseline='alphabetic';
}
function photo(c,w,h,p,g) {
  const [dark,pink,gold,filter] = g;
  rect(c,dark,0,0,w,h);
  if(p?.image){
    const {image,zoom,panX,panY}=p;
    const s=Math.max(w/image.naturalWidth,h/image.naturalHeight)*zoom;
    const pw=image.naturalWidth*s, ph=image.naturalHeight*s;
    c.filter=filter;
    c.drawImage(image,(w-pw)*(pw>w?panX:.5),(h-ph)*(ph>h?panY:.5),pw,ph);
    c.filter='none';
  }
  c.globalCompositeOperation='soft-light';
  rect(c,gradient(c,0,0,w,h,[gold,'#f3d4bc',pink,dark]),0,0,w,h);
  c.globalCompositeOperation='source-over';
  const v=c.createRadialGradient(w*.53,h*.37,Math.min(w,h)*.16,w*.53,h*.42,Math.hypot(w,h)*.57);
  v.addColorStop(0,'transparent'); v.addColorStop(1,dark+'b0');
  rect(c,v,0,0,w,h);
  const gap=9;
  c.fillStyle='#2b14294d'; c.beginPath();
  for(let y=4;y<h;y+=gap) for(let x=3+(Math.round(y/gap)%2)*gap/2;x<w;x+=gap){
    const r=1.15+1.18*y/h;
    c.moveTo(x+r,y); c.arc(x,y,r,0,tau);
  }
  c.fill();
  for(let i=0;i<w*h/240;i++){
    const x=(noise(i*3)%1)*w,y=(noise(i*3+1)%1)*h;
    rect(c,i%2?'#ffffff2b':'#160d292d',x,y,1+(i%3)*.36,1.25);
  }
}

function sticker(c,kind,x,y,r,angle,color){
  c.save(); c.translate(x,y); c.rotate(angle); c.scale(r/30,r/30);
  c.shadowColor='#190e22a0'; c.shadowOffsetY=4; c.shadowBlur=6;
  c.lineJoin='round'; c.lineWidth=7; c.strokeStyle=cream;
  c.fillStyle=color;
  if(kind==='sun') star(c,30,23,13);
  if(kind==='bolt') path(c,[[4,-31],[-23,5],[-3,5],[-10,30],[24,-9],[5,-9],[15,-31]]);
  if(kind==='star') star(c,30,14);
  if(kind==='palm'){c.beginPath();c.arc(0,0,28,0,tau);}
  c.stroke(); c.shadowColor='transparent'; c.fill();
  if(kind==='sun'){
    c.fillStyle='#ff777f'; disk(c,0,0,16);
    c.fillStyle=cream; disk(c,-5,-5,3);
  }
  if(kind==='palm'){ c.fillStyle=ink; palm(c,-4,16,.52); }
  c.restore();
}
function chip(c,label,x,y,w,h,bg,fg,angle=0){
  c.save(); c.translate(x,y); c.rotate(angle);
  rect(c,ink,3,4,w,h); rect(c,bg,0,0,w,h);
  c.textAlign='center'; c.textBaseline='middle';
  text(c,label,w/2,h*.51,h*.63,fg,w*.89);
  c.restore();
}
function caption(c,state,w,h,top,g){
  const [dark,pink,gold]=g, b=h-top;
  rect(c,gradient(c,0,top,w,h,[dark,'#30192e','#171322']),0,top,w,b);
  rect(c,pink,0,top,w,5);
  rect(c,gold,0,top+5,w,2);
  for(let i=0;i<Math.ceil(w/27);i++){
    const height=b*(.05+(noise(i+32)%1)*.20);
    rect(c,'#100e1c',i*27,h-height,25,height);
    if(i%3===0) rect(c,'#100e1c',i*27+10,h-height-10,2,10);
    for(let j=0;j<3;j++) if((i+j)%3) rect(c,'#695064',i*27+4+j*7,h-height+7,2,3);
  }
  c.textAlign='center'; c.textBaseline='middle';
  const title=state.title.trim().toUpperCase();
  const titleSize=b*.51;
  text(c,title,w/2+4,top+b*.317+6,titleSize,pink,w*.9);
  text(c,title,w/2,top+b*.317,titleSize,cream,w*.9);
  text(c,state.tagline.trim().toUpperCase(),w/2,top+b*.615,b*.09,gold,w*.8,'monospace');
  const r=Math.max(12,b*.063);
  for(let i=-2;i<=2;i++){
    c.save(); c.translate(w/2+i*r*2.55,top+b*.795);
    c.fillStyle=gold; star(c,r,r*.45); c.fill();
    c.restore();
  }
  c.textAlign='left'; c.textBaseline='alphabetic';
  const cw=Math.min(w*.2,b*.69), ch=b*.105;
  chip(c,'VICE CITY • 2026',w-cw-19,h-ch-15,cw,ch,cream,ink);
}

export function drawCover(canvas,state){
  const c=canvas.getContext('2d');
  const {width:w,height:h}=canvas;
  const top=h*.743;
  const g=grades[state.grade];
  const layout=layouts[state.layout];
  rect(c,gradient(c,0,0,w,top,[g[0],g[1],g[0]]),0,0,w,h);
  c.strokeStyle='#fff4df36'; c.lineWidth=2;
  c.beginPath();
  for(let x=-top;x<w;x+=27){c.moveTo(x,top);c.lineTo(x+top,0);}
  c.stroke();
  const hits=[];
  for(const [x,y,ww,hh,deg,id] of layout){
    const pw=w*ww, ph=top*hh, cx=w*x+pw/2, cy=top*y+ph/2, a=deg*Math.PI/180;
    c.save(); c.translate(cx,cy); c.rotate(a);
    c.shadowColor='#190c22ac'; c.shadowBlur=13; c.shadowOffsetY=6;
    rect(c,cream,-pw/2-6,-ph/2-6,pw+12,ph+12);
    c.shadowColor='transparent';
    c.translate(-pw/2,-ph/2);
    c.beginPath(); c.rect(0,0,pw,ph); c.clip();
    if(id<0) city(c,pw,ph,g); else photo(c,pw,ph,state.panels[id],g);
    c.restore();
    hits.push({id,cx,cy,pw,ph,a});
  }
  if(state.layout!=='collage'){
    const pw=w*.24,ph=top*.28,x=w*.72,y=top*.32;
    c.save(); c.translate(x,y); c.rotate(.045);
    rect(c,cream,-6,-6,pw+12,ph+12); city(c,pw,ph,g);
    c.restore();
    hits.push({id:-1,cx:x+(pw*Math.cos(.045)-ph*Math.sin(.045))/2,cy:y+(pw*Math.sin(.045)+ph*Math.cos(.045))/2,pw,ph,a:.045});
  }
  const r=Math.min(w,h)*.042;
  sticker(c,'sun',w*.322,top*.49,r,-.19,g[2]);
  sticker(c,'bolt',w*.683,top*.37,r,.19,'#fff096');
  sticker(c,'palm',w*.077,top*.859,r*.92,-.24,'#b7f4dc');
  sticker(c,'star',w*.936,top*.635,r*.89,.22,'#ff95b9');
  const ch=Math.min(w*.053,h*.054);
  chip(c,'TOP STORY',w*.026,h*.027,w*.175,ch,g[2],ink,-.075);
  chip(c,'VOL. 01 • ISSUE 06',w*.402,h*.018,w*.196,ch*.64,ink,cream,.012);
  caption(c,state,w,h,top,g);
  return hits;
}
