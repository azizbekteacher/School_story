/* Render the hero at each facing direction at high scale, save PNGs, and report
   where the visible asymmetry (arm, eye, hair) actually lands.
   Used to diagnose the "looks left while moving right" bug. */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const crypto = require("crypto");
const os = require("os");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "tools", "shots");
fs.mkdirSync(outDir, { recursive: true });
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9900 + Math.floor(Math.random() * 90);
const PROFILE = path.join(os.tmpdir(), "dsh-face-" + Date.now());
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
function waitPort(port, t = 15000) {
  return new Promise((res, rej) => {
    const s0 = Date.now();
    (function a() {
      const s = net.connect(port, "127.0.0.1");
      s.on("connect", () => { s.destroy(); res(); });
      s.on("error", () => { s.destroy(); if (Date.now() - s0 > t) rej(new Error("timeout")); else setTimeout(a, 150); });
    })();
  });
}
function getJson(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, r => {
      let d = ""; r.on("data", c => d += c);
      r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class WS {
  constructor(h, p, wp) { this.h = h; this.p = p; this.wp = wp; this.key = crypto.randomBytes(16).toString("base64"); this.buf = Buffer.alloc(0); this.id = 0; this.handlers = new Map(); this.onMsg = () => {}; }
  connect() {
    return new Promise((res, rej) => {
      const r = http.request({ host: this.h, port: this.p, path: this.wp, headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Key": this.key, "Sec-WebSocket-Version": "13" } });
      r.on("upgrade", (x, s) => { this.sock = s; this.attach(); res(); }); r.on("error", rej); r.end();
    });
  }
  attach() { this.sock.on("data", d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); }); this.sock.on("error", () => {}); }
  parse() {
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1], op = b0 & 0x0f, mk = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = this.buf.readBigUInt64BE(2); off = 10; }
      let m = null;
      if (mk) { if (this.buf.length < off + 4) return; m = this.buf.slice(off, off + 4); off += 4; }
      if (this.buf.length < off + len) return;
      let pl = this.buf.slice(off, off + len);
      if (m) { const c = Buffer.alloc(len); for (let i = 0; i < len; i++) c[i] = pl[i] ^ m[i % 4]; pl = c; }
      this.buf = this.buf.slice(off + len);
      if (op === 0x1) { try { this.onMsg(JSON.parse(pl.toString("utf8"))); } catch (e) {} } else if (op === 0x8) this.sock.end();
    }
  }
  send(o) {
    const d = Buffer.from(JSON.stringify(o), "utf8"), m = crypto.randomBytes(4), x = Buffer.alloc(d.length);
    for (let i = 0; i < d.length; i++) x[i] = d[i] ^ m[i % 4];
    let h;
    if (d.length < 126) h = Buffer.from([0x81, 0x80 | d.length]);
    else if (d.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(d.length, 2); }
    else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 0x80 | 127; h.writeBigUInt64BE(BigInt(d.length), 2); }
    this.sock.write(Buffer.concat([h, m, x]));
  }
  cmd(me, pa) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.handlers.set(id, m => m.error ? rej(new Error(me + " " + JSON.stringify(m.error))) : res(m.result)); this.send({ id, method: me, params: pa || {} }); });
  }
}

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,860", "about:blank"],
    { stdio: ["ignore", "pipe", "pipe"] });
  let cerr = ""; chrome.stderr.on("data", d => cerr += d.toString());
  try {
    await waitPort(PORT);
    const list = await getJson("/json/list");
    const page = list.find(t => t.type === "page");
    const u = new URL(page.webSocketDebuggerUrl.replace(/^ws:\/\//, "http://"));
    const ws = new WS(u.hostname, u.port, u.pathname);
    await ws.connect();
    ws.onMsg = m => { if (m.id && ws.handlers.has(m.id)) { const h = ws.handlers.get(m.id); ws.handlers.delete(m.id); h(m); } };
    await ws.cmd("Runtime.enable"); await ws.cmd("Page.enable");
    await ws.cmd("Page.navigate", { url });
    await sleep(2000);
    const ev = async e => {
      const r = await ws.cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text);
      return r.result.value;
    };

    // render each facing at 10x into its own canvas with a light background.
    // Character spans roughly y=-38 (top of head) .. y=0 (feet) in local units,
    // so at 10x with the origin at ORIGIN_Y we need ORIGIN_Y >= 400.
    const report = await ev(`(function(){
      var SCALE = 10, CX = 130, ORIGIN_Y = 440, WID = 260, HEI = 480;
      var dirs = ['down','up','left','right'];
      var metrics = {}, images = {};

      dirs.forEach(function(dir){
        var c = document.createElement('canvas');
        c.width = WID; c.height = HEI;
        var g = c.getContext('2d');
        g.fillStyle = '#ffffff'; g.fillRect(0,0,WID,HEI);
        g.save();
        g.translate(CX, ORIGIN_Y);
        g.scale(SCALE, SCALE);
        G.render.character(g, 0, 0, 'hero', dir, 0);
        g.restore();

        var img = g.getImageData(0,0,WID,HEI).data;
        // convert local char-y to canvas-y
        function cy(localY){ return ORIGIN_Y + localY*SCALE; }
        function scanBand(y0, y1, label){
          var xs=[], total=0, sx=0, sy=0;
          for (var y=Math.max(0,Math.round(y0)); y<Math.min(HEI,Math.round(y1)); y++){
            for (var x=0;x<WID;x++){
              var i=(y*WID+x)*4;
              var r=img[i], gg=img[i+1], b=img[i+2];
              if (r<235||gg<235||b<235){ xs.push(x); total++; sx+=x; sy+=y; }
            }
          }
          if (!total) return null;
          xs.sort(function(a,b){return a-b;});
          return { count:total, cx: Math.round(sx/total),
                   minX:xs[0], maxX:xs[xs.length-1],
                   leftExtent: Math.round(sx/total - xs[0]),
                   rightExtent: Math.round(xs[xs.length-1]-sx/total) };
        }
        metrics[dir] = {
          head: scanBand(cy(-38), cy(-26), 'head'),
          torso: scanBand(cy(-26), cy(-12), 'torso'),
          legs: scanBand(cy(-12), cy(1), 'legs'),
          whole: scanBand(cy(-38), cy(1), 'whole')
        };
        images[dir] = c.toDataURL('image/png');
      });
      return { metrics: metrics, images: images };
    })()`);

    console.log("=== HERO FACING ANALYSIS (10x render, canvas centre=130) ===\n");
    for (const dir of ["down", "up", "left", "right"]) {
      const m = report.metrics[dir];
      console.log(dir.toUpperCase());
      for (const band of ["head", "torso", "legs", "whole"]) {
        const b = m[band];
        if (!b) { console.log("  " + band + ": (none)"); continue; }
        const skew = b.cx - 130;
        const lean = skew > 3 ? "  >> LEANS RIGHT" : (skew < -3 ? "  << LEANS LEFT" : "  balanced");
        console.log(`  ${band.padEnd(6)} cx=${String(b.cx).padStart(4)} (${skew >= 0 ? "+" : ""}${skew})  x[${b.minX}..${b.maxX}]  L=${b.leftExtent} R=${b.rightExtent}${lean}`);
      }
      console.log("");
    }

    // The decisive test: the nose pokes out past the head circle on the side the
    // character walks toward, so the HEAD BAND silhouette must be asymmetric in
    // that direction. (Measuring dark pixels does NOT work: hair and eye are both
    // near-black, so the scan just finds the hair on the back of the head.)
    const L = report.metrics.left.head, R = report.metrics.right.head;

    console.log("--- DIRECTION CUE TEST (head silhouette: nose side) ---");
    console.log(`  facing LEFT  → head L=${L.leftExtent} R=${L.rightExtent}  (nose must make L > R)`);
    console.log(`  facing RIGHT → head L=${R.leftExtent} R=${R.rightExtent}  (nose must make R > L)`);
    const leftOk = L.leftExtent > L.rightExtent + 3;
    const rightOk = R.rightExtent > R.leftExtent + 3;
    console.log("");
    if (leftOk && rightOk) {
      console.log("  ✓ PASS — the nose points the way the hero is walking, in both directions");
    } else {
      console.log("  ✗ FAIL — direction cue wrong or too weak");
      if (!leftOk) console.log(`     facing left: L=${L.leftExtent} R=${L.rightExtent}, need L > R+3`);
      if (!rightOk) console.log(`     facing right: L=${R.leftExtent} R=${R.rightExtent}, need R > L+3`);
      process.exitCode = 1;
    }

    console.log("\n--- mirror check (right must be the exact mirror of left) ---");
    console.log(`  left  whole: L=${report.metrics.left.whole.leftExtent} R=${report.metrics.left.whole.rightExtent}`);
    console.log(`  right whole: L=${report.metrics.right.whole.leftExtent} R=${report.metrics.right.whole.rightExtent}`);
    const mirrored = Math.abs(report.metrics.right.whole.leftExtent - report.metrics.left.whole.rightExtent) <= 2
      && Math.abs(report.metrics.right.whole.rightExtent - report.metrics.left.whole.leftExtent) <= 2;
    console.log(mirrored ? "  ✓ side views are exact mirror images" : "  ✗ side views are not clean mirrors");
    if (!mirrored) process.exitCode = 1;

    // Save the PNGs
    for (const dir of ["down", "up", "left", "right"]) {
      const b64 = report.images[dir].split(",")[1];
      fs.writeFileSync(path.join(outDir, "facing-" + dir + ".png"), Buffer.from(b64, "base64"));
      console.log("saved facing-" + dir + ".png");
    }

    // Now composite a real side-by-side strip for visual comparison
    const strip = await ev(`(function(){
      var c = document.createElement('canvas');
      c.width = 4*200; c.height = 360;
      var g = c.getContext('2d');
      g.fillStyle = '#f7f2e8'; g.fillRect(0,0,c.width,c.height);
      var dirs = ['down','up','left','right'];
      dirs.forEach(function(dir, i){
        g.save();
        g.translate(i*200 + 100, 320);
        g.scale(9,9);
        G.render.character(g, 0, 0, 'hero', dir, 0);
        g.restore();
        g.fillStyle = '#333';
        g.font = 'bold 22px sans-serif';
        g.textAlign = 'center';
        g.fillText(dir, i*200+100, 350);
      });
      return c.toDataURL('image/png');
    })()`);
    fs.writeFileSync(path.join(outDir, "facing-strip.png"), Buffer.from(strip.split(",")[1], "base64"));
    console.log("saved facing-strip.png");

    console.log("\nSTDERR: " + cerr.slice(0, 300));
    server.close(); chrome.kill();
  } catch (e) {
    console.error("FAILED: " + e.message);
    if (cerr) console.error(cerr.slice(-800));
    process.exitCode = 1;
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
    setTimeout(() => process.exit(process.exitCode || 0), 250);
  }
})();
