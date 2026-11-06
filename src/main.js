const W=960,H=540,GY=452;
const $=s=>document.querySelector(s),rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const SK='shadowstrike2d_v1';
const S=Object.assign({ch:0,sel:0,unl:1,best:{},stars:{},coins:0,up:[[0,0],[0,0],[0,0]],sk:[0,0,0],vol:.6,mute:false,q:1,shake:true},JSON.parse(localStorage.getItem(SK)||'{}'));
const save=()=>localStorage.setItem(SK,JSON.stringify(S));
const TOUCH='ontouchstart' in window&&matchMedia('(pointer:coarse)').matches;

/* ---------- AUDIO (procedural) ---------- */
let AC,MG;
function aud(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.connect(AC.destination);setVol();music();}if(AC.state==='suspended')AC.resume();}
const setVol=()=>{if(MG)MG.gain.value=S.mute?0:S.vol;};
function tone(f,d,t='square',v=.2,sl=0){if(!AC)return;const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.setValueAtTime(f,n);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+sl),n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(MG);o.start();o.stop(n+d);}
function noise(d,v=.3){if(!AC)return;const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(MG);s.start();}
const SFX={shoot:i=>[()=>tone(900,.1,'sawtooth',.08,-600),()=>tone(300,.16,'square',.1,-200),()=>tone(1400,.06,'triangle',.07,-900)][i](),
reload:()=>{tone(300,.06,'square',.1);setTimeout(()=>tone(520,.08,'square',.1),450)},hit:()=>tone(220,.05,'sawtooth',.07,-100),crit:()=>tone(900,.12,'square',.12,300),
hurt:()=>{tone(120,.2,'sawtooth',.25,-60);noise(.1,.2)},boom:()=>{noise(.5,.5);tone(80,.5,'sine',.4,-50)},spec:()=>tone(200,.45,'sawtooth',.2,700),coin:()=>tone(1200,.08,'triangle',.1,400),
boss:()=>{tone(60,1.6,'sawtooth',.3,40);noise(1,.2)},win:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.3,'triangle',.2),i*140)),lose:()=>tone(300,1,'sawtooth',.2,-250),jump:()=>tone(300,.12,'square',.06,300),enemy:()=>tone(500,.06,'square',.04,-300)};
function music(){const n=[55,55,82,55,65,65,98,65];let i=0;setInterval(()=>{if(!AC||S.mute)return;tone(n[i%8]*(i%32>=16?1.2:1),.22,'sawtooth',.04);if(i%2)tone(n[i%8]*4,.05,'square',.012);i++;},240);}

/* ---------- CANVAS ---------- */
const cv=$('#c'),X=cv.getContext('2d');
function resize(){const k=[.75,1,Math.min(devicePixelRatio||1,2)][S.q];cv.width=W*k;cv.height=H*k;const s=Math.min(innerWidth/W,innerHeight/H);cv.style.width=W*s+'px';cv.style.height=H*s+'px';cv.k=k;}
addEventListener('resize',resize);
const rr=(x,y,w,h,r,f)=>{X.beginPath();X.roundRect(x,y,w,h,r);X.fillStyle=f;X.fill();};
const circ=(x,y,r,f)=>{X.beginPath();X.arc(x,y,r,0,7);X.fillStyle=f;X.fill();};
const ell=(x,y,a,b,f,rot=0)=>{X.beginPath();X.ellipse(x,y,a,b,rot,0,7);X.fillStyle=f;X.fill();};
const poly=(p,f)=>{X.beginPath();X.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)X.lineTo(p[i],p[i+1]);X.closePath();X.fillStyle=f;X.fill();};
const crown=(x,y,s,f)=>poly([x-6*s,y+4*s,x-6*s,y-3*s,x-3*s,y,x,y-5*s,x+3*s,y,x+6*s,y-3*s,x+6*s,y+4*s],f);
const hash=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};

/* ---------- CHARACTERS (from reference art) ---------- */
const CH=[
{id:'ileri',name:'ILERI',col:'#3aa0ff',hp:100,spd:250,dmg:1,rate:.13,mag:36,rel:1.1,cd:7,crit:.25,sp:'PULSE DASH',sd:'Lightning dash that damages everything in your path',wep:'STORM CRYSTAL RIFLE',desc:'The kid with $1 and a dream. Precise, fast crystal-rifle marksman with high crit chance.'},
{id:'toshiro',name:'TOSHIRO',col:'#b04dff',hp:135,spd:215,dmg:1.35,rate:.2,mag:24,rel:1.3,cd:10,crit:.15,sp:'MYSTIC BURST',sd:'Purple shockwave that blasts enemies and erases bullets',wep:'VOID FANG RIFLE',desc:'Scarred crown-bearer in a void coat. Heavy shots that pierce through enemies.'},
{id:'whizz',name:'WHIZZ',col:'#ffa31a',hp:85,spd:275,dmg:.85,rate:.085,mag:50,rel:1.4,cd:12,crit:.15,sp:'OVERDRIVE',sd:'5s of doubled fire rate and +60% damage, mag refilled',wep:'SOLAR FLARE RIFLE',desc:'Rainbow-haired speedster with a blazing rapid-fire gun and a huge magazine.'}];
const OUT=['#f2f2f2','#17112a','#ffa51f'],PANTS=['#14141c','#0e0b18','#15110f'],ALT=['#2b2b6a','#7a1a2a','#1a6a55'],RB=['#ff3b3b','#ff9a1f','#ffe23a','#3bff6a','#3ba8ff','#b04dff'];
function drawGun(i){const c=CH[i].col;X.globalAlpha=.3;rr(-12,-10,84,21,7,c);X.globalAlpha=1;rr(-10,-5,56,11,3,'#1a1a24');rr(30,-3,34,7,2,c);rr(-6,4,8,14,2,'#111');
if(i===0){for(let k=0;k<4;k++)poly([14+k*13,-5,20+k*13,-17-k%2*4,26+k*13,-5],'#9fd8ff');poly([60,-3,84,0,60,4],'#bfe6ff');}
if(i===1){for(let k=0;k<3;k++)poly([12+k*14,-5,20+k*14,-18,28+k*14,-5],'#d4a63a');circ(26,0,5,'#e8b8ff');poly([60,-3,82,0,60,4],'#d4a63a');}
if(i===2){for(let k=0;k<3;k++)poly([14+k*14,5,22+k*14,16,30+k*14,5],'#ffcf3a');poly([-10,-2,-26,-9,-22,2,-26,11,-10,5],'#ff5a1a');poly([60,-3,82,0,60,4],'#ffdf6a');}}
const eye=(x,y,rx,ry,col)=>{ell(x,y,rx,ry,col);circ(x+2,y-3,2.4,'#fff');};
function drawChar(i,x,y,face,t,run,rc,alt,sc=1,fl=0){const c=CH[i];X.save();X.translate(x,y);X.scale(face*sc,sc);const sw=run?Math.sin(t*14)*.7:0;
[[-5,-sw],[6,sw]].forEach(([lx,a])=>{X.save();X.translate(lx,-26);X.rotate(a);rr(-4,0,9,22,3,PANTS[i]);if(i===2)rr(-4,12,9,6,2,'#e8b08a');rr(-5,19,13,7,3,'#111');X.restore();});
X.save();X.translate(0,run?Math.abs(Math.sin(t*14))*-2:0);
if(i===0){rr(-14,-56,28,34,6,alt?ALT[0]:OUT[0]);rr(-9,-56,4,34,1,'#111');rr(5,-56,4,34,1,'#111');rr(-12,-62,24,10,5,'#fff');crown(0,-40,1.2,'#8a8a96');rr(-14,-26,28,5,0,'#111');}
if(i===1){rr(-16,-56,32,44,7,alt?ALT[1]:OUT[1]);rr(-1,-56,2,44,0,'#8a3aff');rr(-16,-26,32,5,0,'#d4a63a');poly([-16,-58,-10,-70,10,-70,16,-58],'#2a1d4a');crown(0,-42,1.2,'#e8c050');}
if(i===2){rr(-14,-56,28,34,6,alt?ALT[2]:OUT[2]);rr(-6,-52,12,24,3,'#d4232a');rr(-15,-27,30,8,2,'#111');rr(-15,-27,30,3,0,'#d4a63a');crown(-9,-48,.9,'#ffe06a');}
if(i===0)circ(-6,-68,21,'#111');if(i===2)rr(-25,-90,50,46,18,'#ff9a2a');
circ(2,-69,21,i===0?'#f4f4f4':'#ffd9b8');X.strokeStyle='#111';X.lineWidth=2;X.beginPath();X.arc(2,-69,21,0,7);X.stroke();
if(i===0){eye(6,-67,6,7.5,'#0a0a0a');eye(16,-67,5,7,'#0a0a0a');X.strokeStyle='#ccc';X.lineWidth=2;X.beginPath();X.moveTo(6,-60);X.lineTo(6,-50);X.moveTo(16,-60);X.lineTo(16,-52);X.stroke();
 X.beginPath();X.arc(0,-76,23,Math.PI,0);X.fillStyle='#fff';X.fill();X.stroke();rr(4,-80,30,7,3,'#fff');X.strokeRect(-12,-92,24,11);X.fillStyle='#111';X.fillRect(-9,-90,18,2);X.fillRect(-7,-86,14,2);}
if(i===1){eye(7,-68,5,6,'#3aa8ff');eye(17,-68,4.5,5.5,'#3aa8ff');X.strokeStyle='#c33';X.lineWidth=2;X.beginPath();X.moveTo(10,-60);X.lineTo(17,-53);X.stroke();X.strokeStyle='#111';X.beginPath();X.moveTo(2,-75);X.lineTo(12,-72);X.moveTo(14,-72);X.lineTo(22,-74);X.stroke();
 for(let k=0;k<9;k++){const a=Math.PI*(1.05+k*.1);const bx=2+Math.cos(a)*18,by=-72+Math.sin(a)*18;poly([bx-6,by+4,bx+Math.cos(a)*16-2,by+Math.sin(a)*20-4,bx+6,by+4],k<4?RB[(k*2)%6]:'#ff9a1f');}
 rr(-20,-82,44,10,3,'#22222c');rr(-4,-82,14,10,2,'#b8bcd0');crown(3,-77,.6,'#334');}
if(i===2){eye(7,-67,5.5,7,'#3aa8ff');eye(17,-67,5,6.5,'#3aa8ff');X.strokeStyle='#a33';X.lineWidth=2;X.beginPath();X.arc(13,-58,4,0,Math.PI);X.stroke();
 for(let k=0;k<6;k++)rr(-22+k*8,-92,9,24,4,RB[k]);rr(-28,-82,9,34,4,RB[1]);rr(20,-82,9,30,4,RB[4]);crown(18,-88,.9,'#ffd23a');}
X.restore();
X.save();X.translate(6,-42);X.rotate(-fl);X.translate(-rc,0);drawGun(i);circ(2,0,6,'#0b0b10');circ(34,2,6,'#0b0b10');X.restore();X.restore();}

/* ---------- MISSIONS ---------- */
const MS=[
{n:'CITY OF SHADOWS',th:0,obj:'Fight through the streets',par:100,enc:['ggg','gggg','ggfgg'],story:'BLACK VEIL has seized the city. Break their street patrols.',tip:'A/D move · W/Space jump (x2) · J or click fire · G bomb · L special · R reload · Q mode',ch:{t:'Land 3 headshots',f:g=>g.hs>=3}},
{n:'BLACK VEIL OUTPOST',th:1,obj:'Destroy the outpost garrison',par:150,enc:['gggh','ggsgh','gfgsgh','ggghhs'],story:'Their outpost feeds the network. Burn it down.',ch:{t:'Lose no more than 50 HP',f:(g,p)=>p.hp>=p.maxhp-50}},
{n:'THE UNDERGROUND',th:2,obj:'Fight through the tunnels',par:170,enc:['gffg','fffgs','gggfsf','hgfgsf'],story:'Beneath the streets the Veil hides its secrets.',ch:{t:'Reach a x6 combo',f:g=>g.maxc>=6}},
{n:'THE COMMANDER',th:3,obj:'Defeat the Black Veil Commander',par:190,enc:['gggh','gfsgh','ghgfs'],boss:'mech',bhp:900,bn:'THE COMMANDER',story:'The Commander holds the key to the protocol. Take him down.',ch:{t:'Take no damage',f:(g,p)=>p.hp>=p.maxhp}},
{n:'THE FINAL PROTOCOL',th:4,obj:'Stop Protocol-X',par:260,enc:['gghgf','ffsgh','hhgsf','gfhsgg'],boss:'tent',bhp:1400,bn:'PROTOCOL-X',story:'Protocol-X is awake. End it, and end BLACK VEIL.',ch:{t:'Finish with 50%+ accuracy',f:g=>g.hits/Math.max(1,g.shots)>=.5}}];
const ET={g:{n:'grunt',hp:45,spd:90,fr:1.1,dmg:8,rng:520,des:300,sc:1,body:'#2b4fa8',hat:'#1c3478',pants:'#1c2a55',pts:100},
h:{n:'heavy',hp:190,spd:55,fr:1.4,dmg:7,rng:480,des:260,sc:1.35,body:'#6a2a34',hat:'#3a1a22',pants:'#2a1218',pts:250,fan:1},
f:{n:'fast',hp:38,spd:230,melee:1,dmg:10,sc:.95,body:'#1f7f5f',hat:'#0f4f3a',pants:'#12402f',pts:150},
s:{n:'sniper',hp:42,spd:50,fr:3,dmg:22,rng:900,des:560,sc:1,body:'#9a7a1a',hat:'#6a4a0a',pants:'#4a3a10',pts:200,snip:1},
mech:{hp:900,sc:1,w:150,h:210,pts:3000,boss:1},tent:{hp:1400,sc:1,w:150,h:260,pts:5000,boss:1}};

/* ---------- STATE ---------- */
const en=[],pb=[],eb=[],fx=[],pop=[],coins=[],cols=[],plat=[],tel=[],gr=[];let ENC=[];
const G={mode:'menu',mi:0,time:0,score:0,combo:0,comboT:0,maxc:0,kills:0,shots:0,hits:0,hs:0,got:0,coins:0,cam:0,lock:null,ei:0,intro:0,shk:0,auto:false,endT:0,go:0,mt:0};
const PL={x:100,y:GY,vx:0,vy:0,face:1,hp:100,maxhp:100,jumps:0,mode:0,rc:0};
const K={},T={mx:0,fire:false};let mdown=false;
const C=()=>CH[S.ch],dmgMul=()=>C().dmg*(1+.15*S.up[S.ch][0])*(PL.buff>0?1.6:1)*(PL.mode?2.4:1);
const shake=v=>{if(S.shake)G.shk=Math.max(G.shk,v);};
let bt=0;function banner(t,ms=2000){const b=$('#banner');b.textContent=t;b.classList.add('on');clearTimeout(bt);bt=setTimeout(()=>b.classList.remove('on'),ms);}
function burst(x,y,col,n,sp=200,s=4,l=.5){n=Math.ceil(n*[.4,.7,1][S.q]);for(let i=0;i<n;i++)fx.push({x,y,vx:rnd(-1,1)*sp,vy:rnd(-1.2,.3)*sp,l,L:l,col,s:rnd(s*.5,s)});}
const ring=(x,y,r,col,l=.4)=>gr.push({x,y,r,col,l,L:l});
const num=(x,y,txt,kind)=>pop.push({x,y,txt,kind,l:.8,vy:-60});

/* ---------- LEVEL ---------- */
function build(i){const m=MS[i];let s=i*977+13;const r=()=>(s=s*16807%2147483647)/2147483647;plat.length=0;cols.length=0;
ENC=m.enc.map((l,k)=>({x:700+k*1000,l,done:false}));if(m.boss)ENC.push({x:700+m.enc.length*1000,l:'',boss:m.boss,done:false});
const end=ENC[ENC.length-1].x+W;G.end=end;
for(let x=420;x<end-200;x+=320+r()*380){const h=44+Math.floor(r()*3)*26,w=76+r()*70;plat.push({x,y:GY-h,w,h});if(r()<.4)plat.push({x:x+w*.25,y:GY-h-46,w:w*.55,h:46});}
for(let k=0;k<3;k++)cols.push({x:500+r()*(end-1100),y:GY-120-r()*90});}
function spawn(t,x){const c=ET[t],b=!!c.boss,hp=b?MS[G.mi].bhp:c.hp*(1+G.mi*.12);const e={t,c,x,y:GY,vy:0,hp,max:hp,face:-1,fireT:rnd(.5,1.5),cd:0,hitF:0,act:false,ch:0,sd:1,stt:0,ph:1,ringT:3,slT:5,sumT:8,rainT:4,boss:b,w:b?c.w:34*c.sc,h:b?c.h:86*c.sc,moving:false};en.push(e);return e;}
function startEnc(e){G.lock=e.x;if(e.boss){const b=spawn(e.boss,e.x+W+250);b.act=true;G.boss=b;G.intro=2.6;banner('⚠ WARNING ⚠',2600);SFX.boss();shake(.4);}
else[...e.l].forEach((ch,k)=>spawn(ch,e.x+W+40+k*75+rnd(0,40)));}

/* ---------- DAMAGE ---------- */
function hurtP(d){if(PL.inv>0||G.mode!=='play')return;PL.hp-=d;PL.inv=.9;$('#flash').style.opacity=.6;shake(.3);SFX.hurt();G.combo=0;burst(PL.x,PL.y-40,'#ff3355',10,200,5);num(PL.x,PL.y-90,'-'+Math.round(d),'hurt');if(PL.hp<=0){PL.hp=0;endM(false);}}
function dmgE(e,a,crit,head){e.hp-=a;e.hitF=.08;e.act=true;G.hits++;if(head){G.hs++;G.score+=50;}burst(e.x,e.y-e.h*.6,crit?'#ffe23a':'#ff8a5a',crit?10:5,180,4,.35);num(e.x+rnd(-14,14),e.y-e.h-6,Math.round(a),crit?'crit':'dmg');crit?SFX.crit():SFX.hit();
if(e.hp<=0){const i=en.indexOf(e);if(i<0)return;en.splice(i,1);G.kills++;G.combo++;G.maxc=Math.max(G.maxc,G.combo);G.comboT=3.5;G.score+=Math.round(e.c.pts*(1+Math.min(G.combo,10)*.2));
 burst(e.x,e.y-e.h/2,'#ffb02a',e.boss?60:20,300,7,.8);ring(e.x,e.y-e.h/2,e.boss?200:70,'#ffd23a');SFX.boom();shake(e.boss?.9:.12);
 for(let k=0;k<(e.boss?14:e.c.pts>=200?4:2);k++)coins.push({x:e.x,y:e.y-e.h/2,vx:rnd(-120,120),vy:rnd(-400,-150),kind:0});if(!e.boss&&Math.random()<.14)coins.push({x:e.x,y:e.y-40,vx:0,vy:-250,kind:1});if(!e.boss&&Math.random()<.1)coins.push({x:e.x,y:e.y-40,vx:0,vy:-250,kind:2});
 if(e.boss){G.bossDone=true;G.boss=null;}}}
function blast(x,y,R,d){burst(x,y,'#ffb02a',24,320,7,.6);ring(x,y,R,'#ff7a1a',.45);SFX.boom();shake(.35);en.slice().forEach(e=>{if(Math.abs(e.x-x)<R+e.w/2&&Math.abs((e.y-e.h/2)-y)<R+e.h/2)dmgE(e,d*(Math.random()<.15?2:1),false,false);});}

/* ---------- PLAYER ACTIONS ---------- */
function reload(){if(PL.rel>0||PL.ammo>=PL.mag)return;PL.rel=C().rel;SFX.reload();}
function shoot(){const c=C();PL.ammo--;PL.fireT=c.rate*(PL.mode?2.4:1)/(PL.buff>0?2:1);G.shots++;const mx=PL.x+PL.face*80,my=PL.y-42;
pb.push({x:mx,y:my,vx:PL.face*1000,vy:rnd(-1,1)*(c.id==='whizz'?40:12),d:20*dmgMul(),l:.8,hit:new Set(),pierce:c.id==='toshiro'||PL.mode===1,col:c.col,big:PL.mode===1});
PL.rc=9;burst(mx,my,c.col,3,120,4,.1);SFX.shoot(S.ch);shake(.01);if(PL.ammo<=0)reload();}
function jump(){if(G.mode!=='play'||G.intro>0)return;if(PL.jumps<2){PL.vy=PL.jumps?-600:-690;PL.jumps++;SFX.jump();burst(PL.x,PL.y,'#fff',4,80,3,.25);}}
function bomb(){if(G.mode!=='play'||PL.bombs<=0||PL.bcd>0)return;PL.bombs--;PL.bcd=.5;gr.push({bomb:1,x:PL.x+PL.face*30,y:PL.y-50,vx:PL.face*340+PL.vx*.3,vy:-380,l:2});}
function special(){if(G.mode!=='play'||PL.spCd>0)return;const c=C();PL.spCd=c.cd;SFX.spec();shake(.4);
if(S.ch===0){PL.inv=.5;PL.dash=.28;PL.hitD=new Set();}
else if(S.ch===1){ring(PL.x,PL.y-40,280,c.col,.6);burst(PL.x,PL.y-40,c.col,40,400,6,.7);en.slice().forEach(e=>{if(Math.abs(e.x-PL.x)<280)dmgE(e,80*dmgMul(),false,false);});for(let i=eb.length-1;i>=0;i--)if(Math.abs(eb[i].x-PL.x)<300)eb.splice(i,1);}
else{PL.buff=5;PL.ammo=PL.mag;PL.rel=0;ring(PL.x,PL.y-40,120,c.col,.5);burst(PL.x,PL.y-40,c.col,25,300,5,.6);}}

/* ---------- ENEMY AI ---------- */
function ebul(x,y,vx,vy,dmg,col='#ff3355',r=7){eb.push({x,y,vx,vy,dmg,col,r,l:5});}
function aimB(e,ox,oy,sp,dmg,col,r,spread=0){const dx=PL.x-ox,dy=PL.y-40-oy,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx)+spread;ebul(ox,oy,Math.cos(a)*sp,Math.sin(a)*sp,dmg,col,r);}
function updE(dt){for(let k=en.length-1;k>=0;k--){const e=en[k],c=e.c;e.fireT-=dt;e.cd-=dt;e.hitF-=dt;const dx=PL.x-e.x,d=Math.abs(dx);e.face=dx>0?1:-1;e.moving=false;
 if(!e.act){if(e.x<G.cam+W+70)e.act=true;else{e.x-=60*dt;continue;}}
 e.vy+=1800*dt;e.y=Math.min(GY,e.y+e.vy*dt);if(e.y>=GY)e.vy=0;
 if(e.boss){bossAI(e,dt,dx,d);continue;}
 if(e.ch>0){e.ch-=dt;if(e.ch<=0){aimB(e,e.x+e.face*50,e.y-60,1100,c.dmg,'#ffee33',6);SFX.enemy();}continue;}
 if(c.melee){e.x+=e.face*c.spd*dt;e.moving=true;if(d<260&&d>100&&e.y>=GY&&Math.random()<.012)e.vy=-560;if(d<46&&Math.abs(PL.y-e.y)<70&&e.cd<=0){hurtP(c.dmg);e.cd=.8;}}
 else{const mv=d>c.des+50?1:d<c.des-80?-1:0;if(mv){e.x+=mv*e.face*c.spd*dt;e.moving=true;}if(e.fireT<=0&&d<c.rng&&e.x<G.cam+W){
  if(c.snip){e.ch=.9;e.fireT=c.fr;}else{const ox=e.x+e.face*50*c.sc,oy=e.y-50*c.sc;for(let j=0;j<(c.fan?3:1);j++)aimB(e,ox,oy,420,c.dmg,'#ff3355',6,(j-(c.fan?1:0))*.14+rnd(-.04,.04));SFX.enemy();e.fireT=c.fr*rnd(.8,1.4);}}}
 e.x=cl(e.x,G.cam+24,G.cam+W-30);}}
function bossAI(e,dt,dx,d){const r=e.hp/e.max,ph=r>.66?1:r>.33?2:3,mech=e.t==='mech';
 if(G.intro>0){if(e.x>G.cam+W-170)e.x-=120*dt;return;}
 if(ph!==e.ph){e.ph=ph;banner('PHASE '+ph,1400);shake(.5);SFX.boss();}
 if(mech){if(d>330)e.x+=e.face*110*dt;else if(d<200)e.x-=e.face*90*dt;e.x=cl(e.x,G.cam+260,G.cam+W+60);}else e.x=G.cam+W-140;
 const ox=e.x+e.face*(mech?110:0),oy=e.y-(mech?150:200),fr=ph===3?1.1:1.8;
 if(e.fireT<=0){if(mech){ebul(ox,oy,e.face*430,0,14,'#7fd8ff',20);SFX.enemy();}else for(let j=-2;j<=2;j++)aimB(e,ox,oy,320,9,'#ff3355',9,j*.22);e.fireT=fr;}
 if(ph>=2){e.rainT-=dt;if(e.rainT<=0){for(let j=0;j<5;j++)ebul(PL.x+rnd(-260,260),-20-j*40,0,rnd(260,380),9,'#ffb02a',8);e.rainT=4;}
  e.slT-=dt;if(e.slT<=0){tel.push({x:PL.x,t:1.2,w:130});e.slT=6;}}
 if(ph===3){e.sumT-=dt;if(e.sumT<=0){for(let j=0;j<2;j++){const f=spawn('f',e.x-80-j*60);f.act=true;}e.sumT=10;}}
 if(mech&&d<190&&e.cd<=0){hurtP(22);e.cd=1.3;shake(.3);}}

/* ---------- UPDATE ---------- */
function update(dt){const c=C(),m=MS[G.mi];
 if(G.intro>0){G.intro-=dt;updE(dt);camFollow();return;}
 G.time+=dt;PL.fireT-=dt;PL.inv-=dt;PL.spCd-=dt;PL.buff-=dt;PL.bcd-=dt;G.comboT-=dt;if(G.comboT<=0)G.combo=0;PL.rc*=.8;
 if(PL.rel>0){PL.rel-=dt;if(PL.rel<=0)PL.ammo=PL.mag;}
 let ax=cl((K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+T.mx,-1,1),want=mdown||K.KeyJ||T.fire;
 if(G.auto){let bd=1e9,tg=null;for(const e of en)if(e.act||e.x<G.cam+W){const d=Math.abs(e.x-PL.x);if(d<bd&&e.x>G.cam-30&&e.x<G.cam+W+30){bd=d;tg=e;}}if(tg){want=true;if(Math.abs(ax)<.2)PL.face=tg.x>PL.x?1:-1;}}
 if(Math.abs(ax)>.2)PL.face=ax>0?1:-1;
 let vx=ax*c.spd*(PL.rel>0?.9:1);
 if(PL.dash>0){PL.dash-=dt;vx=PL.face*760;en.forEach(e=>{if(!PL.hitD.has(e)&&Math.abs(e.x-PL.x)<e.w/2+40&&Math.abs(e.y-PL.y)<e.h){PL.hitD.add(e);dmgE(e,55*dmgMul(),false,false);}});burst(PL.x,PL.y-40,c.col,2,80,5,.3);}
 PL.x+=vx*dt;PL.moving=Math.abs(vx)>10;
 const py=PL.y;PL.vy+=1900*dt;PL.y+=PL.vy*dt;let g=false;if(PL.y>=GY){PL.y=GY;PL.vy=0;g=true;}else if(PL.vy>=0)for(const p of plat)if(py<=p.y+2&&PL.y>=p.y&&PL.x>p.x-6&&PL.x<p.x+p.w+6){PL.y=p.y;PL.vy=0;g=true;break;}
 PL.g=g;if(g)PL.jumps=0;else if(PL.jumps===0)PL.jumps=1;
 camFollow();PL.x=cl(PL.x,G.cam+24,G.cam+W-24);
 if(want&&PL.fireT<=0&&PL.rel<=0&&PL.dash<=0){if(PL.ammo>0)shoot();else reload();}
 /* encounters */
 if(G.lock==null&&G.ei<ENC.length){const e=ENC[G.ei];if(PL.x-W*.4>=e.x-2)startEnc(e);}
 else if(G.lock!=null&&!en.length&&!G.endT){const e=ENC[G.ei];e.done=true;G.ei++;G.lock=null;if(G.ei>=ENC.length){G.endT=1.6;banner('MISSION CLEAR!',1600);}else{G.go=3;}}
 if(G.endT>0){G.endT-=dt;if(G.endT<=0){endM(true);return;}}
 if(G.go>0)G.go-=dt;
 updE(dt);
 for(let i=pb.length-1;i>=0;i--){const b=pb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;let dead=b.l<=0||b.x<G.cam-60||b.x>G.cam+W+60;
  if(!dead)for(const e of en.slice()){if(b.hit.has(e))continue;if(Math.abs(b.x-e.x)<e.w/2+6&&b.y>e.y-e.h&&b.y<e.y){b.hit.add(e);const head=b.y<e.y-e.h*.8,crit=Math.random()<c.crit;dmgE(e,b.d*(crit?2:1)*(head?1.5:1),crit,head);if(!b.pierce){dead=true;break;}}}
  if(dead)pb.splice(i,1);}
 for(let i=eb.length-1;i>=0;i--){const b=eb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;let dead=b.l<=0||b.y>GY+10||b.x<G.cam-120||b.x>G.cam+W+120;
  if(!dead&&PL.inv<=0&&Math.hypot(b.x-PL.x,b.y-(PL.y-40))<b.r+20){hurtP(b.dmg);dead=true;}if(dead)eb.splice(i,1);}
 for(let i=tel.length-1;i>=0;i--){const t=tel[i];t.t-=dt;if(t.t<=0){ring(t.x,GY,t.w,'#ff4422',.4);burst(t.x,GY,'#ff4422',20,300,6,.5);shake(.4);SFX.boom();if(Math.abs(PL.x-t.x)<t.w&&PL.y>=GY-30)hurtP(28);tel.splice(i,1);}}
 for(let i=gr.length-1;i>=0;i--){const q=gr[i];q.l-=dt;if(q.bomb){q.vy+=1500*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;let ex=q.y>=GY-8||q.l<=0;for(const e of en)if(Math.abs(q.x-e.x)<e.w/2&&q.y>e.y-e.h&&q.y<e.y)ex=true;if(ex){gr.splice(i,1);blast(q.x,Math.min(q.y,GY-20),120,95*dmgMul()/c.dmg);}}else if(q.l<=0)gr.splice(i,1);}
 for(let i=coins.length-1;i>=0;i--){const q=coins[i];q.vy+=1400*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.y>GY-12){q.y=GY-12;q.vy=-q.vy*.3;q.vx*=.7;}const d=Math.hypot(q.x-PL.x,q.y-(PL.y-40));if(d<160&&q.kind===0){q.x+=(PL.x-q.x)*dt*6;q.y+=(PL.y-40-q.y)*dt*6;}
  if(d<34){coins.splice(i,1);if(q.kind===0){G.coins++;SFX.coin();}else if(q.kind===1){PL.hp=Math.min(PL.maxhp,PL.hp+30);num(PL.x,PL.y-90,'+30 HP','heal');SFX.coin();}else{PL.bombs++;SFX.coin();}}}
 for(let i=cols.length-1;i>=0;i--){const q=cols[i];if(Math.abs(q.x-PL.x)<36&&Math.abs(q.y-(PL.y-40))<70){cols.splice(i,1);G.got++;G.score+=500;G.coins+=25;burst(q.x,q.y,'#ffd23a',16,250,5,.5);SFX.win();banner('SECRET GEM +500',1000);}}
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.l-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=700*dt;if(f.l<=0)fx.splice(i,1);}
 for(let i=pop.length-1;i>=0;i--){const p=pop[i];p.l-=dt;p.y+=p.vy*dt;if(p.l<=0)pop.splice(i,1);}
 for(let i=gr.length-1;i>=0;i--)if(!gr[i].bomb){gr[i].r+=(gr[i].r<1?0:0);}
 G.shk=Math.max(0,G.shk-dt*1.6);const fl=$('#flash');fl.style.opacity=Math.max(0,parseFloat(fl.style.opacity||0)-dt*2);hud();}
function camFollow(){let t=Math.max(G.cam,PL.x-W*.4);if(G.lock!=null)t=Math.min(t,G.lock);G.cam=Math.min(t,G.end-W);}

/* ---------- BACKGROUNDS ---------- */
const TH=[{s0:'#e8742a',s1:'#fbc872',cl:'#fff1d0',gr:'#d9a15a',gt:'#7a4a22',gd:'#a8723a'},{s0:'#2a0a1a',s1:'#d4442a',cl:'#7a2a2a',gr:'#4a2a2a',gt:'#2a1010',gd:'#3a1a1a'},{},{s0:'#12082e',s1:'#6a1f8a',cl:'#4a2a7a',gr:'#1c1030',gt:'#ff3bd4',gd:'#120a24'},{s0:'#1a0410',s1:'#5a0a2a',cl:'#3a1030',gr:'#1a0818',gt:'#ff2a4a',gd:'#10040c'}];
const wrap=(v,s)=>((v%s)+s)%s;
function palm(x,y,s,c){X.strokeStyle=c;X.lineCap='round';X.lineWidth=9*s;X.beginPath();X.moveTo(x,y);X.quadraticCurveTo(x+22*s,y-90*s,x+6*s,y-170*s);X.stroke();const tx=x+6*s,ty=y-170*s;
for(let k=0;k<8;k++){const a=Math.PI*(1.02+k*.14),L=78*s,ex=tx+Math.cos(a)*L,ey=ty+Math.sin(a)*L*.5+34*s,mx=tx+Math.cos(a)*L*.5,my=ty+Math.sin(a)*L*.9;X.beginPath();X.moveTo(tx,ty);X.quadraticCurveTo(mx,my-9*s,ex,ey);X.quadraticCurveTo(mx,my+15*s,tx,ty);X.fillStyle=c;X.fill();}}
function bg(th,cx){const P=TH[th];if(th===2){lab(cx,0);return;}
 const g=X.createLinearGradient(0,0,0,GY);g.addColorStop(0,P.s0);g.addColorStop(1,P.s1);X.fillStyle=g;X.fillRect(0,0,W,H);
 X.globalAlpha=th===0?.8:.35;for(let i=0;i<6;i++){const x=wrap(i*300-cx*.05,W+360)-180,y=40+(i*57%120);ell(x,y,90,22,P.cl);ell(x+50,y-12,60,20,P.cl);}X.globalAlpha=1;
 if(th===0){for(let i=0;i<7;i++){const x=wrap(i*300-cx*.12,2300)-250;ell(x,GY-30,150,90,'#c47a3e');ell(x+60,GY-60,90,60,'#b86a32');}
  for(let i=0;i<9;i++)palm(wrap(i*250+hash(i)*120-cx*.3,2300)-200,GY-6,.55+hash(i+5)*.3,'#5a3a2a');
  for(let i=0;i<8;i++)palm(wrap(i*330+hash(i+9)*150-cx*.6,2900)-200,GY,.9+hash(i+2)*.35,'#2e1e18');
  X.fillStyle='#4a4a52';for(let i=0;i<14;i++){const x=wrap(i*130-cx,1820)-120;rr(x,GY-110,8,110,2,'#4a4a52');}X.strokeStyle='#6a6a74';X.lineWidth=1;X.beginPath();for(let y=GY-100;y<GY;y+=14){X.moveTo(0,y);X.lineTo(W,y);}X.stroke();
  const sx=wrap(500-cx,1300)-200;rr(sx,GY-95,150,52,4,'#d6d6dc');crown(sx+22,GY-70,1.4,'#ffb02a');rr(sx+44,GY-80,92,10,2,'#555');rr(sx+44,GY-64,70,10,2,'#555');}
 if(th===1){for(let i=0;i<8;i++){const x=wrap(i*260-cx*.15,2100)-150,h=120+hash(i)*140;rr(x,GY-h,70,h,3,'#2a1218');rr(x+10,GY-h-30,50,30,3,'#2a1218');circ(x+35,GY-h-10,5,'#ff2a4a');}
  for(let i=0;i<6;i++){const x=wrap(i*380-cx*.35,2300)-200;rr(x,GY-150,12,150,2,'#1a0a0e');X.strokeStyle='#1a0a0e';X.lineWidth=8;X.beginPath();X.moveTo(x,GY-148);X.lineTo(x+160,GY-120);X.stroke();}
  for(let i=0;i<10;i++){const x=wrap(i*210-cx*.8,2100)-100;rr(x,GY-70,70,70,3,'#6a2a2a');rr(x,GY-70,70,12,3,'#ffb020');}}
 if(th===3||th===4){const n=th===3?'#ff3bd4':'#ff2a4a',n2=th===3?'#3aa0ff':'#b04dff';for(let i=0;i<14;i++){const x=wrap(i*150-cx*.2,2100)-150,h=130+hash(i+th)*200;rr(x,GY-h,100,h,2,'#0c0820');for(let j=0;j<h/26;j++)if(hash(i*9+j)>.5)rr(x+10+hash(j)*60,GY-h+10+j*26,10,8,1,hash(j+i)>.5?n:n2);}
  for(let i=0;i<8;i++){const x=wrap(i*300-cx*.5,2400)-200,h=80+hash(i+3)*120;rr(x,GY-h,110,h,3,'#150c30');rr(x+10,GY-h+14,90,18,3,i%2?n:n2);crown(x+55,GY-h+50,2,i%2?n2:n);}}
 ground(P);}
function ground(P){X.fillStyle=P.gr;X.fillRect(0,GY,W,H-GY);X.fillStyle=P.gt;X.fillRect(0,GY,W,6);X.fillStyle=P.gd;X.beginPath();X.moveTo(0,GY+6);for(let x=0;x<=W;x+=24){X.lineTo(x+12,GY+6+10+hash(x+G.cam)*0);X.lineTo(x+24,GY+6);}X.fill();}
function lab(cx,th){X.fillStyle='#8b9096';X.fillRect(0,0,W,H);X.fillStyle='#3a3f48';X.fillRect(0,0,W,70);
 for(let i=0;i<5;i++){const x=wrap(i*240-cx*.8,1200)-120;rr(x,10,150,40,3,'#1e2128');for(let j=0;j<7;j++)rr(x+8+j*20,16,10,28,1,'#0a0c10');}
 X.fillStyle='#a2a8ae';for(let i=0;i<6;i++){const x=wrap(i*260-cx,1560)-130;rr(x,90,230,GY-110,4,'#9aa0a6');X.strokeStyle='#6e747a';X.lineWidth=3;X.strokeRect(x,90,230,GY-110);rr(x+90,120,50,60,3,'#59606a');}
 X.fillStyle='#c8a46a';X.fillRect(0,150,W,9);X.fillStyle='#d8d8dc';X.fillRect(0,GY-80,W,10);
 for(let i=0;i<4;i++){const x=wrap(i*420+150-cx,1680)-150;X.globalAlpha=.4;rr(x,70,70,GY-70,6,'#3aff7a');X.globalAlpha=1;rr(x-6,60,82,14,3,'#555');}
 X.fillStyle='#2b3340';X.fillRect(0,GY,W,H-GY);X.fillStyle='#d4d4cc';X.fillRect(0,GY,W,8);X.fillStyle='#1c2230';for(let r=0;r<3;r++)for(let i=0;i<14;i++)X.fillRect(wrap(i*80+(r%2)*40-cx,1120)-80,GY+14+r*20,74,16);}
function drawPlat(p,th){const lb=th===2;rr(p.x,p.y,p.w,p.h,4,lb?'#6a7078':'#a8723a');X.strokeStyle=lb?'#3a3f48':'#5a3a1a';X.lineWidth=3;X.strokeRect(p.x,p.y,p.w,p.h);if(!lb){X.beginPath();X.moveTo(p.x,p.y);X.lineTo(p.x+p.w,p.y+p.h);X.moveTo(p.x+p.w,p.y);X.lineTo(p.x,p.y+p.h);X.stroke();}else rr(p.x,p.y,p.w,6,2,'#c8ccd2');}

/* ---------- ENEMY ART ---------- */
function drawEn(e){const c=e.c;if(e.boss)return e.t==='mech'?drawMech(e):drawTent(e);X.save();X.translate(e.x,e.y);X.scale(e.face*c.sc,c.sc);const t=G.time*12+e.x,sw=e.moving?Math.sin(t)*.7:0;
 [[-5,-sw],[6,sw]].forEach(([lx,a])=>{X.save();X.translate(lx,-24);X.rotate(a);rr(-4,0,9,20,3,c.pants);rr(-5,17,12,7,3,'#111');X.restore();});
 rr(-14,-52,28,30,6,c.body);rr(-14,-34,28,5,0,'#222');if(c.melee)X.rotate(.15);circ(0,-64,14,'#e6bd98');X.beginPath();X.arc(0,-66,16,Math.PI,0);X.fillStyle=c.hat;X.fill();rr(-16,-67,32,5,2,c.hat);circ(7,-63,2.4,'#111');
 if(c.n==='heavy'){rr(-4,-58,16,9,2,'#222');}if(!c.melee){rr(6,-46,38,7,2,'#222');rr(0,-49,10,12,2,'#333');}else{rr(10,-46,16,6,2,'#e6bd98');}
 if(e.hitF>0){X.globalAlpha=.7;rr(-16,-84,34,84,6,'#fff');X.globalAlpha=1;}X.restore();
 if(e.hp<e.max){rr(e.x-18,e.y-e.h-10,36,5,2,'#300');rr(e.x-18,e.y-e.h-10,36*e.hp/e.max,5,2,'#5aff5a');}
 if(e.ch>0){X.strokeStyle='rgba(255,40,40,.8)';X.lineWidth=2;X.beginPath();X.moveTo(e.x+e.face*50,e.y-60);X.lineTo(PL.x,PL.y-40);X.stroke();}}
function drawMech(e){X.save();X.translate(e.x,e.y);X.scale(e.face,1);const f=e.hitF>0,O=f?'#ffd890':'#e8a019',D=f?'#e0a860':'#b0690f',t=G.time;
 rr(-62,-64,44,64,8,'#3a3a44');rr(12,-64,44,64,8,'#3a3a44');rr(-74,-16,64,16,4,'#222');rr(2,-16,64,16,4,'#222');
 rr(-70,-220,26,36,6,'#555');rr(44,-220,26,36,6,'#555');circ(-57,-190+Math.sin(t*12)*0,6,'#ffb02a');
 rr(-88,-196,176,138,28,O);rr(-88,-104,176,14,0,D);for(let k=0;k<4;k++)poly([-88,-170+k*26,-108,-160+k*26,-88,-150+k*26],'#444');
 circ(8,-142,48,'#8fd0e6');circ(8,-142,40,'#c7ecf7');circ(12,-138,23,'#e0b58f');rr(-8,-166,42,16,6,'#222');circ(20,-140,3,'#111');circ(6,-140,3,'#111');rr(6,-124,16,4,2,'#722');
 X.save();X.translate(94,-120);X.rotate(Math.sin(t*3)*.12-.1);rr(-10,-12,30,64,10,D);rr(-4,-24,22,18,4,'#444');poly([6,-24,52,-150,70,-146,22,-18],f?'#fff':'#d8dfe6');poly([6,-24,52,-150,56,-146,12,-22],'#8fa0b0');for(let k=0;k<4;k++)poly([14+k*2,-30-k*22,28+k*2,-34-k*22,20+k*2,-18-k*22],'#555');X.restore();X.restore();
 rr(e.x-80,e.y-246,160,8,3,'#300');rr(e.x-80,e.y-246,160*e.hp/e.max,8,3,'#ff7a2a');}
function drawTent(e){const f=e.hitF>0,t=G.time,x=e.x,y=e.y;
 X.globalAlpha=.4;rr(x-260,y-340,70,340,8,'#3aff7a');rr(x+190,y-340,70,340,8,'#3aff7a');X.globalAlpha=1;rr(x-300,y-60,170,60,4,'#5a6068');rr(x+130,y-60,170,60,4,'#5a6068');
 X.lineCap='round';for(let k=0;k<7;k++){let px=x,py=y-190,a=Math.PI*(.55+k*.13)+(k%2?0:.15);const seg=[[px,py]];for(let j=0;j<14;j++){a+=Math.sin(t*2.2+k*1.3+j*.45)*.17+(j>6?.05:0);px+=Math.cos(a)*24;py+=Math.sin(a)*24;seg.push([px,py]);}
  for(let j=0;j<seg.length-1;j++){X.strokeStyle=f?'#ff8a8a':(j%2?'#7a0f1c':'#a8182a');X.lineWidth=18-j*1.1;X.beginPath();X.moveTo(seg[j][0],seg[j][1]);X.lineTo(seg[j+1][0],seg[j+1][1]);X.stroke();}}
 circ(x,y-190,66,f?'#ff7a7a':'#c4202a');ell(x-14,y-212,30,18,'#e8505a',-.5);circ(x-18,y-186,26,'#111');circ(x-18,y-186,18,'#2aff6a');circ(x-18,y-186,8,'#031');circ(x-10,y-194,4,'#fff');
 rr(x-90,y-290,180,8,3,'#300');rr(x-90,y-290,180*e.hp/e.max,8,3,'#ff3a4a');}
const enrage=0;

/* ---------- RENDER ---------- */
function render(){const k=cv.k;X.setTransform(k,0,0,k,0,0);
 if(G.mode==='menu'){const t=performance.now()/1000;bg(0,t*60);X.fillStyle='rgba(0,0,0,.25)';X.fillRect(0,0,W,H);drawChar(S.ch,W*.76,GY-6,1,t,true,0,S.sk[S.ch]===2,2.4);return;}
 const th=MS[G.mi].th,cx=G.cam;let sx=0,sy=0;if(G.shk>0&&S.shake){sx=rnd(-1,1)*G.shk*14;sy=rnd(-1,1)*G.shk*14;}
 X.save();X.translate(sx,sy);bg(th,cx);X.translate(-cx,0);
 plat.forEach(p=>{if(p.x+p.w>cx-20&&p.x<cx+W+20)drawPlat(p,th);});
 tel.forEach(t=>{X.globalAlpha=.25+.3*Math.abs(Math.sin(t.t*12));ell(t.x,GY,t.w,t.w*.18,'#ff2222');X.globalAlpha=1;});
 cols.forEach(q=>{X.save();X.translate(q.x,q.y+Math.sin(G.time*3)*5);X.scale(Math.cos(G.time*3),1);poly([0,-20,14,0,0,20,-14,0],'#ffd23a');poly([0,-12,8,0,0,12,-8,0],'#fff6b0');X.restore();});
 coins.forEach(q=>{if(q.kind===0){circ(q.x,q.y,9,'#b87a08');circ(q.x,q.y,7,'#ffc21a');}else if(q.kind===1){rr(q.x-11,q.y-11,22,22,4,'#fff');rr(q.x-3,q.y-8,6,16,1,'#d4232a');rr(q.x-8,q.y-3,16,6,1,'#d4232a');}else{circ(q.x,q.y,10,'#333');rr(q.x-2,q.y-14,4,6,1,'#999');}});
 en.forEach(drawEn);
 if(G.mode!=='over'||PL.hp>0){if(PL.inv<=0||Math.floor(G.time*20)%2)drawChar(S.ch,PL.x,PL.y,PL.face,G.time,PL.moving&&PL.g,PL.rc,S.sk[S.ch]===2,1,0);
  if(PL.dash>0){X.globalAlpha=.4;drawChar(S.ch,PL.x-PL.face*40,PL.y,PL.face,0,true,0,false);X.globalAlpha=1;}
  if(PL.buff>0){X.globalAlpha=.35;ell(PL.x,PL.y-40,38,56,C().col);X.globalAlpha=1;}
  rr(PL.x-22,PL.y-112,44,6,3,'#031');rr(PL.x-22,PL.y-112,44*PL.hp/PL.maxhp,6,3,'#4aff5a');}
 pb.forEach(b=>{X.save();X.translate(b.x,b.y);X.globalAlpha=.4;rr(-30,-(b.big?7:4),60,b.big?14:8,4,b.col);X.globalAlpha=1;rr(-14,-(b.big?4:2),28,b.big?8:4,2,'#fff');X.restore();});
 eb.forEach(b=>{circ(b.x,b.y,b.r+3,'rgba(255,255,255,.3)');circ(b.x,b.y,b.r,b.col);});
 gr.forEach(q=>{if(q.bomb){circ(q.x,q.y,8,'#2a3a2a');rr(q.x-2,q.y-12,4,5,1,'#999');}else{X.globalAlpha=q.l/q.L;X.strokeStyle=q.col;X.lineWidth=6;X.beginPath();X.ellipse(q.x,q.y,q.r*(1-q.l/q.L),q.r*(1-q.l/q.L)*.5,0,0,7);X.stroke();X.globalAlpha=1;}});
 fx.forEach(f=>{X.globalAlpha=cl(f.l/f.L,0,1);X.fillStyle=f.col;X.fillRect(f.x-f.s/2,f.y-f.s/2,f.s,f.s);});X.globalAlpha=1;
 pop.forEach(p=>{X.globalAlpha=cl(p.l*2,0,1);X.font=(p.kind==='crit'?'italic 900 34px':'italic 900 20px')+' Impact,sans-serif';X.textAlign='center';X.lineWidth=5;X.strokeStyle='#000';const tx=p.kind==='crit'?'CRIT '+p.txt:p.txt;X.strokeText(tx,p.x,p.y);X.fillStyle=p.kind==='crit'?'#5ad8ff':p.kind==='hurt'?'#ff4a4a':p.kind==='heal'?'#5aff7a':'#fff';X.fillText(tx,p.x,p.y);});X.globalAlpha=1;
 X.restore();
 if(G.go>0&&Math.floor(G.go*3)%2){X.font='italic 900 40px Impact';X.textAlign='right';X.lineWidth=6;X.strokeStyle='#000';X.strokeText('GO ▶',W-30,200);X.fillStyle='#ffd23a';X.fillText('GO ▶',W-30,200);}}

/* ---------- HUD / FLOW ---------- */
let lastCombo=0;
function hud(){const m=MS[G.mi];$('#hpf').style.width=PL.hp/PL.maxhp*100+'%';$('#ammo').textContent=PL.rel>0?'RELOAD':(PL.mode?'HEAVY ':'')+PL.ammo;$('#bomb').textContent='x'+PL.bombs;
 const t=Math.floor(G.time);$('#tm').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');$('#cn').textContent=G.coins+S.coins;
 $('#obj').textContent=m.obj+' · '+C().sp+(PL.spCd>0?' '+PL.spCd.toFixed(1)+'s':' READY (L)')+' · SCORE '+G.score;
 const cb=$('#combo');if(G.combo>=2&&G.combo!==lastCombo){cb.innerHTML='COMBO KILL<b>'+G.combo+'</b>';cb.classList.remove('pop');void cb.offsetWidth;cb.classList.add('pop');}lastCombo=G.combo;
 const b=G.boss;$('#bossb').classList.toggle('hide',!b);if(b)$('#bf').style.width=b.hp/b.max*100+'%';}
function start(i){aud();[en,pb,eb,fx,pop,coins,gr,tel].forEach(a=>a.length=0);G.mi=i;build(i);Object.assign(G,{time:0,score:0,combo:0,comboT:0,maxc:0,kills:0,shots:0,hits:0,hs:0,got:0,coins:0,cam:0,lock:null,ei:0,intro:0,shk:0,endT:0,go:0,boss:null,bossDone:false});
 const c=C();Object.assign(PL,{x:120,y:GY,vx:0,vy:0,face:1,maxhp:c.hp+15*S.up[S.ch][1],mag:c.mag,ammo:c.mag,rel:0,fireT:0,inv:1,spCd:0,buff:0,bcd:0,dash:0,bombs:6,mode:0,jumps:0,rc:0});PL.hp=PL.maxhp;
 $('#pimg').src='chars/'+c.id+'_f.jpg';$('#pname').textContent=c.name;$('#plv').textContent='Lv: '+(1+S.up[S.ch][0]+S.up[S.ch][1]);
 ['#menu','#result','#pause'].forEach(s=>$(s).classList.add('hide'));$('#hud').classList.remove('hide');$('#touch').classList.toggle('hide',!TOUCH);G.mode='play';
 banner(MS[i].n,2200);$('#tip').textContent=MS[i].story+(MS[i].tip?'  ·  '+MS[i].tip:'');$('#tip').classList.add('on');setTimeout(()=>$('#tip').classList.remove('on'),8000);}
function endM(win){if(G.mode==='over')return;G.mode='over';$('#hud').classList.add('hide');$('#touch').classList.add('hide');const m=MS[G.mi],acc=G.shots?G.hits/G.shots:0;
 const st=win?1+(acc>=.35?1:0)+(G.time<=m.par?1:0):0,ch=win&&m.ch.f(G,PL),bonus=(win?Math.round(Math.max(0,m.par-G.time)*5+acc*300):0)+(ch?400:0),sc=G.score+bonus,coin=Math.floor(sc/12)+st*40+G.coins,nb=win&&sc>(S.best[G.mi]||0);
 S.coins+=coin;if(win){S.best[G.mi]=Math.max(S.best[G.mi]||0,sc);S.stars[G.mi]=Math.max(S.stars[G.mi]||0,st);S.unl=Math.max(S.unl,Math.min(5,G.mi+2));}save();SFX[win?'win':'lose']();
 const r=$('#result');r.innerHTML=`<div class=ttl>${win?'MISSION COMPLETE':'MISSION FAILED'}</div><div class=sub>${m.n}</div><div class=stars>${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><div class=card>Score <b>${sc}</b> ${nb?'<em>NEW BEST!</em>':''}<br>Enemies eliminated <b>${G.kills}</b> · Headshots <b>${G.hs}</b><br>Accuracy <b>${Math.round(acc*100)}%</b> · Time <b>${Math.round(G.time)}s</b> (par ${m.par}s)<br>Secret gems <b>${G.got}/3</b><br>Challenge: <b>${m.ch.t} ${ch?'✔ +400':'✘'}</b><br>Reward <b>+${coin} coins</b></div><div class=row><button class=b data-a=retry>RETRY</button>${win&&G.mi<4?'<button class=b data-a=next>CONTINUE</button>':''}<button class=b data-a=menu>MENU</button></div>`;r.classList.remove('hide');}
function toMenu(){G.mode='menu';['#result','#pause','#hud','#touch'].forEach(s=>$(s).classList.add('hide'));$('#menu').classList.remove('hide');panel(tab);}
function pause(){if(G.mode!=='play')return;G.mode='pause';$('#pause').classList.remove('hide');mdown=false;T.fire=false;}

/* ---------- MENU UI ---------- */
let tab='chars';const hx=s=>s,bar=(l,v)=>`<small>${l}</small><div class=bar><i style="width:${cl(v,.05,1)*100}%"></i></div>`;
function panel(t){tab=t;const p=$('#panel');document.querySelectorAll('#tabs .b').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 if(t==='chars'){const c=C();p.innerHTML=`<div class=row>${CH.map((x,i)=>`<button class="b ${i===S.ch?'on':''}" data-c=${i}>${x.name}</button>`).join('')}</div><div class=cc><img src="chars/${c.id}.jpg" alt="${c.name}"><div style="flex:1"><h2 style="color:${c.col}">${c.name}</h2><p>${c.desc}</p>${bar('HEALTH',c.hp/140)}${bar('SPEED',c.spd/280)}${bar('DAMAGE',c.dmg/1.4)}${bar('FIRE RATE',.09/c.rate)}<p><b style="color:${c.col}">${c.sp}</b> — ${c.sd} (${c.cd}s)</p><small>${c.wep}</small></div></div>`;}
 else if(t==='missions')p.innerHTML=MS.map((m,i)=>`<button class="b w ${i===S.sel?'on':''}" data-m=${i} ${i>=S.unl?'disabled':''}>${i+1}. ${m.n}<br><small>${i>=S.unl?'🔒 LOCKED':'★'.repeat(S.stars[i]||0)+'☆'.repeat(3-(S.stars[i]||0))+' · BEST '+(S.best[i]||0)}</small></button>`).join('');
 else if(t==='upg'){const u=S.up[S.ch],c=C(),cost=[150*(u[0]+1),120*(u[1]+1)];p.innerHTML=`<h2>${c.wep}</h2><p>Coins: <b>${S.coins}</b></p><button class="b w" data-u=0 ${u[0]>=5||S.coins<cost[0]?'disabled':''}>WEAPON DAMAGE Lv ${u[0]}/5 (+15%) — ${u[0]>=5?'MAX':cost[0]}</button><button class="b w" data-u=1 ${u[1]>=5||S.coins<cost[1]?'disabled':''}>${c.name} ARMOR Lv ${u[1]}/5 (+15 HP) — ${u[1]>=5?'MAX':cost[1]}</button><button class="b w" data-u=2>ALT SKIN: ${S.sk[S.ch]===0?'UNLOCK 500':S.sk[S.ch]===2?'EQUIPPED (tap to unequip)':'EQUIP'}</button>`;}
 else{p.innerHTML=`<label>Volume <input id=vol type=range min=0 max=1 step=.05 value=${S.vol}></label><br><label><input id=mute type=checkbox ${S.mute?'checked':''}> Mute</label><br><label><input id=shk type=checkbox ${S.shake?'checked':''}> Screen shake</label><br><label>Graphics <select id=q><option value=0>Low</option><option value=1>Medium</option><option value=2>High</option></select></label>`;$('#q').value=S.q;}}
$('#panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;aud();const d=b.dataset;if(d.c!==undefined)S.ch=+d.c;else if(d.m!==undefined)S.sel=+d.m;else if(d.u!==undefined){const u=S.up[S.ch],i=+d.u,cost=i?120*(u[1]+1):150*(u[0]+1);if(i===2){const k=S.sk;if(k[S.ch]===0){if(S.coins>=500){S.coins-=500;k[S.ch]=2;}}else k[S.ch]=k[S.ch]===2?1:2;}else if(S.coins>=cost&&u[i]<5){S.coins-=cost;u[i]++;}}save();panel(tab);});
$('#panel').addEventListener('input',e=>{aud();const i=e.target.id;if(i==='vol')S.vol=+e.target.value;if(i==='mute')S.mute=e.target.checked;if(i==='shk')S.shake=e.target.checked;if(i==='q'){S.q=+e.target.value;resize();}setVol();save();});
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b){aud();panel(b.dataset.t);}});
$('#play').onclick=()=>start(Math.min(S.sel,S.unl-1));
$('#result').addEventListener('click',e=>{const a=e.target.dataset.a;if(a==='retry')start(G.mi);if(a==='next'){S.sel=G.mi+1;save();start(G.mi+1);}if(a==='menu')toMenu();});
$('#pause').addEventListener('click',e=>{const a=e.target.dataset.a;if(a==='resume'){$('#pause').classList.add('hide');G.mode='play';}if(a==='retry'){$('#pause').classList.add('hide');start(G.mi);}if(a==='menu')toMenu();});

/* ---------- INPUT ---------- */
addEventListener('keydown',e=>{K[e.code]=true;if(G.mode==='pause'&&(e.code==='Escape'||e.code==='KeyP')){$('#pause').classList.add('hide');G.mode='play';return;}if(G.mode!=='play')return;
 if(e.code==='Escape'||e.code==='KeyP')pause();if(e.code==='KeyR')reload();if(e.code==='KeyQ')PL.mode=1-PL.mode;if(e.code==='KeyT')autoT();if(['KeyW','Space','ArrowUp'].includes(e.code)){if(!e.repeat)jump();e.preventDefault();}
 if(e.code==='KeyG'||e.code==='KeyK')bomb();if(e.code==='KeyL'||e.code==='ShiftLeft')special();});
addEventListener('keyup',e=>K[e.code]=false);
cv.addEventListener('mousedown',e=>{if(e.button===0&&G.mode==='play')mdown=true;});addEventListener('mouseup',()=>mdown=false);
const autoT=()=>{G.auto=!G.auto;$('#auto').classList.toggle('on',G.auto);};
$('#auto').addEventListener('pointerdown',autoT);$('#pbtn').addEventListener('pointerdown',pause);$('#arms').addEventListener('pointerdown',()=>{if(G.mode==='play')PL.mode=1-PL.mode;});
(function touch(){const base=$('#joy'),st=$('#stick');let id=null,ox,oy;const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-ox;const m=Math.abs(dx),mx=55;if(m>mx)dx*=mx/m;st.style.transform=`translate(${dx}px,0)`;T.mx=Math.abs(dx)<10?0:dx/mx;};
 base.addEventListener('pointerdown',e=>{id=e.pointerId;base.setPointerCapture(id);const r=base.getBoundingClientRect();ox=r.left+r.width/2;oy=r.top+r.height/2;mv(e);});base.addEventListener('pointermove',mv);
 const up=e=>{if(e.pointerId!==id)return;id=null;T.mx=0;st.style.transform='';};base.addEventListener('pointerup',up);base.addEventListener('pointercancel',up);
 const fb=$('#tf');fb.addEventListener('pointerdown',()=>{aud();T.fire=true;});['pointerup','pointercancel','pointerleave'].forEach(v=>fb.addEventListener(v,()=>T.fire=false));
 $('#tj').addEventListener('pointerdown',jump);$('#tb').addEventListener('pointerdown',bomb);$('#ts').addEventListener('pointerdown',special);$('#tr').addEventListener('pointerdown',reload);})();

/* ---------- LOOP ---------- */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.033,(now-last)/1000);last=now;if(G.mode==='play')update(dt);render();}
window.__ss={G,PL,en,S,start,MS,update,CH};
resize();panel('chars');requestAnimationFrame(loop);
