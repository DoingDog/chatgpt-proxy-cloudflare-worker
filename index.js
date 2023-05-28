const myopenaikeys = ["Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"],
  mykamiyatokens = ["not set"],
  myapipasswords = ["Bearer 11111111"];

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
async function handleRequest(request) {
  if (request.url === `${new URL(request.url).origin}/`) {
    const reqHeaders = {};
    for (const [name, value] of request.headers.entries()) {
      reqHeaders[name] = value;
    }
    const requestData = {
      url: request.url,
      method: request.method,
      headers: reqHeaders,
    };
    return new Response(JSON.stringify(requestData, null, 2), {
      headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }
  function httpErrorHandler(httpCode) {
    const errHeaders = { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
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
  const modifiedHeaders = Object.fromEntries(request.headers);
  Object.assign(modifiedHeaders, {
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Chromium";v="116", "Google Chrome";v="116", "Not:A-Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
  });
  switch (true) {
    case url.pathname.startsWith("/openai"):
    case url.pathname.startsWith("/v1"):
      url.host = "api.openai.com";
      url.pathname = url.pathname.replace(/^\/openai\//, "/");
      Object.assign(modifiedHeaders, {
        authorization: openaikey,
        "content-type": "application/json",
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/churchless"):
      url.host = "free.churchless.tech";
      url.pathname = url.pathname.replace(/^\/churchless\//, "/");
      Object.assign(modifiedHeaders, {
        authorization: "Bearer sk-none",
        "content-type": "application/json",
        origin: "https://acheong08.github.io",
        referer: "https://acheong08.github.io/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/kamiya"):
      url.host = "fastly-k1.kamiya.dev";
      url.pathname = url.pathname.replace(/^\/kamiya\//, "/");
      url.pathname = url.pathname.replace(/^\/v1\//, "/api/openai/");
      Object.assign(modifiedHeaders, {
        authorization: kamiyatoken,
        "content-type": "application/json",
        origin: "https://chat.kamiya.dev",
        referer: "https://chat.kamiya.dev/",
        authority: url.host,
        path: "/api/openai/chat/completions",
      });
      break;
    case url.pathname.startsWith("/kmyalogin"):
      url.host = "fastly-k1.kamiya.dev";
      url.pathname = url.pathname.replace(/^\/kmyalogin\//, "/");
      Object.assign(modifiedHeaders, {
        authorization: kamiyatoken,
        "content-type": "application/json",
        origin: "https://www.kamiya.dev",
        referer: "https://www.kamiya.dev/",
        authority: url.host,
      });
      break;
    default:
      return httpErrorHandler(404);
      break;
  }
  const newHeaders = new Headers();
  for (const [key, value] of Object.entries(modifiedHeaders)) {
    newHeaders.append(key, value);
  }
  let modifiedRequest = new Request(url.toString(), {
    headers: newHeaders,
    body: request.body,
    method: request.method,
    redirect: "follow",
  });
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
