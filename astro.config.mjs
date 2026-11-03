// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://docs.cluewren.dev",
  integrations: [
    starlight({
      title: "Cluewren",
      logo: { src: "./src/assets/wren.svg", alt: "" },
      favicon: "/favicon.svg",
      customCss: ["@fontsource-variable/recursive/mono.css", "./src/styles/custom.css"],
      head: [
        { tag: "meta", attrs: { property: "og:image", content: "https://docs.cluewren.dev/og.png" } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { property: "og:image:alt", content: "Cluewren documentation" } },
      ],
      defaultLocale: "root",
      locales: {
        root: { label: "English", lang: "en" },
        ja: { label: "日本語", lang: "ja" },
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/crane-valley/cluewren" }],
      editLink: { baseUrl: "https://github.com/crane-valley/cluewren-docs/edit/main/" },
      sidebar: [
        {
          label: "Getting started",
          translations: { ja: "はじめに" },
          items: ["getting-started/overview", "getting-started/install", "getting-started/first-run"],
        },
        {
          label: "Engines",
          translations: { ja: "エンジン" },
          items: ["engines/unity", "engines/godot", "engines/unreal"],
        },
        {
          label: "Guides",
          translations: { ja: "ガイド" },
          items: ["guides/requests", "guides/decision-model-key"],
        },
        {
          label: "How it works",
          translations: { ja: "しくみ" },
          items: ["concepts/architecture", "concepts/privacy", "concepts/sandbox"],
        },
        {
          label: "Reference",
          translations: { ja: "リファレンス" },
          items: ["reference/cli", "reference/kit"],
        },
        { label: "cluewren.dev", link: "https://cluewren.dev/", attrs: { rel: "home" } },
      ],
    }),
  ],
});
