//Grab a reference to the context menu 
const contextMenu = document.querySelector(".context");

//Used for deletes later
let rowThatWasRightClicked = null;

//Grab a reference to the budget Category conatiner 
const groups = document.querySelector('.groups');

function addGroup(){
    console.log("add group running");

    //CreateDiv to hold the entire category with a button and line items
    const group = document.createElement('div');
    group.classList.add('group');

    //build ul list
    const groupList = document.createElement('ul');
    groupList.classList.add('group-list');

    /*
    +-----------------------------------------------------------------+
    | groupHeader  (div, .group-header)  |
    |                                                                 |
    |  +---------------------------+   +---------------------------+  |
    |  | createBudgetCategoryText  |   | addRowButton   |  |
    |  | Box("budgetCategoryGroup")|   | (button, "Add Category")  |  |
    |  | (input, swaps to text)    |   |                           |  |
    |  +---------------------------+   +---------------------------+  |
    +-----------------------------------------------------------------+
    */
    const groupHeader = document.createElement('div');
    groupHeader.classList.add('group-header');
    //Add a textbox 
    groupHeader.appendChild(createInput("groupName"));
    //Add the button
    const addRowButton = document.createElement('button');
    addRowButton.textContent = 'Add Category';


    //addRowButton.textContent = 'Add Category';
    addRowButton.classList.add('add-row-button');
    addRowButton.addEventListener('click', () => {
        addRow(groupList);
    });
    groupHeader.appendChild(addRowButton);

    group.appendChild(groupHeader);
    group.appendChild(groupList);
    groups.appendChild(group);
}

//Adds the line item, called from addBudgetCategoryGroup functionwhen the Add Category Button is Clicked 
function addRow(groupList){
    console.log("addRow is running");
    groupList.appendChild(createRow());
}

/*
  +-------------------------------------------------------------------+
  | row  (li, flex container)                     |
  |                                                                   |
  |  +--------------------+              +--------------------------+ |
  |  | rowName  |              | rowValues  | |
  |  | (category text)    |              |                          | |
  |  |                    |              |  +--------------------+  | |
  |  |                    |              |  | budgetCategoryValue|  | |
  |  |                    |              |  | AmountBox (input)  |  | |
  |  +--------------------+              |  +--------------------+  | |
  |                                      +--------------------------+ |
  +-------------------------------------------------------------------+
*/
function createRow(){
    //Right side div: Create inner most value box 
    const rowAmountInput = createInput("rowAmount");

    const rowValues = document.createElement("div");
    rowValues.classList.add("row-values");
    rowValues.appendChild(rowAmountInput);

    //Left Side: Holds line item text
    const rowName = document.createElement("div");
    rowName.classList.add("row-name");

    //create a budget input textbox
    rowName.appendChild(createInput("rowName"));

    //Create list node and return the full line item
    const row = document.createElement("li");
    row.classList.add("row")
    row.appendChild(rowName);
    row.appendChild(rowValues);

    
    addAbilityToDeleteRow(row);
    return row;
}

//Create a textbox for budget category, inserts its own class name
function createInput(textBoxType){
    
    const textBox = document.createElement("input");

    if(textBoxType === "rowName"){
        textBox.type = "text";
        textBox.placeholder = "Category";
        textBox.className = "group-name-input";
    }
    else if(textBoxType === "rowAmount"){
        textBox.type = "text";
        textBox.placeholder = "budgeted amount";
        textBox.className = "group-name-input";
    }
    else if(textBoxType === "groupName"){
        textBox.type = "text";
        textBox.placeholder = "Category Group Name";
        textBox.className = "group-name-input"; //change later if needed
    }
    else{
        console.error("Invalid textBoxType")
    }

    textBox.addEventListener('blur', (event) => {
        console.log('textBox event listner Running....')

        //1. Grab the entered value
        const enteredText = event.target.value;

        //if nothing is entered stop
        if(!enteredText.trim()) return;

        //2.Create a new text element
        const textNode = document.createElement('span');
        textNode.textContent = enteredText;

        //Add a listener to give user the ability to edit text again
        addAbilityToChangeText(textNode, textBoxType);

        //3. Swap the input box with the text node
        event.target.replaceWith(textNode);
    });

    return textBox;
}

function updateMenuPosition(x,y){

    //make it so the menu doesn't appear offscreen
    const maxTopValue = window.innerHeight - contextMenu.offsetHeight;
    const maxLeftValue = window.innerWidth - contextMenu.offsetWidth;

    contextMenu.style.left = `${Math.min(maxLeftValue, x)}px`;
    contextMenu.style.top = `${Math.min(maxTopValue, y)}px`;
}

function addAbilityToDeleteRow(row){

    //Add the right click context menu functionality to the node before its appended
    //contextmenu is the name of the event when a user right clicks
    //contextMenu is the variable holding the context menu ul from the html file
    row.addEventListener('contextmenu', (event) => {
        console.log("Right click listener is firing");
        event.preventDefault();

        rowThatWasRightClicked = row;

        //Move the context menu to the users pointer 
        updateMenuPosition(event.clientX, event.clientY);
        contextMenu.style.visibility = "visible";
    });
}

/**
 * Makes a span editible again by turning it back into an input on click
 * 
 * The edit cycle:
 *  input (blur, with text) -> span (click) -> input (text carried over) -> ...
 * createInput build the input and swaps it for a span on blue. 
 * This function gives that span a click listener that swaps it back
 * into a fresh input, so the cycle repeats. 
 * 
 * @param {HTMLSpanElement} textNode - the span currently showing the entered text
 * @param {string} textBoxType - which kind of input to rebuild ("rowName", "rowAmount", "groupName" )
 */
function addAbilityToChangeText(textNode, textBoxType){

    textNode.addEventListener('click', (event) => {
        console.log("addAbilityToChangeText is running.....");

        //call the input factory
        const newInputBox = createInput(textBoxType)

        //Set the input with actual values from the textNode
        newInputBox.value = textNode.textContent;

        //Swap it with replaceWith
        textNode.replaceWith(newInputBox);

        //Call focus on it
        newInputBox.focus();

    });
}

document.querySelector("#deleteLineItem").addEventListener("click", () => {
    console.log("You clicked the delete line item button");
    rowThatWasRightClicked.remove();
    rowThatWasRightClicked = null;
});

//When the user clicks away, get rid of the context menu
document.addEventListener("click", () => {
    contextMenu.style.visibility = null;
});



 