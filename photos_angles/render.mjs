import { chromium } from 'playwright';
import { spawn } from 'child_process';
const srv = spawn('python3', ['-m', 'http.server', '8811'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const shots = JSON.parse(process.argv[2]);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: 1024, height: 1024 } });
pg.on('pageerror', e => console.error('ERR', e.message));
for (const [name, q] of Object.entries(shots)) {
  await pg.goto('about:blank');
  await pg.goto(`http://localhost:8811/scene.html#${q}`);
  await pg.waitForFunction(() => window.done === true, null, { timeout: 120000 });
  const data = await pg.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  (await import('fs')).writeFileSync(`${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
  console.log('ok', name);
}
await b.close(); srv.kill();
