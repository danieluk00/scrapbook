const addContainer = document.querySelector('.add-container');
const listContainer = document.querySelector('.list-container');
const loginContainer = document.querySelector('.login-container');
const listOfArticles = document.querySelector('.list-group');
const tagGroup = document.querySelector('.tag-group');
const addCard = document.querySelector('.add-article');
const addForm = document.querySelector('.add-form');
const addOverlay = document.querySelector('.overlay');
const wrapper = document.querySelector('.wrapper');
const extraOptionsDiv = document.querySelector('.extra-options');
const search = document.querySelector('.search');
const loginBtn = document.querySelector('.login-btn');
const articleCountText = document.querySelector('.article-Count');
const listNav = document.querySelector('.list-nav');

let section="unread", listSection='unread', articleArray=[], tagArray=[], tagCountArray=[], searchTerm, justAdded, tagFilter, addMode, editDocID;
const debug=true;

//ADD NEW ARTICLE

//Add article - show more options
const showExtraOptions = () => changeVisibility(extraOptionsDiv, 'toggle');

//New article submitted
addForm.addEventListener('submit', e => {
    e.preventDefault();

    let title = addForm.title.value;
    let url = addForm.url.value;
    let tags = addForm.tags.value;
    let description = addForm.description.value;
    let unread = !addForm.markasread.checked;

    addtoFirebase(title,url,tags,description,unread);
})

//Add new article to DB
const addtoFirebase = (title, url, tags, description, unread) => {

    const now = new Date();

    const object = {
        title,
        url,
        tags,
        description,
        uid: UID,
        unread,
        created_at:firebase.firestore.Timestamp.fromDate(now)
    }

    //Set add or edit action
    if (addMode=='add') {
        db.collection("articles").add(object).then(() => {
            getArticles();
            changeSection(listSection);
        });
    } else {
        db.collection("articles").doc(editDocID).set(object).then(() => {
            getArticles();
            changeSection(listSection);
        });
    }
}

//SHOW ARTICLES

//Get articles from Firebase
const getArticles = () => {
    log("Get articles of type " + section)

    articleArray=[];
    tagArray=[];

    db.collection("articles").where("uid", "==", UID).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            //Add documents to array
            addToTagArray(doc);
            articleArray.push(doc);
        });

        renderList(); //Then render list on page

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
};

//Render list of articles from array
const renderList = () => {

    let visibleCount=0, totalCount=0;

    //Make list elements visible
    changeVisibility(listOfArticles,'show');
    changeVisibility(tagGroup,'hide');
    changeVisibility(search,'show');

    listOfArticles.innerHTML = `<ul class="list-group"`; //Start of ul list

    articleArray.forEach(article => {

        //Get properties of article from array
        let unread=article.data().unread;
        let unreadClass = unread ? `unread` : ``;

        let title = article.data().title;
        let url = article.data().url;
        let description = article.data().description;
        let tags = article.data().tags;
        let docID = article.id;

        //Get any search filter term entered
        let searchTerm = search.search.value.trim().toLowerCase();
        changeVisibility(search,'show');

        //Create HTML template
        let html = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
        <span class="article-title ${unreadClass}"><a href="${url}" target="_blank" onclick="readArticle('${docID}')">${title}</a></span>
        <span class="icons">
            <i class="far fa-edit edit" title="Edit" onclick="editArticle('${docID}','${title}','${url}','${description}','${tags}','${unread}')"></i>
            <i class="far fa-trash-alt delete" title="Delete" onclick="deleteArticle('${docID}', '${title}',parentElement.parentElement)"></i>
        </span>
        </li>
        `;
    
        //Count total articles in section (without filters)
        if ((section=='unread' && unread) || (section=='archive' && !unread) || (section=='tags' && tags.toLowerCase().includes(tagFilter)))  {
            totalCount++;
        }
        //Filter out articles from other sections
        if ((section=='unread' && !unread) || (section=='archive' && unread))  {
            html="";
        }
        //Filter out articles if search filter text entered
        if (searchTerm!="" && (!title.toLowerCase().includes(searchTerm) && !description.toLowerCase().includes(searchTerm) && !tags.toLowerCase().includes(searchTerm))) {
            html="";
        }
        //In tags section, filter out articles not in selected tag
        if (section=='tags' && !tags.toLowerCase().includes(tagFilter)) {
            html=""
        }
        //Get visible total;
        if (html!="") {
            visibleCount++;
        }

        //Show article on page
        listOfArticles.innerHTML += html;
    
    })

    //Update caption with number of articles
    if (section=="unread") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>unread</strong> articles`;
    } else if  (section=="archive") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>archived</strong> articles`;
    } else if  (section=="tags") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} articles tagged <strong>'${tagFilter}'</strong>`;     
    }
}
//Create array of active tags
const addToTagArray = doc => {

    let tag = doc.data().tags.toLowerCase().split(','); //For each article, get tags and split string
    tag.forEach(tag => {
        //For each one, add to tag array if it doesn't already exist
        if (tag!="" && tagArray.includes(tag)==false) {
            tagArray.push(tag)
        }
    })

    tagArray.sort(); //Sort alphabetically
    log(tagArray);
}

//Show all tags currently active
const renderTags = () => {
    console.log('Render tags');

    //Show containers
    changeVisibility(listOfArticles,'hide');
    changeVisibility(tagGroup,'show');
    changeVisibility(search,'hide');

    tagGroup.innerHTML = ``;

    tagArray.forEach(tag => {
        //For each tag in array add HTML to page
        let html = `<button type="button" class="btn btn-dark tag-btn" onclick="showTag('${tag}')">${tag}</button>`;
        tagGroup.innerHTML += html;
    })
}

//Show articles associated to a selected tag
const showTag = tag => {
    tagFilter = tag;
    renderList();
}

//SEARCH FILTER

//Listen for search filter term change
search.addEventListener('keyup', () => {
     renderList();
});

//Filter todo list by search term
const filterList = (searchTerm) => {

    //Iterate array and add or remove 'filter-out' class
    Array.from(articleArray)
        .filter(article => !article.textContent.includes(searchTerm))
        .forEach((article) => article.classList.add('filter-out'))

    Array.from(articleArray)
    .filter(article => todarticleo.textContent.includes(searchTerm))
    .forEach((article) => article.classList.remove('filter-out'))
}

//ACTIONS ON ARTICLE LIST

//Set article as read when clicked
const readArticle = (docID) => {
    var docRef = db.collection("articles").doc(docID);

    docRef.get().then(function(doc) {
        if (doc.exists && doc.data().unread) {

            return docRef.update({
                unread: false
            }).then(function() {
                getArticles();
            })
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

//Delete article
const deleteArticle = (docID, title,parentElement) => {
    if (confirm(`Are you sure you want to delete '${title}'?`)) {

        animateCSS(parentElement,'fadeOutLeft','hide');
        setTimeout(() => {
            db.collection("articles").doc(docID).delete().then(function() {
                getArticles();
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });
        }, 500);
    }
}