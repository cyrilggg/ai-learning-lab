const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../site/index.html')).href);
assert.equal(await page.locator('#loss-value').innerText(),'4.6667');
await page.locator('#step').click();assert.equal(await page.locator('#loss-value').innerText(),'2.7096');
await page.locator('#weight').fill('2');await page.locator('#bias').fill('1');assert.equal(await page.locator('#loss-value').innerText(),'0.0000');
await page.locator('#reset').click();await page.locator('#rate').selectOption('0.6');await page.locator('#ten').click();assert.ok(Number(await page.locator('#loss-value').innerText())>4.6667);
for(let i=0;i<8;i++)if(await page.locator('#ten').isEnabled())await page.locator('#ten').click();assert.equal(await page.locator('#step').isDisabled(),true);
await page.locator('#reset').click();await page.locator('#rate').selectOption('0.05');await page.locator('#ten').click();assert.ok(Number(await page.locator('#loss-value').innerText())<1);
await page.locator('[data-goal="explain"]').check();await page.reload();assert.equal(await page.locator('[data-goal="explain"]').isChecked(),true);
await page.locator('#quiz-answer').selectOption('parameters');await page.locator('#check-answer').click();assert.match(await page.locator('#quiz-feedback').innerText(),/对/);
fs.mkdirSync(path.resolve(__dirname,'../artifacts'),{recursive:true});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.resolve(__dirname,'../artifacts/desktop.png'),fullPage:true});
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.resolve(__dirname,'../artifacts/mobile.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.setViewportSize({width:320,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.deepEqual(errors,[]);console.log('PASS: sliders, step, divergence guard, reset, convergence, local persistence, quiz, 390/320px layout, runtime');
await page.locator('[data-course-directory]').click();
assert.equal(await page.locator('dialog').isVisible(),true);
assert.equal(await page.locator('dialog [aria-current="page"]').getAttribute('href'),'index.html');
await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').isVisible(),false);
assert.equal(await page.locator('[data-course-directory]').evaluate(e=>e===document.activeElement),true);
await page.locator('[data-course-directory]').click();
await page.getByRole('link',{name:'第二课 · 转折',exact:true}).click();
assert.match(await page.title(),/第二课/);
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});
 await page.locator('[data-course-directory]').click();
 assert.equal(await page.locator('dialog [aria-current="page"]').getAttribute('href'),'lesson-02.html');
 assert.equal(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
 await page.screenshot({path:path.resolve(__dirname,`../artifacts/directory-${width}.png`)});
 await page.getByRole('button',{name:'关闭课程目录'}).click();
 assert.equal(await page.locator('dialog').isVisible(),false);
 await page.locator('#probe').fill('0');assert.match(await page.locator('#clip-readout').innerText(),/先减 1：-1.0 → 负值归零后：0.0/);
 await page.locator('#probe').fill('2');assert.match(await page.locator('#clip-readout').innerText(),/负值归零后：1.0/);
 await page.locator('#turn').fill('2');await page.locator('#slope').fill('-1');await page.locator('#offset').fill('1');
 assert.match(await page.locator('#hinge-description').innerText(),/x ≤ 2.0 时输出为 1.0/);
 await page.locator('#slope').fill('0');assert.match(await page.locator('#hinge-description').innerText(),/没有可见转折/);
 await page.locator('#hinge-reset').click();assert.equal(await page.locator('#turn').inputValue(),'1');
 await page.locator('#show-fit').click();assert.equal(await page.locator('#combined-loss').innerText(),'0.0000');
 assert.match(await page.locator('#sum-description').innerText(),/= -1.0/);
 await page.locator('#first').fill('-1');await page.locator('#second').fill('-4');assert.ok(Number.isFinite(Number(await page.locator('#combined-loss').innerText())));
 await page.locator('#combine-reset').click();assert.equal(await page.locator('#first').inputValue(),'1');assert.equal(await page.locator('#second').inputValue(),'0');
 await page.locator('#show-fit').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.locator('svg path').evaluateAll(paths=>paths.every(p=>!(/NaN|Infinity/.test(p.getAttribute('d'))))),true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:path.resolve(__dirname,`../artifacts/lesson-02-${width}.png`),fullPage:true});
}
for(const [id,wrong,right] of [['structure','rate','structure'],['slope','minus3','minus1'],['generalize','all','samples']]){
 await page.locator(`[data-check="${id}"]`).click();assert.match(await page.locator('#feedback-'+id).innerText(),/先选择/);
 await page.locator('#quiz-'+id).selectOption(wrong);await page.locator(`[data-check="${id}"]`).click();assert.ok(!(await page.locator('#feedback-'+id).innerText()).startsWith('对。'));
 await page.locator('#quiz-'+id).selectOption(right);await page.locator(`[data-check="${id}"]`).click();assert.ok((await page.locator('#feedback-'+id).innerText()).startsWith('对。'));
}
await page.locator('[data-goal="relu"]').check();await page.reload();assert.equal(await page.locator('[data-goal="relu"]').isChecked(),true);
await page.locator('[data-course-directory]').click();
await page.getByRole('link',{name:'第一课 · 直线',exact:true}).click();assert.equal(await page.locator('[data-goal="explain"]').isChecked(),true);
assert.deepEqual(errors,[]);console.log('PASS: lesson navigation, ReLU controls, threshold and zero slope, exact fit, reset, all quiz branches, separate progress, desktop/390/320px, runtime');
await page.locator('[data-course-directory]').click();await page.getByRole('link',{name:'第三课 · 神经网络',exact:true}).click();
assert.match(await page.title(),/第三课/);
await page.locator('#single-x').fill('-2');assert.match(await page.locator('#single-flow').innerText(),/max\(0, -3\) = 0/);
await page.locator('#single-x').fill('4');
await page.locator('#single details').evaluate(e=>e.open=true);
await page.locator('#single-w').fill('-2');await page.locator('#single-b').fill('2');assert.match(await page.locator('#single-flow').innerText(),/max\(0, -6\) = 0/);
await page.locator('#single-w').fill('1');await page.locator('#single-b').fill('-1');await page.locator('#single details').evaluate(e=>e.open=false);
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});
 for(const [kind,output,layers] of [['base',3,2],['wide',4,2],['deep',2,3]]){
  await page.locator('#structure').selectOption(kind);await page.locator('#network-x').fill('4');
  assert.equal(await page.locator('.flow-layer.pending').count(),layers);
  await page.locator('#network-next').click();assert.equal(await page.locator('.flow-layer.pending').count(),layers-1);
  assert.match(await page.locator('[data-node="h₁"]').innerText(),/h₁ = 3/);assert.match(await page.locator('[data-node="h₂"]').innerText(),/h₂ = 1/);
  await page.locator('#network-all').click();assert.equal(await page.locator('.flow-layer.pending').count(),0);assert.equal(await page.locator('#network-next').isDisabled(),true);
  assert.match(await page.locator('#network-status').innerText(),new RegExp('y = '+output));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#network-flow').screenshot({path:path.resolve(__dirname,`../artifacts/network-${kind}-${width}.png`)});
  await page.locator('#network-reset').click();assert.equal(await page.locator('.flow-layer.pending').count(),layers);
  await page.locator('#network-x').fill('-2');await page.locator('#network-all').click();assert.match(await page.locator('#network-status').innerText(),/y = 0/);
 }
}
for(const [id,wrong,right] of [['width','deep','wide'],['source','h1','x'],['output','6','2']]){
 await page.locator(`[data-check="${id}"]`).click();assert.match(await page.locator('#feedback-'+id).innerText(),/先选择/);
 await page.locator('#quiz-'+id).selectOption(wrong);await page.locator(`[data-check="${id}"]`).click();assert.ok(!(await page.locator('#feedback-'+id).innerText()).startsWith('对。'));
 await page.locator('#quiz-'+id).selectOption(right);await page.locator(`[data-check="${id}"]`).click();assert.ok((await page.locator('#feedback-'+id).innerText()).startsWith('对。'));
}
await page.locator('[data-goal="flow"]').check();await page.reload();assert.equal(await page.locator('[data-goal="flow"]').isChecked(),true);
await page.locator('[data-course-directory]').click();assert.equal(await page.locator('dialog [aria-current="page"]').getAttribute('href'),'lesson-03.html');
await page.getByRole('link',{name:'第二课 · 转折',exact:true}).click();assert.equal(await page.locator('[data-goal="relu"]').isChecked(),true);
await page.getByRole('link',{name:'继续第三课：从 ReLU 到神经网络 →',exact:true}).click();assert.match(await page.title(),/第三课/);
assert.deepEqual(errors,[]);console.log('PASS: neuron controls, base/wide/deep forward steps, input reset, mobile layouts, lesson 3 quiz and progress, directory and lesson 2 onward link');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
