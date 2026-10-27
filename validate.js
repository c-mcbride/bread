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

module.exports = { nameValidator };