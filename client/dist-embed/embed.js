(function(){"use strict";(function(){const I=document.currentScript,S=new URL(I.src).origin;let l="closed",c,i,t,u,d,n,e,r,p,h=!1,o=380;const L=380,b=280,w=800,v=50,x="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",E="margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)";function T(){const a=localStorage.getItem("chat-widget-width");for(a?o=Math.max(b,Math.min(w,parseInt(a,10))):o=L,c=document.createElement("div"),c.id="chat-widget-wrapper",c.style.cssText=`
      display: flex;
      min-height: 100vh;
      width: 100%;
    `,i=document.createElement("div"),i.id="chat-widget-host",i.style.cssText=`
      flex: 1;
      min-width: 0;
      transition: ${E};
      overflow: auto;
      margin-right: 0;
    `;document.body.firstChild&&document.body.firstChild!==c;)i.appendChild(document.body.firstChild);t=document.createElement("div"),t.id="chat-widget-sidebar",t.style.cssText=`
      width: ${o}px;
      height: 100vh;
      position: fixed;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${x};
      overflow: visible;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      z-index: 10000;
    `,e=document.createElement("div"),e.id="chat-widget-resize-handle",e.style.cssText=`
      position: absolute;
      left: -3px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 60px;
      background: #d1d5db;
      border-radius: 3px;
      cursor: ew-resize;
      z-index: 10;
      opacity: 0.7;
      transition: opacity 0.2s, background 0.2s;
    `,e.onmouseover=()=>{e.style.opacity="1",e.style.background="#3b82f6"},e.onmouseout=()=>{h||(e.style.opacity="0.6",e.style.background="#d1d5db")};const k=y=>{y.preventDefault(),y.stopPropagation(),h=!0,t.style.transition="none",i.style.transition="none",e.style.opacity="1",e.style.background="#3b82f6",document.body.style.cursor="ew-resize",document.body.style.userSelect="none",u.style.pointerEvents="none"},C=y=>{if(!h)return;const R="touches"in y?y.touches[0].clientX:y.clientX,M=window.innerWidth-R,m=Math.round(M/v)*v;m>=b&&m<=w&&m!==o&&(o=m,t.style.width=`${o}px`,i.style.marginRight=`${o}px`)},z=()=>{h&&(h=!1,t.style.transition=x,i.style.transition=E,e.style.opacity="0.7",e.style.background="#d1d5db",document.body.style.cursor="",document.body.style.userSelect="",u.style.pointerEvents="",localStorage.setItem("chat-widget-width",o.toString()))};e.addEventListener("mousedown",k),window.addEventListener("mousemove",C),window.addEventListener("mouseup",z),e.addEventListener("touchstart",k,{passive:!1}),window.addEventListener("touchmove",C,{passive:!1}),window.addEventListener("touchend",z),r=document.createElement("div"),r.style.cssText=`
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #1f2937;
      border-bottom: 1px solid #374151;
      transition: padding 0.3s ease;
    `,d=document.createElement("button"),d.innerHTML="✕",d.title="Cerrar",d.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,d.onmouseover=()=>d.style.color="#fff",d.onmouseout=()=>d.style.color="#9ca3af",d.onclick=()=>g.close(),n=document.createElement("button"),n.innerHTML="⛶",n.title="Expandir",n.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,n.onmouseover=()=>n.style.color="#fff",n.onmouseout=()=>n.style.color="#9ca3af",n.onclick=()=>{l==="expanded"?g.open():g.expand()},r.appendChild(d),r.appendChild(n),p=document.createElement("div"),p.style.cssText=`
      flex: 1;
      display: flex;
      transition: padding 0.3s ease;
      background: #1f2937;
    `,u=document.createElement("iframe"),u.src=`${S}/widget`,u.style.cssText=`
      flex: 1;
      width: 100%;
      border: none;
    `,p.appendChild(u),t.appendChild(e),t.appendChild(r),t.appendChild(p);const s=document.createElement("button");s.id="chat-widget-tab",s.innerHTML=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">Chat</span>
    `,s.style.cssText=`
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      padding: 12px 6px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: ${x};
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `,s.onmouseover=()=>{s.style.width="36px",s.style.background="#2563eb"},s.onmouseout=()=>{s.style.width="32px",s.style.background="#3b82f6"},s.onclick=()=>g.toggle(),c.appendChild(i),c.appendChild(t),document.body.appendChild(c),document.body.appendChild(s),document.body.style.margin="0",document.body.style.padding="0"}function f(){const a=document.getElementById("chat-widget-tab");switch(l){case"closed":t.style.transform="translateX(100%)",t.style.width=`${o}px`,i.style.marginRight="0",r.style.padding="8px",p.style.padding="0",a&&(a.style.display="flex"),e.style.display="none";break;case"sidebar":t.style.transform="translateX(0)",t.style.width=`${o}px`,i.style.marginRight=`${o}px`,r.style.padding="8px",p.style.padding="0",a&&(a.style.display="none"),e.style.display="block",n.innerHTML="⛶",n.title="Expandir";break;case"expanded":t.style.transform="translateX(0)",t.style.width="100vw",i.style.marginRight="100vw",r.style.padding="8px 8px 8px 24px",p.style.padding="0 0 0 16px",a&&(a.style.display="none"),e.style.display="none",n.innerHTML="⛶",n.title="Contraer";break}}const g={open(){l="sidebar",f()},close(){l="closed",f()},expand(){l="expanded",f()},toggle(){l==="closed"?this.open():this.close()},getState(){return l}};window.ChatWidget=g,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T()})()})();
