const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace the massive <style> block
// We look for <style> and the next </style>
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>', styleStart);

if (styleStart !== -1 && styleEnd !== -1) {
  const styleLink = '<link rel="stylesheet" href="/src/css/main.css">';
  html = html.substring(0, styleStart) + styleLink + html.substring(styleEnd + 8);
}

// 2. Remove all script tags that are inline and add the new module script
// We'll look for the last </body> and insert before it
// But first, let's remove the script tags.
// Since there might be many, and some might be important (though unlikely in this monolithic file),
// we will target the one at line 1372 and the ones at the end.

// A simpler way: Remove all <script>...</script> blocks that don't have a src attribute.
html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, (match, content) => {
  if (match.includes('src=')) return match; // Keep external scripts
  return ''; // Remove inline scripts
});

// 3. Add the main module script before </body>
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd !== -1) {
  const moduleScript = '\n<script type="module" src="/src/ts/main.ts"></script>\n';
  html = html.substring(0, bodyEnd) + moduleScript + html.substring(bodyEnd);
}

fs.writeFileSync(htmlPath, html);
console.log('index.html cleaned up successfully.');
