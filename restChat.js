// Rest based chat client
// Jim Skon 2022
// Kenyon College

var baseUrl = 'http://3.16.1.164:5005';
var state="off";
var myname="";
var inthandle;
var mostRecentChatBox =""; 

//creating an array for current users 
const currentUsers = []; 

/* Start with text input and status hidden */
document.getElementById('chatinput').style.display = 'none';
document.getElementById('status').style.display = 'none';
document.getElementById('leave').style.display = 'none';
// Action if they push the join button
document.getElementById('login-btn').addEventListener("click", (e) => {
	join();
})

/* Set up buttons */
document.getElementById('leave-btn').addEventListener("click", leaveSession);
document.getElementById('send-btn').addEventListener("click", sendText);

// Watch for enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
    if (e.code == "Enter") {
	sendText();
    }   
});


// Call function on page exit
window.onbeforeunload = leaveSession;


function completeJoin(results) {
	var status = results['status'];
	if (status != "success") {
		alert("Username already exists!");
		leaveSession();
		return;
	}
	var user = results['user'];
	console.log("Join:"+user);
	currentUsers.indexOf(user) === -1? currentUsers.push(user) : console.log("This item already exists"); 
	//currentUsers.push(messages[0].user); 
	//printing the array to dev tools
	//console.log(currentUsers); 
	var chatMembers = "<font color='blue'>" + currentUsers + ", </font>";
		document.getElementById('members').innerHTML=""; 
		document.getElementById('members').innerHTML +=
	    	chatMembers; 
	startSession(user);
}

function join() {
	myname = document.getElementById('yourname').value;
	fetch(baseUrl+'/chat/join/'+myname, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeJoin(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    });
}







function completeSend(results) {
	var status = results['status'];
	if (status == "success") {
		console.log("Send succeeded")
	} else {
		alert("Error sending message!");
	}
}

//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
    console.log("Send: "+myname+":"+message);
	fetch(baseUrl+'/chat/send/'+myname+'/'+message, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeSend(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })    

}

/*
function completeDisappSend(results_dis){
		var status = results['status'];
	if (status == "success") {
		console.log("Disappearing Send succeeded")
	} else {
		alert("Error sending message!");
	}
}


//function called on submitting as disappearing message
function disappearingSend(){{
	   var message = document.getElementById('message').value;
    console.log("Send as disappearing: "+myname+":"+message);
	fetch(baseUrl+'/chat/send/'+myname+'/'+message, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeDisappSend(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })  
}
*/










function completeFetch(result) {
	messages = result["messages"];
	
	//pushing a new user to the current user array
	
	/*
	currentUsers.indexOf(messages[0].user) === -1? currentUsers.push(messages[0].user) : console.log("This item already exists"); 
	//currentUsers.push(messages[0].user); 
	
	//printing the array to dev tools
	//console.log(currentUsers); 
	
	
	var chatMembers = "<font color='blue'>" + currentUsers + ", </font>";
		document.getElementById('members').innerHTML=""; 
		document.getElementById('members').innerHTML +=
	    	chatMembers; */
	    	
	    	
	//with _dm for disappearing message	
	messages.forEach(function (m,i) {
		name = m['user'];
		message = m['message'];
		console.log(message); 
		var disAppBool = message.substr(-3);
		console.log(disAppBool); 
		
		if (disAppBool === "_dm"){
		var chatBoxMsgs = "<font color='red'>" + name + ": </font>" + message + "<br />";
		mostRecentChatBox = mostRecentChatBox + chatBoxMsgs; 
		console.log(mostRecentChatBox); 
		document.getElementById('chatBox').innerHTML +=
	    	chatBoxMsgs;  
	    	setTimeout(() => {
	  		var start = mostRecentChatBox.indexOf(chatBoxMsgs); 
	  		console.log(start); 
	  		var end = start+chatBoxMsgs.length; 
	  		var previousChatBox = mostRecentChatBox.substring(0, start)+mostRecentChatBox.substring(end);
	  		mostRecentChatBox = previousChatBox; 
	  		document.getElementById('chatBox').innerHTML =""; 
	  		document.getElementById('chatBox').innerHTML +=
	    	previousChatBox;    
	    	}, 3000); 
	    
		} else {
		var chatBoxMsgs = "<font color='red'>" + name + ": </font>" + message + "<br />";
		mostRecentChatBox = mostRecentChatBox + chatBoxMsgs; 
		console.log(mostRecentChatBox); 
		document.getElementById('chatBox').innerHTML +=
	    	chatBoxMsgs;     
	    
	    }	
	})
}
	


/* Check for new messages */
function fetchMessage() {
	fetch(baseUrl+'/chat/fetch/'+myname, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeFetch(data))
    .catch(error => {
        {console.log("Server appears down");}
    })  
    
    	
}
/* Functions to set up visibility of sections of the display */
function startSession(name){
    state="on";
    
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'none';
    document.getElementById('user').innerHTML = "User: " + name;
    document.getElementById('chatinput').style.display = 'block';
    document.getElementById('status').style.display = 'block';
    document.getElementById('leave').style.display = 'block';        
    /* Check for messages every 500 ms */
    inthandle=setInterval(fetchMessage,500);
}

function leaveSession(){
    state="off";
    
    //we want: when the user presses the leave button, we want that user to get subtracted from the array of currentUsers, then we want to update the screen 
    
    //this should output the current user
    console.log(myname); 
    
    //now, deleting myname from the array currentUsers and reupdating what is displayed
    const index = currentUsers.indexOf(myname); 
    
    if (index > -1){ //only splice array when item is found 
    	currentUsers.splice(index, 1); 
    }
    
    console.log(currentUsers); 
    
	var remainingMembers = "<font color='blue'>" + currentUsers + ", </font>";
		document.getElementById('members').innerHTML=""; 
		document.getElementById('members').innerHTML +=
	    	remainingMembers; 
	    	
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('status').style.display = 'none';
    document.getElementById('leave').style.display = 'none';
	clearInterval(inthandle);
}

//To register a user

/*
//Listening for the "Submit Registration Details" button click
document.getElementById('submitRegisDetails').addEventListener("click", registerDetails)

function registerDetails(){
	//console.log("the button has been pressed now")
	
	//getting the registration details
	username = document.getElementById('regisUserName').value; 
	email = document.getElementById('regisEmailAddress').value; 
	password = document.getElementById('regisPassword').value;
	
	fetch(baseUrl+'chat/register/'+username+'/'+email+'/'+password,{
	method: 'get'
	})
	.then (response => response.json())
	.then (data => checkRegistration(data))
	.catch(error => {
		{alert("Error: Registration failed! Something went wrong");}
	})
} 

function checkRegistration(results){
	var status = results['status']; 
	
	if (status != "success"){
		alert("Registration Error! Username or Email already exists / Check password length");
		leaveSession(); 
		return; 
	}
	var currentUser = results['user'];
	alert("You are successfully registered"); 
	
	username = document.getElementById('regisUserName').value = ''; 
	email = document.getElementById('regisEmailAddress').value = ''; 
	password = document.getElementById('regisPassword').value = '';
}
*/















