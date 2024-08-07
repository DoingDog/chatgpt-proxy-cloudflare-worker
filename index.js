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
  const validPaths = ["completions", "generations", "transcriptions", "edits", "embeddings", "translations", "variations", "files", "fine-tunes", "moderations", "models", "listBaseModel", "openai", "kamiya", "generate", "conversation", "3p", "bjq", "ato", "speech"];
  const unrestrictedPaths = ["usage", "getDetails", "history", "subscription", "info"];
  const fakeModelsUrl = "https://gist.githubusercontent.com/DoingDog/5d9f8228d02645bb2ace999de796e5b9/raw/fakeModels.json";
  const messageBody = await request.clone().text();
  const urlPathname = url.pathname.split("?")[0].split("/").pop();
  // Helper function to handle key/token initialization and return random element if array
  function initializeAndGetRandomKey(variable, defaultValue, shouldBeArray = false) {
    const finalValue = typeof variable !== "undefined" && variable !== "" ? variable : defaultValue;

    if (shouldBeArray) {
      const arrayValue = finalValue.split(",");
      // Return a random element from the array
      return arrayValue[Math.floor(Math.random() * arrayValue.length)];
    }

    return finalValue;
  }

  // Constants and variables initialization
  const openaikey = `Bearer ${initializeAndGetRandomKey(API_KEY, "sk-xxxxxxxxxx", true)}`;
  let gptapikey = initializeAndGetRandomKey(GPTAPI_KEY, "sk-xxxxxxxxxx");
  let bjqkey = initializeAndGetRandomKey(BJQ_KEY, "sk-xxxxxxxxxx");
  let omgapikey = initializeAndGetRandomKey(OMG_KEY, "sk-xxxxxxxxxx");
  let omgxapikey = initializeAndGetRandomKey(OMGX_KEY, "sk-xxxxxxxxxx");
  const gptapiaccesstoken = initializeAndGetRandomKey(GPTAPI_TOKEN, "abcdefg");
  const kamiyatoken = `Bearer ${initializeAndGetRandomKey(KAMIYA_TOKEN, "sk-xxxxxxxxxx", true)}`;

  const myapipasswords = typeof PASSWORD !== "undefined" && PASSWORD !== "" ? PASSWORD.split(",") : ["cpcw"];

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
      omgapikey = authHeader;
      omgxapikey = authHeader;
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
      url.pathname = url.pathname.replace(/^\/ato\//, "/");
      url.pathname = url.pathname.replace(/^\/ato$/, "/v1/chat/completions");
      const validapi = ["models", "generations", "completions", "speech"];
      if (request.method === "POST" && url.pathname.endsWith("/completions")) {
        // 从环境变量中读取模型列表，以逗号分隔
        const models3pString = CHEAP_MODELS || "gemini-1.5-pro,command-r-plus";

        const models3p = models3pString.split(",").map((model) => model.trim());
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
          url.host = "api.ohmygpt.com";
          Object.assign(modifiedHeaders, {
            authorization: omgapikey,
            origin: "https://bettergpt.chat",
            referer: "https://bettergpt.chat/",
            authority: url.host,
          });
        }
      } else if (validapi.includes(url.pathname.split("/").pop())) {
        url.host = "api.ohmygpt.com";
        Object.assign(modifiedHeaders, {
          authorization: omgapikey,
          origin: "https://bettergpt.chat",
          referer: "https://bettergpt.chat/",
          authority: url.host,
        });
      } else {
        return httpErrorHandler(404);
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
    /*case url.pathname.startsWith("/oma"):
      url.host = "api.ohmygpt.com";
      url.pathname = url.pathname.replace(/^\/oma\//, "/");
      url.pathname = url.pathname.replace(/^\/oma$/, "/v1/chat/completions");
      if (url.pathname.endsWith("/info")) {
        const omgbillingResponse = await fetch(`https://api.ohmygpt.com/api/v1/user/admin/balance`, {
          headers: {
            Authorization: `Bearer ${omgxapikey}`,
          },
          method: "POST",
          body: null,
        });
        const omgbillingData = await omgbillingResponse.json();
        const omgbilling = parseFloat(omgbillingData.data.balance) / 34000;
        return new Response(omgbilling.toFixed(4), {
          headers: cspHeaders,
        });
      }
      Object.assign(modifiedHeaders, {
        authorization: omgxapikey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;
    case url.pathname.startsWith("/omg"):
      url.host = "api.ohmygpt.com";
      url.pathname = url.pathname.replace(/^\/omg\//, "/");
      url.pathname = url.pathname.replace(/^\/omg$/, "/v1/chat/completions");
      if (url.pathname.endsWith("/info")) {
        const omgbillingResponse = await fetch(`https://api.ohmygpt.com/api/v1/user/admin/balance`, {
          headers: {
            Authorization: `Bearer ${omgapikey}`,
          },
          method: "POST",
          body: null,
        });
        const omgbillingData = await omgbillingResponse.json();
        const omgbilling = parseFloat(omgbillingData.data.balance) / 34000;
        return new Response(omgbilling.toFixed(4), {
          headers: cspHeaders,
        });
      }
      Object.assign(modifiedHeaders, {
        authorization: omgapikey,
        origin: "https://bettergpt.chat",
        referer: "https://bettergpt.chat/",
        authority: url.host,
      });
      break;*/
    case url.pathname.startsWith("/bjq"):
      url.host = "api.openai.one";
      url.pathname = url.pathname.replace(/^\/bjq\//, "/");
      url.pathname = url.pathname.replace(/^\/bjq$/, "/v1/chat/completions");
      if (url.pathname.endsWith("/info")) {
        const bjqbillingResponse = await fetch(`https://price.openai.one/api.php?GetData&Getkeyinfo&key=${bjqkey}`);
        const bjqbillingData = await bjqbillingResponse.json();
        return new Response((Number(bjqbillingData.remain_quota) * 2).toFixed(4), {
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
    /*case url.pathname.startsWith("/kamiya"):
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
          return new Response((kmybillingData.data.credit / 100).toFixed(4), {
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
      break;*/
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
    function transformMessages(messages) {
      return messages.map((message) => {
        // Check if 'content' is an array and has structured { type: 'text', text: '...' }
        if (Array.isArray(message.content) && message.content.every(({ type, text }) => type === "text" && text)) {
          // Flatten the content
          message.content = message.content.map(({ text }) => text).join(" ");
        }
        return message;
      });
    }
    const bodyJson = JSON.parse(messageBody);

    // Transform the messages within the body
    bodyJson.messages = transformMessages(bodyJson.messages);

    // Create a new Request object with the transformed body
    modifiedRequest = new Request(modifiedRequest, {
      body: JSON.stringify(bodyJson),
    });
  }
  /*if (request.method === "POST" && url.pathname.endsWith("/completions") && messageBody) {
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
  }*/
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
