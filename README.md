# Coffe shop PWA

## For general knowledge about Svelte and SvelteKit
Reach out to the [documentation](https://svelte.dev/docs/kit/service-workers)

## About PWAs
This is managed via service workers to handle background/offline work by catching fetch requests and caching the required information and pages.

References:
- [General explanation on StackOverlow](https://stackoverflow.com/a/77647464)
- [manifest.json](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Service Workers for Sveltekit](https://svelte.dev/docs/kit/service-workers)

## Icons references
- [SvgRepo tritone happy icons](https://www.svgrepo.com/collection/various-tritone-happy-icons/)

---

## Recreating the project
Without needing to install pnpm permanently you can instead use the following to recreate the project:

```sh
# recreate this project
npx pnpm dlx sv@0.15.4 create --template minimal --types ts --add prettier tailwindcss="plugins:none" --install pnpm coffeShop-pwa
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```