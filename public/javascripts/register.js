(function(){
    const $login = $('#login');
    const $loginBtn = $('#loginBtn');
    const $logout = $('#logout');
    const $register = $('#register');
    const $welcomeUser = $('#welcomeUser');
    $loginBtn.on('click', (e) => {
        e.preventDefault();
        $login.hide();
        $register.hide();
        $logout.show();
        $welcomeUser.show()

        document.loginForm.Name.value = "";
        document.loginForm.Password.value = "";
    })

    $logout.on('click', (e) => {
        e.preventDefault();
        setTimeout(()=>{
            $login.show();
            $register.show();
            $logout.hide();
            $welcomeUser.hide();
        }, 200);
    });

    $welcomeUser.on('click', (e) => {
        e.preventDefault();
    })
})();