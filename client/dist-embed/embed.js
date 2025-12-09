(function(){"use strict";(function(){const z=document.currentScript,S=new URL(z.src).origin;let l="closed",p,n,t,r,a,i,e,c,y,h=!1,s=380;const L=380,b=280,w=800,v=50,m="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",E="margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)";function T(){const o=localStorage.getItem("chat-widget-width");for(o?s=Math.max(b,Math.min(w,parseInt(o,10))):s=L,p=document.createElement("div"),p.id="chat-widget-wrapper",p.style.cssText=`
      display: flex;
      min-height: 100vh;
      width: 100%;
    `,n=document.createElement("div"),n.id="chat-widget-host",n.style.cssText=`
      flex: 1;
      min-width: 0;
      transition: ${E};
      overflow: auto;
      margin-right: 0;
    `;document.body.firstChild&&document.body.firstChild!==p;)n.appendChild(document.body.firstChild);t=document.createElement("div"),t.id="chat-widget-sidebar",t.style.cssText=`
      width: ${s}px;
      height: 100vh;
      position: fixed;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${m};
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
    `,e.onmouseover=()=>{e.style.opacity="1",e.style.background="#3b82f6"},e.onmouseout=()=>{h||(e.style.opacity="0.6",e.style.background="#d1d5db")};const k=u=>{u.preventDefault(),u.stopPropagation(),h=!0,t.style.transition="none",n.style.transition="none",e.style.opacity="1",e.style.background="#3b82f6",document.body.style.cursor="ew-resize",document.body.style.userSelect="none",r.style.pointerEvents="none"},C=u=>{if(!h)return;const M="touches"in u?u.touches[0].clientX:u.clientX,W=window.innerWidth-M,f=Math.round(W/v)*v;f>=b&&f<=w&&f!==s&&(s=f,t.style.width=`${s}px`,n.style.marginRight=`${s}px`)},I=()=>{h&&(h=!1,t.style.transition=m,n.style.transition=E,e.style.opacity="0.7",e.style.background="#d1d5db",document.body.style.cursor="",document.body.style.userSelect="",r.style.pointerEvents="",localStorage.setItem("chat-widget-width",s.toString()))};e.addEventListener("mousedown",k),window.addEventListener("mousemove",C),window.addEventListener("mouseup",I),e.addEventListener("touchstart",k,{passive:!1}),window.addEventListener("touchmove",C,{passive:!1}),window.addEventListener("touchend",I),c=document.createElement("div"),c.style.cssText=`
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #1f2937;
      border-bottom: 1px solid #374151;
      transition: padding 0.3s ease;
    `,a=document.createElement("button"),a.innerHTML="✕",a.title="Cerrar",a.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,a.onmouseover=()=>a.style.color="#fff",a.onmouseout=()=>a.style.color="#9ca3af",a.onclick=()=>g.close(),i=document.createElement("button"),i.innerHTML="⛶",i.title="Expandir",i.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,i.onmouseover=()=>i.style.color="#fff",i.onmouseout=()=>i.style.color="#9ca3af",i.onclick=()=>{l==="expanded"?g.open():g.expand()},c.appendChild(a),c.appendChild(i),y=document.createElement("div"),y.style.cssText=`
      flex: 1;
      display: flex;
      transition: padding 0.3s ease;
      background: #1f2937;
    `,r=document.createElement("iframe"),r.src=`${S}/widget`,r.style.cssText=`
      flex: 1;
      width: 100%;
      border: none;
    `,y.appendChild(r),t.appendChild(e),t.appendChild(c),t.appendChild(y);const d=document.createElement("button");d.id="chat-widget-tab",d.innerHTML=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">Chat</span>
    `,d.style.cssText=`
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
      transition: ${m};
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `,d.onmouseover=()=>{d.style.width="36px",d.style.background="#2563eb"},d.onmouseout=()=>{d.style.width="32px",d.style.background="#3b82f6"},d.onclick=()=>g.toggle(),p.appendChild(n),p.appendChild(t),document.body.appendChild(p),document.body.appendChild(d),document.body.style.margin="0",document.body.style.padding="0"}function R(o){r&&r.contentWindow&&r.contentWindow.postMessage({type:"widget-state-change",state:o},"*")}function x(){const o=document.getElementById("chat-widget-tab");switch(l){case"closed":t.style.transform="translateX(100%)",t.style.width=`${s}px`,n.style.marginRight="0",n.style.visibility="visible",c.style.padding="8px",y.style.padding="0",o&&(o.style.display="flex"),e.style.display="none";break;case"sidebar":t.style.transform="translateX(0)",t.style.width=`${s}px`,n.style.marginRight=`${s}px`,n.style.visibility="visible",c.style.padding="8px",y.style.padding="0",o&&(o.style.display="none"),e.style.display="block",i.innerHTML="⛶",i.title="Expandir";break;case"expanded":t.style.transform="translateX(0)",t.style.width="100vw",n.style.marginRight="100vw",n.style.visibility="hidden",c.style.padding="8px 8px 8px 24px",y.style.padding="0 0 0 16px",o&&(o.style.display="none"),e.style.display="none",i.innerHTML="⛶",i.title="Contraer";break}R(l)}const g={open(){l="sidebar",x()},close(){l="closed",x()},expand(){l="expanded",x()},toggle(){l==="closed"?this.open():this.close()},getState(){return l}};window.ChatWidget=g,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T()})()})();
