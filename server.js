const express = require('express');
const app = express();
const db = require('/home/admin/bread-server/db.js');
const { nameValidator, groupIdValidator, amountValidator } = require('./validate');

app.use(express.static('public'));
app.use(express.json());

// const groups = [
//     {
//         id: 1,
//         name: 'Fixed',
//         rows: [
//             { id: 1, name: 'Rent', amount: 2500},
//             { id: 2, name: 'Electric', amount: 150}
//         ]
//     },
//     {
//         id: 2,
//         name: 'Variable',
//         rows: [
//             { id: 3, name: 'Dining out', amount: -2000}
//         ]
//     },
//     {
//         id: 3,
//         name: 'Savings',
//         rows: [
//             { id: 4, name: 'ally', amount: 4500000}
//         ]

//     }
// ];

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello world!'});
});

app.get('/api/groups', (req, res) => { 
    //GRAB ID and name from groups, rows grouped by external key group_id
    //const query = 'SELECT groups.id, groups.name, rows.id, rows.name, rows.amount FROM rows LEFT JOIN groups on rows.group_id = groups.id';

    const query = 'SELECT groups.id, groups.name FROM GROUPS';
    //Grab all the rows so we don't have to iterate through them in the for loop
    const rowQuery = 'SELECT * FROM rows'; 

     //First grab each group id and name
    const groups = db.prepare(query).all();
    const rows = db.prepare(rowQuery).all();

    //Declare array to hold db items
    const groupsDataStructure = []
    
    for(const group of groups){
        const groupObject = {};
        const rowsDataStructure= [];
        groupObject.id = group.id;
        groupObject.name = group.name;

        //Add rows where group_id matches groupObject.id
        for(const row of rows){
            const rowObject = {};
            if(row.group_id === groupObject.id){
                rowObject.id = row.id;
                rowObject.name = row.name;

                rowObject.amount = row.amount;
                //console.log(rowObject);

                rowsDataStructure.push(rowObject);
            }
        }

        groupObject.rows = rowsDataStructure;
        groupsDataStructure.push(groupObject);
    }

   
    //console.log(groupsDataStructure);
    //console.log(rows);
    res.json(groupsDataStructure);
});

app.post('/api/groups', (req, res) => {
    //destructure the JSON and pull out the name
    let { name } = req.body || {}; //Use the left side if not empty, else use right

    //Returns object either { result : 'message'} or { name: 'name' }
    const nameResult = nameValidator(name);

    if(nameResult.error){
        return res.status(400).json({status: "error", message: nameResult.error});
    }
  
    //Prepare the SQL and insert
    const insertGroup = db.prepare('INSERT INTO groups (name) VALUES (?)');
    const returnedDBObject = insertGroup.run(nameResult.name);
    const newRowId = Number(returnedDBObject.lastInsertRowid);

    console.log('Inserted new row Id: ' + newRowId);
    res.status(201).json({ id: newRowId, name: nameResult, rows: [] });
});

app.patch('/api/groups/:id', (req, res) => {
    const groupId = Number(req.params.id);

    const groupIdResult = groupIdValidator(groupId);

    if(groupIdResult.error){
        return res.status(400).json({status: "error", message: groupIdResult.error});
    }

   
    let { name } = req.body || {};
    const nameResult = nameValidator(name);

    if(nameResult.error){
        return res.status(400).json({status: "error", message: nameResult.error});
    }

    const updateStatement = db.prepare('UPDATE groups SET name = ? WHERE id = ?');
    const returnedDBObject = updateStatement.run(nameResult.name, groupIdResult.groupId);

    if(returnedDBObject.changes === 0){
        res.status(404).json({message: `No matching group found with id ${groupIdResult.groupId}`});
    }
    else{
        res.status(200).json({ id: groupIdResult.groupId, name: nameResult.name});
        console.log("update successful updated group");
    }
});
 
app.post('/api/groups/:id/rows', (req, res) => {
    //deconstruct the JSON and put out the goup_id and name
    const groupId = Number(req.params.id);

    const groupIdResult = groupIdValidator(groupId);

    if(groupIdResult.error){
        return res.status(400).json({status: "error", message: groupIdResult.error});
    }

    let { name } = req.body || {};

    const nameResult = nameValidator(name);

    if(nameResult.error){
        return res.status(400).json({status: "error", message: nameResult.error});
    }

    const updateStatement = db.prepare('INSERT Into rows (name, group_id) VALUES (?,?) ');
    const returnedDBObject = updateStatement.run(nameResult.name, groupIdResult.groupId);

    const newRowId = Number(returnedDBObject.lastInsertRowid);

    console.log('Inserted new row Id: ' + newRowId);
    res.status(201).json({ id: newRowId, name: nameResult.name });
});

app.patch('/api/rows/:id', (req, res) => {
    const rowId = Number(req.params.id);
    const rowIdResult = groupIdValidator(rowId);

    if(rowIdResult.error){
        return res.status(400).json({status: "error", message: rowIdResult.error});
    }

    let { name, amount } = req.body || {};
    let nameToSave = null;
    let amountToSave = null;

    if(name === undefined && amount === undefined){
        return res.status(400).json({status: "error", message: 'Row name and row value cant both be null'});
    }

    if(name !== undefined){
        const nameResult = nameValidator(name);
        if(nameResult.error){
            return res.status(400).json({status: "error", message: nameResult.error});
        }

        nameToSave = nameResult.name;
    }

    if(amount !== undefined){
        const amountResult = amountValidator(amount);
        if(amountResult.error){
            return res.status(400).json({status: "error", message: amountResult.error});
        }

        amountToSave = amountResult.amount;
    }

    const updateStatement = db.prepare('UPDATE rows SET name = COALESCE(?, name), amount = COALESCE(?, amount) WHERE id = ?');
    const returnedDBObject = updateStatement.run(nameToSave, amountToSave, rowId);

    //TODO: UPDATE RES
    res.status(200).json({ });
    console.log("update successful updated row");
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});