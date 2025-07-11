const glob = require("fast-glob");

const contentPaths = [
    './.safelist/**/*.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}'
];

module.exports = {
    content: contentPaths,
    theme: {
        extend: {
            colors: {
                testgreen: '#00ff99',
            },
        },
    },
    plugins: [
        function ({ addVariant }) {
            addVariant('has-headings', '& h1, & h2, & h3, & h4, & h5, & h6');
        },
    ],
};