/**
 * Created by sam on 10/29/2014.
 **/
'use strict';

var myApp = angular.module('myApp', ['ngRoute', 'Authentication', 'ngCookies']);

myApp.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

angular.module('Authentication', []);

myApp.config(function($routeProvider){
    $routeProvider


        // route for the about page
        .when('/about', {
            templateUrl: 'partials/about.html'
        })

        // route for the about page
        .when('/projects/:clientId', {
            templateUrl: 'partials/projects.html'
        })

        // route for project details
        .when('/project-details/:projectId', {
            templateUrl: 'partials/project-details.html'
        })

        // route for add client
        .when('/add-client/', {
            templateUrl: 'partials/add-client.html'
        })

        // route for the home page
        .when('/login', {
            controller: 'LoginController',
            templateUrl: 'partials/login.html'
        })
        // route for the sign up page
        .when('/signup', {
            templateUrl: 'partials/signup.html'
        })

        .when('/', {
            templateUrl: 'partials/main.html'
        })

        .otherwise({ redirectTo: 'partials/login.html' });

})

.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && $location.path() !== '/signup' && !$rootScope.globals.currentUser ) {
                $location.path('/');
            } 
        });
    }]);

/* ----------------------    Project List Controller --------------------------------------------------------------- */

function projectListCtrl($scope,$routeParams,$http, $templateCache) {
    console.log("***");
    $scope.clientId = $routeParams.clientId;
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertProject';
    $scope.codeStatus = '';
    $scope.newProject = true;

    function resetCurrentProjectData(){
        $scope.currentProject = {id:0, projectName:'',contractNumber:'',startDate:'',endDate:''};
    }
    resetCurrentProjectData();
    resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': this.currentProject.id,
            'client_id': $scope.clientId,
            'projectName': this.currentProject.projectName,
            'contractNumber': this.currentProject.contractNumber,
            'startDate': this.currentProject.startDate,
            'endDate': this.currentProject.endDate
        };

        var jdata = 'mydata=' + JSON.stringify(formData); //make the data a string

        $http({
            method: method,
            url: inserturl,
            data: jdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: $templateCache
        }).
            success(function (response) {
                $scope.codeStatus = {
                    type : "success",
                    class : "alert-success",
                    message : response
                };
                $scope.list();
            }).
            error(function (response) {
                $scope.codeStatus = {
                    type : "error",
                    class : "alert-error",
                    message : response || "Request failed"
                };
            });

        $('#myModal').modal('hide');
        resetCurrentProjectData();
        return false;
    };

    $scope.formModal = function(id, currentData){
        if(id && id != 0 && typeof currentData != 'undefined'){
            $scope.newProject = false;
            $scope.currentProject = currentData;
        }else{
            $scope.newProject = true;
            resetCurrentProjectData();
        }
        $('#myModal').modal();
    };

    $scope.deleteModal = function(id){
        $scope.currentDeleteId = id;
        $('#deleteModal').modal();
    };

    $scope.getRecord = function(projectId){
        if(projectId != 0){
            var url = 'http://localhost:1212/getProject/'+projectId;
            $http.get(url).success(function (data) {
            });

        }
    };


    $scope.deleteRecord = function(){
        if($scope.currentDeleteId != 0){
            var url = 'http://localhost:1212/deleteProjects/'+$scope.currentDeleteId;
            $http.get(url).success(function (data) {
                $scope.codeStatus = {
                    type : "success",
                    class : "alert-success",
                    message : data
                };
                $scope.list();
            });
            resetDeleteId();
        }
        $('#deleteModal').modal('hide');
    };

    function resetDeleteId(){
        $scope.currentDeleteId = 0;
    }


    $scope.list = function () {
        var url = 'http://localhost:1212/getAllProjects/'+$scope.clientId;
        $http.get(url).success(function (data) {
            console.log('**' + JSON.stringify(data))
            $scope.projects = data;

        });
    };

    $scope.list();
}

myApp.directive('notification', function($timeout){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="panel-body"><div class="alert {{ngModel.class}}">{{ngModel.message}}</div></div>',
        link: function(scope, element, attrs){
            element.show();
            $timeout(function(){
                element.hide();
            }, 3000);
        }
    }
});

/* ----------------------------------- Project Detail Controller ------------------------------------------------ */

//myApp.controller('projectDetailCtrl', [$scope, projectDetailCtrl]);

function projectDetailCtrl($scope, $routeParams, $http, $templateCache) {
    $scope.project_id = $routeParams.projectId;
    console.log("Project ID: " + $scope.project_id +" from projectCtrl.js");
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertProjectDetail';
    $scope.codeStatus = '';
    $scope.newProjectDetail = true;
    function resetCurrentProjectDetailData(){
        $scope.currentProjectDetail = {_id: "", projectItem:'', contractHours:'', estimatedHours:'', actualHours:''};
    }
    resetCurrentProjectDetailData();
    //resetDeleteId();
    $scope.save = function () {
        var formData = {
            '_id': this.currentProjectDetail._id === undefined ? 0 : this.currentProjectDetail._id,
            'project_id' : $scope.project_id,
            'projectItem': this.currentProjectDetail.projectItem,
            'contractHours': this.currentProjectDetail.contractHours,
            'estimatedHours': this.currentProjectDetail.estimatedHours,
            'actualHours': this.currentProjectDetail.actualHours
        };
        console.log("Saving Data: " + formData);

        var jdata = 'mydata=' + JSON.stringify(formData); //make the data a string
        console.log("* Jdata" + jdata);
        $http({
            method: method,
            url: inserturl,
            data: jdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: $templateCache
        }).
            success(function (response) {
                $scope.codeStatus = {
                    type : "success",
                    class : "alert-success",
                    message : response
                };
                $scope.getRecord($scope.project_id);
                console.log("Save returned success status*");
            }).
            error(function (response) {
                $scope.codeStatus = {
                    type : "error",
                    class : "alert-error",
                    message : response || "Request failed"
                };
                $scope.getRecord($scope.project_id);
                console.log("save returned error status")
            });

        $('#myModal').modal('hide');
        resetCurrentProjectDetailData();
        $scope.getRecord($scope.project_id);
        return false;
    };

    $scope.formModal = function(id, currentData){
        if(id && id != 0 && typeof currentData != 'undefined'){
            $scope.newProjectDetail = false;
            $scope.currentProjectDetail = currentData;
        }else{
            $scope.newProjectDetail = true;
            resetCurrentProjectDetailData();
        }
        $('#myModal').modal();
    };

    $scope.deleteModal = function(id){
        $scope.currentDeleteId = id;
        $('#deleteModal').modal();
    };

    $scope.deleteRecord = function(){
        if($scope.currentDeleteId != 0){
            var url = 'http://localhost:1212/deleteProjectDetail/'+$scope.currentDeleteId;
            $http.get(url).success(function (data) {
                $scope.codeStatus = {
                    type : "success",
                    class : "alert-success",
                    message : data
                };
                $scope.getRecord($scope.project_id);
            });
            resetDeleteId();
        }
        $('#deleteModal').modal('hide');
    };

    function resetDeleteId(){
        $scope.currentDeleteId = 0;
    }

    $scope.getRecord = function(projectId){
        if(projectId != 0){
            var url = 'http://localhost:1212/getProject/'+$scope.project_id;
            $http.get(url).success(function (data) {
                $scope.currentProject = data;
                var urlDetail = 'http://localhost:1212/getProjectDetailsByProjectId/'+$scope.project_id;
                $http.get(urlDetail).success(function (data) {
                    $scope.currentProject.projectDetails = data;

                });
            });
        }
    };
    $scope.getRecord($scope.project_id);
}

myApp.directive('notification', function($timeout){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="panel-body"><div class="alert {{ngModel.class}}">{{ngModel.message}}</div></div>',
        link: function(scope, element, attrs){
            element.show();
            $timeout(function(){
                element.hide();
            }, 3000);
        }
    }


});

//PhoneListCtrl.$inject = ['$scope', '$http'];