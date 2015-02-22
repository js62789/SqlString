# SqlString
A JavaScript utility used to build SQL strings via chainable methods

##Examples

```javascript
  var sql = new SqlString();
  sql.select(['id', 'name']).from('account').where({age: 3, active: false});
  
  console.log(sql.toString());
  // SELECT `id`, `name` FROM `account` WHERE `age` = '3' AND `active` = 'false'
```

```javascript
  var sql = new SqlString();
  sql.insert({age: 3, active: false}).into('account');
  
  console.log(sql.toString());
  // INSERT INTO `account` SET `age` = '3', `active` = 'false'
```

```javascript
  var sql = new SqlString();
  sql.update('account').set({age: 3, active: false}).where({id: 1});
  
  console.log(sql.toString());
  // UPDATE `account` SET `age` = '3', `active` = 'false' WHERE `id` = '1'
```

```javascript
  var sql = new SqlString();
  sql.delete().from('account').where({id: 1});
  
  console.log(sql.toString());
  // DELETE FROM `account` WHERE `id` = '1'
```

```javascript
  var sql = new SqlString();
  sql.select('*').from('account').where({age: [1, 2, 3]});
  
  console.log(sql.toString());
  // SELECT * FROM `account` WHERE `age` IN ('1', '2', '3')
```

```javascript
  var innerSql = new SqlString();
  innerSql.select('id').from('account_email').where({type: 'personal'});
  
  var sql = new SqlString();
  sql.select('*').from('account').where({id: innerSql});
  
  console.log(sql.toString());
  // SELECT * FROM `account` WHERE `id` IN (SELECT `id` FROM `account_email` WHERE `type` = 'personal')
```

```javascript
  var innerSql = new SqlString();
  innerSql.select('id').from('account_email').where({type: 'personal'});

  var sql = new SqlString();
  sql.select('*').from('account').where({or: [{id: 2}, {id: innerSql}], age: 3});
  
  console.log(sql.toString());
  // SELECT * FROM `account` WHERE (`id` = '2' OR `id` IN (SELECT `id` FROM `account_email` WHERE `type` = 'personal')) AND `age` = '3'
```
