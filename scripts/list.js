//SHOW ARTICLES

//Get articles from Firebase
const getArticles = () => {
    log("Get articles of type " + section)

    articleArray=[];
    tagArray=['starred']; //Start with blank array (except for 'Starred' which is default)

    db.collection("articles")
        .where("uid", "==", UID)
        .orderBy('created_at')
        .get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    addToTagArray(doc); //Generate tag array
                    articleArray.push(doc); //Populate article array (for use offline)
        });

        articleArray.reverse(); //Reverse array to show most recent articles first
        renderList(); //Then render list on page

    })
    .catch(function(error) {
        log("Error getting documents: ", error);
    });
};

//Render list of articles from array
const renderList = () => {

    let visibleCount=0, totalCount=0;

    //Make list elements visible
    changeVisibility(listOfArticles,'show');
    changeVisibility(tagContainer,'hide');
    changeVisibility(search,'show');

    listOfArticles.innerHTML = `<ul class="list-group"`; //Start of ul list

    articleArray.forEach(article => {

        //Get properties of article from array
        let unread=article.data().unread;
        let unreadClass = unread ? `class="unread"` : ``;

        let title = article.data().title;
        let url = article.data().url;
        let description = article.data().description;
        let tags = article.data().tags;
        let docID = article.id;
        let domain =  getSite(url);

        //Get any search filter term entered
        let searchTerm = search.search.value.trim().toLowerCase();

        let tagHTML =`<span>`;
        let tag = splitTags(tags); //For each article, get tags and split string
        tag.forEach(tag => {
            if (tag!=tagFilter) {
                tagHTML += `<span class="badge inline-tag badge-pill badge-${tagClass(tag)}" onclick="showTag('${tag}')">${tagName(tag)}</span>`
            }
        })

        tagHTML += `<span>`;

        if (tagHTML == `<span></span>`) {
            tagHTML = ``;
        }

        //Create HTML template
        let html="";

        if (visibleCount<maxInList) {
            html = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="article-main">
                <span class="article-title"><a href="${url}" ${unreadClass} target='_blank' onclick="readArticle('${docID}')">${title}</a> ${domain}</span>
                ${tagHTML}
            </div>
            <span class="icons">
                <i class="far fa-edit edit" title="Edit" onclick="editArticle('${docID}','${title}','${url}','${description}','${tags}',${unread})"></i>
                <i class="far fa-trash-alt delete" title="Delete" onclick="deleteArticle('${docID}', '${title}',parentElement.parentElement)"></i>
            </span>
            </li>
            `;
        }
    
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
        //Don't show more than 25 articles on the page
        if (visibleCount>=maxInList) {
            html=""
        }
        //Get visible total
        if (html!="") {
            visibleCount++;
        }

        //Show article on page
        listOfArticles.innerHTML += html;
    
    })

    //Update caption with number of articles
    if (section=="unread") {

        if (totalCount==0) {
            articleCountText.innerHTML = `No unread articles to show. <a href="#" onclick="showAddContainer()">Click here</a> to add one.`;
        } else {
            articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>unread</strong> articles`;
        }

    } else if (section=="archive") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} <strong>archived</strong> articles`;
    } else if (section=="tags") {
        articleCountText.innerHTML = `Showing ${visibleCount} of ${totalCount} articles tagged <span class="badge inline-tag badge-pill badge-${tagClass(tagFilter)}">${tagName(tagFilter)}</span>`;     
    }
}

//Create array of active tags
const addToTagArray = doc => {

    let tag = splitTags(doc.data().tags); //For each article, get tags and split string
    tag.forEach(tag => {
        //For each one, add to tag array if it doesn't already exist
        if (tag!="" && tagArray.includes(tag)==false) {
            tagArray.push(tag)
        }
    })

    tagArray.sort(); //Sort alphabetically
}

const splitTags = tags => tags.toLowerCase().split(',');

//Show all tags currently active
const renderTags = () => {
    log('Render tags');

    //Show containers
    changeVisibility(listOfArticles,'hide');
    changeVisibility(tagContainer,'show');
    changeVisibility(search,'hide');
    changeVisibility(tagTitle,'show');

    tagGroup.innerHTML = ``;

    tagArray.forEach(tag => {

        //For each tag in array add HTML to page
        let html = `<button type="button" class="btn btn-${tagClass(tag)} tag-btn" onclick="showTag('${tag}')">${tagName(tag)} <span class="badge badge-light tag-number">${getTaggedNumber(tag)}</span></button>`;
        tagGroup.innerHTML += html;
    })

    tagTitle.textContent = tagGroup.innerHTML == `` ? "No tags to show" : "Select a tag to view associated articles:";
}

const tagClass = tag => tag=='starred' ? 'warning' : 'dark';

const tagName = tag => tag.charAt(0).toUpperCase() + tag.substring(1,tag.length);

//Returns number of articles with a particular tag
const getTaggedNumber = tag => {
    let count=0;

    articleArray.forEach(article => {
        if (article.data().tags.toLowerCase().includes(tag.toLowerCase())) {
            count++;
        }
    })
    return count;
}

//Show articles associated to a selected tag
const showTag = tag => {
    log('Show tag: ' + tag);
    section="tags";

    tagFilter = tag;
    renderList();

    animateCSS(listContainer,'fadeIn');
}

//SEARCH FILTER

//Listen for search filter term change
search.addEventListener('keyup', e => {
    e.preventDefault();
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
        log("Error getting document:", error);
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