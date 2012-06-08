var assert = require('assert'),
    _  = require('underscore'),
    GameStore = require('../../lib/gamestore'),
    gameStore = new GameStore,
    redis = require('redis').createClient(),
    Step = require('step');

// clear database

// define some custom assert functions
assert.isNull = function(obj,msg) {
  if(obj!=null) {
    console.log("not null:  "+obj);
  }
  assert.strictEqual(null,obj,msg);
};

assert.isNotNull = function(obj,msg) {
  assert.notStrictEqual(null,obj,msg);
};

assert.eql = function(obj1,obj2,msg) {
  assert.deepEqual(obj1,obj2,msg);
};


// define some global variables
var gameID=0;
var fields = _.map(_.range(50),function(n) {
      return {id:n,state:'free'};
});

var games = []
// testing sequentally
Step(

  function select() {
    redis.select(42,this);
  },
  function flush(err,res) {
    redis.flushdb(this);
  },
  
  function createGame(err,res) {
    console.log("creating new game: ");
    gameStore.createGame(this);
  },

  function checkGame(err,res) {

    gameID = res;
    assert.isNull(err,"no error");
    assert.eql(gameID,1,"First gameID == 1");

    console.log('created game with id: '+gameID);
    return gameID;
  },

  function addPlayer(err,res) {
    console.log("add player1: gameID "+res);
    gameStore.addPlayer(gameID,"player1",this);
  },

  function checkPlayer(err,res) {
    assert.isNull(err,"no error");
    return res;
  },
  function readPlayer(err,res) {
    console.log("read first player");
    gameStore.readGame(gameID,this);
  },
  function checkPlayer2(err,res) {
    assert.isNull(err,"no error");
    assert.deepEqual(res,{nplayers:1,player1:"player1"});
    return result;
  },
  function addAnotherPlayer(err,res) {
    console.log("add another player");
    gameStore.addPlayer(gameID,"player2",this);
  },
  function readAnotherPlayer(err,res) {
   
    console.log("read another player");
    gameStore.readGame(gameID,this);

  },
  function checkAnotherPlayer(err,res) {
    
    assert.isNull(err,"no error");
    assert.deepEqual(res,{nplayers:2,player1:"player1",player2:"player2"});
    return result;
  },
  
  function addThirdPlayer(err,res) {
    console.log("add a third player");
    gameStore.addPlayer(gameID,"player3",this);
  },
  function checkAnotherPlayer(err,res) {
    assert.isNotNull(err,"there should be an error");
    return res;
  },
  
  function readAnotherPlayer(err,res) {
   
    console.log("read another player");
    gameStore.readGame(gameID,this);

  },
  function checkAnotherPlayer(err,res) {
    
    assert.isNull(err,"no error");
    assert.deepEqual(res,{nplayers:2,player1:"player1",player2:"player2"});
    return res;
  },

  function saveBoard(err,res) {
    console.log("add a board");
    gameStore.saveBoard(gameID,{size:19,player:"black"},this);
  }, 

  function readBoard(err,res) {
    assert.isNull(err,"no error");
    console.log("and read the board");
    gameStore.readBoard(gameID,this);
  },
  function checkBoard(err, res) {
    assert.isNull(err,"no error");
    assert.deepEqual(res,{size:19,player:"black"});

    return res;
  },
  
  function saveField(err,res) {
    console.log("add a field");
    gameStore.saveField(gameID,{id:1,state:"free"},this);
  }, 

  function readField(err,res) {
    assert.isNull(err,"no error");
    console.log("and read the field");
    gameStore.readField(gameID,1,this);
  },

  function checkField(err, res) {
    console.log("check fields");
    assert.isNull(err,"no error");
    assert.deepEqual(res,{id:1,state:"free"});
    return res;
  },

  function saveAllFields(ers,res) {
    console.log("save 50 fields");
    gameStore.saveAllFields(gameID,fields,this);
  },
  function readFields(err,res) {
    console.log("Read all fields");
    assert.isNull(err,"no error");
    gameStore.readAllFields(gameID,this);
  },

  function checkFields(err,res) {
    var sortByID = function(h1,h2) {
      return h1.id-h2.id;
    };
    assert.isNull(err,"no error");
    res.sort(sortByID);
    assert.deepEqual(res,fields,'saved fields === read fields');
    return res;
  },
  function flush(err,res) {
    redis.flushdb(this);
  },
  
  function createGame(err,res) {
    console.log("creating new game: ");
    gameStore.createGame(this);
  },

  function saveId(err,res) {
    games.push(res);
    return res;
  },
  
  function createGame(err,res) {
    console.log("creating new game: ");
    gameStore.createGame(this);
  },

  function saveId(err,res) {
    games.push(res);
    return res;
  },
  
  function readGames(err,res) {
    gameStore.readAllGames(this);
  },
  function checkGames(err,res) {
    
    ids = _.map(res,function(m) {return m.id});
    
    assert.isNull(err,"no error");
    ids.sort();
    assert.deepEqual(ids,games,'saved games === read games');
  }

);



  
