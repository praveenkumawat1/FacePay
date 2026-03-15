const fs = require("fs");
const path = require("path");

function searchFiles(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes("node_modules")) {
      searchFiles(filePath, results);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      const content = fs.readFileSync(filePath, "utf8");

      if (
        content.includes("ResponsiveContainer") ||
        content.includes("AreaChart") ||
        content.includes("PieChart") ||
        content.includes("BarChart") ||
        content.includes("recharts")
      ) {
        results.push(filePath);
      }
    }
  });

  return results;
}

console.log("🔍 Searching for Recharts usage...\n");
const results = searchFiles("./src");

if (results.length > 0) {
  console.log("📊 Found Recharts in these files:\n");
  results.forEach((file) => console.log(`  ❌ ${file}`));
  console.log("\n💡 Comment out chart code in these files!\n");
} else {
  console.log("✅ No Recharts found!\n");
}
