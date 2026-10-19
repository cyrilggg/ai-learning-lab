(function(root){
  'use strict';
  const relu=z=>Math.max(0,z);
  const hinge=(x,a,t,b)=>a*relu(x-t)+b;
  const combined=(x,a1,a2)=>1+a1*relu(x-1)+a2*relu(x-3);
  const samples=Array.from({length:9},(_,i)=>({x:i/2,y:combined(i/2,2,-3)}));
  const mse=predict=>samples.reduce((sum,s)=>sum+(predict(s.x)-s.y)**2,0)/samples.length;
  const mx=samples.reduce((s,p)=>s+p.x,0)/samples.length;
  const my=samples.reduce((s,p)=>s+p.y,0)/samples.length;
  const w=samples.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/samples.reduce((s,p)=>s+(p.x-mx)**2,0);
  const b=my-w*mx;
  const bestLine={w,b,loss:mse(x=>w*x+b)};
  const api={relu,hinge,combined,samples,mse,bestLine};
  if(typeof module!=='undefined')module.exports=api;else root.NonlinearModel=api;
})(typeof window!=='undefined'?window:globalThis);
