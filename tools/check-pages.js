/* Verify the deployed GitHub Pages site for real.
   Checks the live URL and the three asset paths that break when a site is
   served from a subpath (/School_story/) with absolute references.

   Usage: node tools/check-pages.js [baseUrl]
   Default base: https://azizbekteacher.github.io/School_story/
   Exit code 0 = everything green, 1 = at least one check failed. */
const https = require("https");

const DEFAULT_BASE = "https://azizbekteacher.github.io/School_story/";
const base = (process.argv[2] || DEFAULT_BASE).replace(/\/?$/, "/");

const ASSETS = ["js/main.js", "css/style.css", "memory.js"];
const NEEDLE = "Sulton School";

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "user-agent": "school-story-pages-check" } }, res => {
      const { statusCode = 0, headers } = res;
      if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
        res.resume();
        const next = new URL(headers.location, url).toString();
        return resolve(get(next, redirects + 1));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({
        status: statusCode,
        url,
        type: headers["content-type"] || "",
        body: Buffer.concat(chunks).toString("utf8")
      }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout after 20s: " + url)));
  });
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + (detail ? "  " + detail : ""));
}

(async () => {
  console.log("live site: " + base);
  console.log("");

  let home;
  try {
    home = await get(base);
  } catch (e) {
    console.log("  FAIL  homepage unreachable: " + e.message);
    process.exit(1);
  }
  check("GET " + base, home.status === 200, "HTTP " + home.status + " " + home.type);
  check("homepage HTML contains \"" + NEEDLE + "\"", home.body.indexOf(NEEDLE) !== -1,
    home.body.indexOf(NEEDLE) !== -1 ? "found" : "NOT found (body " + home.body.length + " bytes)");

  for (const asset of ASSETS) {
    const url = base + asset;
    try {
      const r = await get(url);
      check("GET " + asset, r.status === 200 && r.body.length > 0,
        "HTTP " + r.status + " " + r.body.length + " bytes " + r.type);
    } catch (e) {
      check("GET " + asset, false, e.message);
    }
  }

  // Relative references in the served HTML: a leading "/" would point at the
  // domain root and 404 under /School_story/. Catch that here rather than in
  // a browser.
  const badRefs = [];
  const re = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(home.body))) {
    const ref = m[1];
    if (/^(?:[a-z]+:)?\/\//i.test(ref) || ref.startsWith("data:") || ref.startsWith("#")) continue;
    if (ref.startsWith("/")) badRefs.push(ref);
  }
  check("no root-absolute asset references in HTML", badRefs.length === 0,
    badRefs.length ? "found " + badRefs.join(", ") : "all relative");

  const failed = results.filter(r => !r.ok);
  console.log("");
  console.log(failed.length === 0
    ? "  PASS  " + results.length + "/" + results.length + " checks green — " + base
    : "  FAIL  " + failed.length + " of " + results.length + " checks failed");
  process.exit(failed.length === 0 ? 0 : 1);
})();
