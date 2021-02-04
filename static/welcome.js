// remember the channel if a user closes the web browser window
if (localStorage.getItem("currentroom") != null){

    if (localStorage.getItem("closed") === 'true'){

        currentroom = localStorage.getItem("currentroom");
        window.location.href = "/chatroom" + `/${currentroom}`;
    }

}
