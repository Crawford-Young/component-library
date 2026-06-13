import path from 'node:path'
import remarkGfm from 'remark-gfm'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    }
    viteConfig.build = {
      ...viteConfig.build,
      target: 'esnext',
    }
    return viteConfig
  },
}

export default config
