function parseHistoryText(fileContent) {

    var lines = fileContent.split(/\r?\n/);

    lines = lines.map(line => line.trim())
                 .filter(line => line !== "");

    if (lines.length === 0) {
        throw new Error("The file is empty!");
    }

    var currentIndex = null;

    var headerMatch = lines[0].match(/^CURRENT_INDEX=(\d+)$/);

    if (headerMatch) {
        currentIndex = Number(headerMatch[1]);
        lines.shift();
    }

    var urls = lines;

    if (urls.length === 0) {
        throw new Error("No URLs found!");
    }

    if (currentIndex === null) {
        currentIndex = urls.length - 1;
    }

    if (currentIndex >= urls.length) {
        throw new Error("Invalid current page index!");
    }

    return {
        urls: urls,
        currentIndex: currentIndex
    };
}


    //importing the history
async function importHistoryFromFile(file) {

    if (!file) {
        throw new Error("No file selected!");
    }

    var content = await file.text();

    var history = parseHistoryText(content);

    var newHead = null;
    var previousNode = null;
    var newCurrent = null;

    for (var i = 0; i < history.urls.length; i++) {

        var newNode = new DoubleLinkedNode(
            history.urls[i],
            previousNode,
            null
        );

        if (newHead === null) {
            newHead = newNode;
        }

        if (previousNode !== null) {
            previousNode.next = newNode;
        }

        if (i === history.currentIndex) {
            newCurrent = newNode;
        }

        previousNode = newNode;
    }

function displayHistoryOnPage() {

    var display = document.getElementById("historyDisplay");

    // Clear previous display
    display.innerHTML = "";

    var node = browserHistory.head;
    var index = 0;

    // Traverse the linked list
    while (node !== null) {

        var page = document.createElement("div");

        page.style.padding = "10px";
        page.style.margin = "5px 0";
        page.style.border = "1px solid #ccc";
        page.style.borderRadius = "6px";

        // Mark the current page
        if (node === browserHistory.curNode) {
            page.innerHTML = "<strong>[" + index +
                "] " + node.url + " ← CURRENT PAGE</strong>";

            page.style.backgroundColor = "#d4edda";
        }
        else {
            page.textContent = "[" + index + "] " + node.url;
        }

        display.appendChild(page);

        node = node.next;
        index++;
    }
}

    //brows. history update
    browserHistory.loadNodes(newHead, newCurrent);

    console.log("History imported successfully!");

    browserHistory.display_history();

    displayHistoryOnPage();

    return true;
}


//picking file below

document.addEventListener("DOMContentLoaded", function () {

    var fileInput = document.getElementById("historyFile");
    var importButton = document.getElementById("importHistoryButton");
    var status = document.getElementById("importStatus");

    importButton.addEventListener("click", async function () {

        var file = fileInput.files[0];

        if (!file) {
            status.textContent = "Please select a file!";
            return;
        }

        if (!file.name.toLowerCase().endsWith(".txt")) {
            status.textContent = "Please select a TXT file!";
            return;
        }

        try {
            await importHistoryFromFile(file);
            status.textContent = "History imported successfully!";
        }
        catch (error) {
            status.textContent = "Error: " + error.message;
            console.error(error);
        }
    });
});
