addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      ({ stack }) =>
        new Response(stack, {
          headers: { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
          status: 500,
        })
    )
  );
});
async function handleRequest(request) {
  const cspHeaders = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
  if (request.url === `${new URL(request.url).origin}/`) {
    const reqBody = await request.clone().text();
    const requestData = { url: request.url, method: request.method, data: reqBody, headers: Object.fromEntries(request.headers), cf: Object.fromEntries(Object.entries(request.cf)) };
    return new Response(JSON.stringify(requestData, null, 2), {
      headers: cspHeaders,
    });
  }
  function httpErrorHandler(httpCode) {
    function returnCode(msg) {
      return new Response(JSON.stringify({ error: { message: `${httpCode} ${msg}`, code: httpCode } }, null, 2), { headers: cspHeaders, status: httpCode });
    }
    const httpCodes = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      408: "Request Timeout",
      410: "Gone",
      413: "Payload Too Large",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
    };
    return httpCodes[httpCode] ? returnCode(httpCodes[httpCode]) : null;
  }
  if (request.method !== "POST" && request.method !== "GET" && request.method !== "OPTIONS") {
    return httpErrorHandler(405);
  }
  const url = new URL(request.url);
  const validPaths = ["completions", "generations", "transcriptions", "edits", "embeddings", "translations", "variations", "files", "fine-tunes", "moderations", "models"];
  const unrestrictedPaths = ["usage", "login", "getDetails"];
  const fakeModelsUrl = "https://gist.githubusercontent.com/DoingDog/5d9f8228d02645bb2ace999de796e5b9/raw/fakeModels.json";
  const messageBody = await request.clone().text();
  const urlPathname = url.pathname.split("?")[0].split("/").pop();
  const myopenaikeys = typeof API_KEY !== "undefined" && API_KEY !== "" ? API_KEY.split(",") : ["sk-xxxxxxxxxx"];
  const mykamiyatokens = typeof KAMIYA_TOKEN !== "undefined" && KAMIYA_TOKEN !== "" ? KAMIYA_TOKEN.split(",") : ["eyxxxx.eyxxxx"];
  const myapipasswords = typeof PASSWORD !== "undefined" && PASSWORD !== "" ? PASSWORD.split(",") : ["cpcw"];
  let openaikey = `Bearer ${myopenaikeys[Math.floor(Math.random() * myopenaikeys.length)]}`;
  let kamiyatoken = `Bearer ${mykamiyatokens[Math.floor(Math.random() * mykamiyatokens.length)]}`;
  if (validPaths.includes(urlPathname) && (request.method === "POST" || request.method === "GET")) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return httpErrorHandler(401);
    }
    const authHeaderValue = authHeader.substring("Bearer ".length);
    if (!myapipasswords.includes(authHeaderValue)) {
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
    "content-type": "application/json",
    "X-Forwarded-For": "1.1.1.1",
    "X-Real-IP": "1.1.1.1",
  });
  switch (true) {
    case url.pathname.startsWith("/openai/"):
    case url.pathname.startsWith("/v1/"):
      url.host = "api.openai.com";
      url.pathname = url.pathname.replace(/^\/openai\//, "/");
      Object.assign(modifiedHeaders, {
        authorization: openaikey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/churchless/"):
      if (url.pathname.endsWith("/models")) {
        const fakeResponse = await fetch(fakeModelsUrl);
        return new Response(fakeResponse.body, {
          headers: cspHeaders,
        });
      }
      url.host = "free.churchless.tech";
      url.pathname = url.pathname.replace(/^\/churchless\//, "/");
      Object.assign(modifiedHeaders, {
        origin: "https://acheong08.github.io",
        referer: "https://acheong08.github.io/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/kamiya/"):
      if (url.pathname.endsWith("/models")) {
        const fakeResponse = await fetch(fakeModelsUrl);
        return new Response(fakeResponse.body, {
          headers: cspHeaders,
        });
      }
      url.host = "fastly-k1.kamiya.dev";
      url.pathname = url.pathname.replace(/^\/kamiya\//, "/");
      url.pathname = url.pathname.replace(/^\/v1\//, "/api/openai/");
      Object.assign(modifiedHeaders, {
        authorization: kamiyatoken,
        origin: "https://chat.kamiya.dev",
        referer: "https://chat.kamiya.dev/",
        authority: url.host,
        path: "/api/openai/chat/completions",
      });
      break;
    case url.pathname.startsWith("/kmyalogin/"):
      url.host = "fastly-k1.kamiya.dev";
      url.pathname = url.pathname.replace(/^\/kmyalogin\//, "/");
      Object.assign(modifiedHeaders, {
        authorization: kamiyatoken,
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
  Object.entries(modifiedHeaders).forEach(([key, value]) => {
    newHeaders.append(key, value);
  });
  let modifiedRequest;
  try {
    modifiedRequest = new Request(url.toString(), {
      headers: newHeaders,
      body: request.body,
      method: request.method,
      redirect: "follow",
    });
  } catch (error) {
    return httpErrorHandler(400);
  }
  if (request.method === "POST" && url.pathname.endsWith("/completions") && messageBody) {
    try {
      const requestBody = JSON.parse(messageBody);
      const messages = requestBody.messages;
      const lastMessage = messages[messages.length - 1];
      const lastMessageContent = lastMessage.content;
      const lastSecondUserMessageContent = messages[messages.length - 3]?.content || "";
      if (lastMessageContent.includes("WS[") || lastSecondUserMessageContent.includes("WS[")) {
        const queries = [];
        function matchContent(content, queries) {
          let count = 0;
          const matches = content.match(/WS\[[^\]]+\]/g);
          if (matches) {
            matches.forEach((match) => {
              const query = match.slice(3, -1);
              if (count < 2) {
                queries.push(query);
                count++;
              }
            });
          }
          return null;
        }
        matchContent(lastMessageContent, queries);
        lastSecondUserMessageContent && matchContent(lastSecondUserMessageContent, queries);
        if (queries.length >= 1) {
          const snippets = [];
          const limit = queries.length <= 2 ? 10 : 5;
          for (const query of queries) {
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
          const instructions = "Instructions: Reply to me in the language of my request or question above. Give a comprehensive answer to the question or request I have made above. Below are some results from a web search. Use them if necessary.";
          lastMessage.content = `${lastMessageContent.replace(/WS\[[^\]]*\]/g, "")}\n\nCurrent date:${new Date().toLocaleString()} UTC\n\n${instructions}\n${snippets}`;
          requestBody.messages[messages.length - 1] = lastMessage;
          modifiedRequest = new Request(modifiedRequest, {
            body: JSON.stringify(requestBody),
          });
        }
      }
    } catch (error) {
      return httpErrorHandler(400);
    }
  }
  try {
    const response = await fetch(modifiedRequest);
    const responseStatus = httpErrorHandler(response.status);
    if ((request.method === "POST" || request.method === "GET") && url.pathname.endsWith("/completions") && responseStatus) {
      return responseStatus;
    }
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set("Access-Control-Allow-Origin", request.headers.get("Access-Control-Allow-Origin") || "*");
    modifiedResponse.headers.set("Access-Control-Allow-Headers", request.headers.get("Access-Control-Allow-Headers") || "*");
    return modifiedResponse;
  } catch (err) {
    return httpErrorHandler(502);
  }
}
