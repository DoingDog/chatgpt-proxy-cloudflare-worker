addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
const myopenaikey = 'Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const myapipassword = 'Bearer 12345678';



const myua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
async function handleRequest(request) {
    const mbody = await request.clone().text();
    const url = new URL(request.url);
    let rp = 'ini';
    let openaikey = 'ini';
    const headers_Origin = request.headers.get("Access-Control-Allow-Origin") || "*"
    if ((url.pathname.endsWith('/completions') || url.pathname.endsWith('/generations') ||
            url.pathname.endsWith('/transcriptions') || url.pathname.endsWith('/edits') ||
            url.pathname.endsWith('/embeddings') || url.pathname.endsWith('/translations') ||
            url.pathname.endsWith('/variations') || url.pathname.endsWith('/files') ||
            url.pathname.endsWith('/fine-tunes') || url.pathname.endsWith('/moderations')) &&
        (request.method === 'POST' || request.method === 'GET')) {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response('No Password. Enter password or use your own key.', {
                status: 401
            });
        } else if (authHeader !== myapipassword) {
            openaikey = authHeader;
        } else {
            openaikey = myopenaikey;
        }
    }
    if (url.pathname.startsWith('/openai') || url.pathname.startsWith('/v1')) {
        const TELEGRAPH_URL = 'https://api.openai.com';
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, '');
        url.pathname = url.pathname.replace(/^\/openai\//, '/');
        rp = 'openai';
    } else if (url.pathname.startsWith('/churchless')) {
        const TELEGRAPH_URL = 'https://free.churchless.tech';
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, '');
        url.pathname = url.pathname.replace(/^\/churchless\//, '/');
        rp = 'churchless';
    } else {
        return new Response('Not Found', {
            status: 404
        });
        rp = '404';
    }
    let modifiedRequest = new Request(url.toString(), {
        headers: request.headers,
        method: request.method,
        body: request.body,
        redirect: 'follow'
    });
    modifiedRequest.headers.set('user-agent', myua);
    if (rp === 'openai') {
        modifiedRequest.headers.set('authorization', openaikey);
        modifiedRequest.headers.set('content-type', 'application/json');
        modifiedRequest.headers.set('origin', 'https://bettergpt.chat');
        modifiedRequest.headers.set('referer', 'https://bettergpt.chat/');
    } else if (rp === 'churchless') {
        modifiedRequest.headers.set('authorization', 'Bearer sk-none');
        modifiedRequest.headers.set('content-type', 'application/json');
        modifiedRequest.headers.set('origin', 'https://acheong08.github.io');
        modifiedRequest.headers.set('referer', 'https://acheong08.github.io/');
    }
    if (request.method === 'POST' && url.pathname.endsWith('/completions')) {
        const requestBody = await JSON.parse(mbody);
        const messages = requestBody.messages;
        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage.content;
        if (lastMessageContent.includes("WS[")) {
            const lastSecondUserMessage = messages[messages.length - 3];
            let lastSecondUserMessageContent = '';
            if (lastSecondUserMessage) {
                lastSecondUserMessageContent = lastSecondUserMessage.content;
            }
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
                const matches2 = lastSecondUserMessageContent.match(/WS\[([^\]]+)\]/g);
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
            let limit = 2;
            let snippets = [];
            if (queries.length <= 2) {
                limit = 4;
            }
            if (queries) {
                for (let query of queries) {
                    const searchUrl = `https://ddg-api.herokuapp.com/search?query=${query}&limit=${limit}`;
                    const searchResponse = await fetch(searchUrl);
                    const searchResults = await searchResponse.json();
                    const currentSnippet = searchResults.map(result => `${result.snippet}`).join('\n');
                    const currentSnippetWithQuery = `\n\n[${query}]\n${currentSnippet}`;
                    snippets.push(currentSnippetWithQuery);
                }
            }
            const currentDate = new Date();
            const instructions =
                "Instructions: Answer me in the language used in my request or question above. Answer the questions or requests I made above in a comprehensive way. Below are some web search results. Use them if you need.";
            const regexws = /WS\[[^\]]*\]/g;
            const replcedLastMessageContent = lastMessageContent.replace(regexws, '');
            const newLastMessageContent =
                `${replcedLastMessageContent}\n\nCurrent date:${currentDate.toLocaleString()} UTC\n\n${instructions}\n${snippets}`;
            lastMessage.content = newLastMessageContent;
            requestBody.messages[messages.length - 1] = lastMessage;
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(JSON.stringify(requestBody));
            modifiedRequest = new Request(modifiedRequest, {
                body: JSON.stringify(requestBody)
            });
        }
    }
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', headers_Origin);
    return modifiedResponse;
}
