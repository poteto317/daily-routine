import type { NextConfig } from "next";
import { InjectManifest } from "workbox-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    // ビルド時のTypeScriptエラーを警告に変更
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer, dev }) => {
    // プロダクションビルドまたは明示的に有効化されている場合のみService Workerを生成
    if (!isServer && !dev) {
      config.plugins.push(
        new InjectManifest({
          swSrc: path.resolve("./src/service-worker/custom-sw.js"),
          swDest: path.resolve("./public/sw.js"),
          // ビルド成果物のうち、存在しないファイルを除外
          exclude: [
            /\.map$/,
            /^manifest.*\.js$/,
            /_buildManifest\.js$/,
            /_ssgManifest\.js$/,
            /build-manifest\.json$/,
            /react-loadable-manifest\.json$/,
            /middleware-.*\.js$/,
            /next-font-manifest\..*$/,
            /server\//,
          ],
          compileSrc: true,
          // 大きなファイルもキャッシュ対象に含める
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20MB
          // デバッグ用: console.logを保持
          webpackCompilationPlugins: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: false,
                },
                mangle: false,
                format: {
                  comments: false,
                  beautify: true,
                },
              },
            }),
          ],
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
