const express = require('express');
const app = express();

app.use(express.static('public'));

const groups = [
    {
        id: 1,
        name: 'Fixed',
        rows: [
            { id: 1, name: 'Rent', amount: 2500},
            { id: 2, name: 'Electric', amount: 150}
        ]
    },
    {
        id: 2,
        name: 'Variable',
        rows: [
            { id: 3, name: 'Dining out', amount: -2000}
        ]
    },
    {
        id: 3,
        name: 'Savings',
        rows: [
            { id: 4, name: 'ally', amount: 4500000}
        ]

    }
];

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello world!'});
});

app.get('/api/groups', (req, res) => { 
    res.json(groups);
});
 
app.listen(3000, () => {
    console.log('Server running on port 3000');
});