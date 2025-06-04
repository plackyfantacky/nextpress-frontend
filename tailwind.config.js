const fs = require('fs');

let safelist = [];

try {
  safelist = JSON.parse(fs.readFileSync('./tailwind.safelist.json', 'utf-8'));
} catch {
  console.warn('⚠️ No safelist found — using empty array');
}

module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  safelist,
};