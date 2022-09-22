import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import type { Context } from "koa";

import Router from "@koa/router";
import serve from "koa-static";

import logger from "koa-logger";

import { urlAlphabet, customAlphabet } from "nanoid";

const port = process.env.PORT || 3000;

const app = new Koa();
const router = new Router();

if (process.env.NODE_ENV === "development") {
    app.use(logger());
}

interface link {
    readonly slug: string;
    readonly url: string;
}

const links: link[] = [{ slug: "ggoodale", url: "https://www.google.com" }];

const nanoid = customAlphabet(urlAlphabet, 12);

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        // @ts-ignore
        ctx.status = err?.status || 500;
        ctx.body = "Something leaked! We'll fix the pipes";

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

    const id = nanoid();

    links.push({ slug: id, url: url });
    ctx.body = `${ctx.request.URL.origin}/${id}`;
});

app.on("error", (err, ctx) => {
    console.error("Server Error : ", err, ctx);
});

app.use(router.routes()).listen(port);
