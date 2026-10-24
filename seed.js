const db = require('/home/admin/bread-server/db.js');

const insertGroups = db.prepare('INSERT INTO groups (name) VALUES (?)');
insertGroups.run('Fixed');
