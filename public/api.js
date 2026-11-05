
/**
 * Runs when a page loads, 
 */
export async function fetchGroups(){
    const endpoint = '/api/groups';
    const response = await fetch(endpoint);
    const fetchedGroups = await response.json();
    
    return fetchedGroups;
}

export async function postGroup(name){
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

export async function patchGroup(groupId, name){
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

export async function postRow(groupId, name){
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

export async function patchRow(rowId, fields){
    const response = await fetch(`/api/rows/${rowId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type' : 'application/json'
        },
        //Call with patchRow(7, { amount: 1250 }) or patchRow(7, { name: 'Rent' }) or patchRow(7, { name: 'Rent', amount: 1250})
        body: JSON.stringify(fields), 
        //console.log("Fields ", fields);
    });

    if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result; 
}

export async function deleteRow(rowId){
    const response = await fetch(`/api/rows/${rowId}`, { method: 'DELETE'});

    if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
}

export async function fetchAccounts(){
    const endpoint = '/api/accounts';
    const response = await fetch(endpoint);

    const fetchedAccounts = await response.json();
    return fetchedAccounts;
}