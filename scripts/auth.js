let UID, userName, loggedIn;
const userNameBtn = document.querySelector('.username');

userNameBtn.addEventListener('submit', e => {
    e.preventDefault();
    loginWithGoogle();
})

auth.onAuthStateChanged(user => {

  if (user) {

    log('Logged in: '+user);
    UID = user.uid;
    userName = user.displayName;
    userNameBtn.textContent = userName;
    changeVisibility(loginContainer,'hide');
    changeVisibility(userNameBtn,'show');
    changeVisibility(listContainer,'show');

    loggedIn=true;

    getArticles('unread');

  } else {

    log('Not logged in')
    loggedIn = false;

    changeVisibility(loginContainer,'show');
    changeVisibility(listContainer,'hide');
    changeVisibility(addContainer,'hide');
    changeVisibility(userNameBtn,'hide');

  }

})

const provider = new firebase.auth.GoogleAuthProvider();

const loginWithGoogle = () => {

   firebase.auth().signInWithPopup(provider).then(function(result) {
        if (result.credential) {
          var token = result.credential.accessToken;
        }
        var user = result.user;
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;

        document.querySelector('.login-error').textContent=errorMessage;
        // ...
      });

}


const logout = () => {
  if (confirm('Are you sure you want to log out?')) {

    firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }, function(error) {
      // An error happened.
    });

} else {
    // Do nothing!
}

}