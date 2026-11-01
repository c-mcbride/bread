import { fetchGroups, postGroup, patchGroup, postRow, patchRow, deleteRow } from '/api.js';

//Grab a reference to the context menu 
const contextMenu = document.querySelector(".context");

//Used for deletes later
let rowThatWasRightClicked = null;

/**
 * After changing script.js to a module to pull in other classes, add group is no longer global
 * Here we add the event listener, and pass in addGroup with no params because otherwise JS passes in the 
 * Click event which is technically not null, addGroup accepts it but it doesn't work properly
 * 
 * addEventListener('click', addGroup) calls addGroup(theClickEvent)
 * addGroup(gropuData = { name: '', row:[] }) default only kicks in when the argument is undefined
 * Here the argument is the click event, groupData is the event
 * groupData.name is undefined (events have no name)
 * groupData.rows is undefined 
 * name.trim() throws
 * 
 * button.addEventListener('click', () => addGroup());
 * now the browser calls the arrow function and hands the event to it
 * The arrow function ignores that event. calls addGroup with nothing
 * 
 * function handleAddGroupClick(){
 *      addGroup();
 * }
 */
document.querySelector('#addGroupButton').addEventListener('click', () => addGroup());

//Grab a reference to the budget Category conatiner 
const groups = document.querySelector('.groups');



async function initializeApp(){
    const fetchedGroups  = await fetchGroups();
    for(const group of fetchedGroups){
        addGroup(group);
    }
}

initializeApp();

function addGroup(groupData = { name:'', rows: [] }){
    console.log("add group running");

    const name= groupData.name;
    const rows = groupData.rows;

    //CreateDiv to hold the entire category with a button and line items
    const group = document.createElement('div');
    group.classList.add('group');
    
    if(groupData.id !== undefined){
        //Add div id from DB
        group.dataset.id = groupData.id;
    }

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
    
    if(name.trim().length === 0){
        groupHeader.appendChild(createInput("groupName"));
    }
    else{
        groupHeader.appendChild(createSpan(name, "groupName"));
    }
    
    //Add the button
    const addRowButton = document.createElement('button');
    addRowButton.textContent = 'Add Category';


    //Add add row button no matter what
    //addRowButton.textContent = 'Add Category';
    addRowButton.classList.add('add-row-button');
    addRowButton.addEventListener('click', () => {
        addRow(groupList);
    });
    groupHeader.appendChild(addRowButton);

    //iterate through stored rows and add them to the element
    for(const currentRow of rows){
        let rowToAdd = createRow(currentRow);
        //rowToAdd.dataset.id = currentRow.id
        //call row builder for current row
        groupList.appendChild(rowToAdd);
    }

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
function createRow(rowData = { name: '', amount: 0 }){

    //Right side div: Create inner most value box 
    const rowAmount = createAmountSpan(rowData.amount);

    const rowValues = document.createElement("div");
    rowValues.classList.add("row-values");
    rowValues.appendChild(rowAmount);

    //Left Side: Holds line item text
    const rowName = document.createElement("div");
    rowName.classList.add("row-name");

    if(rowData.name.trim().length  === 0){
        rowName.appendChild(createInput("rowName"));
    }
    else{
        rowName.appendChild(createSpan(rowData.name, "rowName"));
    }

    //Create list node and return the full line item
    const row = document.createElement("li");

    if(rowData.id !== undefined){
        row.dataset.id = rowData.id;
    }

    row.classList.add("row")
    row.appendChild(rowName);
    row.appendChild(rowValues);

    
    addAbilityToDeleteRow(row);
    return row;
}

//Create a textbox for row names amounts or names of groups
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

    textBox.addEventListener('blur', async (event) => {
        console.log('textBox event listner Running....')

        //1. Grab the entered value
        let enteredText = event.target.value;
        enteredText = enteredText.trim();

        //if nothing is entered stop
        if(!enteredText) return;

        //2.Create a new text element
        const textNode = createSpan(enteredText, textBoxType);
        const targetNode = event.target;

        const groupNode = targetNode.closest('.group');
        targetNode.replaceWith(textNode);

        //Commit to DB
        if(textBoxType === "groupName"){
            saveGroupName(groupNode, enteredText);
        }

        if(textBoxType === "rowName"){
            const listNode = textNode.closest('.row');
            saveRowName(groupNode, listNode, enteredText);
        }
    });

    //TODO: swap happens after the await (double blur risk)
    //TODO: no error handling on failed POST
    return textBox;
}

async function saveGroupName(groupNode,text){
    if(!groupNode.dataset.id){
        try{
            const result = await postGroup(text);
            groupNode.dataset.id = result.id;
        }catch(error){
            console.error("Error posting group to DB: ", error);
        }
    }
    else{
        try{
            const result = await patchGroup(groupNode.dataset.id, text);
        }catch(error){
            console.log(groupNode.dataset.id, text);
            console.error("Error during PATCH Request: ", error);
        }
    }
}

async function saveRowName(groupNode, rowNode, text){
    if(!rowNode.dataset.id){
        try{
            const result = await postRow(groupNode.dataset.id, text);
            rowNode.dataset.id = result.id
        }catch(error){
            console.log("error during POST Request when saving Row name: ", error);
        }
    }
    else{
        try{
            /**
             * This does not allow you to patch in a new row amount
             * currently there is no programmatic way to se row amount
             * Later, row amount will be patched via moving money ONLY 
             */
            const result = await patchRow(rowNode.dataset.id, { name: text });
        }catch(error){
            console.log("error during PATCH request when patching Row name: ", error);
        }
    }

    //TODO ADD PATCH
}

//Enters a span with the param text, adds a listener that allows you to change it back into node
function createSpan(text, textBoxType){
    const textNode = document.createElement('span');
    textNode.textContent = text;

    //Add the lisner to give the user edit ability
    addAbilityToChangeText(textNode, textBoxType);

    return textNode;
}

function createAmountSpan(cents){
    const formattedDollars = (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    const amountNode = document.createElement('span');
    amountNode.textContent = formattedDollars;

    if(cents > 0){
        amountNode.classList.add('is-positive');
    }
    else if(cents=== 0){
        amountNode.classList.add('is-zero');
    }
    else{
        amountNode.classList.add('is-negative');
    }

    return amountNode;
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
    const listNode = rowThatWasRightClicked.dataset.id;

    deleteRow(listNode); //Delete from DB
    rowThatWasRightClicked.remove();
    rowThatWasRightClicked = null;
});

//When the user clicks away, get rid of the context menu
document.addEventListener("click", () => {
    contextMenu.style.visibility = null;
});