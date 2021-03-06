var express = require('express');
var router = express.Router();
var dbHelper = require('../utils/dbHelper');
var serverMethods = require('../utils/serverMethods');
var firebase = require('firebase');

var config = {
    apiKey: process.env.FBKEY,
    authDomain: process.env.FBauthDomain,
    databaseURL: process.env.FBDBURL,
    projectId: process.env.FBprojectID,
    storageBucket: process.env.FBstorageBucket,
    messagingSenderId: process.env.FBmessagingSenderID
};
firebase.initializeApp(config);

/* GET users listing. */
router.get('/register', function (req, res, next) {
    res.render('register');
});

/* POST users listing. */
router.post('/register', function(req, res, next) {
    var userName = req.body.email;
    var password = req.body.password;
    firebase.auth().createUserWithEmailAndPassword(userName, password).then(function (newUser) {
      var id = newUser.user.uid;
      serverMethods.generateDBID(id, function (databaseID) {
          dbHelper.createProfile(req.body, databaseID);
      })
    });

    res.send({response: 'respond with a resource'});
});

router.post('/login', function (req, res, next) {
 // console.log(req.body.token);
    if (req.body.token === undefined){
        var userName = req.body.username;
        var password = req.body.password;
        firebase.auth().signInWithEmailAndPassword(userName, password).then(function (user) {
            user.user.getIdToken(true).then(function (value) {
                // return serverMethods.serverTokenAuth(value); //prints the UID from Firebase
                serverMethods.serverTokenAuth(value, function (firebaseID) {
                    serverMethods.generateDBID(firebaseID, function (profileID) {

                       return res.redirect('/profiles/' + profileID);

                    });
                });
            });
        }).catch(function (reason) {
            console.log(reason)
        });
    }else {
        var token = req.body.token;
        serverMethods.serverTokenAuth(token, function (firebaseID) {
            serverMethods.generateDBID(firebaseID, function (profileID) {
                dbHelper.retriveAllUserInfo(profileID, function (returnedDBSearch) {
                    res.send(returnedDBSearch);
                });
            });
        })
    }


});

router.post("/recovery", function (req, res) {

    res.send({message: "Email Sent", redirect: "/"});
});


/* PUT users listings. */


module.exports = router;