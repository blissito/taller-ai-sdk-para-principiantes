(function(){"use strict";(function(){const C=document.currentScript,I=new URL(C.src).origin;let l="closed",a,t,n,c,i,o,e,u=!1,r=380;const S=380,m=280,g=800,w=50,h="all 0.3s ease-in-out";function v(){const d=localStorage.getItem("chat-widget-width");for(d?r=Math.max(m,Math.min(g,parseInt(d,10))):r=S,a=document.createElement("div"),a.id="chat-widget-wrapper",a.style.cssText=`
      display: flex;
      min-height: 100vh;
      width: 100%;
    `,t=document.createElement("div"),t.id="chat-widget-host",t.style.cssText=`
      flex: 1;
      min-width: 0;
      transition: ${h};
      overflow: auto;
    `;document.body.firstChild&&document.body.firstChild!==a;)t.appendChild(document.body.firstChild);n=document.createElement("div"),n.id="chat-widget-sidebar",n.style.cssText=`
      width: 0;
      height: 100vh;
      position: sticky;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${h};
      overflow: visible;
      display: flex;
      flex-direction: column;
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
    `,e.onmouseover=()=>{e.style.opacity="1",e.style.background="#3b82f6"},e.onmouseout=()=>{u||(e.style.opacity="0.6",e.style.background="#d1d5db")};const E=p=>{p.preventDefault(),p.stopPropagation(),u=!0,n.style.transition="none",e.style.opacity="1",e.style.background="#3b82f6",document.body.style.cursor="ew-resize",document.body.style.userSelect="none",c.style.pointerEvents="none"},k=p=>{if(!u)return;const L="touches"in p?p.touches[0].clientX:p.clientX,z=window.innerWidth-L,x=Math.round(z/w)*w;x>=m&&x<=g&&x!==r&&(r=x,n.style.width=`${r}px`)},T=()=>{u&&(u=!1,n.style.transition=h,e.style.opacity="0.7",e.style.background="#d1d5db",document.body.style.cursor="",document.body.style.userSelect="",c.style.pointerEvents="",localStorage.setItem("chat-widget-width",r.toString()))};e.addEventListener("mousedown",E),window.addEventListener("mousemove",k),window.addEventListener("mouseup",T),e.addEventListener("touchstart",E,{passive:!1}),window.addEventListener("touchmove",k,{passive:!1}),window.addEventListener("touchend",T);const f=document.createElement("div");f.style.cssText=`
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #1f2937;
      border-bottom: 1px solid #374151;
    `,i=document.createElement("button"),i.innerHTML="✕",i.title="Cerrar",i.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,i.onmouseover=()=>i.style.color="#fff",i.onmouseout=()=>i.style.color="#9ca3af",i.onclick=()=>y.close(),o=document.createElement("button"),o.innerHTML="⛶",o.title="Expandir",o.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,o.onmouseover=()=>o.style.color="#fff",o.onmouseout=()=>o.style.color="#9ca3af",o.onclick=()=>{l==="expanded"?y.open():y.expand()},f.appendChild(i),f.appendChild(o),c=document.createElement("iframe"),c.src=`${I}/widget`,c.style.cssText=`
      flex: 1;
      width: 100%;
      border: none;
    `,n.appendChild(e),n.appendChild(f),n.appendChild(c);const s=document.createElement("button");s.id="chat-widget-tab",s.innerHTML=`
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
      transition: ${h};
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `,s.onmouseover=()=>{s.style.width="36px",s.style.background="#2563eb"},s.onmouseout=()=>{s.style.width="32px",s.style.background="#3b82f6"},s.onclick=()=>y.toggle(),a.appendChild(t),a.appendChild(n),document.body.appendChild(a),document.body.appendChild(s),document.body.style.margin="0",document.body.style.padding="0"}function b(){const d=document.getElementById("chat-widget-tab");switch(l){case"closed":n.style.width="0",t.style.flex="1",d&&(d.style.display="flex"),e.style.display="none";break;case"sidebar":n.style.width=`${r}px`,t.style.flex="1",d&&(d.style.display="none"),e.style.display="block",o.innerHTML="⛶",o.title="Expandir";break;case"expanded":n.style.width="100vw",t.style.flex="0",t.style.width="0",t.style.overflow="hidden",d&&(d.style.display="none"),e.style.display="none",o.innerHTML="⛶",o.title="Contraer";break}}const y={open(){l="sidebar",t.style.flex="1",t.style.width="",t.style.overflow="auto",b()},close(){l="closed",t.style.flex="1",t.style.width="",t.style.overflow="auto",b()},expand(){l="expanded",b()},toggle(){l==="closed"?this.open():this.close()},getState(){return l}};window.ChatWidget=y,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v()})()})();
