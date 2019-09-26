const addContainer = document.querySelector('.add-container');
const listContainer = document.querySelector('.list-container');
const loginContainer = document.querySelector('.login-container');
const listOfArticles = document.querySelector('.list-group');
const addCard = document.querySelector('.add-article');
const addForm = document.querySelector('.add-form');
const addOverlay = document.querySelector('.overlay');
const wrapper = document.querySelector('.wrapper');
const extraOptionsDiv = document.querySelector('.extra-options');
const plusIcon = document.querySelector('.fa-plus-circle');
const search = document.querySelector('.search');
const loginBtn = document.querySelector('.login-btn');

let section='unread', articleArray=[];
const debug=true;

const onLoad = () => {
    log('loaded');
}

//Plus icon clicked
const showAddContainer = () => {
    changeVisibility(plusIcon, 'hide');
    changeVisibility(listContainer, 'hide');
    animateCSS(addContainer, 'fadeIn', 'show')

    document.querySelector('.enter-title').focus();
}

//List icon clicked
const showListContainer = () => {
    animateCSS(listContainer,'fadeIn','show');
    animateCSS(plusIcon, 'fadeIn', 'show')
    changeVisibility(addContainer, 'hide');
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

    renderList();

}

//Open extra options
const showExtraOptions = () => changeVisibility(extraOptionsDiv, 'toggle');

//Article entered

addForm.addEventListener('submit', e => {

    e.preventDefault();

    let title = addForm.title.value;
    let url =  addForm.url.value;
    let tags = addForm.tags.value;

    addtoFirebase(title,url,tags);
    getArticles();
})

//Add new article to DB
const addtoFirebase = (title, url, tags) => {

    const now = new Date();

    const object = {
        title,
        url,
        tags,
        uid: UID,
        unread: true,
        created_at:firebase.firestore.Timestamp.fromDate(now)
    }

    db.collection("articles").add(object).then(() => {

        animateCSS(addContainer, 'zoomOut', 'hide')

        setTimeout(() => {
            showListContainer();
        },1000);

    })

}

//Get articles
const getArticles = () => {
    log("Get articles of type " + section)

    articleArray=[];

    db.collection("articles").where("uid", "==", UID)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            articleArray.push(doc);
       
        });

        renderList();

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

};

const renderList = () => {

    console.log('Render list');

    listOfArticles.innerHTML = `<ul class="list-group"`;

    articleArray.forEach(article => {

        let unread=article.data().unread;
        let unreadClass = unread ? `unread` : ``;
        let title = article.data().title.length>25 ? article.data().title.substring(0, 25) + '...' : article.data().title;
    
        let url = article.data().url;
        let docID = article.id;
    
        let render=true;
    
        let html = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
        <span class="article-title ${unreadClass}"><a href="${url}" target="_blank" onclick="readArticle('${docID}')">${title}</a></span>
        <i class="far fa-edit edit" title="Edit"></i>
        <i class="far fa-trash-alt delete" title="Delete"></i>
        </li>
        `;
        
    
        if ((section=='unread' && !unread) || (section=='archive' && unread) || (section=='tags')) {
            html="";
        }
    
        listOfArticles.innerHTML += html;
    

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
    const searchTerm = search.value.trim();
    filterList(searchTerm);
});

//Filter todo list by search term
const filterList = (searchTerm) => {

    //Iterate array and add or remove 'filter-out' class
    Array.from(list.children)
        .filter(todo => !todo.textContent.includes(searchTerm))
        .forEach((todo) => todo.classList.add('filter-out'))

    Array.from(list.children)
    .filter(todo => todo.textContent.includes(searchTerm))
    .forEach((todo) => todo.classList.remove('filter-out'))
    
}