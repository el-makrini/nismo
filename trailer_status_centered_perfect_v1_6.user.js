// ==UserScript==
// @name         Trailer Status Script (Centered Perfect v1.6)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Badges genau mittig auf dem Trailerkasten platzieren
// @match        https://trans-logistics-eu.amazon.com/yms/shipclerk/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const JSON_URL = 'https://raw.githubusercontent.com/HaqIshaq/trailer-daten/main/trailer-status.json';

  const STATUS_STYLE = {
    'PLANE': { bg: '#dbeafe', border: '#1d4ed8', color: '#000' },
    'OK FL': { bg: '#dcfce7', border: '#16a34a', color: '#000' },
    'NO FL': { bg: '#fee2e2', border: '#dc2626', color: '#000' },
    'SPAIN': { bg: '#fef3c7', border: '#f59e0b', color: '#000' }
  };

  let statusMap = {};

  function makeBadge(label, key){
      const b=document.createElement("span");
      const st=STATUS_STYLE[key];
      b.textContent=label;
      b.style.background=st.bg;
      b.style.border="1px solid "+st.border;
      b.style.padding="2px 6px";
      b.style.borderRadius="8px";
      b.style.fontSize="10px";
      b.style.fontWeight="bold";
      b.style.whiteSpace="nowrap";
      b.style.position="absolute";

      // **Perfekte Mitte auf Trailerkasten**
      b.style.left="50%";
      b.style.top="45%";   // leicht oberhalb der Mitte = wie dein Screenshot
      b.style.transform="translate(-50%, -50%)";

      b.style.zIndex="9999";
      b.style.pointerEvents="none";
      return b;
  }

  function findTrailerBody(el){
      let r=el;
      for(let i=0;i<12 && r;i++, r=r.parentElement){
          const svg = r.querySelector("svg");
          if(svg){
              if(getComputedStyle(svg).position==="static")
                  svg.style.position="relative";
              return svg;
          }
          const box = r.querySelector("div[class*='asset'], div[class*='trailer'], div[class*='equipment']");
          if(box){
              if(getComputedStyle(box).position==="static")
                  box.style.position="relative";
              return box;
          }
      }
      return null;
  }

  function scan(){
      document.querySelectorAll("a,span,div").forEach(el=>{
          if(el.dataset.done) return;

          const t=(el.textContent||"").trim();
          if(!/^[A-Z0-9]{3,20}$/.test(t)) return;

          const code=t.toUpperCase();
          let label=null;

          if(statusMap[code]==="PLANE") label="PLANE";
          if(statusMap[code]==="OK FL") label="OK FL";
          if(statusMap[code]==="NO FL") label="NO FL";
          if(code.startsWith("VI")) label="SPAIN";

          if(!label) return;

          const body=findTrailerBody(el);
          if(body){
              body.appendChild(makeBadge(label,label));
              el.dataset.done=1;
          }
      });
  }

  fetch(JSON_URL)
    .then(r=>r.json())
    .then(j=>{
        const m={};
        Object.keys(j).forEach(k=>j[k].forEach(c=>m[String(c).toUpperCase()]=k));
        statusMap=m;
        scan();
        setInterval(scan,1500);
        new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
    });

})();
