'use strict';
const N=window.NonlinearModel;
const byId=id=>document.getElementById(id);
const value=id=>Number(byId(id).value);
const ns='http://www.w3.org/2000/svg';
function svgNode(tag,attrs,text){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;}
function plot(id,xmin,xmax,ymin,ymax,curves,dots=[],turn=null){
 const svg=byId(id),width=Math.max(250,svg.clientWidth),height=280;
 const left=46,right=width-18,top=28,bottom=height-38;
 const x=v=>left+(v-xmin)/(xmax-xmin)*(right-left),y=v=>bottom-(v-ymin)/(ymax-ymin)*(bottom-top);
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';svg.replaceChildren();
 for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4;svg.append(svgNode('line',{x1:left,x2:right,y1:y(v),y2:y(v),stroke:'var(--edge)'}),svgNode('text',{x:left-7,y:y(v)+4,'text-anchor':'end'},Number(v.toFixed(1))));}
 for(let i=Math.ceil(xmin);i<=xmax;i++)svg.append(svgNode('text',{x:x(i),y:bottom+20,'text-anchor':'middle'},i));
 svg.append(svgNode('text',{x:left,y:17},'输出'),svgNode('text',{x:right,y:height-1,'text-anchor':'end'},'输入 x'));
 if(ymin<=0&&ymax>=0)svg.append(svgNode('line',{x1:left,x2:right,y1:y(0),y2:y(0),stroke:'var(--muted)','stroke-width':1}));
 if(turn!==null)svg.append(svgNode('line',{x1:x(turn),x2:x(turn),y1:top,y2:bottom,stroke:'var(--orange)','stroke-dasharray':'3 4'}));
 curves.forEach(c=>{const xs=Array.from({length:101},(_,i)=>xmin+(xmax-xmin)*i/100);if(c.knots)xs.push(...c.knots);xs.sort((a,b)=>a-b);svg.append(svgNode('path',{d:xs.map((v,i)=>(i?'L':'M')+x(v)+' '+y(c.fn(v))).join(' '),fill:'none',stroke:c.color,'stroke-width':c.dash?2:3,'stroke-dasharray':c.dash||'none'}));});
 dots.forEach(p=>svg.append(svgNode('circle',{cx:x(p.x),cy:y(p.y),r:4.5,fill:p.color||'var(--paper)',stroke:p.color||'var(--orange)','stroke-width':2})));
}
function draw(){
 for(const id of ['probe','turn','slope','offset','first','second'])byId(id+'-value').textContent=value(id).toFixed(1);
 const p=value('probe'),t=value('turn'),a=value('slope'),b=value('offset'),a1=value('first'),a2=value('second');
 plot('clip-chart',-1,4,-2,4,[{fn:x=>x-1,color:'var(--muted)',dash:'7 5'},{fn:x=>N.relu(x-1),color:'var(--green)',knots:[1]}],[{x:p,y:p-1,color:'var(--orange)'},{x:p,y:N.relu(p-1),color:'var(--green)'}]);
 byId('clip-readout').textContent=`先减 1：${(p-1).toFixed(1)} → 负值归零后：${N.relu(p-1).toFixed(1)}。${p<1?'还没过门槛，输出为 0。':p===1?'刚好到门槛，输出仍为 0。':'已经过门槛，保留多出来的量。'}`;
 const end=N.hinge(4,a,t,b),lo=Math.min(0,b,end)-1,hi=Math.max(1,b,end)+1;
 plot('hinge-chart',0,4,lo,hi,[{fn:x=>N.hinge(x,a,t,b),color:'var(--green)',knots:[t]}],[],t);
 byId('hinge-equation').textContent=`y = ${a.toFixed(1)} × ReLU(x − ${t.toFixed(1)}) + (${b.toFixed(1)})`;
 byId('hinge-description').textContent=`x ≤ ${t.toFixed(1)} 时输出为 ${b.toFixed(1)}；x > ${t.toFixed(1)} 时，输入每增加 1，输出变化 ${a.toFixed(1)}。${a===0?'当前斜率为 0，没有可见转折。':''}纵轴随参数范围调整，请结合刻度观察。`;
 plot('parts-chart',0,4,-6,12,[{fn:x=>a1*N.relu(x-1),color:'#336b9c',dash:'8 4',knots:[1]},{fn:x=>a2*N.relu(x-3),color:'var(--orange)',dash:'2 4',knots:[3]}]);
 plot('sum-chart',0,4,-6,12,[{fn:x=>N.bestLine.w*x+N.bestLine.b,color:'var(--muted)',dash:'7 5'},{fn:x=>N.combined(x,a1,a2),color:'var(--green)',knots:[1,3]}],N.samples);
 byId('parts-equation').textContent=`合成 = 固定起点 1 + ${a1.toFixed(1)} × ReLU(x − 1) + (${a2.toFixed(1)}) × ReLU(x − 3)`;
 const loss=N.mse(x=>N.combined(x,a1,a2));
 byId('combined-loss').textContent=loss.toFixed(4);
 byId('linear-loss').textContent='最佳直线的样本误差：'+N.bestLine.loss.toFixed(4);
 byId('comparison').textContent=loss<1e-10?'现在贴合了所有样本。试着解释 x > 3 时为什么向下。':loss<N.bestLine.loss?'当前合成模型更贴近这些样本。还能再缩小误差吗？':'结构能表达转折，也需要合适的参数；当前还没有比最佳直线贴合得好。';
 byId('sum-description').textContent=`三个区间的斜率：x < 1 时为 0；1 < x < 3 时为 ${a1.toFixed(1)}；x > 3 时为 ${a1.toFixed(1)} + (${a2.toFixed(1)}) = ${(a1+a2).toFixed(1)}。第二个开始贡献后，第一个仍然在贡献。`;
 byId('line-explanation').textContent=`对同一组 9 个样本，最小化平均平方误差得到 y = ${N.bestLine.w.toFixed(4)} × x + ${N.bestLine.b.toFixed(4)}，误差为 ${N.bestLine.loss.toFixed(4)}。`;
}
for(const id of ['probe','turn','slope','offset','first','second'])byId(id).addEventListener('input',draw);
function setValues(pairs){for(const [id,v] of pairs)byId(id).value=v;draw();}
byId('hinge-reset').addEventListener('click',()=>setValues([['turn',1],['slope',1],['offset',0]]));
byId('combine-reset').addEventListener('click',()=>setValues([['first',1],['second',0]]));
byId('show-fit').addEventListener('click',()=>setValues([['first',2],['second',-3]]));
const answers={structure:['structure','对。增加并组合单元改变了结构，才有机会出现第二个转折。','学习率控制更新步长，偏移控制上下移动，都不能让一个单元拥有两个转折。'],slope:['minus1','对。两个贡献的斜率相加：2 + (−3) = −1。','第一个贡献没有停止；总斜率是两个系数之和，而不是只看第二个。'],generalize:['samples','对。这只说明贴合了当前样本，新数据上的表现需要另行验证。','当前样本上的误差无法保证新数据表现，也可能出现过拟合。']};
document.querySelectorAll('[data-check]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.check,answer=byId('quiz-'+id).value,rule=answers[id];byId('feedback-'+id).textContent=answer?(answer===rule[0]?rule[1]:rule[2]):'先选择你的判断，再检查。';}));
const goals=[...document.querySelectorAll('[data-goal]')],key='ai-learning-lab.lesson-02.v1';
function status(message=''){byId('progress-status').textContent=goals.filter(e=>e.checked).length+' / '+goals.length+' 项完成'+(message?' · '+message:'');}
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');goals.forEach(e=>e.checked=saved?.[e.dataset.goal]===true);status();}catch{status('无法读取本地记录。');}
goals.forEach(e=>e.addEventListener('change',()=>{try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(goals.map(el=>[el.dataset.goal,el.checked]))));status('已保存到当前浏览器');}catch{status('保存失败，刷新可能丢失勾选。');}}));
new ResizeObserver(draw).observe(byId('clip-chart').parentElement);
draw();
