const fs = require('fs');

let safelist = [];
let custom = [];

try {
    safelist = JSON.parse(fs.readFileSync('./tailwind.safelist.json', 'utf-8'));
    custom = JSON.parse(fs.readFileSync('./tailwind.custom.json', 'utf-8'));

} catch {
    console.warn('⚠️ No safelist or custom list found — using empty array');
}

module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './src/app/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/lib/**/*.{js,ts,jsx,tsx}',
    ],
    safelist,
    custom
};