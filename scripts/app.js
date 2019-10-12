const addContainer = document.querySelector('.add-container');
const listContainer = document.querySelector('.list-container');
const loginContainer = document.querySelector('.login-container');
const listOfArticles = document.querySelector('.list-group');
const tagContainer = document.querySelector('.tag-container');
const tagGroup = document.querySelector('.tag-group');
const tagTitle = document.querySelector('.tag-title');
const addCard = document.querySelector('.add-article');
const addForm = document.querySelector('.add-form');
const addOverlay = document.querySelector('.overlay');
const wrapper = document.querySelector('.wrapper');
const extraOptionsDiv = document.querySelector('.extra-options');
const search = document.querySelector('.search');
const loginBtn = document.querySelector('.login-btn');
const articleCountText = document.querySelector('.article-Count');
const listNav = document.querySelector('.list-nav');
const moreOptionsLink = document.querySelector('.expand-options-icon');
const sortByDiv = document.querySelector('.sortby-div');
const maxInList=20;

let section="unread", listSection='unread', sortOrder="recent", articleArray=[], tagArray=[], tagCountArray=[], searchTerm, justAdded, tagFilter, addMode, editDocID;
const debug=true;

//ADD NEW ARTICLE

//Add article - show more options
const showExtraOptions = () => {
    changeVisibility(extraOptionsDiv, 'toggle');
    updateTitle();
}

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

//Listener for URL entered
document.querySelector('.enter-url').addEventListener('input', () => {
    updateTitle();
});

//Update title if blank
const updateTitle = () => {
    if (document.querySelector('.enter-title').value=="") {
        document.querySelector('.enter-title').value = getTitleFromURL(document.querySelector('.enter-url').value);
    }
}

//Add new article to DB
const addtoFirebase = (title, url, tags, description, unread) => {

    const now = new Date();
    updateTitle(); //If blank, autogenerate title from URL

    const object = {
        title: removeSpecialCharacters(title),
        url,
        tags: removeSpecialCharactersExceptCommas(tags),
        description: removeSpecialCharacters(description),
        uid: UID,
        unread,
        created_at:firebase.firestore.Timestamp.fromDate(now)
    }

    getSite(url);

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

//REGEX
const removeSpecialCharacters = string => string.replace(/[\/\\,+~'"*{}]/g, '');

const removeSpecialCharactersExceptCommas = string => string.replace(/[\/\\+~'"*{}]/g, '');

//Extracts domain from URL, e.g. guardian.co.uk
const getSite = url => {

    //Trim HTTP or HTTPS
    if (url.substring(0,7)=="http://") {
        url=url.substring(7,url.length)

    } else if (url.substring(0,8)=="https://") {
        url=url.substring(8,url.length)
    }

    //Trim WWW
    if (url.substring(0,4)=="www.") {
        url=url.substring(4,url.length)
    }

    //Trim everything after domain
    if (url.indexOf('/')!=-1) {
        url = url.substring(0, url.indexOf('/'));
    } else if (url.indexOf('?')!=-1) {
        url = url.substring(0, url.indexOf('/'));
    }

    if (url.length>25) {
        url = url.substring(0,22) + "..."
    }

    return url;

}

//Extracts title from URL
//.e.g https://www.theguardian.com/politics/2019/sep/28/boris-johnson-no-deal-brexit -> Boris johnson no deal brexit
const getTitleFromURL = url => {

    let title = url
    let i=0;

    //Trim HTTP or HTTPS
    if (title.substring(0,7)=="http://") {
        title=title.substring(7,title.length)

    } else if (title.substring(0,8)=="https://") {
        title=title.substring(8,title.length)
    }

    //Remove trailing slash
    if (title.substring(title.length-1)=="/") {
        title = title.substring(0,title.length-1);
    }

    //Keep removing everything up to the slash
    while (title.indexOf('/')!=-1 && (title.indexOf('/')!=title.length) && i<20) {
        title = title.substring(title.indexOf('/')+1,title.length);
        i++;
    }

    //Replace dashes with spaces
    while (title.indexOf('-')!=-1 && i<20) {
        title= title.replace("-"," ");
        i++;
    }

    //Capitalise first letter of words:
    title = capitaliseFirstLetterOfWords(title);
    title = title.trim()

    if (title=="") {
        title = url;
    }

    return title;

}

const capitaliseFirstLetterOfWords = str => {
    //Split the string into array of words
    let splitStr = str.toLowerCase().split(' ');
    for (let i=0; i < splitStr.length; i++) {
        //Capitlise each word and save back to array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }