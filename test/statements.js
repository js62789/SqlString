var assert = require("assert");
var SqlString = require('../sqlstring');

describe('Statement Compiling', function(){

  describe('#where()', function(){

    it('should use an AND operator when given an object', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({age: 3, name: 'test'});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE `age` = '3' AND `name` = 'test'");
    });

    it('should not escape a boolean', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({active: true});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE `active` = true");
    });

    it('should use an IN when given an array as a criteria value', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({age: [1,2,3]});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE `age` IN ('1', '2', '3')");
    });

    it('should use an OR operator when given an or property', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({or: [{age: 3}, {name: 'test'}]});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE (`age` = '3' OR `name` = 'test')");
    });

    it('should throw an error when an or value is not an array', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({or: {age: 3, name: 'test'}});
      assert.throws(sql.toString, Error);
    });

    it('should use an AND operator and an OR operator', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({age: 3, or: [{id: 1}, {name: 'test'}]});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE `age` = '3' AND (`id` = '1' OR `name` = 'test')");
    });

    it('should accept a SqlString as a criteria value', function(){
      var ids = new SqlString();
      ids.select('id').from('account');
      var sql = new SqlString();
      sql.select('email').from('account_email').where({id: ids});
      assert.equal(sql.toString(), 'SELECT `email` FROM `account_email` WHERE `id` IN (SELECT `id` FROM `account`)');
    });

  });

  describe('#select()', function(){

    it('should escape namespaced fields', function(){
      var sql = new SqlString();
      sql.select('account.id').from('account');
      assert.equal(sql.toString(), 'SELECT `account`.`id` FROM `account`');
    });

  });

  describe('#orderBy()', function () {

    it('should accept a field', function(){
      var sql = new SqlString();
      sql.select('id').from('account').orderBy('id');
      assert.equal(sql.toString(), 'SELECT `id` FROM `account` ORDER BY `id` ASC');
    });

    it('should accept a field and order', function(){
      var sql = new SqlString();
      sql.select('id').from('account').orderBy('id', 'desc');
      assert.equal(sql.toString(), 'SELECT `id` FROM `account` ORDER BY `id` DESC');
    });

  });

});
