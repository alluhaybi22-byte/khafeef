const fs=require('fs'),http=require('http'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.split('/').pop();if(name==='pdf.min.mjs'||name==='pdf.worker.min.mjs'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(require('path').join(require('path').dirname(require.resolve('pdfjs-dist/package.json')),'build',name)));return}if(name==='pdf-lib.min.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(require.resolve('pdf-lib').replace('/cjs/index.js','/dist/pdf-lib.min.js')));return}res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(__dirname+'/../index.html','utf8').replaceAll('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js','/pdf-lib.min.js').replaceAll('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/','/'))}).listen(0,'127.0.0.1');
 const browser=await chromium.launch({headless:true,...(process.env.KHAFEEF_TEST_CHROME?{executablePath:process.env.KHAFEEF_TEST_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.PDFLib,{timeout:60000});
  const pdf=await page.evaluate(async()=>{const d=await PDFLib.PDFDocument.create();d.addPage([300,400]).drawText('PAGE ONE');d.addPage([400,300]).drawText('PAGE TWO');return Array.from(await d.save())});
  await page.locator('#pick').setInputFiles([{name:'sample.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf)},{name:'sample.jpg',mimeType:'image/jpeg',buffer:Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1800;c.height=1200;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,1800,1200);x.strokeStyle='blue';x.lineWidth=15;x.strokeRect(300,200,1200,800);x.fillStyle='black';x.font='50px Arial';x.fillText('KHAFEEF TEST IMAGE',500,500);return Array.from(Uint8Array.from(atob(c.toDataURL('image/jpeg').split(',')[1]),x=>x.charCodeAt(0)))}))}]);
  await page.waitForFunction(()=>!state.busy,{timeout:90000});assert.equal(await page.locator('.page').count(),3,await page.locator('#status').textContent());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile overflow');
  const before=await page.evaluate(()=>S.items.map(x=>x.id));
  await page.locator('.page').first().scrollIntoViewIfNeeded();
  const cdp=await page.context().newCDPSession(page),a=await page.locator('.page').nth(0).boundingBox(),b=await page.locator('.page').nth(2).boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});
  await page.waitForTimeout(500);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.evaluate(()=>S.items[2].id),before[0],'long press reorder');
  await page.evaluate(ids=>move(ids[0],ids[1]),before);
  // Reorder with a keyboard-accessible control; native drag has the same move handler.
  await page.locator('.page').nth(2).focus();await page.keyboard.press('Alt+ArrowUp');assert.equal(await page.evaluate(()=>S.items[1].kind),'image');
  await page.locator('.page').nth(1).click();await page.waitForFunction(()=>!document.getElementById('rotate').disabled);
  assert.equal(await page.locator('#position').inputValue(),'2');
  await page.locator('#rotate').click();await page.waitForFunction(()=>!document.getElementById('rotate').disabled);assert.equal(await page.evaluate(()=>S.items[1].rotation),90);
  const box=await page.locator('#editCanvas').boundingBox();await page.mouse.move(box.x+box.width*.1,box.y+box.height*.1);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.8);await page.mouse.up();await page.locator('#applyCrop').click();
  assert(Math.abs(await page.evaluate(()=>S.items[1].crop.w)-.7)<.02);
  await page.locator('#make').click();await page.waitForFunction(()=>!state.busy&&state.output,{timeout:90000});
  const info=await page.evaluate(async()=>{const bytes=await state.output.blob.arrayBuffer(),d=await PDFLib.PDFDocument.load(bytes);const m=await pdfJS(),v=await m.getDocument({data:new Uint8Array(bytes)}).promise;const texts=[];for(let i=1;i<=v.numPages;i++){texts.push((await (await v.getPage(i)).getTextContent()).items.map(x=>x.str).join(' '))}await v.destroy();return{count:d.getPageCount(),sizes:d.getPages().map(p=>p.getSize()),texts}});
  assert.equal(info.count,3);assert.equal(info.sizes[0].width,300);assert(info.texts[0].includes('PAGE ONE'));assert(info.texts[2].includes('PAGE TWO'));
  await page.locator('#mode').selectOption('compress');assert.equal(await page.evaluate(()=>state.output),null);await page.locator('#make').click();await page.waitForFunction(()=>!state.busy&&state.output,{timeout:90000});
  const compressed=await page.evaluate(async()=>{const m=await pdfJS(),d=await m.getDocument({data:new Uint8Array(await state.output.blob.arrayBuffer())}).promise;const text=await (await d.getPage(1)).getTextContent();const n=d.numPages;await d.destroy();return {n,text:text.items.length}});assert.equal(compressed.n,3);assert.equal(compressed.text,0);
  // Failed imports leave the successful document and its output intact.
  await page.locator('#pick').setInputFiles({name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('invalid')});await page.waitForFunction(()=>!state.busy);assert.equal(await page.locator('.page').count(),3);assert(await page.locator('#status').textContent());
  await page.locator('.page').nth(0).click();await page.waitForFunction(()=>!document.getElementById('rotate').disabled);await page.locator('#rotate').click();await page.waitForFunction(()=>!document.getElementById('rotate').disabled);await page.locator('#closeEdit').click();await page.locator('#mode').selectOption('preserve');await page.locator('#make').click();await page.waitForFunction(()=>!state.busy&&state.output,{timeout:90000});
  assert.equal(await page.evaluate(async()=>{const d=await PDFLib.PDFDocument.load(await state.output.blob.arrayBuffer());return d.getPage(0).getRotation().angle}),90);
  await page.screenshot({path:process.env.KHAFEEF_TEST_SCREENSHOT||'/tmp/khafeef-mobile-preview.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: PDF+image import, mobile layout, reorder, crop, rotation, preserved text, compressed PDF, invalid input, output invalidation.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
