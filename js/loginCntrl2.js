// register controller


function signUpCtrl($scope, $routeParams, $http, $templateCache) {
    console.log("***");
    $scope.userId = $routeParams.userId;
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertUser';
    $scope.codeStatus = '';
    //$scope.newProject = true;

    //function resetCurrentUserData() {
    //    $scope.currentUser = { id: 0, projectName: '', username: '', email: '', firstName: '', lastName:'' };
    //}
    //resetCurrentUserData();
    //resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': this.currentUser.id,
            'user_id': $scope.UserId,
            'projectName': this.currentUser.projectName,
            'email': this.currentUser.contractNumber,
            'password': this.currentUser.password,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName
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
                    type: "success",
                    class: "alert-success",
                    message: response
                };
                $scope.list();
            }).
            error(function (response) {
                $scope.codeStatus = {
                    type: "error",
                    class: "alert-error",
                    message: response || "Request failed"
                };
            });

    };

    $scope.getRecord = function (userId) {
        if (userId != 0) {
            var url = 'http://localhost:1212/getUser/' + userId;
            $http.get(url).success(function (data) {
            });

        }
    };


    myApp.directive('notification', function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                ngModel: '='
            },
            template: '<div class="panel-body"><div class="alert {{ngModel.class}}">{{ngModel.message}}</div></div>',
            link: function (scope, element, attrs) {
                element.show();
                $timeout(function () {
                    element.hide();
                }, 3000);
            }
        }
    });
};