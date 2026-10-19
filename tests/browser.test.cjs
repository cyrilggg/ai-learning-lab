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
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
