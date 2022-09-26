<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

const baseURL = "http://localhost:3000/api";

interface link {
    id: number;
    mask: string;
    target: string;
}

let id = 0;

const targetURL: Ref<string> = ref("https://");
const generatedURLs: Ref<link[]> = ref([]);
const copyBtnText: Ref<string> = ref("Copy");

const lastURL: Ref<string> = ref("");

async function generateUrl(): Promise<void> {
    const res = await fetch(`${baseURL}/shorten`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetURL.value }),
    });

    if (!res.ok) {
        console.log(res.status);
        return;
    }

    const responseObj = await res.json();

    generatedURLs.value.push(responseObj);
    setGeneratedLinks(generatedURLs.value);

    targetURL.value = "https://";
    lastURL.value = responseObj.mask;

    navigator.clipboard.writeText(lastURL.value?.toString());
}

function copyMainURL(): void {
    navigator.clipboard.writeText(lastURL.value);
    copyBtnText.value = "Done!";

    setTimeout(() => {
        copyBtnText.value = "Copy";
    }, 5000);
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
    setGeneratedLinks(generatedURLs.value);
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
    <div v-auto-animate v-if="lastURL !== ''" class="flex-center">
        <div>The below url is already copied to your clipboard!</div>
        <div id="result">
            {{ lastURL }}
            <button id="copy" @click="copyMainURL">
                {{ copyBtnText }}
            </button>
        </div>
    </div>
    <div v-if="generatedURLs.length !== 0">
        <h2>Your Generated URLs</h2>
        <ul v-auto-animate>
            <li v-for="url in generatedURLs" key="url.id">
                <div class="block">
                    <div id="heading">{{ url.mask }}</div>
                    <div>{{ url.target }}</div>
                </div>
                <div class="buttons">
                    <button id="blue" @click="copyToClipboard(url.mask)">
                        Copy
                    </button>
                    <button id="delete" @click="deleteURL(url)">Delete</button>
                </div>
            </li>
        </ul>
    </div>
</template>
