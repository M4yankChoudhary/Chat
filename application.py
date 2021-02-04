import os
import requests

from flask import Flask, session, jsonify, render_template, request, url_for, redirect
from flask_session import Session
from flask_socketio import SocketIO, emit, send, join_room, leave_room
import datetime

app = Flask(__name__)

# configure socket
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# zip - iterator
app.jinja_env.filters['zip'] = zip

# store channel name and messages into a dictionary
chatrooms = {}

# current time (AM/PM)
current_time = datetime.datetime.now().strftime(" %I:%M %p")


@app.route("/", methods=['GET', 'POST'])
def index():
    ''' Welcome - if logged in '''

    if 'loggedin' in session:

        # welcome page
        return redirect("/welcome")
    else:

        # login form
        return render_template("login.html")


@app.route("/login", methods=['GET', 'POST'])
def login():

    ''' Log in '''

    # forget any data in session
    session.clear()

    if request.method == 'GET':

        # login form
        return render_template("login.html")
    else:
        username = request.form.get("username")

        # username required
        if not username:
            return redirect("/")

        # session variables
        session["loggedin"] = True
        session["username"] = username

        return redirect("/welcome")


@app.route("/welcome", methods=['GET', 'POST'])
def welcome():

    ''' Welcome '''

    if 'loggedin' in session:
        
        # Welcome 'your name' 
        return render_template("welcome.html", username=session['username'])


@app.route("/logout")
def logout():

    ''' Log out '''

    # clear session and return to index page
    session.clear()
    return redirect("/")


@app.route("/chatrooms", methods=['GET', 'POST'])
def chat_rooms():

    ''' All Channels '''

    if 'loggedin' in session:
        if request.method == 'GET':

            # provide a list of list of channels
            return render_template("chatrooms.html", rooms=chatrooms)
        else:
            # create a new channel
            addroom = request.form.get("name")
            # check name conflict
            if addroom not in chatrooms:
                chatrooms.update({addroom:[]})
            # add new channel to the dictionary
            chatrooms.update({addroom:[]})
            chatrooms[addroom].append({'sender': [], 'message': [], 'time': []})
            
            return redirect("/chatrooms")            
    else:
        return render_template("error.html", message="You must be loggedin")
    

@app.route("/chatroom/<string:roomname>", methods=['GET'])
def chatroom(roomname):

    ''' current channel '''

    if 'loggedin' in session:

        # handle KeyError
        if roomname not in chatrooms :
            return render_template("error.html", message="Channel not found")
 
        sender = chatrooms[roomname][0]['sender']
        messages = chatrooms[roomname][0]['message']
        time = chatrooms[roomname][0]['time']

        username = session["username"]

        return render_template("room.html", roomname=roomname, sender=sender, messages=messages,time=time, chat=chatrooms[roomname], channels=chatrooms, username=username)
    
    else:
        return render_template("error.html", message="You must be loggedin")


@socketio.on("submit message")
def display_message(data):

    ''' messages '''

    message = data["message"]
    name = data["roomname"]
    username = data["username"]

    if len(chatrooms[name]) >= 100:
        chatrooms[name] = []

    chatrooms[name][0]['sender'].append(username)
    chatrooms[name][0]['message'].append(message)
    chatrooms[name][0]['time'].append(current_time)

    send({"message": message, "sender": username, "time": current_time}, room=name)

@socketio.on('join')
def join(data):

    ''' Join room '''

    username = session["username"]
    room = data["roomname"]
    join_room(room)

    send({"join_message": username + " has joined the "+ room + " room.", "time": current_time}, room=room)

@socketio.on('leave')
def leave(data):

    ''' leave room '''

    username = data["username"]
    room = data["roomname"]
    leave_room(room)

    send({"leave_message": username + "has left the room", "username":username, "time": current_time}, room=room)


if __name__ == "__main__":
    socketio.run(app)
