const addContainer = document.querySelector('.add-container');
const listContainer = document.querySelector('.list-container');
const listOfArticles = document.querySelector('.list-group');
const addCard = document.querySelector('.add-article');
const addForm = document.querySelector('.add-form');
const addOverlay = document.querySelector('.overlay');
const wrapper = document.querySelector('.wrapper');
const extraOptionsDiv = document.querySelector('.extra-options');
const plusIcon = document.querySelector('.fa-plus-circle')

let section='unread';
const debug=true;

const onLoad = () => {
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

    getArticles();

}

//Open extra options
const showExtraOptions = () => changeVisibility(extraOptionsDiv, 'toggle');

//Article entered

addForm.addEventListener('submit', e => {

    log(this);
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

        animateCSS(addContainer, 'zoomOutDown', 'hide')

        setTimeout(() => {
            showListContainer();
        }, 800);

    })

}

//Get articles
const getArticles = () => {
    log("Get articles of type " + section)

    listOfArticles.innerHTML = `<ul class="list-group"`;

    db.collection("articles").where("uid", "==", UID)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            let unread=doc.data().unread;
            let unreadClass = unread ? `unread` : ``;
            let title = doc.data().title.length>25 ? doc.data().title.substring(0, 25) + '...' : doc.data().title;

            let url = doc.data().url;
            let docID = doc.id;

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
       
        });

        listOfArticles.innerHTML += `</ul>`;
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

};


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