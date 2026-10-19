'use strict';
const M=window.LinearModel,$=id=>document.getElementById(id);
let w=1,b=0,rate=.05,history=[M.loss(1,0)],last=null,halted=false;
const fmt=n=>Math.abs(n)>=10000?n.toExponential(3):n.toFixed(4);
const NS='http://www.w3.org/2000/svg';
function node(tag,attrs={},value){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(value!==undefined)el.textContent=value;return el;}
function chart(svg,domainX,domainY,height,xLabel,yLabel){
 const width=Math.max(250,svg.parentElement.clientWidth-parseFloat(getComputedStyle(svg.parentElement).paddingLeft)-parseFloat(getComputedStyle(svg.parentElement).paddingRight));
 svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.style.height=height+'px';svg.replaceChildren();
 const left=66,right=width-16,top=35,bottom=height-44;
 const x=v=>left+(v-domainX[0])/(domainX[1]-domainX[0])*(right-left),y=v=>bottom-(v-domainY[0])/(domainY[1]-domainY[0])*(bottom-top);
 svg.append(node('rect',{x:left,y:top,width:right-left,height:bottom-top,fill:'none',stroke:'var(--edge)'}));
 for(let i=0;i<4;i++){const val=domainY[0]+(domainY[1]-domainY[0])*i/3,py=y(val);svg.append(node('line',{x1:left,x2:right,y1:py,y2:py,stroke:'var(--edge)'}));svg.append(node('text',{x:left-9,y:py+4,'text-anchor':'end'},Math.abs(val)>=1000?val.toExponential(1):Number(val.toFixed(2))));}
 for(let i=0;i<3;i++){const val=domainX[0]+(domainX[1]-domainX[0])*i/2;svg.append(node('text',{x:x(val),y:bottom+19,'text-anchor':i===0?'start':i===2?'end':'middle'},Number(val.toFixed(1))));}
 svg.append(node('text',{x:left,y:18},yLabel));svg.append(node('text',{x:right,y:height-5,'text-anchor':'end'},xLabel));
 return{x,y,left,right,top,bottom};
}
function draw(){
 const predictions=M.samples.map(s=>w*s.x+b),vals=[0,1,3,5,...predictions],lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max(.5,(hi-lo)*.1);
 const svg=$('prediction-chart'),c=chart(svg,[0,2],[lo-pad,hi+pad],310,'输入 x（无单位）','输出 y（无单位）');
 svg.append(node('line',{x1:c.x(0),y1:c.y(b),x2:c.x(2),y2:c.y(2*w+b),stroke:'var(--green)','stroke-width':2.5}));
 M.samples.forEach((s,i)=>{svg.append(node('line',{x1:c.x(s.x),x2:c.x(s.x),y1:c.y(s.y),y2:c.y(predictions[i]),stroke:'var(--muted)','stroke-dasharray':'4 4'}));svg.append(node('circle',{cx:c.x(s.x),cy:c.y(s.y),r:5,fill:'var(--orange)'}));svg.append(node('rect',{x:c.x(s.x)-3,y:c.y(predictions[i])-3,width:6,height:6,fill:'var(--green)'}));});
 $('sample-grid').replaceChildren(...M.samples.map((s,i)=>{const el=document.createElement('div');el.textContent='输入 '+s.x+' / 答案 '+s.y;const value=document.createElement('b');value.textContent='预测 '+fmt(predictions[i]);el.append(value);return el;}));
 const hs=$('loss-chart'),max=Math.max(...history,.001),h=chart(hs,[0,Math.max(1,history.length-1)],[0,max*1.1],200,'训练步数','平均平方误差');
 hs.append(node('path',{d:history.map((v,i)=>(i?'L':'M')+h.x(i)+' '+h.y(v)).join(' '),fill:'none',stroke:'var(--green)','stroke-width':2}));hs.append(node('circle',{cx:h.x(history.length-1),cy:h.y(history.at(-1)),r:4,fill:'var(--green)'}));
 $('equation').textContent='预测 = '+w.toFixed(2)+' × x '+(b<0?'− ':'+ ')+Math.abs(b).toFixed(2);
 $('loss-value').textContent=fmt(M.loss(w,b));$('weight-value').textContent=fmt(w);$('bias-value').textContent=fmt(b);$('step-count').textContent='第 '+(history.length-1)+' 步';
 for(const [id,value,min,max] of [['weight',w,-3,5],['bias',b,-4,5]]){const el=$(id);el.min=Math.min(min,Math.floor(value));el.max=Math.max(max,Math.ceil(value));el.value=value;}
 $('step').disabled=halted;$('ten').disabled=halted;
 if(last){const el=$('step-detail');el.replaceChildren();[
 '更新前：w = '+fmt(last.before.w)+'，b = '+fmt(last.before.b)+'，loss = '+fmt(last.before.loss),
 '三个误差（预测 − 答案）：'+last.errors.map(fmt).join('、'),
 'w 的梯度 = 2 × 平均(误差 × 输入) = '+fmt(last.dw)+'；b 的梯度 = 2 × 平均(误差) = '+fmt(last.db),
 'w：'+fmt(last.before.w)+' − '+last.rate+' × ('+fmt(last.dw)+') = '+fmt(last.w),
 'b：'+fmt(last.before.b)+' − '+last.rate+' × ('+fmt(last.db)+') = '+fmt(last.b),
 '更新后 loss = '+fmt(M.loss(last.w,last.b))+'。两个梯度均由更新前的参数计算。'
 ].forEach(text=>{const p=document.createElement('p');p.textContent=text;el.append(p);});}
 else $('step-detail').textContent='先点一次“学习一步”，这里会展示更新前的误差、梯度与新参数。';
}
function restart(message){history=[M.loss(w,b)];last=null;halted=false;$('status').textContent=message;draw();}
for(const id of ['weight','bias'])$(id).addEventListener('input',()=>{w=Number($('weight').value);b=Number($('bias').value);restart('已手动调整参数，新实验从当前数值开始。训练样本仍是同一组。');});
$('rate').addEventListener('change',()=>{rate=Number($('rate').value);restart('学习率已切换，保留当前参数并新开误差曲线。公平比较时请先“回到起点”。');});
$('reset').addEventListener('click',()=>{w=1;b=0;restart('参数已回到 w = 1、b = 0；保留你选中的学习率 '+rate+'。');});
function train(n){let count=0;const before=M.loss(w,b);for(let i=0;i<n;i++){if(halted)break;const next=M.step(w,b,rate);if(!Number.isFinite(M.loss(next.w,next.b))||Math.abs(next.w)>1000||Math.abs(next.b)>1000||history.length>=1001){halted=true;break;}last=next;w=next.w;b=next.b;history.push(M.loss(w,b));count++;}const after=M.loss(w,b);$('status').textContent=halted?'已暂停：参数超出展示范围，或达到 1000 步上限。可回到起点并减小学习率；不是模型自动学会了。':'完成 '+count+' 步。loss 从 '+fmt(before)+' 变为 '+fmt(after)+(after>before?'：误差上升，试着减小学习率。':'：观察预测线与圆点之间的距离。');draw();}
$('step').addEventListener('click',()=>train(1));$('ten').addEventListener('click',()=>train(10));
$('check-answer').addEventListener('click',()=>{$('quiz-feedback').textContent=$('quiz-answer').value==='parameters'?'对，这里更新的是 w 和 b。输入与正确答案固定，梯度决定怎样调整参数。':$('quiz-answer').value?'再看三个圆点：答案没有移动。移动的是模型预测线，背后改变的是参数。':'先选择一个判断，再检查理解。';});
const goals=[...document.querySelectorAll('[data-goal]')],KEY='ai-learning-lab.lesson-01.v1';
function goalStatus(message){$('progress-status').textContent=goals.filter(el=>el.checked).length+' / '+goals.length+' 项完成'+(message?' · '+message:'');}
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');goals.forEach(el=>el.checked=saved?.[el.dataset.goal]===true);goalStatus();}catch{goalStatus('无法读取本地记录，当前未恢复勾选。');}
goals.forEach(el=>el.addEventListener('change',()=>{try{localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(goals.map(e=>[e.dataset.goal,e.checked]))));goalStatus('已保存到当前浏览器');}catch{goalStatus('保存失败，刷新可能丢失本次勾选。');}}));
new ResizeObserver(draw).observe($('prediction-chart').parentElement);draw();
