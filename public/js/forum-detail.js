if(window.history && window.history.pushState) {
    window.onpopstate=function () {
        window.history.pushState('forward', null, '');
        window.history.forward(1);
    }
}