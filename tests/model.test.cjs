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
