//Change section
const changeSection = newSection => {

    log('Change to section: ' + newSection);

    newSection!=undefined ? section=newSection : "";

    //Make all menu sections inactive
    while (document.querySelector('.active')) {
        document.querySelector('.active').classList.remove('active');
    }
    //Make new menu section active in nav
    document.getElementById(section).classList.add('active');

    //Show section container
    section=='add' ? showAddContainer() : showListContainer();
}

//Show 'Add article' form
const showAddContainer = () => {

    if (!loggedIn) {
        return;
    }

    animateCSS(addContainer,'fadeIn');

    changeVisibility(addContainer, 'show');
    changeVisibility(listContainer, 'hide');
    changeVisibility(sortByDiv,'hide');

    document.querySelector('.extra-options').classList.add('d-none');
    changeVisibility(moreOptionsLink,'show');
    addMode='add';

    document.querySelector('.card-title').innerHTML=`<b>Add new article</b>`;
    document.querySelector('.add-article-btn').innerHTML="Add to scrapbook";

    addForm.title.value = "";
    addForm.url.value = "";
    addForm.tags.value = "";
    addForm.description.value ="";
    addForm.markasread.checked = false;

    //document.querySelector('.enter-title').focus();
}

//Show list of articles
const showListContainer = () => {
    
    if (!loggedIn) {
        return;
    }

    tagFilter="";

    if (section=='unread' || section=='archive' || section=='tags') {
        listSection=section;
    }

    animateCSS(listContainer,'fadeIn');
    changeVisibility(sortByDiv,'hide');
    changeVisibility(addContainer, 'hide');
    changeVisibility(listContainer, 'show');
    listSection=='tags' ? renderTags() : renderList();
}


//Edit article
const editArticle = (docID,title,url,description,tags,unread) => {

    animateCSS(addContainer,'fadeIn');

    changeVisibility(addContainer, 'show');
    changeVisibility(listContainer, 'hide');
    document.querySelector('.extra-options').classList.add('d-none');
    addMode='edit';

    document.querySelector('.card-title').innerHTML=`<b>Edit article:</b> ${title}`;
    document.querySelector('.add-article-btn').innerHTML="Save changes";

    addForm.title.value = title;
    addForm.url.value = url;
    addForm.tags.value = tags;
    addForm.description.value = description;
    addForm.markasread.checked = !unread;

    showExtraOptions();
    changeVisibility(moreOptionsLink,'hide');

    editDocID = docID;

   // document.querySelector('.enter-title').focus();
}

//Add/edit form cancel button clicked
const cancel = () => {
    changeSection(listSection);
}

const changeLoginTab = tab => {
    document.getElementById('login-create').classList.remove('active');
    document.getElementById('login-login').classList.remove('active');
    document.getElementById('login-reset').classList.remove('active');

    document.getElementById(tab).classList.add('active');

    if (tab=='login-login') {
        document.getElementById('login-instruction').innerText = "Enter your email address and password to login";
        document.getElementById('password-group').classList.remove('d-none');
        document.getElementById('login-submit').innerText = 'Login'
    } else if (tab=='login-create') {
        document.getElementById('login-instruction').innerText = "Enter your email address and choose a password to create an account";
        document.getElementById('password-group').classList.remove('d-none');
        document.getElementById('login-submit').innerText = 'Create account'
    } else if (tab=='login-reset') {
        document.getElementById('login-instruction').innerText = "Enter your email address to reset your password.";
        document.getElementById('password-group').classList.add('d-none');
        document.getElementById('login-submit').innerText = 'Reset password'
    }
}