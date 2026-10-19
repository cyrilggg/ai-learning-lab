const assert=require('node:assert/strict');
const {loss,step}=require('../site/model.js');
assert.equal(loss(2,1),0);
assert.ok(Math.abs(loss(1,0)-14/3)<1e-12);
const s=step(1,0,.05);assert.ok(Math.abs(s.w-1.2666666666666666)<1e-12);assert.equal(s.b,.2);
let w=1,b=0;for(let i=0;i<200;i++){const s=step(w,b,.05);w=s.w;b=s.b;}assert.ok(loss(w,b)<1e-5);
const eps=1e-6;for(const [w,b] of [[1,0],[-2,4],[3,-1]]){const s=step(w,b,.05);assert.ok(Math.abs(s.dw-(loss(w+eps,b)-loss(w-eps,b))/(2*eps))<1e-7);assert.ok(Math.abs(s.db-(loss(w,b+eps)-loss(w,b-eps))/(2*eps))<1e-7);}
w=1;b=0;for(let i=0;i<10;i++){const s=step(w,b,.6);w=s.w;b=s.b;}assert.ok(loss(w,b)>loss(1,0));
console.log('PASS: exact optimum, initial loss, simultaneous update, convergence, finite-difference gradients, divergence');
const N=require('../site/nonlinear-model.js');
assert.equal(N.relu(-2),0);assert.equal(N.relu(0),0);assert.equal(N.relu(2),2);
assert.deepEqual([1,2,3].map(x=>N.hinge(x,-1,2,1)),[1,1,0]);
assert.deepEqual([0,1,2,3,4].map(x=>N.combined(x,2,-3)),[1,1,3,5,4]);
assert.equal(N.mse(x=>N.combined(x,2,-3)),0);
assert.ok(N.bestLine.loss>0);
// The least-squares line must have zero residual sum and zero x-weighted residual sum.
assert.ok(Math.abs(N.samples.reduce((s,p)=>s+N.bestLine.w*p.x+N.bestLine.b-p.y,0))<1e-12);
assert.ok(Math.abs(N.samples.reduce((s,p)=>s+p.x*(N.bestLine.w*p.x+N.bestLine.b-p.y),0))<1e-12);
for(const a of [-2,0,3])for(const t of [0,1,4])for(const b of [-2,2]){
 assert.equal(N.hinge(t,a,t,b),b);
 assert.ok(Math.abs(N.hinge(t+1e-8,a,t,b)-b)<4e-8);
}
for(const a1 of [-1,3])for(const a2 of [-4,2])for(const {x} of N.samples){
 const y=N.combined(x,a1,a2);assert.ok(Number.isFinite(y)&&y>=-6&&y<=12);
}
console.log('PASS: ReLU threshold, hinge continuity, two-turn target, least-squares optimality, slider boundaries');
const Net=require('../site/network-model.js');
assert.equal(Net.neuron([4],[1],-1).value,3);
assert.equal(Net.neuron([0],[1],-1).value,0);
assert.deepEqual(Net.forward('base',4).layers[0].map(n=>n.value),[3,1]);
assert.equal(Net.forward('base',4).output,3);
assert.equal(Net.forward('wide',4).output,4);
assert.equal(Net.forward('deep',4).output,2);
assert.equal(Net.forward('base',8).output,-1); // No ReLU at the output.
for(let x=-2;x<=5;x+=.5){
 const h1=Math.max(0,x-1),h2=Math.max(0,x-3);
 assert.equal(Net.forward('base',x).output,2*h1-3*h2);
 assert.equal(Net.forward('wide',x).output,2*h1-3*h2+.5*Math.max(0,x-2));
 assert.equal(Net.forward('deep',x).output,2*Math.max(0,h1-h2-1));
 for(const kind of ['base','wide','deep']){
  const r=Net.forward(kind,x);r.layers.forEach((layer,i)=>layer.forEach(n=>assert.deepEqual(n.inputs,i?r.layers[i-1].map(p=>p.value):[x])));
 }
}
assert.throws(()=>Net.neuron([1,2],[1],0));
console.log('PASS: network intermediate values, all structure equations, input boundaries, layer dependencies, linear output');
