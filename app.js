var express = require('express');
var app = express();
var path = require('path');
var router = express.Router();
var formidable = require('formidable');
var mv = require('mv');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');

// viewed at http://localhost:8080
app.use(express.static(path.join(__dirname, '/client')));
app.use(express.static(path.join(__dirname, '/client/assets')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'));
});
app.listen(8080);

app.use(bodyParser.json());
app.use('/', router);

router.post('/api/upload', function (req, res, next) {

	var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
		uploadSingleDocument(files.uploads, function (err) {
			if(err) {
				res.send({ success:false, message: err });
			} else {
				res.send({ success : true });
			}
		})      
    });
}); 

function uploadSingleDocument(files, callback) {
    if(!files) {
        callback("file not found");
    }
    var tempPath = files.path;
    var targetPath = path.resolve('./Files/'+path.basename(files.name));
    mv(tempPath, targetPath, { mkdirp: true }, function (err) {
	    if (err) {
	      callback(err);
	    } else {
	      callback(null);
	    }
    });
}

router.post('/api/uploadFromGoogleDrive', function (req, res, next) {

	var fileInfo = req.body;
 	tryToCreateDir();
    
    request.get({
        url: fileInfo.link,
        encoding: null,
        headers: {
            Authorization: 'Bearer ' + fileInfo.userAccessToken
        }
    }, function (err, response) {
        if (err) {
            res.send({ success:false, message: 'File is not suppoeted' });
        } else {
        	var file = fs.createWriteStream(path.join(__dirname, '/' + fileInfo.filePath));
            response.pipe(file);
            fs.writeFile(path.join(__dirname, '/' + fileInfo.filePath), response.body, function (err) {
                if (!err) {
                    res.send({ success : true });
                } else {
                    res.send({ success:false, message: err });
                }
            });
        }
    })
}); 

function tryToCreateDir() {
    fs.mkdir(path.join(__dirname, '/Files'), function (error) {});
}
