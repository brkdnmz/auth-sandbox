# Auth Sandbox

The first app that I implemented actual authentication lifecycle using JWTs (JSON Web Token).

## Motivation — Why? 🤔

Since I've first met and tried web development in late 2021, authentication has been my weakest point. After 2 years of avoidance, I finally decided to take it serious to figure out and understand how exactly authentication works; how to:

- Sign up?
- Sign in?
- **Know about the user has signed in?**
- **Persist the session?**

As bolded out, I have struggled a lot trying to understand how the last two things are done.

So, the universe has carried me to the point where I finally began building a personal project **just to learn about how to solve these problems**.

Moreover, my greater motivation is that I want this app to help those among you who also struggles to understand the logic behind authentication.

Therefore, I've been building this app for educational purposes.

### Is that it?

Of course not!

What do you think I have been doing since 2021? Continuously learning about web development:

- Basics:
  - HTML, CSS, JavaScript
  - How web works
  - Data flow:
    - What "client" and "server" exactly are
    - Where data are stored (databases)
    - HTTP
    - How servers send data (APIs)
    - How data are served (mostly JSON)
    - How clients request & get data (sending HTTP requests to APIs)
- TypeScript 💙 (my favorite language by far)
- Frontend & backend libraries and frameworks:
  - React
  - Node.js with various libraries:
    - Express
    - Prisma

...and so on. It seemed like I was going a bit out of scope.

Briefly, I have learnt so much about the web, and discovered lots of helpful libraries & frameworks that I wanted to introduce. This app also involves lots of them, which serves my purpose.

## Tech Stack

I believe that discovering new libraries are a huge source of encouragement to learn more about web development. At least, it's the case for me. Therefore, I hope those used in this app inspires you guys:

- [T3 Stack](https://create.t3.gg/)
  - [Next.js](https://nextjs.org/) (a React framework): The "skeleton," so to say. Both the frontend and the backend are handled by Next.js.
  - [Tailwind CSS](https://tailwindcss.com/): A wonderful CSS library. Provides lots of utility classes. One of my favorites.
  - [tRPC](https://trpc.io/): APIs could not be more fun! Seriously, one of the most fun libraries to use. I absolutely love it.
  - [Drizzle ORM](https://orm.drizzle.team/) (an alternative to Prisma): I have some experience with Prisma, and I also wanted to try out Drizzle. I like how it uses 100% TypeScript, unlike Prisma with `.prisma` stuff.
  - [Zod](https://zod.dev/): A validation library. The TypeScript that works in runtime, that's how I see Zod.
  - [Zustand](https://github.com/pmndrs/zustand): A very lightweight yet powerful state management library. They say Redux is so much complicated. I have only used Zustand so far, as a third-party state management library.
- [React Hook Form](https://react-hook-form.com/): A form state management library. Works nice with zod.
- [shadcn/ui](https://ui.shadcn.com/): A dope UI library that provides nice components.
- [React Email](https://react.email/): Prepare emails with JSX!
- [nodemailer](https://nodemailer.com/): Send emails with ease. _(Used [Resend](https://resend.com/home) previously)_
- [js-cookie](https://github.com/js-cookie/js-cookie): Cookie API library.
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3): What is needed for SQLite database management.
- [clsx](https://www.npmjs.com/package/clsx): Makes `className`s better to write.
- [Framer Motion](https://www.framer.com/motion/): Animation? Here it is.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Generate and decode JWTs.
- [next-themes](https://www.npmjs.com/package/next-themes): Light/dark modes.
- [React Icons](https://react-icons.github.io/react-icons/): Self-explanatory.
- [bcrypt](https://www.npmjs.com/package/bcrypt): Used for safe password encryption.
