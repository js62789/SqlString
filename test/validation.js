var assert = require("assert");
var SqlString = require('../sqlstring');

describe('Validation', function(){

  it('should fail if no type declared', function(){
    var sql = new SqlString();
    assert.equal(false, sql.validate());
  });

  describe('Select Statements', function(){

    it('should fail if given select, but not from', function(){
      var sql = new SqlString();
      sql.select('id');
      assert.equal(false, sql.validate());
    });

    it('should fail if given from, but not select', function(){
      var sql = new SqlString();
      sql.select().from('account');
      assert.equal(false, sql.validate());
    });

    it('should pass if given select & from', function(){
      var sql = new SqlString();
      sql.select('id').from('account');
      assert.equal(true, sql.validate());
    });

  });

  describe('Insert Statements', function(){

    it('should fail if given into, but not insert', function(){
      var sql = new SqlString();
      sql.insert().into('account');
      assert.equal(false, sql.validate());
    });

    it('should fail if given insert, but not into', function(){
      var sql = new SqlString();
      sql.insert({age: 3});
      assert.equal(false, sql.validate());
    });

    it('should pass if given insert & into', function(){
      var sql = new SqlString();
      sql.insert({age: 3}).into('account');
      assert.equal(true, sql.validate());
    });

  });

  describe('Update Statements', function(){

    it('should fail if given update, but not set', function(){
      var sql = new SqlString();
      sql.update('account');
      assert.equal(false, sql.validate());
    });

    it('should fail if given set, but not update', function(){
      var sql = new SqlString();
      sql.update().set({age: 3});
      assert.equal(false, sql.validate());
    });

    it('should pass if given update & set', function(){
      var sql = new SqlString();
      sql.update('account').set({age: 3});
      assert.equal(true, sql.validate());
    });

  });

  describe('Delete Statements', function(){

    it('should fail if given from, but not where', function(){
      var sql = new SqlString();
      sql.delete().from('account');
      assert.equal(false, sql.validate());
    });

    it('should fail if given where, but not from', function(){
      var sql = new SqlString();
      sql.delete().where({age: 3});
      assert.equal(false, sql.validate());
    });

    it('should pass if given from & where', function(){
      var sql = new SqlString();
      sql.delete().from('account').where({age: 3});
      assert.equal(true, sql.validate());
    });

  });

});
