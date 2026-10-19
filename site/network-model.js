(function(root){
 'use strict';
 const unit=(id,weights,bias,activation='relu')=>({id,weights,bias,activation});
 const first=()=>[unit('h₁',[1],-1),unit('h₂',[1],-3)];
 const structures={
  base:{label:'两个并列单元',layers:[first(),[unit('y',[2,-3],0,'linear')]]},
  wide:{label:'变宽：三个并列单元',layers:[[...first(),unit('h₃',[1],-2)],[unit('y',[2,-3,.5],0,'linear')]]},
  deep:{label:'变深：再加一层',layers:[first(),[unit('g',[1,-1],-1)],[unit('y',[2],0,'linear')]]}
 };
 function neuron(inputs,weights,bias,activation='relu'){
  if(inputs.length!==weights.length)throw new Error('Input and weight dimensions must match');
  const products=inputs.map((v,i)=>v*weights[i]),sum=products.reduce((a,b)=>a+b,0),z=sum+bias;
  return {products,sum,z,value:activation==='relu'?Math.max(0,z):z};
 }
 function forward(kind,x){
  const structure=structures[kind];if(!structure)throw new Error('Unknown structure');
  let inputs=[x];const layers=structure.layers.map(layer=>{
   const result=layer.map(node=>({...node,inputs:[...inputs],...neuron(inputs,node.weights,node.bias,node.activation)}));
   inputs=result.map(node=>node.value);return result;
  });return {layers,output:inputs[0]};
 }
 const api={structures,neuron,forward};
 if(typeof module!=='undefined')module.exports=api;else root.NetworkModel=api;
})(typeof window!=='undefined'?window:globalThis);
