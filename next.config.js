/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-var-requires */
const externallyEmbeddableIFrameResponseHeaders =
  require("./src/shared-module/utils/responseHeaders").externallyEmbeddableIFrameResponseHeaders
const svgoConfig = require("./src/shared-module/utils/svgoConfig")

const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: externallyEmbeddableIFrameResponseHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // No max-age until old builds' chunks stay reachable after a deploy: a cached page
        // pointing at chunks the new revision no longer serves fails to load.
        source: "/iframe",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ]
  },
  output: "standalone",
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      loader: "@svgr/webpack",
      options: {
        svgoConfig: svgoConfig,
      },
    })

    return config
  },
  compiler: {
    emotion: {
      autoLabel: "always",
      // labelFormat: "[dirname]--[filename]--[local]",
    },
  },
  experimental: {
    modularizeImports: {
      lodash: {
        transform: "lodash/{{member}}",
      },
    },
  },
}

if (process.env.NEXT_PUBLIC_BASE_PATH) {
  config.basePath = process.env.NEXT_PUBLIC_BASE_PATH
}

module.exports = config
