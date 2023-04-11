//
//  
// An Improved Chat Program
// Onta and Koirala
// Software Development
// Spring 2023


#include <iostream>
#include <fstream>
#include <map>
#include <algorithm>
#include "httplib.h"
#include <vector>

using namespace httplib;
using namespace std;

const int port = 5005;

/*
void addUser(string username, string password, string email, map<string,string> &userMap) {
	/* iterate through users adding message to each 
	string jsonMessage = "{\"user\":\""+username+"\",\"pass\":\""+password+"\",\"email\":\""+email+"\"}";
	userMap[username] = jsonMessage;
	cout << "addUser output: "<< userMap[username] << endl;
}*/



//goes through a map and adds messages to users
void addMessage(string username, string message, map<string,vector<string>> &messageMap) {
	string jsonMessage = "{\"user\":\""+username+"\",\"message\":\""+message+"\"}";
	for (auto userMessagePair : messageMap) {
		username = userMessagePair.first;
		messageMap[username].push_back(jsonMessage);
	}
}



//retrieves the json list of messages for this specific user
string getMessagesJSON(string username, map<string,vector<string>> &messageMap) {
	bool first = true;
	string result = "{\"messages\":[";
	for (string message :  messageMap[username]) {
	//For the first message, no comma. For the rest, yes.
		if (not first) result += ","; 
		result += message;
		first = false;
	}
	result += "]}";
	messageMap[username].clear();
	return result;
}



int main(void) {
  Server svr;
  int nextUser=0;
  map<string,vector<string>> messageMap; //The main map of the users and the messages: string username is the key, vector of strings are the messages.  
  //map<string, string> userEmail; 
  //map<string, string> userMap; 
  vector<string> activeUsers; 
	
	
	
  //Returns the API Name. 
  svr.Get("/", [](const Request & /*req*/, Response &res) {
    res.set_header("Access-Control-Allow-Origin","*");
    res.set_content("Chat API", "text/plain");
  });


  
  
 svr.Get(R"(/chat/join/(.*))", [&](const Request& req, Response& res) {
   res.set_header("Access-Control-Allow-Origin","*");
   string username = req.matches[1];
   string result;
   vector<string> empty;
   cout << username << " joins" << endl;
   activeUsers.push_back(username); 
   for (int i=0; i<activeUsers.size(); ++i){
   		cout<<activeUsers[i]<<endl; 
   }
  	

   // Check if user with this name exists
   if (messageMap.count(username)) {
   	result = "{\"status\":\"exists\"}";
   } else {
   	// Add user to messages map
   	messageMap[username]=empty;
   	result = "{\"status\":\"success\",\"user\":\"" + username + "\"}";
   }
   res.set_content(result, "text/json");
 });






	//Handles the sending of messages
   svr.Get(R"(/chat/send/(.*)/(.*))", [&](const Request& req, Response& res) {
    res.set_header("Access-Control-Allow-Origin","*");
	string username = req.matches[1];
	string message = req.matches[2];
	string result; 
	
    if (!messageMap.count(username)) {
    	result = "{\"status\":\"baduser\"}";
	} else {
		addMessage(username,message,messageMap);
		result = "{\"status\":\"success\"}";
	}
    res.set_content(result, "text/json");
  });
  
  
  
  
  //Grabs the messages that are sent
   svr.Get(R"(/chat/fetch/(.*))", [&](const Request& req, Response& res) {
    string username = req.matches[1];
    res.set_header("Access-Control-Allow-Origin","*");
    string resultJSON = getMessagesJSON(username,messageMap);
    res.set_content(resultJSON, "text/json");
  });
  
  
  
  
  
  //Linux Console Output
  cout << "Server listening on port " << port << endl;
  svr.listen("0.0.0.0", port);




}//End of int main
