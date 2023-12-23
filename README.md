# Auth Sandbox

The first app in which I implemented the actual authentication lifecycle using JWTs (JSON Web Token).

## Motivation — Why? 🤔

Since I first met and tried web development in late 2021, authentication has been my weakest point. After 2 years of avoidance, I finally decided to take it seriously to figure out and understand how exactly authentication works; how to:

- Sign up?
- Sign in?
- **Know if the user has signed in?**
- **Persist the session?**

As bolded out, I have struggled a lot trying to understand how the last two things are done.

So, the universe has carried me to the point where I finally began building a personal project **just to learn about how to solve these problems**.

Moreover, my greater motivation is that I want this app to help those among you who also struggle to understand the logic behind authentication.

Therefore, I've been building this app for educational purposes.

### Is that it?

Of course not!

What do you think I have been doing since 2021? Continuously learning about web development:

- Basics:
  - HTML, CSS, JavaScript
  - How the web works
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

Briefly, I have learned so much about the web and discovered lots of helpful libraries & frameworks that I wanted to introduce. This app also involves lots of them, which serves my purpose.

## Tech Stack

I believe that discovering new libraries is a huge source of encouragement to learn more about web development. At least, that's the case for me. Therefore, I hope those used in this app inspire you guys:

- [T3 Stack](https://create.t3.gg/)
  - [Next.js](https://nextjs.org/) (a React framework): The "skeleton," so to say. Both the frontend and the backend are handled by Next.js.
  - [Tailwind CSS](https://tailwindcss.com/): A wonderful CSS library. Provides lots of utility classes. One of my favorites.
  - [tRPC](https://trpc.io/): APIs could not be more fun! Seriously, one of the most fun libraries to use. I absolutely love it.
  - [Prisma](https://www.prisma.io/docs): A dope ORM that makes it easy to manage DBs. I pretty much like it!
    - I have previously wanted to introduce [Drizzle ORM](https://orm.drizzle.team/) in this project. However, it had so many bugs that I got pretty frustrated. I think they need some time getting Drizzle to a trustable level.
  - [Zod](https://zod.dev/): A validation library. The TypeScript that works in runtime, that's how I see Zod.
  - [Zustand](https://github.com/pmndrs/zustand): A very lightweight yet powerful state management library. They say Redux is so much more complicated. I have only used Zustand so far, as a third-party state management library.
- [React Hook Form](https://react-hook-form.com/): A form state management library. Works nice with Zod.
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

## Getting Started

Alright, alright — here comes the fun part!

### Prerequisites

#### NodeJS & pnpm

1. Firstly, you should have **NodeJS** installed. You may download the installer [here](https://nodejs.org/en).

2. Then, you need to install the **pnpm** package manager. You may use the following commands:
    - Windows (PowerShell): `iwr https://get.pnpm.io/install.ps1 -useb | iex`
    - Linux (POSIX): `curl -fsSL https://get.pnpm.io/install.sh | sh -`

    For other alternatives and more details, see [pnpm docs](https://pnpm.io/installation). I'm a Windows user, and I preferred the Choco option.

#### PostgreSQL

To persist data, an app should use a database system. For this purpose, I used PostgreSQL in this project. So, with defaults, you should install and configure PostgreSQL, too. You can download it [here](https://www.postgresql.org/download/).

### Package Installation

After you satisfy these prerequisites, clone this repo to your local system. Then, all you need is the following command to finalize the installation phase:
  - `pnpm i`

This command checks the `package.json` and `pnpm-lock.yaml` to analyze all package dependencies and install all required packages with proper versions. See the details [here](https://pnpm.io/cli/install).

### Environment Variables

This part is crucial for the app to run seamlessly. Create a copy of the `.env.example` file and name it as `.env`. Then, configure the following environment variables:

- `NEXT_HOST` (defaults to `localhost`): Specifies the host that the app will run at. This variable doesn't actually configure the host. You might not touch it at all.

- `NEXT_PORT` (defaults to `3000`): Specifies the port. Like `NEXT_HOST`, it doesn't configure the port but rather serves it. To change the actual port, open `package.json` and use the `-p` flag to change the following scripts as follows:

  ```json
    "scripts": {
      "dev": "next dev -p 5678",
      "start": "next start -p 5678"
    }
  ```

  The value `5678` is given as an example. You may use another suitable value.

  As an alternative, you may not touch the scripts at all, and provide the port when running them:
    - `pnpm dev -p 3452`
    - `pnpm start -p 3452`

- `DB_HOST` (defaults to `localhost`): The host that the database server (PostgreSQL) is running at. If you run everything locally, this may remain unchanged.
- `DB_PORT` (defaults to `5432`): The port that the database server is listening at. PostgreSQL's default installation sets the port to 5432.
- Database credentials: `DB_USER`, `DB_PASSWORD` (default to `postgres` and `123456`): PostgreSQL's installer wants you to provide them anyway. Configure them accordingly.
- `DB_NAME` (defaults to `authsandbox`): The database's name. You may change it however you want.
- `DATABASE_URL`: This variable is generated using the `DB_`-prefixed variables above. Configure them, not this.

- `GMAIL_ACCOUNT_EMAIL_ADDRESS` and `GMAIL_APP_PASSWORD`: The app sends verification emails using Gmail's SMTP. Please refer to the comments in `.env.example`.

- `ACCESS_TOKEN_DURATION` and `REFRESH_TOKEN_DURATION`: The lifetime of the auth tokens. They default to 5 minutes and 1 month, respectively.

## Run It!

After you complete the steps above, you should be able to run the app. First, run `pnpm build` to build the app, then run `pnpm start` to run the app.

If you want to modify the code and see the results immediately, you may choose to run the app in development mode: `pnpm dev`.
