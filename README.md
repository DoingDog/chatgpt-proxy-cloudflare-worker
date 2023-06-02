# ChatGPT Proxy Cloudflare Worker

这是一个 Cloudflare Worker 反向代理 ChatGPT API，支持流式输出，支持联网搜索功能，支持设置访问密码。

请在仓库目录获取`index.js`（源代码）或`production.js`（压缩的代码）进行 Cloudflare Workers 部署

部署方式请自行搜索。部署代码后，在 Workers 设置环境变量添加以下变量（多个 KEY 或密码可以用逗号 "," 分隔）：

- `PASSWORD`：反向代理 API 访问密码（可选，默认为 "cpcw"）
  示例：`password,football`
- `API_KEY`：OpenAI Key，用作一个 GPT 端点（可选）
  示例：`sk-sdh687ggi324yvu6sdto2u4yb5y6vi7j,sk-2438r7gv7624r324v859v3873v25fg75`
- `KAMIYA_TOKEN`："kamiya.dev" 的 Access Token，用作一个 GPT 端点（可选）
  示例：`eybv63756_crey3t5v6.eMy3u746t7234_i6fegtu346t2gt.eyb783642vb2376egtf_WW`

使用时，在客户端 API key 输入处填写你的访问密码（或直接填写一个可用的 API KEY），将 API 地址改为 `https://workers_域名/v1/chat/completions`。

你也可以用 `https://workers_域名/churchless/v1/chat/completions` 访问 acheong08 提供的免费 API。

你也可以用 `https://workers_域名/kamiya/v1/chat/completions` 访问 kamiya.dev 提供的 ChatGPT API。

使用时，请照常提出问题和要求。如果需要进行网络搜索，在请求的任何地方加入 `WS[搜索内容]`，即可自动将该内容的搜索结果加在请求的后面。请注意这会拖慢回答速度。

每次请求搜索时，由于 CPU 时间限制，默认当前提问最多使用两次搜索。用户上次提问的搜索请求也会被再次发送。一次回答总共最多进行 4 次搜索。多余的会被丢弃。

示例：给我现在的时间。`WS[现在时间]WS[时区]`

代码作者：GPT4

---

English

# ChatGPT Proxy Cloudflare Worker

This is a Cloudflare Worker reverse proxy ChatGPT API, support streaming output, support network search function, support setting access password.

Please get `index.js` (source code) or `production.js` (compressed code) in the repository directory for Cloudflare Workers deployment.

Please search for your own deployment method. After deploying the code, add the following variables (multiple KEYs or passwords can be separated by a comma ",") to the Workers settings environment variable:

- `PASSWORD`: reverse proxy API access password (optional, default is "cpcw")
  Example: `password,football`
- `API_KEY`: OpenAI Key, used as a GPT endpoint (optional)
  Example: `sk-sdh687ggi324yvu6sdto2u4yb5y6vi7j,sk-2438r7gv7624r324v859v3873v25fg75`
- `KAMIYA_TOKEN`: Access Token for "kamiya.dev", used as a GPT endpoint (optional)
  Example: `eybv63756_crey3t5v6.eMy3u746t7234_i6fegtu346t2gt.eyb783642vb2376egtf_WW`

To use it, fill in your access password in the client API key input (or just fill in an available API KEY) and change the API address to `https://workers_domain/v1/chat/completions`.

You can also use `https://workers_domain/churchless/v1/chat/completions` to access the free API provided by acheong08.

You can also use `https://workers_domain/kamiya/v1/chat/completions` to access the ChatGPT API provided by kamiya.dev.

When using it, please ask questions and requests as usual. If you need to do a web search, add `WS[search content]` anywhere in the request to automatically add the search results for that content to the end of the request. Please note that this slows down the answer.

Each time a search is requested, the current question will be searched at most twice by default due to CPU time limitations. The search request for the user's last question will also be sent again. A total of up to 4 searches can be performed on a single answer. Any extra will be discarded.

Example: Give me the current time. `WS[present time]WS[time zone]`

Code author: GPT4
