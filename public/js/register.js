function checkpassword() {
    const password = document.getElementsByClassName("input-item")[1].value;
    const repassword = document.getElementsByClassName("input-item")[2].value;
    const tips = document.getElementById("tips")

    if(password == repassword) {
        tips.innerText="输入的密码一致"
        tips.style.color="green"
        document.getElementsByClassName("btn")[0].disabled = false;

    }else {
        tips.innerText="输入的密码不一致!"
        tips.style.color="red"
        document.getElementsByClassName("btn")[0].disabled = true;
    }
}

function checkusername(){
    const username = document.getElementsByClassName("input-item")[0].value;
    const tips = document.getElementById("tips")
    const checkrule = /^[a-zA-Z][a-zA-Z0-9]{4,9}$/g
    if(checkrule.exec(username)&&username.length<=10){
        tips.innerText="用户名格式正确"
        tips.style.color="green"
        document.getElementsByClassName("btn")[0].disabled = false;
    }
    else {
        tips.innerText="用户名长度为5-10位，字母开头，只能有字母或数字!"
        tips.style.color="red"
        document.getElementsByClassName("btn")[0].disabled = true;
    }
}
