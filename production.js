const myopenaikey = "Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    myapipassword = "Bearer 12345678";

const myua="Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";async function handleRequest(e){let t=await e.clone().text(),a=new URL(e.url),s="ini",n=ini,h="ini",i=e.headers.get("Access-Control-Allow-Origin")||"*";if((a.pathname.endsWith("/completions")||a.pathname.endsWith("/generations")||a.pathname.endsWith("/transcriptions")||a.pathname.endsWith("/edits")||a.pathname.endsWith("/embeddings")||a.pathname.endsWith("/translations")||a.pathname.endsWith("/variations")||a.pathname.endsWith("/files")||a.pathname.endsWith("/fine-tunes")||a.pathname.endsWith("/moderations"))&&("POST"===e.method||"GET"===e.method)){let r=e.headers.get("Authorization");if(!r)return new Response(null,{status:401});n=r!==myapipassword?r:myopenaikey}if(a.pathname.startsWith("/openai")||a.pathname.startsWith("/v1"))h="https://api.openai.com",a.host=h.replace(/^https?:\/\//,""),a.pathname=a.pathname.replace(/^\/openai\//,"/"),s="openai";else{if(!a.pathname.startsWith("/churchless"))return new Response(null,{status:404});h="https://free.churchless.tech",a.host=h.replace(/^https?:\/\//,""),a.pathname=a.pathname.replace(/^\/churchless\//,"/"),s="churchless"}let o=new Request(a.toString(),{headers:e.headers,body:e.body,method:e.method,redirect:"follow"});if(o.headers.set("user-agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"),o.headers.set("sec-ch-ua",'"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"'),o.headers.set("sec-ch-ua-mobile","?0"),o.headers.set("sec-ch-ua-platform",'"macOS"'),o.headers.set("sec-fetch-dest","empty"),o.headers.set("sec-fetch-mode","cors"),o.headers.set("sec-fetch-site","same-origin"),o.headers.set("Pragma","no-cache"),o.headers.set("Cache-Control","no-cache"),"openai"===s?(o.headers.set("authorization",n),o.headers.set("content-type","application/json"),o.headers.set("origin","https://bettergpt.chat"),o.headers.set("referer","https://bettergpt.chat/"),o.headers.set("authority","api.openai.com")):"churchless"===s&&(o.headers.set("authorization","Bearer sk-none"),o.headers.set("content-type","application/json"),o.headers.set("origin","https://acheong08.github.io"),o.headers.set("referer","https://acheong08.github.io/"),o.headers.set("authority","free.churchless.tech")),"POST"===e.method&&a.pathname.endsWith("/completions")&&t){let c=await JSON.parse(t),l=c.messages,p=l[l.length-1],d=p.content,u=l[l.length-3],m="";if(u&&(m=u.content),d.includes("WS[")||m.includes("WS[")){let f=[],g=0,w=d.match(/WS\[([^\]]+)\]/g);if(w)for(let y of w){let W=y.slice(3,-1);g<2&&(f.push(W),g++)}if(g=0,m){let $=m.match(/WS\[([^\]]+)\]/g);if($)for(let b of $){let _=b.slice(3,-1);g<2&&(f.push(_),g++)}}let S=5,k=[];if(f.length<=2&&(S=10),f)for(let q of f)try{let A=`https://duckduckgo-api.vercel.app/search?q=${q}&max_results=${S}`,C=await fetch(A),v=await C.json(),j=v.map(e=>`'${e.title}' : ${e.body} ; (${e.href})`).join("\n"),M=`

[${q}]
${j}`;k.push(M)}catch(O){try{let T=`https://api-ddg.iii.hair/search?q=${q}&max_results=${S}`,z=await fetch(T),G=await z.json(),I=G.map(e=>`'${e.title}' : ${e.body} ; (${e.href})`).join("\n"),K=`

[${q}]
${I}`;k.push(K)}catch(x){try{let B=`https://ddg-api.herokuapp.com/search?query=${q}&limit=${S}`,L=await fetch(B),P=await L.json(),H=P.map(e=>`'${e.title}' : ${e.snippet} ; (${e.link})`).join("\n"),R=`

[${q}]
${H}`;k.push(R)}catch(U){return new Response(null,{status:502})}}}let X=new Date,E=d.replace(/WS\[[^\]]*\]/g,""),N=`${E}

Current date:${X.toLocaleString()} UTC

Instructions: Answer me in the language used in my request or question above. Answer the questions or requests I made above in a comprehensive way. Below are some web search results. Use them if you need.
${k}`;p.content=N,c.messages[l.length-1]=p,o=new Request(o,{body:JSON.stringify(c)})}}try{let D=await fetch(o),F=new Response(D.body,D);return F.headers.set("Access-Control-Allow-Origin",i),F}catch(J){return new Response(null,{status:502})}}addEventListener("fetch",e=>{e.respondWith(handleRequest(e.request).catch(e=>new Response(e.stack,{status:500})))});
