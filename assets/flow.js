// Cover sheet: BareClaude's dispatch path, with work items moving through it.
(function(){
  var svg=document.getElementById('flow'); if(!svg) return;
  var NS='http://www.w3.org/2000/svg';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var L={
    wide:{vb:[960,330],w:150,h:46,n:{
      sch:[85,60],chat:[85,150],hook:[85,240],q:[275,150],b:[450,150],a:[625,150],id:[805,150],out:[805,265],def:[450,275]}},
    tall:{vb:[400,620],w:116,h:44,n:{
      sch:[68,40],chat:[200,40],hook:[332,40],q:[200,140],b:[200,240],a:[120,345],def:[310,345],id:[120,445],out:[120,550]}}
  };
  var LABEL={sch:'Schedules',chat:'Chat, allowlisted',hook:'Signed webhooks',q:'Per-agent queue',b:'Budget check',
    a:'Agent session',id:'Identity wrappers',out:'Outside services',def:'Held, owner alerted'};
  var EDGES=[['sch','q'],['chat','q'],['hook','q'],['q','b'],['b','a'],['a','id'],['id','out'],['b','def']];
  var paths={}, mode=null, tokens=[], last=0, spawnAt=0, running=false, raf=0, inView=false;

  function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}
  function anchor(s,t,lay){
    var S=lay.n[s],T=lay.n[t],w=lay.w/2,h=lay.h/2,dx=T[0]-S[0],dy=T[1]-S[1];
    if(Math.abs(dx)>Math.abs(dy)){var sx=S[0]+Math.sign(dx)*w,tx=T[0]-Math.sign(dx)*w,mx=(sx+tx)/2;
      return 'M'+sx+' '+S[1]+' C'+mx+' '+S[1]+' '+mx+' '+T[1]+' '+tx+' '+T[1]}
    var sy=S[1]+Math.sign(dy)*h,ty=T[1]-Math.sign(dy)*h,my=(sy+ty)/2;
    return 'M'+S[0]+' '+sy+' C'+S[0]+' '+my+' '+T[0]+' '+my+' '+T[0]+' '+ty}
  function build(){
    var m=svg.clientWidth<560?'tall':'wide'; if(m===mode) return; mode=m;
    var lay=L[m]; svg.innerHTML=''; tokens=[]; paths={};
    svg.setAttribute('viewBox','0 0 '+lay.vb[0]+' '+lay.vb[1]);
    EDGES.forEach(function(e){paths[e[0]+'>'+e[1]]=el('path',{d:anchor(e[0],e[1],lay),'class':'edge'+(e[1]==='def'?' over':'')})});
    Object.keys(lay.n).forEach(function(k){
      var p=lay.n[k],g=el('g',{'class':'node'+(k==='b'?' gate':'')});
      el('rect',{x:p[0]-lay.w/2,y:p[1]-lay.h/2,width:lay.w,height:lay.h,rx:3},g);
      var t=el('text',{x:p[0],y:p[1]+5,'text-anchor':'middle'},g); t.textContent=LABEL[k];
      if(m==='tall') t.setAttribute('style','font-size:13px');
    });
    var bp=lay.n.b, note=el('text',{'class':'note',x:m==='wide'?bp[0]+12:bp[0]+70,y:m==='wide'?bp[1]+70:bp[1]+52});
    note.textContent='over budget';
    if(reduce){ // still frame: a few items placed along the path
      [['q>b',.5],['a>id',.4],['b>def',.6],['sch>q',.7]].forEach(function(r){
        var pa=paths[r[0]],pt=pa.getPointAtLength(pa.getTotalLength()*r[1]);
        el('circle',{cx:pt.x,cy:pt.y,r:5,'class':'tok'+(r[0]==='b>def'?' def':'')})});
    }
  }
  function spawn(){
    var src=['sch','chat','hook'][Math.floor(Math.random()*3)], held=Math.random()<.18;
    var route=[src+'>q','q>b'].concat(held?['b>def']:['b>a','a>id','id>out']);
    tokens.push({route:route,i:0,d:0,held:held,c:el('circle',{r:5,'class':'tok'+(held?' def':'')})});
  }
  function frame(t){
    if(!running) return;
    var dt=last?Math.min((t-last)/1000,.05):0; last=t;
    if(t>spawnAt){spawn();spawnAt=t+650+Math.random()*500}
    tokens=tokens.filter(function(k){
      var p=paths[k.route[k.i]],len=p.getTotalLength(); k.d+=150*dt;
      if(k.d>=len){k.i++;k.d=0;if(k.i>=k.route.length){k.c.remove();return false}p=paths[k.route[k.i]];len=p.getTotalLength()}
      var pt=p.getPointAtLength(k.d); k.c.setAttribute('cx',pt.x); k.c.setAttribute('cy',pt.y);
      var last1=k.i===k.route.length-1; k.c.style.opacity=last1?Math.max(0,1-k.d/len*1.1):1;
      if(k.held&&k.route[k.i]==='q>b'&&k.d>len*.6) k.c.setAttribute('class','tok def');
      return true});
    raf=requestAnimationFrame(frame);
  }
  function start(){ if(reduce||running||document.hidden||!inView) return; running=true; last=0; raf=requestAnimationFrame(frame) }
  function stop(){ running=false; cancelAnimationFrame(raf); raf=0 }
  build();
  addEventListener('resize',function(){var was=mode;build(); if(was!==mode&&running){stop();start()}});
  if(!reduce){
    new IntersectionObserver(function(es){inView=es[0].isIntersecting; inView?start():stop()}).observe(svg);
    document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  }
})();
