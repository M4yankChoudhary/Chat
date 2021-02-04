document.addEventListener('DOMContentLoaded', () => {

    // remve local storage items
    localStorage.removeItem('currentroom');
    localStorage.removeItem('closed');
    
    //by default submit button is disabled
    document.querySelector("#submit").disabled = true;
    // enable button only if there is text in the input field
    document.querySelector('#username').onkeyup = () => {
        if (document.querySelector('#username').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    };

    document.querySelector('#form').onsubmit = () => {

        // get username
        const username = document.querySelector('#username').value;

        // set username
        localStorage.setItem("name", username);
    };

});