# URL Shortener (Vite + Koa.js)
I made this as my hobby project while learning Vue, Koa.js and sql databases. Feel free use it!

## Getting Started
#### Clone this repo
```bash
git clone https://github.com/that-ambuj/url-shortener
cd url-shortener
yarn
```
#### Using in dev environment
```bash
yarn dev
```
The frontend will on visible localhost:5713 in your browser and backend will be on localhost:3000/api.
#### Using the production build
```bash
yarn build:start
```
The backend will serve static build files on localhost:3000, and the api on /api endpoint.

## Tech Stack used :
- [Vue](https://vuejs.org) - Vue is a frontend framework I really became a fan of. I love it's typescript support and combination of speed with [Vite.js](https://vitejs.dev).
- [Koa.js](https://koajs.dev) - Koa is a minimal backend framework which is way faster than express and has concise syntax.
- [Prisma ORM](https://prisma.io) - Prisma a typesafe ORM mainly for SQL databases and I really like it typesafety when working with sql databases.
- [Sqlite3](https://sqlite.org) - I'm using sqlite3 file-based sql database suitable for small to mid size projects. Using postgresql in a hobby project would have been overkill.
