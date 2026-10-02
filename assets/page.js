// Project pages: render the diagram, draw its lines in once, and track the section in view.
(function(){
    var cs=getComputedStyle(document.documentElement), v=function(n){return cs.getPropertyValue(n).trim()};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('pre > code.language-mermaid').forEach(function(c){
    var box=document.createElement('div'); box.className='sheet mermaid-box';
    var m=document.createElement('pre'); m.className='mermaid'; m.textContent=c.textContent.replace(/^(\s*flowchart)\s+LR/m,'$1 TB'); m.style.background='none'; m.style.border='0'; m.style.margin='0';
    box.appendChild(m); c.parentElement.replaceWith(box);
    var tb=document.getElementById('tb'); if(tb){box.appendChild(tb.content.cloneNode(true))}
  });
  if(window.mermaid){
    mermaid.initialize({startOnLoad:false,theme:'base',fontFamily:'Geist, system-ui, sans-serif',
      themeVariables:{background:'transparent',primaryColor:v('--sheet'),primaryBorderColor:v('--ink'),primaryTextColor:v('--ink'),
        lineColor:v('--ink'),secondaryColor:v('--sheet'),tertiaryColor:v('--sheet'),edgeLabelBackground:v('--sheet'),fontSize:'15px'}});
    (document.fonts?document.fonts.ready:Promise.resolve()).then(function(){return mermaid.run()}).then(function(){
      document.querySelectorAll('.mermaid-box').forEach(function(box){
        box.querySelectorAll('.edgePath path, path.flowchart-link').forEach(function(p){
          try{p.style.setProperty('--len',p.getTotalLength())}catch(e){}});
        if(reduce){box.classList.add('drawn');return}
        new IntersectionObserver(function(es,o){if(es[0].isIntersecting){requestAnimationFrame(function(){box.classList.add('drawn')});o.disconnect()}},{threshold:.35}).observe(box);
      });
    });
  }
  var links=[].slice.call(document.querySelectorAll('.toc ol a'));
  if(links.length){
    var map={}; links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var spy=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting) return;
      links.forEach(function(a){a.classList.remove('on')});
      if(map[e.target.id]) map[e.target.id].classList.add('on');
    })},{rootMargin:'0px 0px -70% 0px'});
    document.querySelectorAll('article h2[id]').forEach(function(h){spy.observe(h)});
  }
})();
