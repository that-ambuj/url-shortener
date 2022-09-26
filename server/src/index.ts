import * as dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import type { Context } from "koa";
import Router from "@koa/router";
import serve from "koa-static";
import logger from "koa-logger";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";

import { customAlphabet } from "nanoid";

import { PrismaClient } from "@prisma/client";
import type { Link } from "@prisma/client";

const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

const app = new Koa();
const router = new Router();

app.use(bodyParser());

if (app.env === "dev") {
    app.use(logger());
    app.use(cors({ origin: "http://localhost:5173" }));
}

const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    10
);

// error handler middleware
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err: any) {
        ctx.status = err.status || 500;
        ctx.body = err.message || "Oops! Something doesn't look right.";

        ctx.app.emit("error", err, ctx);
    }
});

// serve frontend build on request to host
app.use(serve("../frontend/dist/"));

router.get("/:slug", async (ctx: Context) => {
    const slug = ctx.params.slug;
    const correctLink: Link | null = await prisma.link.findUnique({
        where: { slug },
    });
    if (correctLink === null) {
        ctx.throw(400, "Wrong URL identifier");
    }
    ctx.redirect(correctLink?.target);
});

router.post("/api/shorten", async (ctx: Context) => {
    const url: string | undefined = ctx.request?.body?.url?.toString();
    if (url === undefined) {
        ctx.throw(400, "Please provide a URL to shorten.");
    }
    const urlRegex =
        /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    if (!urlRegex.test(url)) {
        ctx.throw(400, "Please provide a valid URL");
    }

    const slug = nanoid();

    const newLink: Link = await prisma.link.create({
        data: { slug: slug, target: url },
    });
    ctx.status = 201;
    ctx.body = {
        id: newLink.id,
        target: newLink.target,
        mask: `${ctx.URL.host}/${slug}`,
    };
});

router.delete("/api/delete", async (ctx: Context) => {
    const id: string | undefined = ctx.request?.body?.id?.toString();
    if (id === undefined) {
        ctx.throw(400, "Please provides an ID.");
    }
    await prisma.link.delete({
        where: {
            id: parseInt(id),
        },
    });

    ctx.status = 204;
    return;
});

app.on("error", (err, ctx) => {
    console.error("Server Error : ", err, ctx);
});

app.use(router.routes()).listen(port, () => {
    console.log(`This Koa server is listening on port: ${port}`);
});
