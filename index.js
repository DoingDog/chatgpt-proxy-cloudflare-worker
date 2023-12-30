addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      ({ stack }) =>
        new Response(stack, {
          headers: { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
          status: 500,
        }),
    ),
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
  if (request.method == "OPTIONS") {
    return new Response(null, {
      headers: { "Content-Type": "text/plain;charset=utf8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
      status: 204,
    });
  }
  if (request.method !== "POST" && request.method !== "GET") {
    return httpErrorHandler(405);
  }
  const url = new URL(request.url);
  const validPaths = ["completions", "generations", "transcriptions", "edits", "embeddings", "translations", "variations", "files", "fine-tunes", "moderations", "models", "listBaseModel", "openai", "kamiya", "generate", "conversation", "3p", "bjq", "ato"];
  const unrestrictedPaths = ["usage", "getDetails", "history", "subscription", "info"];
  const fakeModelsUrl = "https://gist.githubusercontent.com/DoingDog/5d9f8228d02645bb2ace999de796e5b9/raw/fakeModels.json";
  const messageBody = await request.clone().text();
  const urlPathname = url.pathname.split("?")[0].split("/").pop();
  const myopenaikeys = typeof API_KEY !== "undefined" && API_KEY !== "" ? API_KEY.split(",") : ["sk-xxxxxxxxxx"];
  let gptapikey = typeof GPTAPI_KEY !== "undefined" && GPTAPI_KEY !== "" ? GPTAPI_KEY : "sk-xxxxxxxxxx";
  let bjqkey = typeof BJQ_KEY !== "undefined" && BJQ_KEY !== "" ? BJQ_KEY : "sk-xxxxxxxxxx";
  const gptapiaccesstoken = typeof GPTAPI_TOKEN !== "undefined" && GPTAPI_TOKEN !== "" ? GPTAPI_TOKEN : "abcdefg";
  const mykamiyatokens = typeof KAMIYA_TOKEN !== "undefined" && KAMIYA_TOKEN !== "" ? KAMIYA_TOKEN.split(",") : ["sk-xxxxxxxxxx"];
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
      gptapikey = authHeader;
      bjqkey = authHeader;
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
    case url.pathname.startsWith("/ato"):
    case url.pathname.startsWith("/v1/"):
      if (!url.pathname.endsWith("/ato") && !url.pathname.endsWith("/completions") && !url.pathname.endsWith("/models")) {
        return httpErrorHandler(404);
      }
      url.pathname = url.pathname.replace(/^\/ato\//, "/");
      url.pathname = url.pathname.replace(/^\/ato$/, "/v1/chat/completions");
      if (request.method === "POST" && url.pathname.endsWith("/completions")) {
        const models3p = ["gpt-3.5-turbo-16k", "gpt-3.5-turbo", "gpt-4", "gpt-4-32k"];
        const atoRequestBody = await request.clone().json();
        const model = atoRequestBody.model;
        if (models3p.includes(model)) {
          url.host = "api.gptapi.us";
          Object.assign(modifiedHeaders, {
            authorization: gptapikey,
            origin: "https://bettergpt.chat",
            referer: "https://bettergpt.chat/",
            authority: url.host,
          });
        } else {
          url.host = "api.openai.one";
          Object.assign(modifiedHeaders, {
            authorization: bjqkey,
            origin: "https://bettergpt.chat",
            referer: "https://bettergpt.chat/",
            authority: url.host,
          });
        }
      } else {
        url.host = "api.gptapi.us";
        Object.assign(modifiedHeaders, {
          authorization: gptapikey,
          origin: "https://bettergpt.chat",
          referer: "https://bettergpt.chat/",
          authority: url.host,
        });
      }
      break;
    case url.pathname.startsWith("/3p"):
      url.host = "api.gptapi.us";
      url.pathname = url.pathname.replace(/^\/3p\//, "/");
      url.pathname = url.pathname.replace(/^\/3p$/, "/v1/chat/completions");
      if (url.pathname.endsWith("/info")) {
        const apiusbillingResponse = await fetch(`https://www.gptapi.us/api/user/self`, {
          headers: {
            Authorization: `Bearer ${gptapiaccesstoken}`,
          },
        });
        const apiusbillingData = await apiusbillingResponse.json();
        const apiusbilling = apiusbillingData.data.quota / 500000;
        return new Response(apiusbilling.toFixed(4), {
          headers: cspHeaders,
        });
      }
      Object.assign(modifiedHeaders, {
        authorization: gptapikey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/bjq"):
      url.host = "api.openai.one";
      url.pathname = url.pathname.replace(/^\/bjq\//, "/");
      url.pathname = url.pathname.replace(/^\/bjq$/, "/v1/chat/completions");
      if (url.pathname.endsWith("/info")) {
        const bjqbillingResponse = await fetch(`https://price.openai.one/api.php?GetData&Getkeyinfo&key=${bjqkey}`);
        const bjqbillingData = await bjqbillingResponse.json();
        return new Response(Number(bjqbillingData.remain_quota).toFixed(4), {
          headers: cspHeaders,
        });
      }
      Object.assign(modifiedHeaders, {
        authorization: bjqkey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/openai"):
      url.host = "api.openai.com";
      url.pathname = url.pathname.replace(/^\/openai\//, "/");
      url.pathname = url.pathname.replace(/^\/openai$/, "/v1/chat/completions");
      Object.assign(modifiedHeaders, {
        authorization: openaikey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/kamiya"):
      url.host = "p0.kamiya.dev";
      url.pathname = url.pathname.replace(/^\/kamiya\//, "/");
      switch (true) {
        case url.pathname.endsWith("/models"):
          const fakeResponse = await fetch(fakeModelsUrl);
          return new Response(fakeResponse.body, {
            headers: cspHeaders,
          });
          break;
        case url.pathname.endsWith("/info"):
          const infoResponse = await fetch(`https://${url.host}/api/session/getDetails`, {
            headers: {
              Authorization: kamiyatoken,
            },
          });
          const kmybillingData = await infoResponse.json();
          return new Response(kmybillingData.data.credit.toString(), {
            headers: cspHeaders,
          });
          break;
        default:
          url.pathname = url.pathname.replace(/^\/kamiya$/, "/v1/chat/completions");
          url.pathname = url.pathname.replace(/^\/v1\//, "/api/openai/");
          Object.assign(modifiedHeaders, {
            authorization: kamiyatoken,
            origin: "https://chat.kamiya.dev",
            referer: "https://chat.kamiya.dev/",
            authority: url.host,
          });
          break;
      }
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
              const searchResponse = await fetch(`https://s0.awsl.app/search?q=${query}&max_results=${limit}`);
              const searchResults = await searchResponse.json();
              const currentSnippet = searchResults.map(({ title, body, href }) => `'${title}' : ${body} ; (${href})`).join("\n");
              snippets.push(`\n\n[${query}]\n${currentSnippet}`);
            } catch (err) {
              return httpErrorHandler(502);
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
