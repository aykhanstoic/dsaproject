class DoubleLinkedNode {
    next;
    prev;
    url;

    constructor(urlString, prevNode, nextNode) {
        this.next = nextNode;
        this.prev = prevNode;
        this.url = urlString;
    }

}

var headNode;
var currentNodePage;


function visit(url) {
    var newNode = new DoubleLinkedNode(url, currentNodePage, null);

    if (currentNodePage) {
        currentNodePage.next = newNode
    } else {
        headNode = newNode;
    }
    currentNodePage = newNode;
}

function current_page() {
    if (currentNodePage == null) return null
    return currentNodePage.url;
}

function forward(steps) {
    var curNode = currentNodePage;
    while (steps > 0 && curNode && curNode.next) {
        curNode = curNode.next;
        steps--;
    }
    currentNodePage = curNode;
    return curNode.url;
}

function backwards(steps) {
    var curNode = currentNodePage;
    while (steps > 0 && curNode && curNode.prev) {
        curNode = curNode.prev;
        steps--;
    }
    currentNodePage = curNode;
    return curNode.url;
}



function initBrowserHistory(homepage) {
    headNode = homepage;
    currentNodePage = homepage;
}


function printPages() {
    var n = headNode;
    var i = 0;
    while (n) {

        if (currentNodePage == n) console.log(i + " " + n.url + " <= current page");
        else console.log(i + " " + n.url);
        n = n.next;
        i++;
    }
}