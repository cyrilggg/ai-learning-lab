'use strict';
(() => {
 const courses = [
  {file:'index.html', label:'第一课 · 直线', title:'让模型学会一条直线', description:'参数、预测、误差与训练，从两个旋钮开始。'},
  {file:'lesson-02.html', label:'第二课 · 转折', title:'从直线到转折', description:'看懂 ReLU，动手组合不同区间的变化。'},
  {file:'lesson-03.html', label:'第三课 · 神经网络', title:'从 ReLU 到神经网络', description:'跟着数值逐层计算，区分变宽与变深。'}
 ];
 const current = location.pathname.split('/').pop() || 'index.html';
 const dialog = document.createElement('dialog');
 dialog.className = 'course-drawer';
 dialog.id = 'course-directory';
 dialog.setAttribute('aria-labelledby','directory-title');
 dialog.innerHTML = '<div class="directory-heading"><div><div class="eyebrow">AI 学习实验室</div><h2 id="directory-title">课程目录</h2></div><button class="directory-close secondary" aria-label="关闭课程目录" autofocus>关闭 ×</button></div><p class="directory-intro">按理解程度推进，随时回来复习。</p><nav aria-label="全部课程"><h3 class="directory-group">基础入门</h3><ol class="directory-list"></ol></nav>';
 const list = dialog.querySelector('ol');
 courses.forEach(course => {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = course.file;
  link.setAttribute('aria-label',course.label);
  if(course.file === current) link.setAttribute('aria-current','page');
  const label = document.createElement('span');label.className='directory-label';label.textContent=course.label+(course.file===current?' · 正在学习':'');
  const title = document.createElement('strong');title.textContent=course.title;
  const description = document.createElement('span');description.className='directory-description';description.textContent=course.description;
  link.append(label,title,description);item.append(link);list.append(item);
 });
 document.body.append(dialog);
 const trigger = document.querySelector('[data-course-directory]');
 trigger.setAttribute('aria-controls',dialog.id);
 trigger.addEventListener('click',()=>dialog.showModal());
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>trigger.focus());
})();
