import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
    plugins: [
        purgeCSSPlugin({
            content: ['./index.html', './src/**/*.tsx', './src/**/*.ts'],
            safelist: [
                /^Mui/, // keep Material UI classes
            ],
        }),
    ],
};
