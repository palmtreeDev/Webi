// Initialize Firebase
var config = {
  apiKey: "AIzaSyDpKNAAmDu7iwUFiVvLJmUm_DpaRVAhEFA",
  authDomain: "webi-96ddb.firebaseapp.com",
  databaseURL: "https://webi-96ddb.firebaseio.com",
  projectId: "webi-96ddb",
  storageBucket: "webi-96ddb.appspot.com",
  messagingSenderId: "846826250516"
};
firebase.initializeApp(config);

var providerData;
var currentUser;

var provider = new firebase.auth.FacebookAuthProvider();

function initApp() {
  //LOGIN
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('quickstart-button').textContent = 'Sign out';
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      // [END_EXCLUDE]
    } else {
      // Let's try to get a Google auth token programmatically.
      // [START_EXCLUDE]
      document.getElementById('quickstart-button').textContent = 'Sign-in with Facebook';
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('quickstart-button').disabled = false;
  });
  // [END authstatelistener]
  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
  document.getElementById('toggle-developer').addEventListener('click', devInfo, false);

  //POSTING COMMENTS
  document.getElementById('myButton').addEventListener('click', postComment, false);

}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function postComment(){
  var ref;
  var url = "";
  var d = new Date();
  var texts = document.getElementById('myTextArea').value;

  if (!isEmpty(texts)) {
    var data = {
      name: providerData[0].displayName,
      profile: providerData[0].photoURL,
      text: texts,
      time: d.getTime(),
      user_id: providerData[0].uid
    }
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      var str = (tabs[0].url);
      var realStr = str.replace("https://", "");
      realStr = realStr.replace(/\./g, "_");
      realStr = realStr.replace(/\//g, "`");
      url = new String('urls/' + realStr);
      if(url[url.length - 1] == '`') {
        url = url.slice(0,-1);
      }
      ref = firebase.database().ref(url);
      ref.push(data);
    });
    $('#myTextArea').val('')
  }
}

/**
* Start the auth flow and authorizes to Firebase.
* @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
*/
function startAuth(interactive) {

  var provider = new firebase.auth.FacebookAuthProvider();

  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log("facebook login success");

    /*add user to the users tree if they don't already exist*/
    var database = firebase.database();
    var ref = database.ref('users');
    console.log("ref: " + ref);
    ref.on('value', insertUser);

  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });

  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
}

function insertUser(data) {
  console.log("gotData called");
  var entry = data.val();
  var keys = Object.keys(entry);
  console.log("keys: " + keys);

  var found = false;
  var i = 0;
  while ((i < keys.length) && (!found)) {
    var db_uid = keys[i];
    found = (db_uid == providerData[0].uid);
    console.log("db_uid: " + db_uid);
    console.log("currentUser: " + providerData[0].uid);
    i++;
  }
  console.log("found: " + found.toString());

  if (!found) {
    var data = {
      name: providerData[0].displayName,
      profileUrl: providerData[0].photoURL,
      history: null
    }
    console.log("name: " + providerData[0].displayName);
    console.log("photoUrl: " + providerData[0].photoURL);

    var database = firebase.database();
    var ref = firebase.database().ref("users/" + providerData[0].uid);
    ref.set(data);
  }
}

function displayComment(){
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var str = (tabs[0].url);
    var realStr = str.replace("https://", "");
    realStr = realStr.replace(/\./g, "_");
    realStr = realStr.replace(/\//g, "`");
    url = new String('urls/' + realStr);
    if(url[url.length - 1] == '`') {
      url = url.slice(0,-1);
    }
    var ref = firebase.database().ref(url);
    ref.on('value',gotData);
  });
}

function gotData(data){
  $('#commentDiv').empty();
  var user = data.val();
  var keys = Object.keys(user);
  for(var i = 0; i < keys.length; i++){
    var k = keys[i];
    var comment = user[k].text;
    $('#commentDiv')
    .append("<div class='comment'><img class='profile' src='" + user[k].profile + "'><div class='commentText'>" + comment + "</div></div>");
  }
  $('#commentRow').scrollTop($('#commentRow')[0].scrollHeight);
  // for(var i = keys.length-1; i > 0; i--){
  //   var k = keys[i];
  //   var comment = user[k].text;
  //   // console.log(comment);
  //   $('#commentDiv')
  // .append("<p class='comment'>" + comment + "</p>");
  // }
}

/**
* Starts the sign-in process.
*/
function startSignIn() {
  // document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    startAuth(true);
  }
}

function devInfo() {
  var x = document.getElementById("developer-div");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

window.onload = function() {
  initApp();
  displayComment();
};
