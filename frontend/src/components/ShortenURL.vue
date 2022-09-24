<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

const baseURL = "http://localhost:3000";

interface link {
    id: number;
    mask: string;
    target: string;
}

let id = 0;

const targetURL: Ref<string> = ref("https://");
const generatedURLs: Ref<link[]> = ref([]);

const lastURL: Ref<string> = ref("");

async function generateUrl(): Promise<void> {
    const res = await fetch(`${baseURL}/shorten?url=${targetURL.value}`, {
        method: "POST",
    });

    if (!res.ok) {
        console.log(res.status, " ", res.json());
        return;
    }

    const responseObj = await res.json();

    generatedURLs.value.push(responseObj);

    targetURL.value = "https://";
    lastURL.value = responseObj.mask;

    copyToClipboard(lastURL.value?.toString());
}

function copyToClipboard(string: string): void {
    navigator.clipboard.writeText(string);
}

function setGeneratedLinks(links: link[]): void {
    window.localStorage.setItem("Links", JSON.stringify(links));
}

function getGeneratedLinks(): link[] {
    const links: string | null = window.localStorage.getItem("Links");
    if (links === null) {
        return [];
    }
    return JSON.parse(links);
}

async function deleteURL(link: link): Promise<void> {
    const res = await fetch(`${baseURL}/delete?id=${link.id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        // TODO handle error
        return;
    }
    generatedURLs.value = generatedURLs.value.filter((l) => l !== link);
}

onMounted(() => {
    generatedURLs.value = getGeneratedLinks();
});

onUnmounted(() => {
    setGeneratedLinks(generatedURLs.value);
    generatedURLs.value = [];
});
</script>

<template>
    <div id="title" class="flex-center">
        <h1>URL Shortener</h1>
        <div id="sub-title">
            Designed and Developed by
            <a href="https://www.github.com/that-ambuj/">Ambuj Singh</a>
        </div>
    </div>
    <form @submit.prevent="generateUrl">
        <input
            id="url"
            v-model="targetURL"
            type="url"
            placeholder="Enter a URL"
            autocomplete="off"
        />
        <button class="btn">Shorten!</button>
    </form>
    <div v-auto-animate v-if="lastURL !== ''" id="result">
        <div>The below url is already copied to your clipboard!</div>
        {{ lastURL }}
        <button id="copy" @click="copyToClipboard(lastURL)">Copy</button>
    </div>
    <div v-if="generatedURLs.length !== 0">
        <h2>Your Generated URLs</h2>
        <ul v-auto-animate>
            <li v-for="url in generatedURLs" key="url.id">
                <div class="block">
                    <div id="heading">{{ url.mask }}</div>
                    <div>{{ url.target }}</div>
                </div>
                <button @click="deleteURL(url)">Delete</button>
            </li>
        </ul>
    </div>
</template>

<style lang="scss"></style>
