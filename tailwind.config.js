const glob = require("fast-glob");

const contentPaths = [
    './.safelist/**/*.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}'
];

const matchedFiles = glob.sync(contentPaths, { dot: true });
console.log("Matched files:", matchedFiles);

module.exports = {
    content: contentPaths,
    theme: {
        extend: {
            colors: {
                testgreen: '#00ff99',
            },
        },
    },
    plugins: [],
};