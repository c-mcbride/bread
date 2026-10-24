const db = require('/home/admin/bread-server/db.js');

const insertGroups = db.prepare('INSERT INTO groups (name) VALUES (?)');
insertGroups.run('Fixed');
insertGroups.run('Variable');
insertGroups.run('Savings');

const insertRows = db.prepare('INSERT INTO rows (group_id, name, amount) VALUES(?, ?, ?) ');
insertRows.run(1, 'Rent', 2500);
insertRows.run(1, 'Electric', 150);

insertRows.run(2, 'Dining out', -2000);

insertRows.run(3, 'ally', 4500000);