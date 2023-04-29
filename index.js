const myopenaikey =
    "Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const myapipassword = "Bearer 12345678";



const myua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) =>
                new Response(err.stack, {
                    status: 500,
                })
        )
    );
});
async function handleRequest(request) {
    const mbody = await request.clone().text();
    const url = new URL(request.url);
    let rp = "ini";
    let openaikey = ini;
    let TELEGRAPH_URL = "ini";
    const headers_Origin =
        request.headers.get("Access-Control-Allow-Origin") || "*";
    if (
        (url.pathname.endsWith("/completions") ||
            url.pathname.endsWith("/generations") ||
            url.pathname.endsWith("/transcriptions") ||
            url.pathname.endsWith("/edits") ||
            url.pathname.endsWith("/embeddings") ||
            url.pathname.endsWith("/translations") ||
            url.pathname.endsWith("/variations") ||
            url.pathname.endsWith("/files") ||
            url.pathname.endsWith("/fine-tunes") ||
            url.pathname.endsWith("/moderations")) &&
        (request.method === "POST" || request.method === "GET")
    ) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return new Response(null, {
                status: 401,
            });
        } else if (authHeader !== myapipassword) {
            openaikey = authHeader;
        } else {
            openaikey = myopenaikey;
        }
    }
    if (url.pathname.startsWith("/openai") || url.pathname.startsWith("/v1")) {
        TELEGRAPH_URL = "https://api.openai.com";
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
        url.pathname = url.pathname.replace(/^\/openai\//, "/");
        rp = "openai";
    } else if (url.pathname.startsWith("/churchless")) {
        TELEGRAPH_URL = "https://free.churchless.tech";
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
        url.pathname = url.pathname.replace(/^\/churchless\//, "/");
        rp = "churchless";
    } else {
        return new Response(null, {
            status: 404,
        });
    }
    let modifiedRequest = new Request(url.toString(), {
        headers: request.headers,
        body: request.body,
        method: request.method,
        redirect: "follow",
    });
    modifiedRequest.headers.set("user-agent", myua);
    modifiedRequest.headers.set(
        "sec-ch-ua",
        '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"'
    );
    modifiedRequest.headers.set("sec-ch-ua-mobile", "?0");
    modifiedRequest.headers.set("sec-ch-ua-platform", '"macOS"');
    modifiedRequest.headers.set("sec-fetch-dest", "empty");
    modifiedRequest.headers.set("sec-fetch-mode", "cors");
    modifiedRequest.headers.set("sec-fetch-site", "same-origin");
    modifiedRequest.headers.set("Pragma", "no-cache");
    modifiedRequest.headers.set("Cache-Control", "no-cache");
    if (rp === "openai") {
        modifiedRequest.headers.set("authorization", openaikey);
        modifiedRequest.headers.set("content-type", "application/json");
        modifiedRequest.headers.set("origin", "https://bettergpt.chat");
        modifiedRequest.headers.set("referer", "https://bettergpt.chat/");
        modifiedRequest.headers.set("authority", "api.openai.com");
    } else if (rp === "churchless") {
        modifiedRequest.headers.set("authorization", "Bearer sk-none");
        modifiedRequest.headers.set("content-type", "application/json");
        modifiedRequest.headers.set("origin", "https://acheong08.github.io");
        modifiedRequest.headers.set("referer", "https://acheong08.github.io/");
        modifiedRequest.headers.set("authority", "free.churchless.tech");
    }
    if (
        request.method === "POST" &&
        url.pathname.endsWith("/completions") &&
        mbody
    ) {
        const requestBody = await JSON.parse(mbody);
        const messages = requestBody.messages;
        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage.content;
        const lastSecondUserMessage = messages[messages.length - 3];
        let lastSecondUserMessageContent = "";
        if (lastSecondUserMessage) {
            lastSecondUserMessageContent = lastSecondUserMessage.content;
        }
        if (
            lastMessageContent.includes("WS[") ||
            lastSecondUserMessageContent.includes("WS[")
        ) {
            let queries = [];
            let count = 0;
            const matches = lastMessageContent.match(/WS\[([^\]]+)\]/g);
            if (matches) {
                for (let match of matches) {
                    const query = match.slice(3, -1);
                    if (count < 2) {
                        queries.push(query);
                        count++;
                    }
                }
            }
            count = 0;
            if (lastSecondUserMessageContent) {
                const matches2 =
                    lastSecondUserMessageContent.match(/WS\[([^\]]+)\]/g);
                if (matches2) {
                    for (let match of matches2) {
                        const query = match.slice(3, -1);
                        if (count < 2) {
                            queries.push(query);
                            count++;
                        }
                    }
                }
            }
            let limit = 5;
            let snippets = [];
            if (queries.length <= 2) {
                limit = 10;
            }
            if (queries) {
                for (let query of queries) {
                    try {
                        const searchUrl = `https://duckduckgo-api.vercel.app/search?q=${query}&max_results=${limit}`;
                        const searchResponse = await fetch(searchUrl);
                        const searchResults = await searchResponse.json();
                        const currentSnippet = searchResults
                            .map(
                                (result) =>
                                    `'${result.title}' : ${result.body} ; (${result.href})`
                            )
                            .join("\n");
                        const currentSnippetWithQuery = `\n\n[${query}]\n${currentSnippet}`;
                        snippets.push(currentSnippetWithQuery);
                    } catch (err) {
                        try {
                            const searchUrl = `https://api-ddg.iii.hair/search?q=${query}&max_results=${limit}`;
                            const searchResponse = await fetch(searchUrl);
                            const searchResults = await searchResponse.json();
                            const currentSnippet = searchResults
                                .map(
                                    (result) =>
                                        `'${result.title}' : ${result.body} ; (${result.href})`
                                )
                                .join("\n");
                            const currentSnippetWithQuery = `\n\n[${query}]\n${currentSnippet}`;
                            snippets.push(currentSnippetWithQuery);
                        } catch (err) {
                            try {
                                const searchUrl = `https://ddg-api.herokuapp.com/search?query=${query}&limit=${limit}`;
                                const searchResponse = await fetch(searchUrl);
                                const searchResults =
                                    await searchResponse.json();
                                const currentSnippet = searchResults
                                    .map(
                                        (result) =>
                                            `'${result.title}' : ${result.snippet} ; (${result.link})`
                                    )
                                    .join("\n");
                                const currentSnippetWithQuery = `\n\n[${query}]\n${currentSnippet}`;
                                snippets.push(currentSnippetWithQuery);
                            } catch (err) {
                                return new Response(null, {
                                    status: 502,
                                });
                            }
                        }
                    }
                }
            }
            const currentDate = new Date();
            const instructions =
                "Instructions: Answer me in the language used in my request or question above. Answer the questions or requests I made above in a comprehensive way. Below are some web search results. Use them if you need.";
            const regexws = /WS\[[^\]]*\]/g;
            const replcedLastMessageContent = lastMessageContent.replace(
                regexws,
                ""
            );
            const newLastMessageContent = `${replcedLastMessageContent}\n\nCurrent date:${currentDate.toLocaleString()} UTC\n\n${instructions}\n${snippets}`;
            lastMessage.content = newLastMessageContent;
            requestBody.messages[messages.length - 1] = lastMessage;
            modifiedRequest = new Request(modifiedRequest, {
                body: JSON.stringify(requestBody),
            });
        }
    }
    try {
        const response = await fetch(modifiedRequest);
        const modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set(
            "Access-Control-Allow-Origin",
            headers_Origin
        );
        return modifiedResponse;
    } catch (err) {
        return new Response(null, {
            status: 502,
        });
    }
}
