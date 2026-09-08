// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The release version is resolved by scripts/sync-content.mjs (prebuild) and
// written to src/version.json; the SiteTitle and Footer components read it, so
// the config itself no longer needs to shell out to git.

// https://astro.build/config
export default defineConfig({
  site: 'https://mat-docs.shukelabs.com',
  integrations: [
    starlight({
      title: 'my-ai-team',
      description:
        'Public documentation for my-ai-team — a tmux-based framework for running structured AI-agent sessions against a GitHub repo. Latest release only.',
      // Starlight ships Pagefind site search by default (no extra config).
      // SiteTitle override adds the version badge + CC-BY link into the site
      // header (inherited by every route); Footer repeats the licence notice.
      // Header override adds the Buy Now purchase CTA to the same header.
      components: {
        Header: './src/components/Header.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        { label: 'Overview', slug: 'overview' },
        {
          label: 'Quickstart',
          items: [
            { label: 'Linux', slug: 'quickstart-linux' },
            { label: 'macOS', slug: 'quickstart-macos' },
            { label: 'WSL2', slug: 'quickstart-wsl2' },
            { label: 'baton & duo', slug: 'quickstart-baton-duo' },
          ],
        },
        { label: 'User guide', slug: 'user-guide' },
        { label: 'FAQ', slug: 'faq' },
        { label: 'Configuration examples', slug: 'examples' },
        { label: 'Versioning policy', slug: 'versioning' },
        { label: 'Changelog', slug: 'changelog' },
      ],
    }),
  ],
});
