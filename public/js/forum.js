const contents = document.getElementById('contentsText');
const title = document.getElementById('titleText');
const hrefs = document.getElementsByClassName("delete")
const choose = document.getElementsByClassName("choose")
const selected = document.getElementById("forum-number")
const ul = document.getElementsByTagName("ul")[0]
const content_tr = document.getElementsByTagName("tbody")[0]?document.getElementsByTagName("tbody")[0].getElementsByTagName("tr"):null

let defaultnum = 3

changePage(defaultnum)

//设置每页帖子数
function changePage(number) {
    if(hrefs.length!==0){
        const pagenumber = hrefs.length % number === 0 ? hrefs.length / number : Math.floor(hrefs.length / number)+1; //计算页数
        //往ul中添加页码节点
        ul.innerHTML=""
        for(let i=0;i<pagenumber;i++){
            ul.insertAdjacentHTML("beforeend",`<li><a href="javascript:;">${i+1}</a></li>`)
        }
        //添加完后获取节点再绑定函数
        const pages = document.querySelectorAll("li a")
        for(page of pages){
            page.onclick = function (){
                //给tr全部设置隐藏
                [...content_tr].forEach(item=>{
                    item.style.display="none"
                })
                //使用for循环显示应该显示的帖子
                for(let i=(this.innerText-1)*selected.options[selected.selectedIndex].value+1;i<=Math.min(this.innerText*selected.options[selected.selectedIndex].value,content_tr.length);i++){
                    const current_forum = document.querySelector(`tbody tr:nth-child(${i})`)
                    current_forum.style.display="table-row"
                }
            }
        }
        pages[0].onclick()
    }
}

selected.onchange = function (){
    changePage(selected.options[selected.selectedIndex].value)
}


for(let href of hrefs){
    href.addEventListener("click",function (event){
        if(confirm('确认要删除吗')){
            let str =""
            for(let i=0;i<choose.length;i++){
                if(choose[i].checked === true){
                    str+=`id=${choose[i].value}&`
                }
            }
            if(str===""){
                window.location.href = `/delete?id=${event.target.previousElementSibling.value}`
            }else{
                window.location.href = `/delete?${str}`
            }
        }
    })
}

title.addEventListener('input',function () {
    const len = txtCount(this); //   调用函数
    document.getElementById('titleCount').innerHTML = len;
});

contents.addEventListener('input',function () {
    const len = txtCount(this); //   调用函数
    document.getElementById('contentsCount').innerHTML = len;
});

//函数 - 获取文本内容和长度
function txtCount(el) {
    const val = el.value;
    const eLen = val.length;
    return eLen;
}