'use strict';
(() => {
 const M=window.NetworkModel,$=id=>document.getElementById(id),num=id=>Number($(id).value),fmt=n=>String(Number(n.toFixed(3)));
 function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
 function single(){
  const x=num('single-x'),w=num('single-w'),b=num('single-b'),r=M.neuron([x],[w],b);
  for(const id of ['single-x','single-w','single-b'])$(id+'-value').textContent=fmt(num(id));
  $('single-flow').replaceChildren(...[['① 乘权重',`${fmt(x)} × (${fmt(w)}) = ${fmt(r.sum)}`],['② 加偏置',`${fmt(r.sum)} + (${fmt(b)}) = ${fmt(r.z)}`],['③ 经过 ReLU',`max(0, ${fmt(r.z)}) = ${fmt(r.value)}`]].map(([title,text])=>{const card=el('div',undefined,'flow-node');card.append(el('h3',title),el('p',text));return card;}));
 }
 let step=0;
 const descriptions={base:'1 个隐藏层，宽度为 2。h₁、h₂ 并列，都接收 x；输出层直接组合它们。',wide:'1 个隐藏层，宽度为 3。新增 h₃ 也接收 x，并以 0.5 的权重加入输出。层数没有增加。',deep:'2 个隐藏层，宽度依次为 2、1。新增 g 接收 h₁、h₂ 的结果，经过新的加权、偏置和 ReLU 后，再送给输出层。'};
 function render(){
  const kind=$('structure').value,x=num('network-x'),r=M.forward(kind,x),last=r.layers.length-1;
  $('network-x-value').textContent=fmt(x);$('structure-note').textContent=descriptions[kind];
  $('network-status').textContent=step===0?'输入已就绪。先猜下一层的结果，再点击“计算下一层”。':step===r.layers.length?`前向计算完成：y = ${fmt(r.output)}。这是固定参数下的计算结果，不代表预测正确。`:`已算完隐藏层 ${step}。下一层将使用这些输出继续计算。`;
  $('network-next').disabled=step===r.layers.length;
  const flow=$('network-flow');flow.replaceChildren();
  const input=el('section',undefined,'flow-layer');input.append(el('h3','输入层'),el('div',`x = ${fmt(x)}`,'flow-node input-node'));flow.append(input);
  const formulas=$('network-formulas');formulas.replaceChildren();
  r.layers.forEach((layer,index)=>{
   const section=el('section',undefined,'flow-layer'+(step<=index?' pending':''));
   section.append(el('h3',index===last?'输出层':`隐藏层 ${index+1} · ${layer.length} 个${layer.length>1?'并列':''}单元`));
   const source=index===0?['x']:r.layers[index-1].map(n=>n.id);
   layer.forEach(n=>{
    const card=el('div',undefined,'flow-node');card.dataset.node=n.id;
    card.append(el('h4',n.id));
    n.weights.forEach((w,i)=>card.append(el('p',`${source[i]} → × (${fmt(w)})${step>index?`：${fmt(n.inputs[i])} × (${fmt(w)}) = ${fmt(n.products[i])}`:''}`,'incoming-edge')));
    if(step>index){card.append(el('p',`加权和 ${fmt(n.sum)} + 偏置 (${fmt(n.bias)}) = ${fmt(n.z)}`));card.append(el('strong',`${n.id} = ${fmt(n.value)}`,'node-result'));card.append(el('small',n.activation==='relu'?`ReLU：max(0, ${fmt(n.z)})`:'直接输出 · 不经过 ReLU'));}
    else{card.append(el('p',`偏置 ${fmt(n.bias)} · ${n.activation==='relu'?'经过 ReLU':'无激活'}`),el('strong','等待计算','node-result'));}
    section.append(card);
    const sum=n.weights.map((w,i)=>`(${fmt(w)}) × ${source[i]}`).join(' + ')+` + (${fmt(n.bias)})`;
    formulas.append(el('p',`${n.id} = ${n.activation==='relu'?'ReLU('+sum+')':sum}`));
   });flow.append(section);
  });
 }
 for(const id of ['single-x','single-w','single-b'])$(id).addEventListener('input',single);
 $('network-x').addEventListener('input',()=>{step=0;render();});$('structure').addEventListener('change',()=>{step=0;render();});
 $('network-next').addEventListener('click',()=>{step=Math.min(step+1,M.structures[$('structure').value].layers.length);render();});
 $('network-all').addEventListener('click',()=>{step=M.structures[$('structure').value].layers.length;render();});
 $('network-reset').addEventListener('click',()=>{step=0;render();});
 const answers={width:['wide','对。同一隐藏层的单元变多，是变宽，隐藏层仍只有一层。','再看来源：10 个单元都直接接收 x，没有多接一层隐藏计算。'],source:['x','对。h₁ 和 h₂ 都接收 x，彼此并不串联。','h₂ 与 h₁ 并列，并没有接在 h₁ 后面。'],output:['2','对。y = 2 × 4 − 3 × 2 = 2，输出层不使用 ReLU。','先分别乘权重：2 × 4 与 −3 × 2，再相加得到 2。']};
 document.querySelectorAll('[data-check]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.check,v=$('quiz-'+id).value,a=answers[id];$('feedback-'+id).textContent=v?(v===a[0]?a[1]:a[2]):'先选择你的判断。';}));
 const goals=[...document.querySelectorAll('[data-goal]')],key='ai-learning-lab.lesson-03.v1';
 function status(message=''){$('progress-status').textContent=goals.filter(e=>e.checked).length+' / '+goals.length+' 项完成'+(message?' · '+message:'');}
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');goals.forEach(e=>e.checked=saved?.[e.dataset.goal]===true);status();}catch{status('无法读取本地记录。');}
 goals.forEach(e=>e.addEventListener('change',()=>{try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(goals.map(e=>[e.dataset.goal,e.checked]))));status('已保存到当前浏览器');}catch{status('保存失败，刷新可能丢失勾选。');}}));
 single();render();
})();
