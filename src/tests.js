var tests = [

    {
        name: "Constructor: homepage becomes the only and current page",
        run: function () {
            var h = new BrowserHistory("home.com");
            return h.size === 1 &&
                h.current_page().url === "home.com" &&
                h.head === h.tail;
        }
    },

    {
        name: "visit: adds a page at the end and it becomes current",
        run: function () {
            var h = new BrowserHistory("home.com");
            var result = h.visit("a.com");
            return result === "a.com" &&
                h.current_page().url === "a.com" &&
                h.display_history() === "0 home.com\n1 a.com [<]";
        }
    },

    {
        name: "visit: branching from the middle removes forward history",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            h.back(2);                 // now on "a"
            h.visit("new");            // b and c must disappear
            return h.size === 3 &&
                h.display_history() === "0 home\n1 a\n2 new [<]" &&
                h.forward(5) === "new";
        }
    },

    {
        name: "back: moves back the given number of steps",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            return h.back(2) === "a" &&
                h.current_page().url === "a";
        }
    },

    {
        name: "back: 100 steps on a history of 2 pages stops at the oldest page",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            return h.back(100) === "home";
        }
    },

    {
        name: "forward: more steps than available stops at the newest page",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.back(2);
            return h.forward(100) === "b";
        }
    },

    {
        name: "current_page: does not change the state",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.back(1);
            h.current_page();
            h.current_page();
            return h.current_page().url === "a" &&
                h.size === 3 &&
                h.display_history() === "0 home\n1 a [<]\n2 b";
        }
    },

    {
        name: "display_history: marker [<] is on the current page",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.back(1);
            return h.display_history() === "0 home\n1 a [<]\n2 b";
        }
    },

    {
        name: "capacity: oldest pages are pruned when the limit is exceeded",
        run: function () {
            var h = new BrowserHistory("home", 3);   // capacity 3
            h.visit("a");
            h.visit("b");
            h.visit("c");
            h.visit("d");
            return h.size === 3 &&
                h.display_history() === "0 b\n1 c\n2 d [<]" &&
                h.back(100) === "b";
        }
    },

    {
        name: "delete_history: removes everything and is safe to use afterwards",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.delete_history();
            return h.size === 0 &&
                h.head === null &&
                h.tail === null &&
                h.current_page() === null &&
                h.back(3) === null &&
                h.forward(3) === null &&
                h.display_history() === "history is empty";
        }
    },

    {
        name: "deleteUrl: deletes a page from the middle",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            var result = h.deleteUrl("b");
            return result === true &&
                h.size === 3 &&
                h.display_history() === "0 home\n1 a\n2 c [<]";
        }
    },

    {
        name: "deleteUrl: deleting the current page moves the cursor to the previous page",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.back(1);                 // current = a
            h.deleteUrl("a");
            return h.current_page().url === "home" &&
                h.display_history() === "0 home [<]\n1 b";
        }
    },

    {
        name: "restore: puts the deleted page back in the same position",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            h.deleteUrl("b");
            var result = h.restore();
            return result === "b" &&
                h.size === 4 &&
                h.display_history() === "0 home\n1 a\n2 b\n3 c [<]";
        }
    },

    {
        name: "restore: pages come back in reverse order of deletion (stack)",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            h.deleteUrl("a");
            h.deleteUrl("c");
            var first = h.restore();   // last deleted comes back first
            var second = h.restore();
            return first === "c" &&
                second === "a" &&
                h.size === 4;
        }
    },

    {
        name: "export: exported text can be read back by the importer",
        run: function () {
            var h = new BrowserHistory("home");
            h.visit("a");
            h.visit("b");
            h.visit("c");
            h.back(2);                 // current = a
            var text = h.toText();     // "CURRENT_INDEX=1\nhome\na\nb\nc"
            var parsed = parseHistoryText(text);
            return parsed.urls.join(",") === "home,a,b,c" &&
                parsed.currentIndex === 1;
        }
    },

    {
        name: "import: an empty file throws an error",
        run: function () {
            try {
                parseHistoryText("");
                return false;          // no error = FAIL
            } catch (e) {
                return true;           // error = PASS
            }
        }
    }

];

// Runs every test and shows the results (you do not need to edit this)

var passedCount = 0;
var box = document.createElement("div");
box.style.cssText = "margin-top:30px;padding:10px;border-top:3px solid #333;font-family:monospace;";

var title = document.createElement("h3");
box.appendChild(title);

for (var i = 0; i < tests.length; i++) {
    var ok;
    try {
        ok = tests[i].run();
    } catch (e) {
        ok = false;                    // a crash also counts as FAIL
    }
    if (ok) passedCount++;

    var line = document.createElement("div");
    line.textContent = (ok ? "PASS  " : "FAIL  ") + tests[i].name;
    line.style.color = ok ? "green" : "red";
    box.appendChild(line);
    console.log((ok ? "PASS  " : "FAIL  ") + tests[i].name);
}

title.textContent = "Test Results: " + passedCount + " passed, " +
    (tests.length - passedCount) + " failed (" + tests.length + " total)";
title.style.color = passedCount === tests.length ? "green" : "red";
document.body.appendChild(box);