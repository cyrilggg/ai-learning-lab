(function(root){
  'use strict';
  const samples=[{x:0,y:1},{x:1,y:3},{x:2,y:5}];
  function loss(w,b){return samples.reduce((sum,s)=>sum+(w*s.x+b-s.y)**2,0)/samples.length;}
  function step(w,b,rate){
    const errors=samples.map(s=>w*s.x+b-s.y);
    const dw=errors.reduce((sum,e,i)=>sum+2*e*samples[i].x,0)/samples.length;
    const db=errors.reduce((sum,e)=>sum+2*e,0)/samples.length;
    return {before:{w,b,loss:loss(w,b)},errors,dw,db,rate,w:w-rate*dw,b:b-rate*db};
  }
  const api={samples,loss,step};
  if(typeof module!=='undefined')module.exports=api;else root.LinearModel=api;
})(typeof window!=='undefined'?window:globalThis);
