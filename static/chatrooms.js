document.addEventListener('DOMContentLoaded', () => {

    //by default submit button is disabled
    document.querySelector("#submit").disabled = true;

    // enable button only if there is text in the input field
    document.querySelector('#room').onkeyup = () => {
        if (document.querySelector('#room').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    };

    
    // log out user and clear local storage
    document.querySelector('#logout').onclick  = () => {
        localStorage.clear();
    };

     // Each button should emit a "submit vote" event
    document.querySelectorAll('.roomid').forEach(button => {
        button.onclick = () => {
            const selection = button.dataset.name;
            localStorage.setItem("currentroom", selection);
        };
    });

});