var app = angular.module('uploadFile',['ngSanitize','ngFileUpload']);

app.controller('UploadController', ['$scope', '$http', '$rootScope', 'googleDriveApi', 'Upload' ,function($scope, $http, $rootScope, googleDriveApi, Upload) {
    var self = this;
	self.options = {
        success: function (files) {
            $scope.serverError = false;
            $('.browseForFileInput').fileinput('clear');
            var file = files[0];
            $http({
            	url:'/api/uploadFromGoogleDrive',
            	method: 'POST',
            	data: {
            		link: file.link,
                	filePath: '/Files/'+ file.name
            	}
            }).then(function success(response) {
                $scope.serverSuccess = "File uploaded SuccessFully";
                $scope.serverError = false;
            }, function error(response) {
            	$scope.serverError = true;
                $scope.error = response.data.message;
                $scope.serverSuccess = '';
            });
        },
        cancel: function () {
            console.log("cancel");
        },
        linkType: "direct",
        extensions: ['.doc', '.docx', '.pdf', '.txt', '.xls', '.ppt', '.odt', '.ods', '.odp','.rtf','.xlsx','.jpg','.pptx'],
    };
    self.setResume = function () {
        var resume = document.getElementById('resumeFile').files[0];
        $scope.serverError = false;
        if(!resume){
            return;
        }
        var resumeReader = new FileReader();
        resumeReader.onloadend = function (e) {

             Upload.upload({
                url: '/api/upload',
                data: {
                  uploads: resume
                }
            }).then(function (response) {
                if(response.data.success) {
                    $scope.serverSuccess = "File uploaded SuccessFully";
                    $scope.serverError = false;
                } else {
                    $scope.serverError = true;
                    $scope.error = response.data.message;
                    $scope.serverSuccess = '';
                }
            })
        }
        resumeReader.readAsDataURL(resume);
    }
    self.openDropBox = function () {
        $scope.serverError = false;
        Dropbox.choose(self.options);
    }
    self.openGoogleDrive = function () {
        $scope.serverError = false;
        var picker = new googleDriveApi.FilePicker({
            onSelect: function (file) {
                $('.browseForFileInput').fileinput('clear');
                    $http({
                    	url:'/api/uploadFromGoogleDrive',
                    	method: 'POST',
                    	data: {
                    		link: file.downloadUrl,
                        	userAccessToken: file.userAccessToken,
                        	filePath: '/Files/'+ file.name
                    	}
                    }).then(function success(response) {
                    	console.log(response.data);
                        if(response.data.success) {
                            $scope.serverSuccess = "File uploaded SuccessFully";
                            $scope.serverError = false;
                        } else {
                            $scope.serverError = true;
                            $scope.error = response.data.message;
                            $scope.serverSuccess = '';
                        }
                    }, function error(response) {
                    	
                    });
	            },
            onCancel: function () {
                console.log("cancel");
            }
        });
    }
}]);