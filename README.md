# TakeShape

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Developer notes

### Scripts

#### `npm run erase` - a convenient way to remove and reinstall everything.
#### `npm run screens` - takes screenshots at various sizes to assist testing

#### `--turbo` flag with `next dev` for faster development. It also suppresses some warnings related to `react-toastify`

### Packages

#### `class-variance-authority` - component configuration with classNames (pairs well with tailwind)
#### `framer-motion` - advanced animations
#### `react-toastify` - rendering notifications
#### `react-intersection-observer` - simplifies the Intersection Observer API
#### `react-device-detect` - detects user device information
#### `@vis.gl/react-google-maps` - handles Google's Map API declaratively
#### `@radix-ui/react-select` - an advanced non-native select input

### State Management

A chain of React Context's found here `context/providers.tsx`. I believe `jotai` should be removed for simplicity.

### Page -> Component structure

All components exist in `components/**/*`, the structure of this directory is as flat as possible with both page components (eg. dashboard) and shared components (eg. cva) side-by-side.

### Buttons and inputs

Heavily leverages `class-variance-authority` to strike a balance between configurability and consistency.
