/**
 * Created by sam on 11/6/2014.
 */
function projectDetailCtrl($scope, $routeParams, $http, $templateCache) {
    $scope.project_id = $routeParams.projectId;
    console.log("Project ID: " + $scope.project_id +" from projectCtrl.js");
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertProject';
    $scope.codeStatus = '';
    $scope.newProject = true;
    function resetCurrentProjectData(){
        $scope.currentClient = {id:'', projectName:'',contractNumber:'',startDate:'',endDate:'', hourlyRate:'', laborRate:'',scopeOfWork:''};
    }
    resetCurrentProjectData();
    //resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': this.currentClient._id,
            'projectName': this.currentClient.projectName,
            'contractNumber': this.currentClient.contractNumber,
            'startDate': this.currentClient.startDate,
            'endDate': this.currentClient.endDate,
            'hourlyRate': this.currentClient.hourlyRate,
            'laborRate': this.currentClient.laborRate,
            'scopeOfWork': this.currentClient.scopeOfWork
        };
        console.log(formData);

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
                console.log("*");
            }).
            error(function (response) {
                $scope.codeStatus = {
                    type : "error",
                    class : "alert-error",
                    message : response || "Request failed"
                };
            });
        resetCurrentProjectData();
        return false;
    };

    $scope.getRecord = function(projectId){
        if(projectId != 0){
            var url = 'http://localhost:1212/getProject/'+$scope.project_id;
            $http.get(url).success(function (data) {
                $scope.currentClient = data;
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