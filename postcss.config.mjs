import autoprefixer from "autoprefixer";

export default {
    plugins: {
        '@tailwindcss/postcss': {
            config: './tailwind.config.js'
        },
        autoprefixer: {}
    }
};
