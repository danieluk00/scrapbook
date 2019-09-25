//Log text to console if debug=true
const log = text => debug ? console.log(text) : "";

//Change element visibility
const changeVisibility = (element, action) => {

    const classes=element.classList;
    const hide = 'd-none';

    if (action=='show' && classes.contains(hide)) {
        classes.remove(hide);

    } else if (action=='hide') {
        classes.add(hide);

    } else if (action=='toggle') {
        classes.contains(hide) ? classes.remove(hide) :classes.add(hide);
    }
}

//Get existing cookie
const getCookie = cname => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
//Check if cookie exists
const checkCookie = cname => {
    if (getCookie(cname)=="") {return false;}
    else {return true;}
}  

//Set new cookie
const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//Delete from firebase
const deleteDoc = (collectionName, id) => db.collection(collectionName).doc(id).delete();


//Animate items
const animateCSS = (element, animationName, hide, callback) => {
    element.classList.add('animated', animationName);

    if (hide=='show' && element.classList.contains('d-none')) {
        element.classList.remove('d-none');
    }

    function handleAnimationEnd() {
        element.classList.remove('animated', animationName)
        element.removeEventListener('animationend', handleAnimationEnd)

        hide=='hide' ? element.classList.add('d-none') : "";
        
        if (typeof callback === 'function') callback()
    }

    element.addEventListener('animationend', handleAnimationEnd)
}