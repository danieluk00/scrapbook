let UID, userName, loggedIn;
const userNameBtn = document.querySelector('.username');
const loginForm = document.querySelector('.login-form');
const loginInput = document.querySelector('.login-input');

userNameBtn.addEventListener('submit', e => {
    e.preventDefault();
    loginWithGoogle();
})

auth.onAuthStateChanged(user => {

  if (user) {

    log('Logged in: '+user);
    UID = user.uid;
    userName = user.email;
    userNameBtn.textContent = userName;
    changeVisibility(loginContainer,'hide');
    changeVisibility(listNav,'show');
    changeVisibility(listContainer,'show');
    changeVisibility(userNameBtn,'show');

    loggedIn=true;

    getArticles('unread');

  } else {

    log('Not logged in')
    loggedIn = false;

    changeVisibility(loginContainer,'show');
    changeVisibility(listNav,'hide');
    changeVisibility(listContainer,'hide');
    changeVisibility(addContainer,'hide');
    changeVisibility(userNameBtn,'hide');

    document.querySelector('.login-error').textContent="";
    loginForm.password.value="";

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


loginForm.addEventListener('submit', e => {

  e.preventDefault();

  let email = loginForm.email.value;
  let password = loginForm.password.value;

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    document.querySelector('.login-error').textContent=errorMessage;
    animateCSS(loginForm,'shake');
    // ...
  });

})

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

loginInput.addEventListener('keyup', () => {
  document.querySelector('.login-error').textContent="";
});

loginInput.addEventListener('keyup', () => {
  document.querySelector('.login-password-input').textContent="";
});