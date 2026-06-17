const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("./src");
let changedFiles = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Find all matches of: import {name}Asset from "@/assets/{filename}.asset.json";
  const regex = /import\s+(\w+)(?:Asset)?\s+from\s+["']@\/assets\/([^"']+)\.asset\.json["'];/g;
  let match;
  let modifications = [];

  while ((match = regex.exec(content)) !== null) {
    const importName = match[1];
    const fileName = match[2];
    modifications.push({ importName, fileName, fullMatch: match[0] });
  }

  if (modifications.length > 0) {
    let newContent = content;
    modifications.forEach(({ importName, fileName, fullMatch }) => {
      // Replace the import line
      newContent = newContent.replace(fullMatch, "");

      // Look for const something = importName.url;
      const usageRegex1 = new RegExp(`const\\s+(\\w+)\\s*=\\s*${importName}\\.url;`, "g");
      if (usageRegex1.test(newContent)) {
        newContent = newContent.replace(usageRegex1, `const $1 = "/assets/${fileName}";`);
      }

      // Also look for direct usage of importName.url
      const usageRegex2 = new RegExp(`${importName}\\.url`, "g");
      newContent = newContent.replace(usageRegex2, `"/assets/${fileName}"`);
    });

    // Remove any double blank lines created by removing the imports
    newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    fs.writeFileSync(file, newContent, "utf8");
    console.log(`Updated ${file}`);
    changedFiles++;
  }
});

console.log(`Changed ${changedFiles} files.`);
