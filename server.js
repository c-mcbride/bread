const express = require('express');
const app = express();
const db = require('/home/admin/bread-server/db.js');

app.use(express.static('public'));

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
                console.log(rowObject);

                rowsDataStructure.push(rowObject);
            }
        }

        console.log(rowsDataStructure);
        groupObject.rows = rowsDataStructure;
        groupsDataStructure.push(groupObject);
    }

   
    //console.log(groupsDataStructure);
    //console.log(rows);
    res.json(groupsDataStructure);
});
 
app.listen(3000, () => {
    console.log('Server running on port 3000');
});