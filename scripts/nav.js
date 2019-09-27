//Change section
const changeSection = newSection => {

    log(newSection);

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
    changeVisibility(addContainer, 'show');
    changeVisibility(listContainer, 'hide');
    document.querySelector('.extra-options').classList.add('d-none');
    addMode='add';

    document.querySelector('.card-title').innerHTML=`<b>Add new article</b>`;
    document.querySelector('.add-article-btn').innerHTML="Add to scrapbook";

    addForm.title.value = "";
    addForm.url.value = "";
    addForm.tags.value = "";
    addForm.description.value ="";
    addForm.markasread.checked = false;

    document.querySelector('.enter-title').focus();
}

//Show list of articles
const showListContainer = () => {

    if (section=='unread' || section=='archive' || section=='tags') {
        listSection=section;
    }

    changeVisibility(addContainer, 'hide');
    changeVisibility(listContainer, 'show');
    listSection=='tags' ? renderTags() : renderList();
}


//Edit article
const editArticle = (docID,title,url,description,tags,unread) => {

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
    
    //showExtraOptions();

    editDocID = docID;

    document.querySelector('.enter-title').focus();
}

//Add/edit form cancel button clicked
const cancel = () => {
    changeSection(listSection);
}