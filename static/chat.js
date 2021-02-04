document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Starting room
    var roomname = localStorage.getItem('currentroom')
    joinRoom(roomname);

    // current user
    var username = localStorage.getItem("name");

    var check_image;

    document.querySelector('#logout').onclick  = () => {
        localStorage.clear();
    };
        
    //by default submit button is disabled
    document.querySelector("#send-button").disabled = true;
    // enable button only if there is text in the input field
    document.querySelector('#message').onkeyup = () => {
        if (document.querySelector('#message').value.length > 0)
            document.querySelector('#send-button').disabled = false;
        else
            document.querySelector('#send-button').disabled = true;
    };
    

    // Each button should emit a "annonce message" event
    document.querySelectorAll('#send-button').forEach(button => {
        button.onclick = () => {
            const selection = document.querySelector('#message').value;
            socket.emit('submit message', {'message': selection,'username': username , 'roomname': roomname});
            document.querySelector('#message').value = '';
        };
    });

    // file upload
    document.querySelector('#inputFileToLoad').addEventListener("change", () => {

            var filesSelected = document.getElementById("inputFileToLoad").files;
            if(filesSelected.length > 0){

                var fileToLoad = filesSelected[0];
                var fileReader = new FileReader();

                fileReader.onload = function(fileLoadedEvent) {

                    var srcData = fileLoadedEvent.target.result;
                    socket.emit('submit message', {"message": srcData, 'username': username , 'roomname': roomname});
                    check_image = srcData;

                }
                fileReader.readAsDataURL(fileToLoad);
            }
    });

    // When a new message is announced, add to the messages
    socket.on('message', data => {
        //create a message box
        if(data.message){
            const p = document.createElement('p');
            p.setAttribute('class', 'box');
            const line_break = document.createElement('br');
                // username
                const username_span = document.createElement('span');
                // time 
                const time_span = document.createElement('span');
                time_span.setAttribute('class', 'time');
                username_span.setAttribute("class", 'username')
                username_span.innerHTML = data.sender;
                time_span.innerHTML = data.time;
                if (data.message.length > 250){
                    const newImage = document.createElement('img');
                    newImage.src = `${data.message}`;
                    p.innerHTML =  username_span.outerHTML + line_break.outerHTML + newImage.outerHTML +  line_break.outerHTML + line_break.outerHTML + time_span.outerHTML;
                    document.querySelector('#chat').append(p);
                }
                else {
                    p.innerHTML = username_span.outerHTML + line_break.outerHTML +  data.message + line_break.outerHTML + time_span.outerHTML;
                    document.querySelector('#chat').append(p);
                }
                scrollDown();        
        }

        // join  or leave notification
        if((data.join_message) || (data.leave_message)) {
            const div = document.createElement('p');
            div.setAttribute('class', 'alert alert-primary');
            if(data.join_message){
                div.innerHTML = data.join_message;
            } else {
                div.innerHTML = data.leave_message;
            }
            document.querySelector('#chat').append(div);
            scrollDown();
        }
    });

    document.querySelectorAll('.roomid').forEach(button => {
        button.onclick = () => {
            let switchtoRoom = button.dataset.name;
            leaveRoom(roomname);
            joinRoom(switchtoRoom);
            localStorage.setItem("currentroom", switchtoRoom);
        };
    });

    function scrollDown(){

        window.scrollTo(0,document.body.scrollHeight);
    }

    //'enter' key
    var msg = document.querySelector("#message");
    msg.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.querySelector("#send-button").click();
            scrollDown();
        }
    });

    function leaveRoom(room){

        socket.emit('leave', {'username': username, 'roomname': room});

    }

    function joinRoom(room){

        socket.emit('join', {'username': username, 'roomname': room});

    }

});
    // check if user closes a window
window.onbeforeunload = function() {
    localStorage.setItem("closed", 'true');
    return this.undefined;
};
