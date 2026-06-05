# Coffe shop PWA

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

## Building

To create a production version of your app:

```sh
npm run build
```
