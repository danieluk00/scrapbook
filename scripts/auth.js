let UID, userEmail, loggedIn;
const loginBtn = document.querySelector('.username');

loginBtn.addEventListener('submit', e => {
    e.preventDefault();
    loginWithGoogle();
})

auth.onAuthStateChanged(user => {

  if (user) {
    log('Logged in');
    UID = user.uid;
    userEmail = user.email;
    loginBtn.textContent = userEmail;
    loggedIn=true;

    getArticles('unread');

  } else {

    log('Not logged in')
    loggedIn = false;
    loginWithGoogle();
  }

})

const provider = new firebase.auth.GoogleAuthProvider();

const loginWithGoogle = () => {

  firebase.auth().signInWithPopup(provider).then(function(result) {
    var token = result.credential.accessToken;
    var user = result.user;
    setCookie('uid',user.uid,365);
    setCookie('email',user.email,365);
    setUserFromCookie();

  }).catch(function(error) {

    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });

}