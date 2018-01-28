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

/**
* initApp handles setting up the Firebase context and registering
* callbacks for the auth status.
*
* The core initialization is in firebase.App - this is the glue class
* which stores configuration. We provide an app name here to allow
* distinguishing multiple app instances.
*
* This method also registers a listener with firebase.auth().onAuthStateChanged.
* This listener is called when the user is signed in or out, and that
* is where we update the UI.
*
* When signed in, we also authenticate to the Firebase Realtime Database.
*/

var provider = new firebase.auth.FacebookAuthProvider();

function initApp() {
  // Listen for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
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

  // // Request an OAuth token from the Chrome Identity API.
  // chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
  //   if (chrome.runtime.lastError && !interactive) {
  //     console.log('It was not possible to get a token programmatically.');
  //   } else if(chrome.runtime.lastError) {
  //     console.error(chrome.runtime.lastError);
  //   } else if (token) {
  //     // Authorize Firebase with the OAuth Access Token.
  //     var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  //     firebase.auth().signInWithCredential(credential).catch(function(error) {
  //       // The OAuth token might have been invalidated. Lets' remove it from cache.
  //       if (error.code === 'auth/invalid-credential') {
  //         chrome.identity.removeCachedAuthToken({token: token}, function() {
  //           startAuth(interactive);
  //         });
  //       }
  //     });
  //   } else {
  //     console.error('The OAuth Token was null');
  //   }
  // });

}

/**
* Starts the sign-in process.
*/
function startSignIn() {
  document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    startAuth(true);
  }
}

window.onload = function() {
  initApp();
};
