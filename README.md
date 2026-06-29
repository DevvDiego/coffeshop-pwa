# Lirios App
Coffe shop mobile app prototype using Sveltekit and Capacitor

## Installing the project
**Note:** The package manager used in this project is [pnpm](https://pnpm.io/), but the commands in this readme will use npx pnpm to install temporarily pnpm and keep the workflow clean.

### Installing dependencies
```sh
npx pnpm install
```

### Developing
Once you've installed the dependencies, you can start a development server:
```sh
npm run dev
# or pnpm run dev
```

---

## Capacitor & Android Compilation (APK)

Since SvelteKit relies on Server-Side Rendering (SSR) by default, we use `@sveltejs/adapter-static` to turn the project into a Single Page Application (SPA). This allows Capacitor to bundle and run the app locally on the device without needing a Node.js server.

### Prerequisites & Setup

1. Android Studio installed: Ensure you have Android Studio installed along with the Android SDK Command-line Tools.
2. Capacitor Initialization: (Already configured in the repository, but we use `build` as the `web-dir`).

### The Mobile Development Workflow
Every time you make changes to your Svelte components or Tailwind styles and want to test them on an Android device or emulator, follow these steps:

#### 1. Build the Static Web Assets
This compiles your SvelteKit app into standard HTML, JS, and CSS inside the `/build` folder:
```sh
npm run build
# or pnpm run build
```

#### 2. Sync with Capacitor
This copies the compiled assets from the `/build` folder directly into the native Android project wrapper:
```sh
npx cap sync
```

#### 3. Open and Build the APK
Open the native container inside Android Studio to compile your final binary:
```sh
npx cap open android
```

Once Android Studio opens:

* Wait for the Gradle sync to finish (the loading bar at the bottom).
* In the top menu, go to: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
* When the compilation completes, a notification bubble will appear in the bottom-right corner. Click **"locate"** to find your installable `app-debug.apk` file.

**Tip:** If you want to test changes in real-time on your phone or emulator without rebuilding constantly, you can use Capacitor's live reload feature during development:
```sh
npx cap copy
npx cap run android --live-reload --external
```

---

## General knowledge

References:
- [General Service workers explanation on StackOverlow](https://stackoverflow.com/a/77647464)
- [manifest.json](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [Service Workers for Sveltekit](https://svelte.dev/docs/kit/service-workers)

Icons
- [SvgRepo tritone happy icons](https://www.svgrepo.com/collection/various-tritone-happy-icons/)
