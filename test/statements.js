var assert = require("assert");
var SqlString = require('../sqlstring');

describe('Statement Compiling', function(){

  describe('#set()', function(){

    it('should accept an object', function(){
      var sql = new SqlString();
      sql.update('account').set({email: 'test@test.com'});
      assert.equal(sql.toString(), "UPDATE `account` SET `email` = 'test@test.com'");
    });

    it('should accept multiple criteria', function(){
      var sql = new SqlString();
      sql.update('account').set({email: 'test@test.com', age: 3});
      assert.equal(sql.toString(), "UPDATE `account` SET `email` = 'test@test.com', `age` = '3'");
    });

    it('should accept multiple objects as arguments', function(){
      var sql = new SqlString();
      sql.update('account').set({email: 'test@test.com', age: 3}, {name: 'test'});
      assert.equal(sql.toString(), "UPDATE `account` SET `email` = 'test@test.com', `age` = '3', `name` = 'test'");
    });

    it('should accept methods and parameters', function(){
      var sql = new SqlString();
      sql.update('account').set({email: 'test@test.com', password: {method: 'MD5', param: 'password'}}, {name: 'test'});
      assert.equal(sql.toString(), "UPDATE `account` SET `email` = 'test@test.com', `password` = MD5('password'), `name` = 'test'");
    });

  });

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

    it('should use a LIKE operator when passed a like property', function(){
      var sql = new SqlString();
      sql.select('id').from('account').where({first_name: {operator: 'like', value: 'John'}});
      assert.equal(sql.toString(), "SELECT `id` FROM `account` WHERE `first_name` LIKE 'John'");
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

  describe('#insert()', function(){

    it('should accept an object', function(){
      var sql = new SqlString();
      sql.insert({name: 'test', age: 4}).into('account');
      assert.equal(sql.toString(), "INSERT INTO `account` SET `name` = 'test', `age` = '4'");
    });

    it('should accept an array', function(){
      var sql = new SqlString();
      sql.insert([{name: 'test', age: 4}, {name: 'test2', age: 5}]).into('account');
      assert.equal(sql.toString(), "INSERT INTO `account` (`name`, `age`) VALUES ('test', '4'), ('test2', '5')");
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
