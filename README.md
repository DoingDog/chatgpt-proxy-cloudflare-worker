# chatgpt-proxy-cloudflare-worker
<br>Cloudflare Worker 反向代理 ChatGPT API，支持流式输出，支持联网搜索功能，支持设置访问密码
<br>
<br>部署方式请自行搜索。部署时，修改代码最上面的 “openaikey” 内容为你自己的openai api key。以及修改 “apipassword”（访问密码）。
<br>
<br>使用时，在客户端填写key的地方填写你的访问密码 填写域名改为你的域名。
<br>
<br>使用时，请照常提出问题和要求。如果需要进行网络搜索，在请求的任何地方加入“WS[搜索内容]”，即可自动将该内容的搜索结果加在请求的后面。请注意这会拖慢回答速度。
<br>
<br>每次请求搜索时，由于CPU时间限制，默认当前提问最多使用两次搜索。用户上次提问的搜索请求也会被再次发送。一次回答总共最多进行4次搜索。多余的会被丢弃。
<br>
<br>举例：“给我现在的时间。WS[现在时间]WS[时区]”
<br>
<br>代码作者：GPT4

<br>
<br>English (google translate)
<br>
<br>Cloudflare Worker reverse proxy ChatGPT API, supports streaming output, supports network search function, supports setting access password
<br>
<br>Please search for deploying methods by yourself. Before deploy, modify the "openaikey" content at the top of the code to your own openai api key. Also, set the "apipassword" (access password).
<br>
<br>When using, fill in your access password in the place where you fill in the api key in the ChatGPT client terminal, fill in the custom domain name with your worker domain name.
<br>
<br>As you go, please ask ChatGPT questions and requests as usual. If you need to search the web, add "WS[search content]" anywhere in the request, and the program can automatically search and add the results to the request. Note that this will slow down replies.
<br>
<br>The current request uses up to two searches by default for fear of CPU time limit excess. The search params in the user's last request will also be sent again. A total of up to 4 searches can be performed with one answer. Excess will be discarded.
<br>
<br>Example: "Give me the current time. WS[current time]WS[time zone]"
<br>
<br>Code author: GPT4
