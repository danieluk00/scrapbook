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


let section='unread', articleArray=[], tagArray=[], tagCountArray=[], searchTerm, justAdded, tagFilter, addMode, editDocID;
const debug=true;

const onLoad = () => {
    log('loaded');
}

//New article clicked
const showAddContainer = () => {
    changeVisibility(addContainer, 'show');
    changeVisibility(listContainer, 'hide');
    document.querySelector('.extra-options').classList.add('d-none');
    addMode='add';

    document.querySelector('.card-title').textContent="Add new article";
    document.querySelector('.add-article-btn').innerHTML="Add to scrapbook";

    addForm.title.value = "";
    addForm.url.value = "";
    addForm.tags.value = "";
    addForm.description.value ="";

    document.querySelector('.enter-title').focus();
}


//Change section
const changeSection = newSection => {

    if (newSection!=null) {
        section=newSection;
    }

    //Make all menu sections inactive
    while (document.querySelector('.active')) {
        document.querySelector('.active').classList.remove('active');
    }

    //Make new menu section active
    document.getElementById(section).classList.add('active');

    if (section=='add') {
        showAddContainer()
    } else {
        changeVisibility(addContainer, 'hide');
        changeVisibility(listContainer, 'show');
        section=='tags' ? renderTags() : renderList();
    }

}

//Open extra options
const showExtraOptions = () => changeVisibility(extraOptionsDiv, 'toggle');

//Article entered

addForm.addEventListener('submit', e => {

    e.preventDefault();

    let title = addForm.title.value;
    let url = addForm.url.value;
    let tags = addForm.tags.value;
    let description = addForm.description.value;

    addtoFirebase(title,url,tags,description);
})

//Add new article to DB
const addtoFirebase = (title, url, tags, description) => {

    const now = new Date();

    const object = {
        title,
        url,
        tags,
        description,
        uid: UID,
        unread: true,
        created_at:firebase.firestore.Timestamp.fromDate(now)
    }
    
    if (addMode=='add') {
        db.collection("articles").add(object).then(() => {
            getArticles();
            changeSection('unread');
        })
    } else {
        db.collection("articles").doc(editDocID).set(object).then(() => {
            getArticles();
            changeSection('unread');
        })
    }

}

//Get articles
const getArticles = () => {
    log("Get articles of type " + section)

    articleArray=[];
    tagArray=[];

    db.collection("articles").where("uid", "==", UID)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            addToTagArray(doc);
            articleArray.push(doc);
       
        });

        renderList();

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

};

const renderList = () => {

    let visibleCount=0, totalCount=0;

    console.log('Render list');
    
    changeVisibility(listOfArticles,'show');
    changeVisibility(tagGroup,'hide');

    listOfArticles.innerHTML = `<ul class="list-group"`;

    articleArray.forEach(article => {

        let unread=article.data().unread;
        let unreadClass = unread ? `unread` : ``;
        //let title = article.data().title.length>25 ? article.data().title.substring(0, 25) + '...' : article.data().title;
        let title = article.data().title;

        let url = article.data().url;
        let description = article.data().description;
        let tags = article.data().tags;
        let docID = article.id;

        let searchTerm = search.search.value.trim().toLowerCase();
        changeVisibility(search,'show');

    
        let html = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
        <span class="article-title ${unreadClass}"><a href="${url}" target="_blank" onclick="readArticle('${docID}')">${title}</a></span>
        <span class="icons">
            <i class="far fa-edit edit" title="Edit" onclick="editArticle('${docID}','${title}','${url}','${description}','${tags}','${title}')"></i>
            <i class="far fa-trash-alt delete" title="Delete" onclick="deleteArticle('${docID}', '${title}',parentElement)"></i>
        </span>
        </li>
        `;
    
        if ((section=='unread' && unread) || (section=='archive' && !unread) || (section=='tags' && tags.toLowerCase().includes(tagFilter)))  {
            totalCount++;
        }

        //Filter out articles from other sections
        if ((section=='unread' && !unread) || (section=='archive' && unread))  {
            html="";
        }
        
        //Filter out articles if search text entered
        if (searchTerm!="" && (!title.toLowerCase().includes(searchTerm) && !description.toLowerCase().includes(searchTerm) && !tags.toLowerCase().includes(searchTerm))) {
            html="";
        }

        if (section=='tags' && !tags.toLowerCase().includes(tagFilter)) {
            html=""
        }

        if (html!="") {
            visibleCount++;
        }

        removeAnimations();

        listOfArticles.innerHTML += html;
    
    })


    if (section=="unread") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>unread</strong> articles`;
    } else if  (section=="archive") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>archived</strong> articles`;
    } else if  (section=="tags") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} articles tagged <strong>'${tagFilter}'</strong>`;     
    }

}

const renderTags = () => {

    console.log('Render list');

    changeVisibility(listOfArticles,'hide');
    changeVisibility(tagGroup,'show');

    tagGroup.innerHTML = ``;

    changeVisibility(search,'hide');

    tagArray.forEach(tag => {

        let html = `
        <button type="button" class="btn btn-dark" onclick="showTag('${tag}')">
        ${tag}
        </button>
        `;

        tagGroup.innerHTML += html;

        //<span class="badge badge-light">4</span>

    })

}


//Set article as read
const readArticle = (docID) => {

    var docRef = db.collection("articles").doc(docID);

    docRef.get().then(function(doc) {
        if (doc.exists && doc.data().unread) {
            console.log("Document data:", doc.data());

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

const shortenTitle = title => title.length()>=20 ?  title.substring(1, 20) + '...' : title;


//Listen for search term change
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

const removeAnimations = () => {

    if (document.querySelector('.animated')) {
        document.querySelector('.animated').classList.remove('animated');
    }
    if (document.querySelector('.rubberBand')) {
        document.querySelector('.rubberBand').classList.remove('rubberBand');
    }

}

const addToTagArray = doc => {

    let tag = doc.data().tags.toLowerCase().split(',');
    tag.forEach(tag => {

        if (tag!="" && tagArray.includes(tag)==false) {
            tagArray.push(tag)
        }

    //countTags();

    })

    tagArray.sort();

    log(tagArray);
}

const showTag = tag => {

    log('Show tag: '+tag)
    tagFilter = tag;
    renderList();
}

const editArticle = (docID,title,url,description,tags) => {

    changeVisibility(addContainer, 'show');
    changeVisibility(listContainer, 'hide');
    document.querySelector('.extra-options').classList.add('d-none');
    addMode='edit';

    document.querySelector('.card-title').textContent="Edit article";
    document.querySelector('.add-article-btn').innerHTML="Save changes";

    addForm.title.value = title;
    addForm.url.value = url;
    addForm.tags.value = tags;
    addForm.description.value =description;

    editDocID = docID;

    document.querySelector('.enter-title').focus();
}
