addEventListener("fetch",e=>{e.respondWith(handleRequest(e.request).catch(({stack:e})=>new Response(e,{headers:{"Content-Type":"text/plain;charset=utf8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*"},status:500})))});async function handleRequest(e){let t={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*"};if(e.url===`${new URL(e.url).origin}/`){let a=await e.clone().text(),n={url:e.url,method:e.method,data:a,headers:Object.fromEntries(e.headers),cf:Object.fromEntries(Object.entries(e.cf))};return new Response(JSON.stringify(n,null,2),{headers:t})}function s(e){var a;let n={400:"Bad Request",401:"Unauthorized",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",408:"Request Timeout",410:"Gone",413:"Payload Too Large",429:"Too Many Requests",500:"Internal Server Error",502:"Bad Gateway",503:"Service Unavailable"};return n[e]?(a=n[e],new Response(JSON.stringify({error:{message:`${e} ${a}`,code:e}},null,2),{headers:t,status:e})):null}if("POST"!==e.method&&"GET"!==e.method&&"OPTIONS"!==e.method)return s(405);let r=new URL(e.url),i=["completions","generations","transcriptions","edits","embeddings","translations","variations","files","fine-tunes","moderations","models","listBaseModel","openai","kamiya","generate","conversation","3p","bjq"],o=await e.clone().text(),l=r.pathname.split("?")[0].split("/").pop(),h="undefined"!=typeof API_KEY&&""!==API_KEY?API_KEY.split(","):["sk-xxxxxxxxxx"],p="undefined"!=typeof GPTAPI_KEY&&""!==GPTAPI_KEY?GPTAPI_KEY:"sk-xxxxxxxxxx",c="undefined"!=typeof BJQ_KEY&&""!==BJQ_KEY?BJQ_KEY:"sk-xxxxxxxxxx",d="undefined"!=typeof GPTAPI_TOKEN&&""!==GPTAPI_TOKEN?GPTAPI_TOKEN:"abcdefg",u="undefined"!=typeof KAMIYA_TOKEN&&""!==KAMIYA_TOKEN?KAMIYA_TOKEN.split(","):["sk-xxxxxxxxxx"],m="undefined"!=typeof PASSWORD&&""!==PASSWORD?PASSWORD.split(","):["cpcw"],g=`Bearer ${h[Math.floor(Math.random()*h.length)]}`,f=`Bearer ${u[Math.floor(Math.random()*u.length)]}`;if(i.includes(l)&&("POST"===e.method||"GET"===e.method)){let w=e.headers.get("Authorization");if(!w)return s(401);let y=w.substring(7);m.includes(y)||(g=w,f=w,p=w,c=w)}else if(!i.includes(l)&&!["usage","getDetails","history","subscription","info"].includes(l))return s(403);let x=Object.fromEntries(e.headers);switch(Object.assign(x,{"user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36","sec-ch-ua":'"Chromium";v="116", "Google Chrome";v="116", "Not:A-Brand";v="99"',"sec-ch-ua-mobile":"?0","sec-ch-ua-platform":'"macOS"',"sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"same-site",Pragma:"no-cache","Cache-Control":"no-cache","content-type":"application/json","X-Forwarded-For":"1.1.1.1","X-Real-IP":"1.1.1.1"}),!0){case r.pathname.startsWith("/3p"):if(r.host="api.gptapi.us",r.pathname=r.pathname.replace(/^\/3p\//,"/"),r.pathname=r.pathname.replace(/^\/3p$/,"/v1/chat/completions"),r.pathname.endsWith("/info")){let $=await fetch("https://www.gptapi.us/api/user/self",{headers:{Authorization:`Bearer ${d}`}}),b=await $.json(),_=b.data.quota/5e5;return new Response(_.toFixed(4),{headers:t})}Object.assign(x,{authorization:p,origin:"https://bettergpt.chat",referer:"https://bettergpt.chat/",authority:r.host});break;case r.pathname.startsWith("/bjq"):if(r.host="api.openai.one",r.pathname=r.pathname.replace(/^\/bjq\//,"/"),r.pathname=r.pathname.replace(/^\/bjq$/,"/v1/chat/completions"),r.pathname.endsWith("/info")){let v=await fetch(`https://price.openai.one/api.php?GetData&Getkeyinfo&key=${c}`),A=await v.json();return new Response(Number(A.remain_quota).toFixed(4),{headers:t})}Object.assign(x,{authorization:c,origin:"https://bettergpt.chat",referer:"https://bettergpt.chat/",authority:r.host});break;case r.pathname.startsWith("/openai"):case r.pathname.startsWith("/v1/"):r.host="api.openai.com",r.pathname=r.pathname.replace(/^\/openai\//,"/"),r.pathname=r.pathname.replace(/^\/openai$/,"/v1/chat/completions"),Object.assign(x,{authorization:g,origin:"https://bettergpt.chat",referer:"https://bettergpt.chat/",authority:r.host});break;case r.pathname.startsWith("/kamiya"):switch(r.host="p0.kamiya.dev",r.pathname=r.pathname.replace(/^\/kamiya\//,"/"),!0){case r.pathname.endsWith("/usage"):return new Response(JSON.stringify({object:"list",total_usage:0},null,2),{headers:t});case r.pathname.endsWith("/models"):let k=await fetch("https://gist.githubusercontent.com/DoingDog/5d9f8228d02645bb2ace999de796e5b9/raw/fakeModels.json");return new Response(k.body,{headers:t});case r.pathname.endsWith("/info"):let q=await fetch(`https://${r.host}/api/session/getDetails`,{headers:{Authorization:f}}),W=await q.json();return new Response(W.data.credit.toString(),{headers:t});case r.pathname.endsWith("/subscription"):let j=await fetch(`https://${r.host}/api/session/getDetails`,{headers:{Authorization:f}}),C=await j.json(),S=.0014*C.data.credit;return new Response(JSON.stringify({object:"billing_subscription",has_payment_method:!1,canceled:!1,canceled_at:null,delinquent:null,access_until:3376656e3,hard_limit_usd:S,system_hard_limit_usd:S,plan:{title:"Explore",id:"free"},primary:!0,account_name:"Restful API Inc",po_number:null,billing_email:null,tax_ids:null,billing_address:null,business_address:null},null,2),{headers:t});case r.pathname.endsWith("/generations"):let T=JSON.parse(o),O=T.size.indexOf("x"),z=parseInt(T.size.substring(0,O)),P=await fetch(`https://${r.host}/api/image/generate`,{method:"POST",headers:{Authorization:f,"Content-Type":"application/json"},body:JSON.stringify({prompt:T.prompt,negativePrompt:"lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",steps:28,scale:12,sampler:"DPM++ 2M Karras",width:z,height:z,watermark:!1,model:"anything-v5-PrtRE"},null,2)}),E=await P.json();return new Response(JSON.stringify({created:Date.now(),data:[{url:E.image},]},null,2),{headers:t});default:r.pathname=r.pathname.replace(/^\/kamiya$/,"/v1/chat/completions"),r.pathname=r.pathname.replace(/^\/v1\//,"/api/openai/"),Object.assign(x,{authorization:f,origin:"https://chat.kamiya.dev",referer:"https://chat.kamiya.dev/",authority:r.host})}break;default:return s(404)}let G=new Headers;Object.entries(x).forEach(([e,t])=>{G.append(e,t)});let M;try{M=new Request(r.toString(),{headers:G,body:e.body,method:e.method,redirect:"follow"})}catch(R){return s(400)}if("POST"===e.method&&r.pathname.endsWith("/completions")&&o)try{let B=JSON.parse(o),I=B.messages,D=I[I.length-1],F=D.content,H=I[I.length-3]?.content||"";if(F.includes("WS[")||H.includes("WS[")){let N=[];function U(e,t){let a=0,n=e.match(/WS\[[^\]]+\]/g);return n&&n.forEach(e=>{let n=e.slice(3,-1);a<2&&(t.push(n),a++)}),null}if(U(F,N),H&&U(H,N),N.length>=1){let K=[],L=N.length<=2?10:5;for(let X of N)try{let J=await fetch(`https://s0.awsl.app/search?q=${X}&max_results=${L}`),Q=await J.json(),V=Q.map(({title:e,body:t,href:a})=>`'${e}' : ${t} ; (${a})`).join("\n");K.push(`

[${X}]
${V}`)}catch(Y){return s(502)}D.content=`${F.replace(/WS\[[^\]]*\]/g,"")}

Current date:${new Date().toLocaleString()} UTC

Instructions: Reply to me in the language of my request or question above. Give a comprehensive answer to the question or request I have made above. Below are some results from a web search. Use them if necessary.
${K}`,B.messages[I.length-1]=D,M=new Request(M,{body:JSON.stringify(B)})}}}catch(Z){return s(400)}try{let ee=await fetch(M),et=s(ee.status);if(("POST"===e.method||"GET"===e.method)&&r.pathname.endsWith("/completions")&&et)return et;let ea=new Response(ee.body,ee);return ea.headers.set("Access-Control-Allow-Origin",e.headers.get("Access-Control-Allow-Origin")||"*"),ea.headers.set("Access-Control-Allow-Headers",e.headers.get("Access-Control-Allow-Headers")||"*"),ea}catch(en){return s(502)}}
