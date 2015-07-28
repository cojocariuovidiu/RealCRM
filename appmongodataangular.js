/**
 * Created by sam on 10/29/2014.
 */
var application_root = __dirname,
    express = require("express"),
    cors = require('cors');
    path = require("path");
var databaseUrl = "localhost:27017/realcrm"; // "username:password@example.com/mydb"
var collections = ["projects", "projectDetails", "clients", "users"]; 
var db = require("mongojs").connect(databaseUrl, collections);
var bodyParser = require('body-parser');
//var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var mongoStore = require('connect-mongo')(express);
var app = express();
//var pass = require('./lib/config/pass');
console.log("MongoDb console");
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST, Put");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
}
app.use(allowCrossDomain);


// Configuring rest of tools
app.configure(function () {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.cookieParser());
    app.use(bodyParser.json());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    app.use(app.router);
    app.use(cors());
    //app.use(bodyParser.json());
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.get('/api', function (req, res) {
    res.send(' Hello, your node API is running :)');
});

/**--------------------------------------------signup process---------------------------------------------------------**/
/*list all users */
app.get('/users', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597"); // 1597 is for webstorm - figure out how to not require this
    res.header("Access-Control-Allow-Methods", "GET, POST");
    db.users.find().sort({ _id: -1 } , function (err, users) {
        if (err || !users || users.length == 0) var str = '[]';
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            var str = '[';
            users.forEach(function (user) {
                str = str + '{ "id" : "' + user._id + 
                '", "firstName" : "' + user.firstName + 
                '", "lastName" : "' + user.lastName +
                '", "userName" : "' + user.username +
                '"},' + '\n';
            });
            str = str.trim();
            str = str.substring(0, str.length - 1);
            str = str + ']';
        }
        res.end(str);
    });
});

/* insert new user */
app.post('/insertUser', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var jsonData = JSON.parse(req.body.mydata);
    var saveId = jsonData.id;
    delete jsonData.id;
    if (saveId != 0) {
        console.log("jsonData " + JSON.stringify(jsonData));
        db.users.update({ _id: db.ObjectId(saveId) }, { $set: jsonData }, { multi: false }, function (err, saved) {
            if (err || !saved) res.end("User not updated");
            else res.end("User updated");
        });
    } else {
        /*console.log(saveData);
         res.end(JSON.stringify(saveData));*/
        db.users.save(jsonData, function (err, saved) {
            if (err || !saved) res.end("User not saved");
            else res.end("User saved");
        });
    }
});

/**--------------------------------------------login process----------------------------------------------------------**/
app.post('/authenticate', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597"); // 1597 is for webstorm - figure out how to not require this
    res.header("Access-Control-Allow-Methods", "GET, POST");
    users.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: true,
                    data: user,
                    token: user.token
                });
            } else {
                res.json({
                    type: false,
                    data: "Incorrect username/password"
                });
            }
        }
    });
});

app.post('/signin', function (req, res) {
    users.findOne({ email: req.body.email, password: req.body.password }, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function (err, user) {
                    user.token = jwt.sign(user, process.env.JWT_SECRET);
                    user.save(function (err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
});

app.get('/me', ensureAuthorized, function (req, res) {
    users.findOne({ token: req.token }, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}


/** -------------------------------------------start of projects  page -----------------------------------------------**/

/*list projects by client id */
app.get('/getAllProjects/:clientId', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597"); // 1597 is for webstorm - figure out how to not require this
    res.header("Access-Control-Allow-Methods", "GET, POST");

    db.projects.find({"client_id":req.params.clientId}).sort( { _id: -1 } , function (err, projects) {
        if (err || !projects || projects.length == 0) var str = '[]';
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            var str = '[';
            projects.forEach(function (project) {
                var projectDetailsStr = '';
                var projectDetailsReady = false;
                str = str + '{ "id" : "' + project._id +
                    '", "projectName" : "' + project.projectName +
                    '", "contractNumber" : "' + project.contractNumber +
                    '", "startDate" : "' + project.startDate +
                    '", "hourlyRate" : "' + project.hourlyRate +
                    '", "laborRate" : "' + project.laborRate +
                    '", "scopeOfWork" : "' + project.scopeOfWork +
                    '", "endDate" : "' + project.endDate + '"},' + '\n';
                //projectDetails":[' + '],

            });


            str = str.trim(); // This is for removing leading / trailing whitespaces
            if (str.substring(str.length - 1 , str.length) === ",") {
               str = str.substring(0, str.length - 1); // removing last ","
            }
            str = str + ']';
        }
        res.end(str);
    });
});
/*delete a single project*/
app.get('/deleteProjects/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var deleteId = req.params.id;
    if(deleteId){
        db.projects.remove( { _id : db.ObjectId(deleteId) }, true , function(){
            res.end("Project deleted");
        });
    }else{
        res.end("Project not deleted");
    }
});
/*find a single project*/
app.get('/getProject/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var projectId = req.params.id;
    if(projectId){
        db.projects.findOne({
            _id: db.ObjectId(projectId)
        }, function(err, doc) {
            // doc._id.toString() === '523209c4561c640000000001'
            /*console.log(err);
             console.log(doc);
             console.log(JSON.stringify(doc));*/
            res.end(JSON.stringify(doc));
        });
    }else{
        res.end("Project not found");
    }
});

/*find a single project Detail*/
app.get('/getProjectDetailsByProjectId/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var projectId = req.params.id;
    if(projectId){
        db.projectDetails.find({
            "project_id": projectId
        }, function(err, doc) {
            // doc._id.toString() === '523209c4561c640000000001'
            /*console.log(err);
             console.log(doc);
             console.log(JSON.stringify(doc));*/
            res.end(JSON.stringify(doc));
        });
    }else{
        res.end("Project details not found");
    }
});

/* insert new project */
app.post('/insertProject', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    //res.writeHead(200, {'Content-Type': 'text/plain'});
    //user = req.body.username;
    //passwd = req.body.password;
    //emailid = req.body.email;
    var jsonData = JSON.parse(req.body.mydata);
    var saveId = jsonData.id;
    delete jsonData.id;
    if (saveId != 0) {
        console.log("jsonData " + jsonData);
        db.projects.update({_id: db.ObjectId(saveId)}, {$set: jsonData}, {multi: false}, function (err, saved) {
            if (err || !saved) res.end("User not updated");
            else res.end("User updated");
        });
    } else {
        /*console.log(saveData);
         res.end(JSON.stringify(saveData));*/
        db.projects.save(jsonData, function (err, saved) {
            if (err || !saved) res.end("User not saved");
            else res.end("User saved");
        });
    }
});

app.post('/insertProjectDetail', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    //res.writeHead(200, {'Content-Type': 'text/plain'});
    //user = req.body.username;
    //passwd = req.body.password;
    //emailid = req.body.email;
    var jsonData = JSON.parse(req.body.mydata);
    var saveId = jsonData._id;
    var projectId = jsonData.project_id;
    delete jsonData._id;
    if (saveId != 0) {
        console.log("saveId = " + saveId + " jsonData " + jsonData);
        db.projectDetails.update({_id: db.ObjectId(saveId)}, {$set: jsonData}, {multi: false}, function (err, saved) {
            if (err || !saved) res.end("User not updated");
            else res.end("User updated");
        });
    } else {
        /*console.log(saveData);
         res.end(JSON.stringify(saveData));*/
        console.log("objectid = " + db.ObjectId(projectId));
        console.log("projectId =" + projectId + " save id =" + saveId);
        db.projectDetails.insert(jsonData);
        console.log("projectId =" + projectId + "save id =" + saveId);

    }

});

/*delete a single project Detail*/
app.get('/deleteProjectDetail/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var deleteId = req.params.id;
    if(deleteId){
        db.projectDetails.remove( { _id : db.ObjectId(deleteId) }, true , function(){
            res.end("Project Detail deleted");
        });
    }else{
        res.end("Project Detail not deleted");
    }
});

/**------------------------------------------------- clients page --------------------------------------- **/

/*list all clients */
app.get('/getAllClients', function (req, res, next) {
    console.log("inside getAllClients");
    res.header("Access-Control-Allow-Origin", "*");
    //res.header('Access-Control-Allow-Credentials: true'); 
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Authorization, Content-Type");
    
    db.clients.find().sort( { _id: -1 } , function (err, clients) {
        if (err || !clients || clients.length == 0) var str = '[]';
        else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            var str = '[';
            clients.forEach(function (client) {

                str = str + '{ "id" : "' + client._id + '", "clientName" : "' + client.clientName + '"},' + '\n';
            });
            str = str.trim();
            str = str.substring(0, str.length - 1);
            str = str + ']';
        }
        res.end(str);
    });
});

/*get count of clients projects */
app.get('/getProjectCountByClientId/:clientId', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597"); // 1597 is for webstorm - figure out how to not require this
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var str = db.projects.find({"client_id" : req.params.clientId}).count(function(err, count) {
        console.log(count);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        var str = '';
        str = str + '{ "count" : "' + count + '"}' + '\n';
        str = str + '';
        res.end(str);


        return(count);
    });
});

/*delete a single client*/
app.get('/deleteClient/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var deleteId = req.params.id;
    if(deleteId){
        db.clients.remove( { _id : db.ObjectId(deleteId) }, true , function(){
            res.end("Project deleted");
        });
    }else{
        res.end("Project not deleted");
    }
});
/*find a single client*/
app.get('/getClient/:id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    var clientId = req.params.id;
    if(clientId){
        db.clients.findOne({
            _id: db.ObjectId(clientId)
        }, function(err, doc) {
            // doc._id.toString() === '523209c4561c640000000001'
            /*console.log(err);
             console.log(doc);
             console.log(JSON.stringify(doc));*/
            res.end(JSON.stringify(doc));
        });
    }else{
        res.end("Project not found");
    }
});

/* insert new client */
app.post('/insertClient', function (req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:1597");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    //res.writeHead(200, {'Content-Type': 'text/plain'});
    //user = req.body.username;
    //passwd = req.body.password;
    //emailid = req.body.email;
    var jsonData = JSON.parse(req.body.mydata);
    var saveId = jsonData.id;
    delete jsonData.id;
    if (saveId != 0) {
        console.log("jsonData " + jsonData);
        db.clients.update({_id: db.ObjectId(saveId)}, {$set: jsonData}, {multi: false}, function (err, saved) {
            if (err || !saved) res.end("User not updated");
            else res.end("User updated");
        });
    } else {
        /*console.log(saveData);
         res.end(JSON.stringify(saveData));*/
        db.clients.save(jsonData, function (err, saved) {
            if (err || !saved) res.end("User not saved");
            else res.end("User saved");
        });
    }
});


app.listen(1212);