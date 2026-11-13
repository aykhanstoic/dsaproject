// node for one page, prev = page before, next = page after
class DoubleLinkedNode {
    next;
    prev;
    url;
    visitedAt;

    constructor(urlString, prevNode, nextNode) {
        this.next = nextNode;
        this.prev = prevNode;
        this.url = urlString;
        this.visitedAt = new Date();
    }

}

// stack for deleted pages so they can be restored
class DeletedStack {
    top;
    size;

    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(item) {
        this.top = { item: item, below: this.top };
        this.size++;
    }

    pop() {
        if (this.top == null) return null
        var item = this.top.item;
        this.top = this.top.below;
        this.size--;
        return item;
    }

    isEmpty() {
        return this.top == null;
    }
}

// head = oldest page, tail = newest page
class BrowserHistory {
    head;
    tail;
    curNode;
    size;
    capacity;
    deleted;



    constructor(homepage, capacity = 50) {
        if (capacity < 1) throw new Error("capacity must be at least 1");

        this.capacity = capacity;
        this.head = null;
        this.tail = null;
        this.curNode = null;
        this.size = 0;
        this.deleted = new DeletedStack();

        if (homepage) {
            var node = new DoubleLinkedNode(homepage, null, null);
            this.head = node;
            this.tail = node;
            this.curNode = node;
            this.size = 1;
        }
    }

    visit(url) {
        var newNode = new DoubleLinkedNode(url, this.curNode, null);

        if (this.curNode) {
            // remove forward history
            var n = this.curNode.next;
            while (n) {
                var nextNode = n.next;
                n.prev = null;
                n.next = null;
                this.size--;
                n = nextNode;
            }
            this.curNode.next = newNode
        } else {
            this.head = newNode;
        }

        this.tail = newNode;
        this.curNode = newNode;
        this.size++;

        if (this.size > this.capacity) this.removeOldest();
        return url;
    }

    back(steps) {
        if (this.curNode == null) return null
        while (steps > 0 && this.curNode.prev) {
            this.curNode = this.curNode.prev;
            steps--;
        }
        return this.curNode.url;
    }

    forward(steps) {
        if (this.curNode == null) return null
        while (steps > 0 && this.curNode.next) {
            this.curNode = this.curNode.next;
            steps--;
        }
        return this.curNode.url;
    }

    current_page() {
        if (this.curNode == null) return null
        return { url: this.curNode.url, visitedAt: this.curNode.visitedAt };
    }

    display_history() {
        if (this.head == null) {
            console.log("history is empty");
            return "history is empty";
        }

        var lines = [];
        var n = this.head;
        var i = 0;
        while (n) {
            if (this.curNode == n) lines.push(i + " " + n.url + " [<]");
            else lines.push(i + " " + n.url);
            n = n.next;
            i++;
        }

        var text = lines.join("\n");
        console.log(text);

        return text;
    }

    delete_history() {
        var n = this.head;
        while (n) {
            var nextNode = n.next;
            n.prev = null;
            n.next = null;
            n = nextNode;
        }
        this.head = null;
        this.tail = null;
        this.curNode = null;
        this.size = 0;
    }

    // deletes first page with this url and pushes it to the deleted stack
    deleteUrl(url) {
        var n = this.head;
        var i = 0;
        while (n && n.url != url) {
            n = n.next;
            i++;
        }
        if (n == null) return false

        if (this.curNode == n) {
            if (n.prev) this.curNode = n.prev;
            else this.curNode = n.next;
        }

        if (n.prev) n.prev.next = n.next;
        else this.head = n.next;

        if (n.next) n.next.prev = n.prev;
        else this.tail = n.prev;

        n.prev = null;
        n.next = null;
        this.size--;

        // save index so restore puts it back in the same place
        this.deleted.push({ node: n, index: i });
        return true;
    }

    // puts back the last deleted page
    restore() {
        var entry = this.deleted.pop();
        if (entry == null) return null

        var index = Math.min(entry.index, this.size);
        this.insertAt(entry.node, index);
        this.size++;

        if (this.curNode == null) this.curNode = entry.node;
        if (this.size > this.capacity) this.removeOldest();

        return entry.node.url;
    }

    // used by the txt importer
    loadNodes(newHead, newCurrent) {
        this.head = newHead;
        this.curNode = newCurrent;
        this.tail = null;
        this.size = 0;

        var n = newHead;
        while (n) {
            this.tail = n;
            this.size++;
            n = n.next;
        }

        while (this.size > this.capacity) this.removeOldest();
    }

    // same format as the importer reads
    toText() {
        var lines = [];
        var curIndex = 0;
        var n = this.head;
        var i = 0;
        while (n) {
            if (this.curNode == n) curIndex = i;
            lines.push(n.url);
            n = n.next;
            i++;
        }
        return "CURRENT_INDEX=" + curIndex + "\n" + lines.join("\n");
    }

    // oldest page is the head in our list
    removeOldest() {
        var oldest = this.head;
        if (oldest == null) return

        this.head = oldest.next;
        if (this.head) this.head.prev = null;
        else this.tail = null;

        if (this.curNode == oldest) this.curNode = this.head;

        oldest.next = null;
        this.size--;
    }

    insertAt(node, index) {
        if (index == 0) {
            node.prev = null;
            node.next = this.head;
            if (this.head) this.head.prev = node;
            else this.tail = node;
            this.head = node;
            return
        }

        var before = this.head;
        for (var i = 0; i < index - 1; i++) {
            before = before.next;
        }

        var after = before.next;
        node.prev = before;
        node.next = after;
        before.next = node;
        if (after) after.prev = node;
        else this.tail = node;
    }
}


function downloadHistory(history = browserHistory, fileName = "history.txt") {
    var blob = new Blob([history.toText()], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}


var browserHistory = new BrowserHistory("https://www.google.com");