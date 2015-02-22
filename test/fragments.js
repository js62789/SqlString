var assert = require("assert");
var SqlString = require('../sqlstring');

describe('Fragments', function(){

  describe('#select()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.select('id');
      assert.equal(true, returned instanceof SqlString);
    });

    it('should set the query type to SELECT', function(){
      var sql = new SqlString();
      sql.select();
      assert.equal(SqlString.QueryTypes.SELECT, sql.type);
    });

    it('should accept fields as a list of arguments', function(){
      var sql = new SqlString();
      sql.select('id', 'name', 'age');
      assert.equal(3, sql._fragment.select.length);
    });

    it('should accept an array of fields as an argument', function(){
      var sql = new SqlString();
      sql.select(['id', 'name', 'age']);
      assert.equal(3, sql._fragment.select.length);
    });

  });

  describe('#insert()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.insert({id: 1});
      assert.equal(true, returned instanceof SqlString);
    });

    it('should set the query type to INSERT', function(){
      var sql = new SqlString();
      sql.insert();
      assert.equal(SqlString.QueryTypes.INSERT, sql.type);
    });

    it('should accept a map of fields and values', function(){
      var sql = new SqlString();
      sql.insert({name: 'test', age: 3});
      assert.equal(2, sql._fragment.set.length);
    });

  });

  describe('#update()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.update('account');
      assert.equal(true, returned instanceof SqlString);
    });

    it('should set the query type to UPDATE', function(){
      var sql = new SqlString();
      sql.update();
      assert.equal(SqlString.QueryTypes.UPDATE, sql.type);
    });

    it('should accept a map of fields and values', function(){
      var sql = new SqlString();
      sql.update('account');
      assert.equal(1, sql._fragment.update.length);
    });

  });

  describe('#delete()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.delete('account');
      assert.equal(true, returned instanceof SqlString);
    });

    it('should set the query type to DELETE', function(){
      var sql = new SqlString();
      sql.delete();
      assert.equal(SqlString.QueryTypes.DELETE, sql.type);
    });

  });

  describe('#from()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.from('account');
      assert.equal(true, returned instanceof SqlString);
    });

    it('should accept a table name', function(){
      var sql = new SqlString();
      sql.from('account');
      assert.equal(1, sql._fragment.from.length);
    });

    it('should accept a list of table names as arguments', function(){
      var sql = new SqlString();
      sql.from('account', 'account_email');
      assert.equal(2, sql._fragment.from.length);
    });

    it('should accept an array of table names as an argument', function(){
      var sql = new SqlString();
      sql.from(['account', 'account_email']);
      assert.equal(2, sql._fragment.from.length);
    });

  });

  describe('#into()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.into('account');
      assert.equal(true, returned instanceof SqlString);
    });

    it('should accept a table name', function(){
      var sql = new SqlString();
      sql.into('account');
      assert.equal(1, sql._fragment.into.length);
    });

  });

  describe('#set()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.set({id: 1});
      assert.equal(true, returned instanceof SqlString);
    });

    it('should accept a map of criteria', function(){
      var sql = new SqlString();
      sql.set({id: 1, age: 3});
      assert.equal(2, sql._fragment.set.length);
    });

  });

  describe('#where()', function(){

    it('should be chainable', function(){
      var sql = new SqlString();
      var returned = sql.where({id: 1});
      assert.equal(true, returned instanceof SqlString);
    });

    it('should accept a map of criteria', function(){
      var sql = new SqlString();
      sql.where({id: 1, age: 3});
      assert.equal(2, sql._fragment.where.length);
    });

  });

});
