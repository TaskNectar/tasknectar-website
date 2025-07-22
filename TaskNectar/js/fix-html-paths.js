const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.html')) {
      callback(dirPath);
    }
  });
}

function fixBackslashesInHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find src="..." or href="..." with backslashes inside quotes
  content = content.replace(/(src|href)=["']([^"']*\\[^"']*)["']/g, (match, attr, url) => {
    const fixedUrl = url.replace(/\\/g, '/');
    return `${attr}="${fixedUrl}"`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed backslashes in: ${filePath}`);
}

const projectRoot = process.cwd();
walkDir(projectRoot, fixBackslashesInHtmlFile);
