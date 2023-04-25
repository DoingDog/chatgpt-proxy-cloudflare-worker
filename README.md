# Chat GPT Proxy Cloudflare Worker

Cloudflare Worker 反向代理 ChatGPT API，支持流式输出，支持联网搜索功能，支持设置访问密码。

部署方式请自行搜索。部署时，修改代码最上面的 `myopenaikey` 内容为你自己的 openai api key。以及修改 `myapipassword`（访问密码）。不要改动或删除 `Bearer`。

使用时，在客户端 api key 输入处填写你的访问密码（或直接填写一个 openai api key） api 地址改为 `https://workers_域名/v1/chat/completions`。

你也可以用 `https://workers_域名/churchless/v1/chat/completions` 访问 acheong08 提供的免费 api。

使用时，请照常提出问题和要求。如果需要进行网络搜索，在请求的任何地方加入 `WS[搜索内容]`，即可自动将该内容的搜索结果加在请求的后面。请注意这会拖慢回答速度。

每次请求搜索时，由于 CPU 时间限制，默认当前提问最多使用两次搜索。用户上次提问的搜索请求也会被再次发送。一次回答总共最多进行 4 次搜索。多余的会被丢弃。

举例：“给我现在的时间。WS[现在时间]WS[时区]”

代码作者：GPT4

---

English (gpt translate)

This is a Cloudflare Workers reverse proxy for ChatGPT API, which supports streaming output, network search function and access password setting.

Please search and follow the deployment instructions yourself. When deploying, modify the `myopenaikey` value at the top of the code with your own OpenAI API key and modify the `myapipassword` value as your access password. Do not change or delete the `Bearer`.

When using, fill in your access password in the client api key input (or directly fill in an openai api key) and change the api address to `https://workers_domain/v1/chat/completions`.

Alternatively, you can use `https://workers_domain/churchless/v1/chat/completions` to access the free API provided by acheong08.

Please feel free to ask ChatGPT any questions or requests, as usual. If you need to search the web, add `WS[search content]` anywhere in the request, and the program will automatically search and add the results to the request. However, this may slow down the response time.

The current request uses up to two searches by default and any search requests from the user's previous question will also be sent again. A total of up to 4 searches will be performed for any answer. Any additional searches will be discarded.

For example, ask "Give me the current time. WS[current time]WS[time zone]"

The code author is GPT4.
