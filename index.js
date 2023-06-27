const express = require("express")
const session = require("express-session")
const path = require("path")
const fs = require("node:fs/promises")
const FileStore = require('session-file-store')(session);
const uuid = require("uuid").v4
const app = express()
let USERS=require("./user.json")
let FORUMS=require("./forums.json")
let retry=""

//设置ejs为模板引擎
app.set("view engine","ejs")
//设置模板路径默认是views
app.set("views",path.resolve(__dirname,"views"))

//启用请求体解析（要不然读取不了post表单内容）
app.use(express.urlencoded())
//设置静态资源
app.use(express.static(path.resolve(__dirname,"public")))
//配置session与store
app.use(session({
    secret:"你好",
    store:new FileStore({
        path:path.resolve(__dirname,"./sessions"),
        secret:"你好",
        //3600秒
        ttl:3600
    })
}))

app.get("/",(req,res)=>{
    res.render("index",{retry})
    retry=""
})
app.get("/register",(req,res)=>{
    res.render("register",{retry})
    retry=""
})
app.get("/login-jump",(req,res)=>{
    res.redirect("/")
})
app.get("/register-jump",(req,res)=>{
    res.redirect("/register")
})

app.post("/login",(req,res)=>{
    const {username,password} = req.body
    if(username ===""||password === ""){
        retry ="empty"
        res.redirect("/")
        return
    }
    const user = USERS.find(items=>{
        return items.username === username&&items.password === password
    })
    if(user){
        req.session.onlineUser = user
        req.session.save(()=>{
            res.redirect("/forums")
        })
    }else{
        retry ="retry"
        res.redirect("/")
    }
})

app.get("/forums",(req,res)=>{
    if(req.session.onlineUser){
        req.session.csrfToken = uuid()
        req.session.save(()=>{
            res.render("forum",{onlineUser:req.session.onlineUser,FORUMS,csrfToken:req.session.csrfToken,retry})
            retry=""
        })
    }else{
        res.redirect("/")
    }
})

app.post("/check_register",(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    console.log(username,password)
    const user = USERS.find(item=>{
        return item.username === username
    })
    if(user){
        retry="exist"
        res.redirect("/register")
    }else{
        USERS.push({
            username,
            password
        })
        fs.writeFile("./user.json",JSON.stringify(USERS)).then(r=>{
            console.log("文件写入成功")}).catch(e=>{
            console.log("写入失败",e)})
        res.redirect("/")
    }
})

app.get("/logout",(req,res)=>{
    req.session.destroy()
    res.redirect("/")
})

app.post("/post-forum",(req,res)=>{
    //检验登录
    if(req.session.onlineUser){
        //防止csrf攻击（使用token）
        const sessionToken = req.session.csrfToken
        const bodyToken = req.body.csrfToken
        req.session.csrfToken = null
        if(sessionToken === bodyToken){
            const id = FORUMS.at(-1)?FORUMS.at(-1).id+1:1
            const postTime = new Date().toLocaleString("zh-CN",{dateStyle:"medium",timeStyle:"medium"})
            const title = req.body.title
            const author = req.session.onlineUser.username
            const contents = req.body.contents
            console.log(req.body.title,req.body.contents,req.session.onlineUser.username,id,postTime)
            if(req.body.title!==""&&req.body.contents!==""){
                FORUMS.push({
                        id,
                        title,
                        author,
                        postTime,
                        contents
                    }
                )
                fs.writeFile("./forums.json",JSON.stringify(FORUMS)).then(r=>{
                    console.log("文件写入成功")}).catch(e=>{
                    console.log("写入失败",e)})
            }else{
                retry="forum empty"
            }
            //保存token为null
            req.session.save(()=>{
                res.redirect("/forums")
            })
        }else{
            res.status(403).send("<h1>Token错误</h1>")
        }
    }else {
        res.redirect("/")
    }
})

app.get("/delete",(req,res)=>{
    //防止csrf攻击
    const referer = req.get("referer")
    console.log(referer)
    if(!referer||!referer.startsWith("http://localhost:3000/forums")){
        res.status(403).send("<h1>没有权限!</h1>")
        return
    }
    if(!req.session.onlineUser){
        res.redirect("/")
        return
    }
    const ids = req.query.id
    for(let id_ of ids){
        FORUMS = FORUMS.filter(item=> item.id!== parseInt(id_))
    }
    fs.writeFile("./forums.json",JSON.stringify(FORUMS)).then(r=>{
        console.log("文件写入成功")}).catch(e=>{
        console.log("写入失败",e)})
    res.redirect("/forums")
})

app.get("/forum-detail",(req,res)=>{
    const referer = req.get("referer")
    if(req.session.onlineUser&&referer.startsWith("http://localhost:3000/forums")){
        const id = parseInt(req.query.id)
        const forum = FORUMS.find(item=>{
            return item.id==id
        })
        res.render("forum-detail",{forum})
    }
    else {
        res.redirect("/")
    }
})

app.use("/",(req,res)=>{
    res.status(404).send("<h1>此页面被外星人劫持了</h1>")
})

app.listen(3000,()=>{
    console.log("服务器启动了")
})