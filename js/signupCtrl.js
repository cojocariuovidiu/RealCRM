/**
 * Created by sam on 11/12/2014.
 */
/* ----------------------    sregist Controller --------------------------------------------------------------- */

function registerCtrl($scope, $http, $routeParams, $templateCache) {
    $scope.user_id = $routeParams.userId;
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertUser';
    //$scope.codeStatus = '';
    //$scope.newProject = true;
       $scope.currentUser = { id: 0, firstName: '', lastName: '', username: '', password: ''};
    
    
    //resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': this.currentUser.id,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'username': this.currentUser.username,
            'password': this.currentUser.password
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
                
            }).
            error(function (response) {
                $scope.codeStatus = {
                    type: "error",
                    class: "alert-error",
                    message: response || "Request failed"
                };
            });
    };
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
    
