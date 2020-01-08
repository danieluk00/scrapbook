let UID, userName, loggedIn;
const userNameBtn = document.querySelector('.fa-user');
const loginForm = document.querySelector('.login-form');
const loginInput = document.querySelector('.login-input');
const loginError = document.querySelector('.login-error');


auth.onAuthStateChanged(user => {

  if (user) {

    log('Logged in: '+user);
    UID = user.uid;
    userName = user.email;
    //userNameBtn.textContent = userName;
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

  if (document.getElementById('login-login').classList.contains('active')) {

    let email = loginForm.email.value;
    let password = loginForm.password.value
  
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    
        setErrorMessage(errorMessage);
        animateCSS(loginForm,'shake');
        // ...
      });
  
  } else if (document.getElementById('login-reset').classList.contains('active')) {
    resetPassword();

  } else if (document.getElementById('login-create').classList.contains('active')) {
    createUser();

  }
})

const createUser = () => {

  var emailAddress = loginForm.email.value;
  var password = loginForm.password.value;

  firebase.auth().createUserWithEmailAndPassword(emailAddress, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    setErrorMessage(errorMessage)
    animateCSS(loginForm,'shake');
    // ...
  });
}


const logout = () => {
  if (confirm('Logged in as '+userName+'\n\nAre you sure you want to log out?')) {
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
  setErrorMessage("");
});

const setErrorMessage = text => loginError.textContent=text;

const resetPassword = () => {

  setErrorMessage("");

  var auth = firebase.auth();
  var emailAddress = loginForm.email.value;
  
  auth.sendPasswordResetEmail(emailAddress).then(function() {

    setErrorMessage('You will receive an email with a link to reset your password.');

  }).catch(function(error) {

    setErrorMessage(errorMessage)
    animateCSS(loginForm,'shake');

  });

}