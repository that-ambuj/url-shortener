import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import type { Context } from "koa";

import Router from "@koa/router";
import serve from "koa-static";
import logger from "koa-logger";
import { customAlphabet } from "nanoid";

const port = process.env.PORT || 3000;

const app = new Koa();
const router = new Router();

let id = 0;

if (process.env.NODE_ENV === "development") {
    app.use(logger());
    app.use(async (ctx, next) => {
        ctx.response.set(
            "Access-Control-Allow-Origin",
            "http://localhost:5173"
        );
        ctx.response.set(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        await next();
    });
}

interface link {
    readonly id: number;
    readonly slug: string;
    readonly url: string;
}

const links: link[] = [
    { id: 1, slug: "ggoodale", url: "https://www.google.com" },
];

const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    10
);

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = 500;
        ctx.body = "Oops! Something doesn't look right.";

        ctx.app.emit("error", err, ctx);
    }
});

app.use(serve("../frontend/dist/"));

router.get("/:slug", async (ctx: Context) => {
    const slug = ctx.params.slug;
    // @ts-ignore
    const correctLink: link = links.find((l) => l.slug === slug);
    if (correctLink === undefined) {
        ctx.status = 404;
        ctx.body = "Wrong Url Identifier";
        return;
    }
    ctx.redirect(correctLink?.url);
});

router.post("/shorten", async (ctx: Context) => {
    if (ctx.query?.url === undefined) {
        ctx.status = 400;
        ctx.body = "Please provide a url";
        return;
    }
    const urlRegex =
        /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    const url: string = ctx.query?.url?.toString();
    if (!urlRegex.test(url)) {
        ctx.status = 400;
        ctx.body = "Please provide a valid URL";
        return;
    }

    const slug = nanoid();

    links.push({ id: id++, slug: slug, url: url });
    ctx.body = `${ctx.request.URL.origin}/${slug}`;
});

app.on("error", (err, ctx) => {
    console.error("Server Error : ", err, ctx);
});

app.use(router.routes()).listen(port);
