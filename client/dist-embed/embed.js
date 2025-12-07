(function(){"use strict";(function(){const h=document.currentScript,x=new URL(h.src).origin;let s="closed",l,e,d,a,i,t;const u=380,c="all 0.3s ease-in-out";function f(){for(l=document.createElement("div"),l.id="chat-widget-wrapper",l.style.cssText=`
      display: flex;
      min-height: 100vh;
      width: 100%;
    `,e=document.createElement("div"),e.id="chat-widget-host",e.style.cssText=`
      flex: 1;
      min-width: 0;
      transition: ${c};
      overflow: auto;
    `;document.body.firstChild&&document.body.firstChild!==l;)e.appendChild(document.body.firstChild);d=document.createElement("div"),d.id="chat-widget-sidebar",d.style.cssText=`
      width: 0;
      height: 100vh;
      position: sticky;
      top: 0;
      right: 0;
      background: #fff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: ${c};
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;const o=document.createElement("div");o.style.cssText=`
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
    `,i.onmouseover=()=>i.style.color="#fff",i.onmouseout=()=>i.style.color="#9ca3af",i.onclick=()=>r.close(),t=document.createElement("button"),t.innerHTML="⛶",t.title="Expandir",t.style.cssText=`
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    `,t.onmouseover=()=>t.style.color="#fff",t.onmouseout=()=>t.style.color="#9ca3af",t.onclick=()=>{s==="expanded"?r.open():r.expand()},o.appendChild(i),o.appendChild(t),a=document.createElement("iframe"),a.src=`${x}/widget`,a.style.cssText=`
      flex: 1;
      width: 100%;
      border: none;
    `,d.appendChild(o),d.appendChild(a);const n=document.createElement("button");n.id="chat-widget-fab",n.innerHTML=`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `,n.style.cssText=`
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: ${c};
      z-index: 9999;
    `,n.onmouseover=()=>{n.style.transform="scale(1.1)",n.style.boxShadow="0 6px 16px rgba(59, 130, 246, 0.5)"},n.onmouseout=()=>{n.style.transform="scale(1)",n.style.boxShadow="0 4px 12px rgba(59, 130, 246, 0.4)"},n.onclick=()=>r.toggle(),l.appendChild(e),l.appendChild(d),document.body.appendChild(l),document.body.appendChild(n),document.body.style.margin="0",document.body.style.padding="0"}function p(){const o=document.getElementById("chat-widget-fab");switch(s){case"closed":d.style.width="0",e.style.flex="1",o&&(o.style.display="flex");break;case"sidebar":d.style.width=`${u}px`,e.style.flex="1",o&&(o.style.display="none"),t.innerHTML="⛶",t.title="Expandir";break;case"expanded":d.style.width="100vw",e.style.flex="0",e.style.width="0",e.style.overflow="hidden",o&&(o.style.display="none"),t.innerHTML="⛶",t.title="Contraer";break}}const r={open(){s="sidebar",e.style.flex="1",e.style.width="",e.style.overflow="auto",p()},close(){s="closed",e.style.flex="1",e.style.width="",e.style.overflow="auto",p()},expand(){s="expanded",p()},toggle(){s==="closed"?this.open():this.close()},getState(){return s}};window.ChatWidget=r,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",f):f()})()})();
