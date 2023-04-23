addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const openaikey = 'Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const myua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
const apipassword = 'Bearer 12345678';

async function handleRequest(request) {
    const mbody = await request.clone().text();
    const url = new URL(request.url);
    const headers_Origin = request.headers.get("Access-Control-Allow-Origin") || "*"
    if ((url.pathname.endsWith('/completions') || url.pathname.endsWith('/generations') ||
            url.pathname.endsWith('/transcriptions') || url.pathname.endsWith('/edits') ||
            url.pathname.endsWith('/embeddings') || url.pathname.endsWith('/translations') ||
            url.pathname.endsWith('/variations') || url.pathname.endsWith('/files') ||
            url.pathname.endsWith('/fine-tunes') || url.pathname.endsWith('/moderations')) &&
        (request.method === 'POST' || request.method === 'GET')) {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== apipassword) {
            return new Response('Wrong Password', {
                status: 401
            });
        }
    }
    if (url.pathname.startsWith('/openai') || url.pathname.startsWith('/v1')) {
        const TELEGRAPH_URL = 'https://api.openai.com';
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, '');
        url.pathname = url.pathname.replace(/^\/openai\//, '/');
        let modifiedRequest = new Request(url.toString(), {
            headers: request.headers,
            method: request.method,
            body: request.body,
            redirect: 'follow'
        });
        modifiedRequest.headers.set('authorization', openaikey);
        modifiedRequest.headers.set('content-type', 'application/json');
        modifiedRequest.headers.set('origin', 'https://bettergpt.chat');
        modifiedRequest.headers.set('referer', 'https://bettergpt.chat/');
        modifiedRequest.headers.set('user-agent', myua);
        if (request.method === 'POST' && url.pathname.endsWith('/completions')) {
            const requestBody = await JSON.parse(mbody);
            const messages = requestBody.messages;
            if (!messages || messages.length === 0) {
                return new Response('Invalid request body', {
                    status: 400
                });
            }
            const lastMessage = messages[messages.length - 1];
            const lastMessageContent = lastMessage.content;
            if (lastMessageContent.startsWith('WEB1 ')) {
                const query = lastMessageContent.substring(5, 55);
                const limit = 5;
                const searchUrl = `https://ddg-api.herokuapp.com/search?query=${query}&limit=${limit}`;
                const searchResponse = await fetch(searchUrl);
                const searchResults = await searchResponse.json();
                const currentDate = new Date();
                const snippets = searchResults.map(result => `'${result.snippet}'`).join(',');
                const newLastMessageContent =
                    `${lastMessageContent.substring(5)}\n\ncurrent date:${currentDate.toLocaleString()} UTC\n\nInstructions: Here are some extra web search results below, use them if needed.\n${snippets}`;

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

    return new Response('Not Found', {
        status: 404
    });
}
