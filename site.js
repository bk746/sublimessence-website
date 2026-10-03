(()=>{
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const root=document.documentElement; root.style.scrollBehavior='auto';
  if(reduce)document.body.classList.add('rm');

  /* ---------- Intro + entrée ---------- */
  const intro=$('#intro'); const readyCbs=[];
  const go=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{document.body.classList.add('ready');readyCbs.forEach(f=>f())}));
  let seen=false;try{seen=sessionStorage.getItem('se3-intro')==='1';sessionStorage.setItem('se3-intro','1')}catch(e){}
  if(!intro||reduce||seen){intro&&intro.classList.add('gone');go()}
  else{let done=false;const lift=()=>{if(done)return;done=true;intro.classList.add('out');setTimeout(go,180);setTimeout(()=>intro.classList.add('gone'),1200)};
    intro.addEventListener('click',lift);addEventListener('keydown',lift,{once:true});setTimeout(lift,1000)}

  /* ---------- Titres en mots ---------- */
  $$('.split').forEach(h=>{let n=0;
    const walk=node=>{[...node.childNodes].forEach(ch=>{
      if(ch.nodeType===3){const parts=ch.textContent.split(/( +)/);const fr=document.createDocumentFragment();
        parts.forEach(p=>{if(!p)return;if(/^ +$/.test(p)){fr.appendChild(document.createTextNode(' '));return}
          const w=document.createElement('span');w.className='w';const i=document.createElement('i');i.style.setProperty('--i',n++);i.textContent=p;w.appendChild(i);fr.appendChild(w)});
        ch.replaceWith(fr)}
      else if(ch.nodeType===1&&ch.tagName!=='SVG')walk(ch)})};
    walk(h)});
  /* Manifeste : mots qui s'allument au défilement */
  const mT=$('#manifT'); let mW=[];
  if(mT){const walk=node=>{[...node.childNodes].forEach(ch=>{
      if(ch.nodeType===3){const fr=document.createDocumentFragment();ch.textContent.split(/( +)/).forEach(p=>{if(!p)return;if(/^ +$/.test(p)){fr.appendChild(document.createTextNode(' '));return}const s=document.createElement('span');s.className='mw';s.textContent=p;fr.appendChild(s)});ch.replaceWith(fr)}
      else if(ch.nodeType===1)walk(ch)})};walk(mT);mW=$$('.mw',mT);
    if(reduce)mW.forEach(w=>w.classList.add('on'))}

  /* ---------- Apparitions ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.06});
  $$('.rv,.brush,.split,#ftBig').forEach(el=>{
    if(reduce){el.classList.add('vis');return}
    const sib=[...el.parentElement.children].filter(x=>x.classList.contains('rv'));const k=sib.indexOf(el);
    if(k>0&&el.classList.contains('rv'))el.style.transitionDelay=Math.min(k,5)*80+'ms';
    io.observe(el)});

  /* ---------- HERO : le pinceau révèle la pièce ---------- */
  const stage=$('#stage'), cv=$('#paint'), pieceImg=$('#heroPiece');
  const P={ok:false};
  if(!stage||!cv||!cv.getContext||reduce){document.body.classList.add('no-paint')}
  else{
    const ctx=cv.getContext('2d'); const mk=document.createElement('canvas'), mx=mk.getContext('2d');
    let W=0,H=0,dpr=1,B=0,stamp=null,dirty=false,painted=0,done=false,healT=0,healing=false;
    const makeStamp=()=>{ // pinceau plat : poils alignés dans le sens du geste
      const L=Math.round(B*.55), Wd=Math.round(B); const c=document.createElement('canvas');c.width=L;c.height=Wd;const g=c.getContext('2d');
      const n=70;for(let j=0;j<n;j++){const y=(j+Math.random())/n*Wd;const edge=Math.min(y,Wd-y)/(Wd/2);
        const a=(.25+Math.random()*.75)*Math.min(1,edge*2.2+.08);const x0=Math.random()*L*.25,x1=L-Math.random()*L*.25;
        const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.25,`rgba(0,0,0,${a})`);gr.addColorStop(.8,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');
        g.strokeStyle=gr;g.lineWidth=Wd/n*(1+Math.random()*1.6);g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke()}
      g.globalCompositeOperation='source-atop';g.fillStyle='#000';g.globalAlpha=.35;g.fillRect(0,Wd*.2,L,Wd*.6);
      return c};
    const size=()=>{const r=stage.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);
      const nW=Math.round(r.width*dpr),nH=Math.round(r.height*dpr);if(!nW||!nH||(nW===W&&nH===H))return;
      let old=null;if(W){old=document.createElement('canvas');old.width=W;old.height=H;old.getContext('2d').drawImage(mk,0,0)}
      W=cv.width=mk.width=nW;H=cv.height=mk.height=nH;if(old)mx.drawImage(old,0,0,W,H);
      B=Math.max(60,W*.2);stamp=makeStamp();dirty=true};
    const dab=(x,y,ang,s=1,a=1)=>{mx.save();mx.globalCompositeOperation=done?'destination-out':'source-over';if(done)a*=.5;mx.translate(x,y);mx.rotate(ang);mx.globalAlpha=a;const L=stamp.width*s,Wd=stamp.height*s;mx.drawImage(stamp,-L/2,-Wd/2,L,Wd);mx.restore();dirty=true};
    const seg=(x0,y0,x1,y1,s=1)=>{const dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy);if(d<.5)return;const ang=Math.atan2(dy,dx);const st=Math.max(2,B*.06*s);
      for(let t=0;t<=d;t+=st){const k=t/d;dab(x0+dx*k,y0+dy*k,ang,s*(.85+Math.random()*.25),.55+Math.random()*.4)}};
    const render=()=>{if(dirty&&P.ok&&W&&H){ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.drawImage(pieceImg,0,0,W,H);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mk,0,0);dirty=false}};
    P.render=render;
    const strokes=[[[.0,.3],[.5,.27],[1,.29]],[[1,.39],[.5,.41],[0,.4]],[[0,.5],[.5,.52],[1,.49]],[[1,.6],[.5,.62],[0,.61]],[[0,.7],[.5,.72],[1,.7]],[[.04,.66],[.06,.8],[.07,.97]],[[.3,.72],[.31,.86]],[[.77,.7],[.76,.82],[.77,.98]],[[.96,.66],[.95,.8],[.94,.95]]];
    // remplissage final : aucune zone ne reste au crayon au repos
    const fill=()=>{mx.save();mx.globalCompositeOperation='source-over';mx.globalAlpha=1;mx.fillStyle='#000';mx.fillRect(0,0,W,H);mx.restore();dirty=true};
    const heal=now=>{const age=now-healT;if(age>380){mx.save();mx.globalCompositeOperation='source-over';mx.globalAlpha=Math.min(.16,(age-380)/2600);mx.fillStyle='#000';mx.fillRect(0,0,W,H);mx.restore();dirty=true}
      render();if(age>1900){fill();render();healing=false;return}requestAnimationFrame(heal)};
    const wake=()=>{healT=performance.now();if(!healing){healing=true;requestAnimationFrame(heal)}};
    const auto=()=>{let si=0,t0=performance.now();const dur=[520,460,460,460,460,300,240,300,280];let last=null;
      const step=now=>{if(si>=strokes.length){let f0=now;const flood=t=>{const k=clamp((t-f0)/650);mx.save();mx.globalCompositeOperation='source-over';mx.globalAlpha=.05+k*.25;mx.fillStyle='#000';mx.fillRect(0,0,W,H);mx.restore();dirty=true;render();if(k<1)requestAnimationFrame(flood);else{fill();render();done=true;document.body.classList.add('auto-done')}};requestAnimationFrame(flood);return}
        const s=strokes[si],k=clamp((now-t0)/dur[si]);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        const segs=s.length-1,pos=e*segs,i=Math.min(segs-1,Math.floor(pos)),f=pos-i;
        const x=(s[i][0]+(s[i+1][0]-s[i][0])*f)*W,y=(s[i][1]+(s[i+1][1]-s[i][1])*f)*H;
        if(last)seg(last[0],last[1],x,y,si>4?.55:1);last=[x,y];
        if(k>=1){si++;t0=now;last=null}
        render();requestAnimationFrame(step)};requestAnimationFrame(step)};
    const start=()=>{size();P.ok=true;readyCbs.push(()=>setTimeout(auto,350));if(document.body.classList.contains('ready'))setTimeout(auto,350)};
    if(pieceImg.complete&&pieceImg.naturalWidth)start();else pieceImg.addEventListener('load',start);
    addEventListener('resize',()=>{if(P.ok){size();if(done&&!healing)fill();render()}});
    // geste de l'utilisateur
    let lp=null;const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*dpr,(e.clientY-r.top)*dpr]};
    stage.addEventListener('pointermove',e=>{if(!P.ok)return;if(e.pointerType!=='mouse'&&!e.buttons&&e.pressure===0)return;const p=pt(e);if(lp)seg(lp[0],lp[1],p[0],p[1],.75);lp=p;
      if(done)wake();if(++painted>60)document.body.classList.add('painted');render()});
    stage.addEventListener('pointerleave',()=>lp=null);
    stage.addEventListener('pointerdown',e=>{if(!P.ok)return;const p=pt(e);lp=p;
      if(e.pointerType!=='mouse'){ // toucher : un coup de pinceau autour du doigt
        const ang=Math.random()*Math.PI;seg(p[0]-Math.cos(ang)*B*.6,p[1]-Math.sin(ang)*B*.6,p[0]+Math.cos(ang)*B*.6,p[1]+Math.sin(ang)*B*.6,.9);if(done)wake();render()}});
    stage.addEventListener('pointerup',()=>lp=null);
  }

  /* ---------- Défilement doux (lerp, desktop) ---------- */
  let tY=scrollY,cY=scrollY,smooth=false;const maxY=()=>document.documentElement.scrollHeight-innerHeight;
  const useSmooth=fine&&!reduce;
  if(useSmooth){
    addEventListener('wheel',e=>{if(e.ctrlKey||e.defaultPrevented||root.classList.contains('lb-on'))return;if(e.target.closest('textarea,select,.mnav'))return;
      e.preventDefault();const d=e.deltaMode===1?e.deltaY*32:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
      if(!smooth){tY=cY=scrollY}tY=clamp(tY+d,0,maxY());smooth=true},{passive:false});
    addEventListener('scroll',()=>{if(!smooth){tY=cY=scrollY}},{passive:true});
    addEventListener('keydown',()=>{smooth=false});
  }
  const goTo=y=>{if(useSmooth){if(!smooth){cY=scrollY}tY=clamp(y,0,maxY());smooth=true}else scrollTo({top:y,behavior:reduce?'auto':'smooth'})};
  const samePage=a=>{const h=a.getAttribute('href')||'';if(h[0]==='#')return h;try{const u=new URL(a.href,location.href);return u.pathname===location.pathname&&u.hash?u.hash:null}catch(e){return null}};
  $$('a[href*="#"]').forEach(a=>a.addEventListener('click',e=>{const id=samePage(a);if(!id||id.length<2)return;let el;try{el=document.querySelector(id)}catch(_){return}if(!el)return;
    e.preventDefault();const y=el.getBoundingClientRect().top+scrollY-(id==='#top'?0:64);goTo(id==='#top'?0:y);history.replaceState(null,'',id);
    setTimeout(()=>{el.setAttribute('tabindex','-1');el.focus({preventScroll:true})},reduce?0:700)}));
  /* ---------- Éléments pilotés par le défilement ---------- */
  const hd=$('.hd'), sticky=$('#sticky'), hero=$('#hero'), zones=['contact','formulaire'].map(id=>document.getElementById(id)).filter(Boolean);
  const orn=$('.h4-orn'), h1=$('#h1'), ghost=$('.h4-word span'), stains=$$('.h3-stain');
  const pars=$$('.par'), deps=$$('[data-depth]');
  const washes=$$('.wash');
  const story=$('#histoire'), lays=$$('#histoire .lay'), stTs=$$('#histoire .st-t'), stBars=$$('#histoire .st-prog b'), stNum=$('#stNum'), stTag=$('#stTag'), stR=$('#histoire .st-r');
  const tagN=['I · Avant','II · Le projet dessiné','III · À l\'atelier','IV · Après'];
  const gal=$('.gal'), galT=$('#galT'), galN=$('#galN'), gcs=$$('.gc');
  /* ---------- Ambiance : orbes pigmentaires + rubans qui se dessinent ---------- */
  const AMB=[['.prx-intro',[],[18,62,-8,1]],['#realisations',[['o-ocre',78,-6,40],['o-sienne',-12,60,30]],[70,30,12,0]],
    ['#methode',[['o-ocre',70,-8,38],['o-sienne',-14,55,30]],[12,70,9,0]],['#atelier',[['o-verte',76,10,40],['o-ocre',-10,70,34]],[80,20,-10,0]],
    ['#tarifs',[['o-sienne',80,40,34],['o-ocre',-8,-10,36]],[60,8,14,0]],['#avis',[['o-ocre',60,-12,40],['o-verte',-12,50,30]],[20,90,-8,0]],
    ['#faq',[['o-sienne',-10,10,34],['o-ocre',78,60,36]],[86,40,10,0]],['#contact',[['o-ocre',70,-10,42],['o-sienne',-14,70,34]],[14,84,-12,1]],
    ['#nathalie',[['o-verte',76,10,40],['o-ocre',-10,70,34]],[80,20,-10,0]],['#engagements',[['o-ocre',72,-8,38],['o-sienne',-12,60,30]],[18,70,8,0]],
    ['#repertoire',[['o-ocre',76,-6,40],['o-verte',-12,40,32]],[70,24,10,0]],
    ['#formulaire',[['o-ocre',70,-10,42],['o-sienne',-14,70,34]],[14,84,-12,1]],['#zone',[['o-verte',72,-10,38],['o-ocre',-12,60,32]],[76,22,-8,0]],
    ['#devis',[['o-ocre',70,-10,42],['o-sienne',-14,70,34]],[14,84,-12,1]]];
  const ribs=[];
  AMB.forEach(([sel,orbs,rb])=>{const el=$(sel);if(!el)return;el.classList.add('amb');
    orbs.forEach(([c,x,y,sz])=>{const o=document.createElement('div');o.className='orb '+c;o.setAttribute('aria-hidden','true');o.style.cssText=`--x:${x}%;--y:${y}%;--s:${sz}vw`;el.prepend(o)});
    if(rb){el.insertAdjacentHTML('afterbegin',`<svg class="rib${rb[3]?' dk':''}" aria-hidden="true"></svg>`);ribs.push([el,$('.rib',el),rb])}});
  const RIB_TXT='h1,h2,h3,h4,p,li,a,button,input,textarea,label,dl,figure,img,blockquote,.sw,.btn,table,summary';
  const ribDraw=()=>ribs.forEach(([el,sv,[y0,y1,tw]])=>{const W=el.offsetWidth;const er=el.getBoundingClientRect();
    // bande vide entre le haut de la section et son premier contenu : le ruban n'y croise jamais de texte
    let top=Infinity;$$(RIB_TXT,el).forEach(t=>{if(t.closest('.rib,.orb'))return;const r=t.getBoundingClientRect();if(r.height>0&&r.width>0)top=Math.min(top,r.top-er.top)});
    const band=Math.min(top,el.offsetHeight)-46;
    if(!W||band<60||innerWidth<768){sv.style.display='none';return}sv.style.display='';
    sv.setAttribute('viewBox',`0 0 ${W} ${band}`);sv.style.height=band+'px';sv.style.bottom='auto';
    const X=v=>(v/100*W).toFixed(1),g=Math.min(6,band*.035),m=band*.5,amp=band*.36;
    const Y=(v,k)=>(m+(v-50)/50*amp+k*g).toFixed(1);let d='';
    for(let i=0;i<7;i++){const k=i-3;const cl=i===0||i===6?'r0':(i===3?'r1':'r2');
      d+=`<path pathLength="1" class="${cl}" d="M${X(-2)} ${Y(y0,k*.6)} C ${X(32)} ${Y(Math.max(0,Math.min(100,y0+tw*3)),k*1.4)}, ${X(66)} ${Y(Math.max(0,Math.min(100,y1-tw*3)),-k*1.4)}, ${X(102)} ${Y(y1,k*.6)}"/>`}
    sv.innerHTML=d});
  ribDraw();addEventListener('load',ribDraw);let ribT;addEventListener('resize',()=>{clearTimeout(ribT);ribT=setTimeout(ribDraw,200)});
  if(reduce)ribs.forEach(r=>r[1].style.setProperty('--rp',1));
  const prxP=$$('.prx-p'), prxI=prxP.map(p=>$('.prx-img',p)), prxIn=prxP.map(p=>$('.prx-in',p));
  const pcS=$('#pcSteps'), pcIt=pcS?$$('.pc-step',pcS):[], pcNum=$$('#pcNum span'), pcNav=$$('.pc-nav li'), pcBar=$('#pcBar');let pcI=-1;
  const itl=$('#geste'), itlM=itl&&$('.itl-media',itl);
  const marq=$('#marq'); if(marq){marq.innerHTML+=marq.innerHTML;$$('span',marq).slice(5).forEach(s=>s.setAttribute('aria-hidden','true'))}
  let galDist=0,galOn=false,stIdx=-1,lastY=scrollY,vel=0,mX=0;
  const layout=()=>{galOn=!reduce&&innerWidth>980&&gal;
    if(gal){if(galOn){galDist=Math.max(0,galT.scrollWidth-innerWidth);gal.style.setProperty('--gh',(innerHeight+galDist)+'px')}else{gal.style.removeProperty('--gh');galT.style.transform=''}}};
  layout();addEventListener('resize',layout);addEventListener('load',layout);
  const frame=()=>{
    if(smooth){cY+=(tY-cY)*.095;if(Math.abs(tY-cY)<.4){cY=tY;smooth=false}scrollTo(0,cY)}
    const y=scrollY,vh=innerHeight; vel+=((y-lastY)-vel)*.2; lastY=y;
    hd.classList.toggle('scrolled',y>8);
    const pastHero=y>vh*.8; const atForm=zones.some(z=>{const r=z.getBoundingClientRect();return r.top<vh*.7&&r.bottom>vh*.3});
    sticky&&sticky.classList.toggle('on',pastHero&&!atForm);
    if(!reduce){
      // hero : profondeur au défilement
      if(y<vh*1.2){orn&&orn.style.setProperty('--oy',(y*.06).toFixed(1)+'px');h1&&(h1.style.transform=`translate3d(0,${y*-.18}px,0)`);ghost&&ghost.style.setProperty('--gx',(y*-.5)+'px');stage&&stage.style.setProperty('--sy',(y*.12+(P.my||0))+'px');stains.forEach((s,i)=>s.style.setProperty('--dy',(y*(i?.3:-.1))+'px'))}
      pars.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-100||r.top>vh+100)return;const p=((r.top+r.height/2)-vh/2)/(vh/2+r.height/2);el.style.setProperty('--py',(clamp(p,-1,1)*-30).toFixed(1)+'px')});
      deps.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;const p=(r.top+r.height/2-vh/2);const v=(p*parseFloat(el.dataset.depth)*.35).toFixed(1)+'px';
        if(el.classList.contains('fl'))el.style.setProperty('--fy',v);else el.style.transform=`translate3d(0,${v},0)`});
      washes.forEach(s=>{const r=s.getBoundingClientRect();if(r.top>vh||r.bottom<0)return;const k=clamp((vh-r.top)/(vh*.9));s.style.setProperty('--w',(.05+1.45*k*k*(3-2*k)).toFixed(3))});
      if(marq){mX-=.5+Math.abs(vel)*.25;const half=marq.scrollWidth/2;if(-mX>half)mX+=half;marq.style.transform=`translate3d(${mX}px,0,0)`}
    }
    // manifeste
    if(mT&&!reduce){const r=mT.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const p=clamp((vh*.82-r.top)/(r.height+vh*.3));const n=Math.round(p*mW.length);mW.forEach((w,i)=>w.classList.toggle('on',i<n))}}
    // histoire épinglée
    if(story){const r=story.getBoundingClientRect();const tot=r.height-vh;const p=clamp(-r.top/tot);const s=clamp(p*3.5-.25,0,3);
      lays.forEach((l,k)=>{if(k)l.style.setProperty('--r',clamp(s-(k-1)).toFixed(3))});
      stBars.forEach((b,k)=>b.style.setProperty('--f',clamp(s-k+1).toFixed(3)));
      const idx=Math.min(3,Math.floor(s+.5));if(idx!==stIdx){stIdx=idx;stTs.forEach((t,k)=>t.classList.toggle('on',k===idx));stNum.style.transform=`translateY(${-idx*25}%)`;stTag.textContent=tagN[idx]}
      stR&&stR.style.setProperty('--st',s>2.85?1:0)}
    // galerie horizontale
    if(galOn){const r=gal.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,r.height-vh));galT.style.transform=`translate3d(${(-p*galDist).toFixed(1)}px,0,0)`;
      galN.textContent=String(Math.min(gcs.length,1+Math.floor(p*gcs.length*.999))).padStart(2,'0')}
    // méthode : le trait se dessine
    if(pcS){const r=pcS.getBoundingClientRect();if(r.top<vh*1.2&&r.bottom>-vh*.2){
      pcBar&&(pcBar.style.transform=`scaleY(${clamp((vh*.55-r.top)/Math.max(1,r.height-vh*.35)).toFixed(4)})`);
      let k=0;pcIt.forEach((li,i)=>{if(li.getBoundingClientRect().top<vh*.6)k=i});
      if(k!==pcI){pcI=k;pcNum.forEach((n,i)=>n.classList.toggle('on',i===k));pcNav.forEach((n,i)=>{n.classList.toggle('on',i===k);n.classList.toggle('done',i<k)});pcIt.forEach((li,i)=>li.classList.toggle('on',i===k))}}}
    // interlude : la marqueterie se rapproche lentement
    if(itlM&&!reduce){const r=itl.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const p=clamp((vh-r.top)/(vh+r.height));itlM.style.transform=`scale(${(1.16-p*.16).toFixed(4)}) translate3d(0,${((p-.5)*-4).toFixed(2)}%,0)`}}
    // rubans : se dessinent à l'entrée de la section
    if(!reduce)ribs.forEach(([el,sv])=>{const r=el.getBoundingClientRect();if(r.top>vh||r.bottom<0)return;sv.style.setProperty('--rp',clamp((vh-r.top)/(Math.min(r.height,vh*1.2)+vh*.2)*1.9).toFixed(3))});
    // prestations : panneaux empilés, image qui respire, panneau recouvert qui recule
    if(!reduce&&innerWidth>980&&prxP.length){const es=prxP.map(p=>clamp(1-p.getBoundingClientRect().top/vh));
      prxP.forEach((p,i)=>{const r=p.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;
        prxI[i].style.setProperty('--is',(1.16-.16*es[i]).toFixed(4));
        const nx=i<prxP.length-1?es[i+1]:0;prxIn[i].style.setProperty('--cs',(1-.06*nx).toFixed(4));p.style.setProperty('--cv',nx.toFixed(3))})}
    requestAnimationFrame(frame)};
  requestAnimationFrame(frame);

  /* ---------- Curseur pigment + boutons aimantés + parallaxe du hero ---------- */
  if(fine&&!reduce){
    const cur=$('#cur'),ci=$('b',cur);document.documentElement.classList.add('has-cur');
    let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;cur.classList.remove('hide')},{passive:true});
    document.addEventListener('mouseleave',()=>cur.classList.add('hide'));
    const loop=()=>{cx+=(x-cx)*.22;cy+=(y-cy)*.22;cur.style.transform=`translate3d(${cx}px,${cy}px,0)`;requestAnimationFrame(loop)};loop();
    document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-cursor],a,button,input,textarea,summary,label');cur.classList.remove('lab','link','paint');
      if(!t)return;const d=t.getAttribute&&t.getAttribute('data-cursor');
      if(d==='paint')cur.classList.add('paint');else if(d){ci.textContent=t.closest('.gc')&&t.closest('.gc').classList.contains('show-a')?'Après':d;cur.classList.add('lab')}
      else if(t.matches('a,button,summary,label'))cur.classList.add('link')});
    $$('.mag').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.style.transform=`translate3d(${dx*.22}px,${dy*.35}px,0)`});
      b.addEventListener('mouseleave',()=>{b.style.transform=''})});
    if(hero){hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      stage.style.setProperty('--sx',(px*-14).toFixed(1)+'px');orn&&(orn.style.setProperty('--omx',(px*-10).toFixed(1)+'px'),orn.style.setProperty('--omy',(py*-6).toFixed(1)+'px'));P.my=py*-10;ghost&&(ghost.style.setProperty('--gmx',(px*30).toFixed(1)+'px'),ghost.style.setProperty('--gmy',(py*14).toFixed(1)+'px'));
      stains.forEach((s,i)=>s.style.setProperty('--dx',(px*(i?40:-24)).toFixed(1)+'px'))})}
  }

  /* ---------- Menu, ancres actives ---------- */
  const burger=$('.burger'), mnav=$('#mnav');
  const setMenu=o=>{burger.setAttribute('aria-expanded',o);mnav.classList.toggle('open',o);burger.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu')};
  burger.addEventListener('click',()=>setMenu(burger.getAttribute('aria-expanded')!=='true'));
  $$('#mnav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  const links=$$('.nav a'), base=links.find(l=>l.hasAttribute('aria-current'));
  const spy=links.map(l=>{const id=samePage(l);const el=id&&document.getElementById(id.slice(1));return el?[l,el]:null}).filter(Boolean);
  let navT=0;const navU=()=>{navT=0;const m=innerHeight*.5;let hit=null;spy.forEach(([l,el])=>{const r=el.getBoundingClientRect();if(r.top<=m&&r.bottom>m)hit=l});
    const on=hit||base;links.forEach(l=>l.classList.toggle('act',l===on))};
  addEventListener('scroll',()=>{if(!navT)navT=requestAnimationFrame(navU)},{passive:true});navU();

  /* ---------- Nuancier ---------- */
  const nvB=$$('.nv-list button'), nvF=$$('.nv-view figure'), nvK=$('#nvK'), nvTt=$('#nvT');
  const nvSet=i=>{nvB.forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-pressed',k===i)});nvF.forEach((f,k)=>f.classList.toggle('on',k===i));
    const b=nvB[i];nvTt.textContent=$('b',b).textContent;nvK.textContent=$('.mono',b).textContent+' · '+$('small',b).textContent.split(' · ')[0]};
  nvB.forEach((b,i)=>{b.addEventListener('click',()=>nvSet(i));b.addEventListener('focus',()=>nvSet(i));if(fine)b.addEventListener('mouseenter',()=>nvSet(i))});

  /* ---------- Avant / après : comparateurs glissants ---------- */
  $$('[data-cmp]').forEach(c=>{const r=$('.cmp-r',c);let drag=false;
    const set=v=>{v=clamp(v,0,100);c.style.setProperty('--p',v+'%');r.value=Math.round(v)};
    const at=e=>{const b=c.getBoundingClientRect();return (e.clientX-b.left)/b.width*100};
    r.addEventListener('input',()=>set(+r.value));
    c.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button)return;drag=true;c.classList.add('drag');set(at(e));if(e.pointerType==='mouse')c.setPointerCapture(e.pointerId)});
    c.addEventListener('pointermove',e=>{if(drag||(fine&&!c.classList.contains('big')&&e.pointerType==='mouse'))set(at(e))});
    const end=()=>{drag=false;c.classList.remove('drag')};
    c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
    if(fine&&!c.classList.contains('big'))c.addEventListener('mouseleave',()=>{c.classList.add('ease');set(50);setTimeout(()=>c.classList.remove('ease'),700)});
    // toucher : un glissement horizontal compare, un glissement vertical fait défiler
    let sx=0,sy=0,lock=0;
    c.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;lock=0},{passive:true});
    c.addEventListener('touchmove',e=>{const t=e.touches[0];if(!lock)lock=Math.abs(t.clientX-sx)>Math.abs(t.clientY-sy)?1:2;if(lock===1){e.preventDefault();set(at(t))}else drag=false},{passive:false});
    // indice de mouvement à l'entrée
    if(c.classList.contains('big')&&!reduce){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();c.classList.add('ease');
      [[30,500],[68,1250],[50,2000]].forEach(([v,t])=>setTimeout(()=>{if(!drag)set(v)},t));setTimeout(()=>c.classList.remove('ease'),2800)}},{threshold:.5});o.observe(c)}
  });
  /* Formulaires — 3 champs, validation + succès / erreur */
  const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const okContact=v=>emailRe.test(v.trim())||v.replace(/\D/g,'').length>=10;
  $$('form.form').forEach(f=>{
    const box=f.parentElement;
    const check=el=>{const w=el.closest('.f');let ok=true;
      if(el.name==='nom')ok=el.value.trim().length>=2;
      if(el.name==='contact')ok=okContact(el.value);
      if(el.name==='message')ok=el.value.trim().length>=8;
      if(ok){w.removeAttribute('data-err');el.removeAttribute('aria-invalid')}else{w.setAttribute('data-err','');el.setAttribute('aria-invalid','true')}
      return ok};
    $$('.f input,.f textarea',f).forEach(el=>{
      const err=$('.err',el.closest('.f'));if(err){err.id=el.id+'-err';el.setAttribute('aria-describedby',err.id)}
      el.addEventListener('blur',()=>{if(el.value)check(el)});
      el.addEventListener('input',()=>{if(el.closest('.f').hasAttribute('data-err'))check(el)})});
    f.addEventListener('submit',async ev=>{ev.preventDefault();
      const bad=$$('.f input,.f textarea',f).filter(el=>!check(el));
      if(bad.length){bad[0].focus();return}
      const btn=$('button[type=submit]',f),t=btn.innerHTML;btn.disabled=true;btn.textContent='Envoi en cours…';
      try{
        const ep=f.dataset.endpoint; /* PLACEHOLDER : brancher l'endpoint (Formspree, Brevo, API) via data-endpoint */
        if(ep){const r=await fetch(ep,{method:'POST',headers:{Accept:'application/json'},body:new FormData(f)});if(!r.ok)throw 0}
        else await new Promise(r=>setTimeout(r,700));
        box.classList.add('sent');box.classList.remove('failed');$('.form-ok',box).focus();
      }catch(e){box.classList.add('failed')}
      finally{btn.disabled=false;btn.innerHTML=t}
    });
  });
})();

/* ---------- Pages intérieures : filtres, visionneuse, photos du formulaire ---------- */
(()=>{
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Filtres des réalisations */
  const rg=$('#rg');
  if(rg){
    const btns=$$('.rf-b'), items=$$('[data-cat]',rg), live=$('#rfLive');
    const apply=f=>{let n=0;
      btns.forEach(b=>{const on=b.dataset.f===f;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      if(!reduce)rg.classList.add('fx');
      setTimeout(()=>{items.forEach(it=>{const show=f==='all'||it.dataset.cat===f;it.hidden=!show;if(show&&it.classList.contains('rc')){if(it.dataset.lb)n++;it.classList.add('vis')}});
        live.textContent=n+' réalisation'+(n>1?'s':'')+' affichée'+(n>1?'s':'');
        requestAnimationFrame(()=>rg.classList.remove('fx'))},reduce?0:220)};
    btns.forEach(b=>b.addEventListener('click',()=>{apply(b.dataset.f);const t=$('#galerie');if(t.getBoundingClientRect().top<0)scrollTo({top:t.getBoundingClientRect().top+scrollY-70,behavior:reduce?'auto':'smooth'})}));
    const h=location.hash.slice(1);if(btns.some(b=>b.dataset.f===h))apply(h);
    /* Visionneuse */
    const lb=$('#lb'), img=$('#lbImg'), tN=$('#lbN'), tT=$('#lbT'), tL=$('#lbL');let seq=[],k=0,opener=null;
    const show=i=>{k=(i+seq.length)%seq.length;const [src,w,h,lab,title]=seq[k];img.classList.remove('on');
      const im=new Image();im.onload=()=>{img.src=src;img.width=w;img.height=h;img.alt=title+' : '+lab;img.style.maxWidth=Math.round(w*1.25)+'px';requestAnimationFrame(()=>img.classList.add('on'))};im.src=src;
      tN.textContent=String(k+1).padStart(2,'0')+' / '+String(seq.length).padStart(2,'0');tT.textContent=title;tL.textContent=lab};
    const open=card=>{seq=[];let start=0;
      $$('.rc[data-lb]',rg).filter(c=>!c.hidden).forEach(c=>{const d=JSON.parse(c.dataset.lb);if(c===card)start=seq.length;d.s.forEach(s=>seq.push([...s,d.t]))});
      opener=document.activeElement;show(start);
      if(lb.showModal)lb.showModal();else lb.setAttribute('open','');document.documentElement.classList.add('lb-on');$('.lb-x',lb).focus()};
    const close=()=>{lb.close?lb.close():lb.removeAttribute('open')};
    lb.addEventListener('close',()=>{document.documentElement.classList.remove('lb-on');opener&&opener.focus&&opener.focus()});
    rg.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)open(b.closest('.rc'))});
    $('.lb-x',lb).addEventListener('click',close);$('.lb-p',lb).addEventListener('click',()=>show(k-1));$('.lb-n',lb).addEventListener('click',()=>show(k+1));
    lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-in'))close()});
    lb.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(k+1)}else if(e.key==='ArrowLeft'){e.preventDefault();show(k-1)}});
    let sx=0;lb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(k+(dx<0?1:-1))},{passive:true});
    window.__lb={open:i=>open($$('.rc[data-lb]',rg)[i])};
  }
  /* Formulaire contact : photos facultatives */
  const up=$('#k-ph');
  if(up){const L=$('#upL'),E=$('#upE');let files=[];
    const draw=()=>{L.innerHTML='';files.forEach((f,i)=>{const li=document.createElement('li');const u=URL.createObjectURL(f);
      li.innerHTML=`<img src="${u}" alt=""><span>${f.name.replace(/[<>&"]/g,'')}</span><button type="button" aria-label="Retirer la photo ${i+1}">✕</button>`;
      $('button',li).addEventListener('click',()=>{files.splice(i,1);sync();draw()});L.appendChild(li)})};
    const sync=()=>{try{const dt=new DataTransfer();files.forEach(f=>dt.items.add(f));up.files=dt.files}catch(e){}};
    up.addEventListener('change',()=>{E.textContent='';const add=[...up.files];
      add.forEach(f=>{if(!/^image\//.test(f.type)){E.textContent='Seules les images sont acceptées.';return}if(f.size>10*1024*1024){E.textContent=f.name+' dépasse 10 Mo.';return}
        if(files.length>=4){E.textContent='4 photos maximum.';return}if(!files.some(x=>x.name===f.name&&x.size===f.size))files.push(f)});
      sync();draw()});
    const drop=$('#up');['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over')}));
    ['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over')}));
    drop.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files.length){try{const dt=new DataTransfer();[...e.dataTransfer.files].forEach(f=>dt.items.add(f));up.files=dt.files}catch(_){}up.dispatchEvent(new Event('change'))}});
  }
})();
/* Carte : chargée à la demande (aucune requête tierce avant le clic) */
(()=>{const b=document.querySelector('.zm-go');if(!b)return;b.addEventListener('click',()=>{const f=document.createElement('iframe');f.src=b.dataset.src;f.title="Carte interactive : atelier Sublimessence, 178 Route de Proméry, Epagny Metz-Tessy";f.setAttribute('referrerpolicy','no-referrer');
  const fig=b.closest('.zone-map');b.parentElement.appendChild(f);fig.classList.add('live');f.focus()})})();
