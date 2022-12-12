import type { Configuration } from 'webpack';
import path from 'path';
// eslint-disable-next-line import/default
import CopyWebpackPlugin from 'copy-webpack-plugin';

import { rules } from './webpack.rules';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
  externals: ['serialport'],
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'py'),
          to: path.join(__dirname, '.webpack/main', 'py'),
        },
      ],
    }),
  ],
};
