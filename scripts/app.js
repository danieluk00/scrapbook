const addContainer = document.querySelector('.add-container');
const listContainer = document.querySelector('.list-container');
const listOfArticles = document.querySelector('.list-group');
const addCard = document.querySelector('.add-article');
const addForm = document.querySelector('.add-form');
const addOverlay = document.querySelector('.overlay');
const wrapper = document.querySelector('.wrapper');
const extraOptionsDiv = document.querySelector('.extra-options');

const debug=true;

//Plus icon clicked
const showAddContainer = () => {
    changeVisibility(listContainer, 'hide');
    animateCSS(addContainer, 'fadeIn', 'show')

    document.querySelector('.enter-title').focus();
}

//List icon clicked
const showListContainer = () => {
    animateCSS(listContainer,'fadeIn','show');
    changeVisibility(addContainer, 'hide');
}

//Change section
const changeSection = newSection => {

    //Make all menu sections inactive
    while (document.querySelector('.active')) {
        document.querySelector('.active').classList.remove('active');
    }

    //Make new menu section active
    document.getElementById(newSection).classList.add('active');

    //Get filtered article list
    getArticles(newSection);
}

//Open extra options
const showExtraOptions = () => changeVisibility(extraOptionsDiv, 'toggle');

//Article entered
addForm.addEventListener('submit', e => {
    e.preventDefault();

    let title = addForm.title.value;
    let url =  addForm.url.value;
    let tags = addForm.tags.value;

    console.log(url);
    console.log(tags);

    addtoFirebase(title,url,tags);
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
const getArticles = (type) => {
    log("Get articles of type " + type)

    listOfArticles.innerHTML = `<ul class="list-group"`;

    db.collection('articles')
        .where('uid','==',UID)
        .orderBy('created_at')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                
                //let unread = change.doc.data().unread ? `<span class="badge badge-primary badge-pill">Unread</span>` : ``;

                let unread=change.doc.data().unread;
                let unreadClass = unread ? `unread` : ``;

                let title = change.doc.data().title;
                let url = change.doc.data().url;
                let docID = change.doc.id.toString()

                let render=true;

                let html = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="article-title ${unreadClass}"><a href="${url}" target="_blank" onclick="readArticle('${docID}')">${title}</a></span>
                <i class="far fa-edit edit" title="Edit"></i>
                <i class="far fa-trash-alt delete" title="Delete"></i>
                </li>
                `;
                

                if (type=='unread' && unread==false) {
                    html="";
                } else if (type=='tags') {
                    html="";
                }

                listOfArticles.innerHTML += html;

            });

            listOfArticles.innerHTML += `</ul>`;

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

            })

        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}
