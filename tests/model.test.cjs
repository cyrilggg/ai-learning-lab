const assert=require('node:assert/strict');
const {loss,step}=require('../site/model.js');
assert.equal(loss(2,1),0);
assert.ok(Math.abs(loss(1,0)-14/3)<1e-12);
const s=step(1,0,.05);assert.ok(Math.abs(s.w-1.2666666666666666)<1e-12);assert.equal(s.b,.2);
let w=1,b=0;for(let i=0;i<200;i++){const s=step(w,b,.05);w=s.w;b=s.b;}assert.ok(loss(w,b)<1e-5);
const eps=1e-6;for(const [w,b] of [[1,0],[-2,4],[3,-1]]){const s=step(w,b,.05);assert.ok(Math.abs(s.dw-(loss(w+eps,b)-loss(w-eps,b))/(2*eps))<1e-7);assert.ok(Math.abs(s.db-(loss(w,b+eps)-loss(w,b-eps))/(2*eps))<1e-7);}
w=1;b=0;for(let i=0;i<10;i++){const s=step(w,b,.6);w=s.w;b=s.b;}assert.ok(loss(w,b)>loss(1,0));
console.log('PASS: exact optimum, initial loss, simultaneous update, convergence, finite-difference gradients, divergence');
