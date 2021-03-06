var express = require('express');
var router = express.Router();
var http = require('http').Server(express),
  url = require('url'),
  fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

function isUserAuthenticated(req, res, next) {

  if (req.session.user) {
    return next();
  }
  res.redirect("/prijava");
}



router.get('/', isUserAuthenticated, function(req, res, next) {
  MongoClient.connect(url, function(err, client) {
    var db = client.db('mydb');
    if (err) throw err;
    
    db.collection("ChatRooms").find({"users" : { $in : [req.session.user.email]  } }).toArray(function(err, result) {
      if (err) throw err;
      
      res.render('index', {
        user: req.session.user,
        chatRooms: result
      });
      client.close();
    });
  });
});

router.post('/new', isUserAuthenticated, function(req, res, next) {
  MongoClient.connect(url, function(err, client) {
    var db = client.db('mydb');
    if (err) throw err;

    var now = new Date();
    var jsonDate = now.toJSON();
    var chatRoom = {
      name: req.body.name,
      users: [req.session.user.email],
      date: jsonDate
    }
    
    db.collection("ChatRooms").insertOne(chatRoom, function(err, res) {
        if (err) throw err;
        console.log("1 ChatRoom inserted");
        client.close();
    });
  });
  res.redirect('/');
});




module.exports = router;