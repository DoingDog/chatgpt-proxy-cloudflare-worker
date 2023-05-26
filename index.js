addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      ({ stack }) =>
        new Response(stack, {
          headers: { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*" },
          status: 500,
        })
    )
  );
});
function httpErrorHandler(httpCode) {
  const errHeaders = { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*" };
  switch (httpCode) {
    case 400:
      return new Response("400 Bad Request", { headers: errHeaders, status: 400 });
    case 401:
      return new Response("401 Unauthorized", { headers: errHeaders, status: 401 });
    case 403:
      return new Response("403 Forbidden", { headers: errHeaders, status: 403 });
    case 404:
      return new Response("404 Not Found", { headers: errHeaders, status: 404 });
    case 405:
      return new Response("405 Method Not Allowed", { headers: errHeaders, status: 405 });
    case 408:
      return new Response("408 Request Timeout", { headers: errHeaders, status: 408 });
    case 410:
      return new Response("410 Gone", { headers: errHeaders, status: 410 });
    case 413:
      return new Response("413 Payload Too Large", { headers: errHeaders, status: 413 });
    case 429:
      return new Response("429 Too Many Requests", { headers: errHeaders, status: 429 });
    case 500:
      return new Response("500 Internal Server Error", { headers: errHeaders, status: 500 });
    case 502:
      return new Response("502 Bad Gateway", { headers: errHeaders, status: 502 });
    case 503:
      return new Response("503 Service Unavailable", { headers: errHeaders, status: 503 });
    default:
      return null;
  }
}
async function handleRequest(request) {
  if (request.method !== "POST" && request.method !== "GET" && request.method !== "OPTIONS") {
    return httpErrorHandler(405);
  }
  const url = new URL(request.url);
  const headers_Origin = request.headers.get("Access-Control-Allow-Origin") || "*";
  const validPaths = ["completions", "generations", "transcriptions", "edits", "embeddings", "translations", "variations", "files", "fine-tunes", "moderations"];
  const unrestrictedPaths = ["usage", "login", "getDetails"];
  const mbody = await request.clone().text();
  const urlPathname = url.pathname.split("?")[0].split("/").pop();
  let openaikey = myopenaikeys[Math.floor(Math.random() * myopenaikeys.length)];
  let kamiyatoken = mykamiyatokens[Math.floor(Math.random() * mykamiyatokens.length)];
  let endpoint = "ini",
    TELEGRAPH_URL = "ini";
  if (validPaths.includes(urlPathname) && (request.method === "POST" || request.method === "GET")) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return httpErrorHandler(401);
    }
    if (!myapipasswords.includes(authHeader)) {
      openaikey = authHeader;
      kamiyatoken = authHeader;
    }
  } else if (!validPaths.includes(urlPathname) && !unrestrictedPaths.includes(urlPathname)) {
    return httpErrorHandler(403);
  }
  switch (true) {
    case url.pathname.startsWith("/openai"):
    case url.pathname.startsWith("/v1"):
      TELEGRAPH_URL = "https://api.openai.com";
      url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
      url.pathname = url.pathname.replace(/^\/openai\//, "/");
      endpoint = "openai";
      break;
    case url.pathname.startsWith("/churchless"):
      TELEGRAPH_URL = "https://free.churchless.tech";
      url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
      url.pathname = url.pathname.replace(/^\/churchless\//, "/");
      endpoint = "churchless";
      break;
    case url.pathname.startsWith("/kamiya"):
      TELEGRAPH_URL = "https://fastly-k1.kamiya.dev";
      url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
      url.pathname = url.pathname.replace(/^\/kamiya\//, "/");
      url.pathname = url.pathname.replace(/^\/v1\//, "/api/openai/");
      endpoint = "kamiya";
      break;
    case url.pathname.startsWith("/kmyalogin"):
      TELEGRAPH_URL = "https://fastly-k1.kamiya.dev";
      url.host = TELEGRAPH_URL.replace(/^https?:\/\//, "");
      url.pathname = url.pathname.replace(/^\/kmyalogin\//, "/");
      endpoint = "kmyalogin";
      break;
    default:
      return httpErrorHandler(404);
      break;
  }
  let modifiedRequest = new Request(url.toString(), {
    headers: request.headers,
    body: request.body,
    method: request.method,
    redirect: "follow",
  });
  modifiedRequest.headers.set("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
  modifiedRequest.headers.set("sec-ch-ua", '"Chromium";v="116", "Google Chrome";v="116", "Not:A-Brand";v="99"');
  modifiedRequest.headers.set("sec-ch-ua-mobile", "?0");
  modifiedRequest.headers.set("sec-ch-ua-platform", '"macOS"');
  modifiedRequest.headers.set("sec-fetch-dest", "empty");
  modifiedRequest.headers.set("sec-fetch-mode", "cors");
  modifiedRequest.headers.set("sec-fetch-site", "same-site");
  modifiedRequest.headers.set("Pragma", "no-cache");
  modifiedRequest.headers.set("Cache-Control", "no-cache");
  switch (endpoint) {
    case "openai":
      modifiedRequest.headers.set("authorization", openaikey);
      modifiedRequest.headers.set("content-type", "application/json");
      modifiedRequest.headers.set("origin", "https://bettergpt.chat");
      modifiedRequest.headers.set("referer", "https://bettergpt.chat/");
      modifiedRequest.headers.set("authority", "api.openai.com");
      break;
    case "churchless":
      modifiedRequest.headers.set("authorization", "Bearer sk-none");
      modifiedRequest.headers.set("content-type", "application/json");
      modifiedRequest.headers.set("origin", "https://acheong08.github.io");
      modifiedRequest.headers.set("referer", "https://acheong08.github.io/");
      modifiedRequest.headers.set("authority", "free.churchless.tech");
      break;
    case "kamiya":
      modifiedRequest.headers.set("authorization", kamiyatoken);
      modifiedRequest.headers.set("content-type", "application/json");
      modifiedRequest.headers.set("origin", "https://chat.kamiya.dev");
      modifiedRequest.headers.set("referer", "https://chat.kamiya.dev/");
      modifiedRequest.headers.set("authority", "fastly-k1.kamiya.dev");
      modifiedRequest.headers.set("path", "/api/openai/chat/completions");
      break;
    case "kmyalogin":
      modifiedRequest.headers.set("authorization", kamiyatoken);
      modifiedRequest.headers.set("content-type", "application/json");
      modifiedRequest.headers.set("origin", "https://www.kamiya.dev");
      modifiedRequest.headers.set("referer", "https://www.kamiya.dev/");
      modifiedRequest.headers.set("authority", "fastly-k1.kamiya.dev");
      break;
    default:
      return httpErrorHandler(404);
      break;
  }
  if (request.method === "POST" && url.pathname.endsWith("/completions") && mbody) {
    const requestBody = await JSON.parse(mbody);
    const messages = requestBody.messages;
    const lastMessage = messages[messages.length - 1];
    const lastMessageContent = lastMessage.content;
    const lastSecondUserMessage = messages[messages.length - 3];
    let lastSecondUserMessageContent = "";
    if (lastSecondUserMessage) {
      lastSecondUserMessageContent = lastSecondUserMessage.content;
    }
    if (lastMessageContent.includes("WS[") || lastSecondUserMessageContent.includes("WS[")) {
      let queries = [];
      function matchContent(content, queries) {
        let count = 0;
        const matches = content.match(/WS\[[^\]]+\]/g);
        if (matches) {
          for (let match of matches) {
            const query = match.slice(3, -1);
            if (count < 2) {
              queries.push(query);
              count++;
            }
          }
        }
        return null;
      }
      matchContent(lastMessageContent, queries);
      if (lastSecondUserMessageContent) {
        matchContent(lastSecondUserMessageContent, queries);
      }
      if (queries.length >= 1) {
        let snippets = [];
        const limit = queries.length <= 2 ? 10 : 5;
        for (let query of queries) {
          try {
            const searchResponse = await fetch(`https://api-ddg.iii.hair/search?q=${query}&max_results=${limit}`);
            const searchResults = await searchResponse.json();
            const currentSnippet = searchResults.map(({ title, body, href }) => `'${title}' : ${body} ; (${href})`).join("\n");
            snippets.push(`\n\n[${query}]\n${currentSnippet}`);
          } catch (err) {
            try {
              const searchResponse = await fetch(`https://ddg-api.herokuapp.com/search?query=${query}&limit=${limit}`);
              const searchResults = await searchResponse.json();
              const currentSnippet = searchResults.map(({ title, snippet, link }) => `'${title}' : ${snippet} ; (${link})`).join("\n");
              snippets.push(`\n\n[${query}]\n${currentSnippet}`);
            } catch (err) {
              return httpErrorHandler(502);
            }
          }
        }
        const instructions = "Instructions: Answer me in the language used in my request or question above. Answer the questions or requests I made above in a comprehensive way. Below are some web search results. Use them if you need.";
        lastMessage.content = `${lastMessageContent.replace(/WS\[[^\]]*\]/g, "")}\n\nCurrent date:${new Date().toLocaleString()} UTC\n\n${instructions}\n${snippets}`;
        requestBody.messages[messages.length - 1] = lastMessage;
        modifiedRequest = new Request(modifiedRequest, {
          body: JSON.stringify(requestBody),
        });
      }
    }
  }
  try {
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    const responseStatus = httpErrorHandler(modifiedResponse.status);
    if ((request.method === "POST" || request.method === "GET") && url.pathname.endsWith("/completions") && responseStatus) {
      return responseStatus;
    }
    modifiedResponse.headers.set("Access-Control-Allow-Origin", headers_Origin);
    return modifiedResponse;
  } catch (err) {
    return httpErrorHandler(502);
  }
}
