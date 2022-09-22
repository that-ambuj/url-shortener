import Koa from "koa";
import type { Context } from "koa";
import Router from "@koa/router";
import serve from "koa-static";
import { urlAlphabet, customAlphabet } from "nanoid";

const app = new Koa();
const router = new Router();

interface link {
    readonly slug: string;
    readonly url: string;
}

const links: link[] = [{ slug: "ggoodale", url: "https://www.google.com" }];

const nanoid = customAlphabet(urlAlphabet, 12);

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

app.use(router.routes()).listen(3000);
