import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import mermaid from 'rspress-plugin-mermaid';
import { pluginGiscus } from 'rspress-plugin-giscus';
import { pluginSitemap } from '@rspress/plugin-sitemap';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'AstraSchedule',
  icon: 'https://image-hk-1.oss-accelerate.aliyuncs.com/icon.png',
  logo: 'https://image-hk-1.oss-accelerate.aliyuncs.com/icon.png',
  logoText: '星程课表 · AstraSchedule',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/AstraSchedule/desktop',
      },
    ],
  },
  llms: true,
  plugins: [
    mermaid(),
    pluginGiscus({
      repo: 'AstraSchedule/desktop',
      repoId: 'R_kgDOLu9Xeg',
      category: 'Giscus',
      categoryId: 'DIC_kwDOLu9Xes4C-nET',
    }),
    pluginSitemap({
      siteUrl: 'https://getastra.cn',
    }),
  ],
  head: [
    '<meta name="baidu-site-verification" content="codeva-QyMSxtlR6S" />'
  ]
});
