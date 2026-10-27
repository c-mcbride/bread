function nameValidator(name){
    if(typeof name !== "string"){
        return { error: 'Name Must be a String' };
    }

    name= name.trim();

    if(name.length === 0){
       return { error: 'Name must not be an empty String'};
    }

    return { name };
}

function groupIdValidator(groupId){
    
    if(!Number.isInteger(groupId) || groupId <= 0){
        return { error: 'id must be a number greater than zero'};
    }

    return { groupId };
}

module.exports = { nameValidator, groupIdValidator };