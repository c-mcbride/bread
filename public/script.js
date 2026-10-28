//Grab a reference to the context menu 
const contextMenu = document.querySelector(".context");

//Used for deletes later
let rowThatWasRightClicked = null;

//Grab a reference to the budget Category conatiner 
const groups = document.querySelector('.groups');

async function fetchGroups(){
    const endpoint = '/api/groups';
    const response = await fetch(endpoint);
    const fetchedGroups = await response.json();
    
    // loop over groups and call add groups for each group object in the group array
    for(const group of fetchedGroups){
       addGroup(group);
    }
}

fetchGroups();

async function postGroup(name){
    const response = await fetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name }),
        });

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}` );
        }

        const result = await response.json();
        return result;
}

async function patchGroup(groupId, name){
    //const url = `/api/groups/${groupId}`; 
    const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ name }),
    });

    if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}` );
    }

    const result = await response.json();
    return result;
}

async function postRow(groupId, name){
    const response = await fetch(`/api/groups/${groupId}/rows`, {
        method: `POST`,
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ name }),
    });

    if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
}

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
        addRow(groupList, group.dataset.id);
    });
    groupHeader.appendChild(addRowButton);

    //iterate through stored rows and add them to the element
    for(const currentRow of rows){
        //call row builder for current row
        groupList.appendChild(createRow(currentRow));
    }

    group.appendChild(groupHeader);
    group.appendChild(groupList);
    groups.appendChild(group);
}

//Adds the line item, called from addBudgetCategoryGroup functionwhen the Add Category Button is Clicked 
function addRow(groupList, groupId){
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

        const parentNode = targetNode.closest('.group');
        targetNode.replaceWith(textNode);

        //Commit to DB
        if(textBoxType === "groupName"){
            //Post new group if the parent group div doesn't have an id 
            if(!parentNode.dataset.id){
                try{
                    const result = await postGroup(enteredText);
                    //Put the returned id on the element
                    parentNode.dataset.id = result.id;
                }catch(error) {
                    console.error("Error during POST Request: ", error);
                    //TODO: ADD LOGIC FOR WHAT TO DO IN THE UI AND ON THE BE IF FAILS.
                    //IDEA 1: add class is-unsaved to parentNode in the catch and style it (red outline)
                    //IDEA 2: Revert to input, swap the spance back to an input holding text so user can try again
                }
            }
            else{
                try{
                    const result = await patchGroup(parentNode.dataset.id, enteredText);
                }catch(error){
                    console.log(parentNode.dataset.id, enteredText);
                    console.error("Error during PATCH Request: ", error);
                }
            }
        }

        if(textBoxType === "rowName"){
            try{
                const result = await postRow(parentNode.dataset.id, enteredText);
            }catch(error){
                console.error("error during POST Request: ", error);
            }
        }
    });

    //TODO: swap happens after the await (double blur risk)
    //TODO: no error handling on failed POST
    return textBox;
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
    rowThatWasRightClicked.remove();
    rowThatWasRightClicked = null;
});

//When the user clicks away, get rid of the context menu
document.addEventListener("click", () => {
    contextMenu.style.visibility = null;
});