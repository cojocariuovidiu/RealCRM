/**
 * Created by sam on 11/6/2014.
 */
function projectCtrl($scope, $routeParams, $http, $templateCache) {
    $scope.project_id = $routeParams.projectId;
    console.log("Project ID: " + $scope.project_id +" from projectCtrl.js");
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertProject';
    $scope.codeStatus = '';
    $scope.newProject = true;
    function resetCurrentProjectData(){
        $scope.currentProject = {id:'', projectName:'',contractNumber:'',startDate:'',endDate:'', hourlyRate:'', laborRate:'',scopeOfWork:''};
    }
    resetCurrentProjectData();
    //resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': $scope.project_id,
            'projectName': this.currentProject.projectName,
            'contractNumber': this.currentProject.contractNumber,
            'startDate': this.currentProject.startDate,
            'endDate': this.currentProject.endDate,
            'hourlyRate': this.currentProject.hourlyRate,
            'laborRate': this.currentProject.laborRate,
            'scopeOfWork': this.currentProject.scopeOfWork
        };
console.log(this.currentProject.id + formData);
console.log(JSON.stringify(formData));
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
                $scope.currentProject = data;
                var urlDetail = 'http://localhost:1212/getProjectDetailsByProjectId/'+$scope.project_id;
                $http.get(urlDetail).success(function (data) {
                    $scope.currentProject.projectDetails = data;
                    $scope.totalContractHours = +0.0;
                    $scope.totalActualHours = +0.0;
                    console.log("reset initial field values for calculations");
                    angular.forEach($scope.currentProject.projectDetails, function( projectDetail){
                        if (projectDetail) {
                            
                            $scope.totalContractHours = parseInt($scope.totalContractHours) + parseInt(projectDetail.contractHours);
                            $scope.totalActualHours = parseInt($scope.totalActualHours) + parseInt(projectDetail.actualHours);
                            $scope.currentProject.totalCost = $scope.totalContractHours * $scope.currentProject.hourlyRate;
                            $scope.currentProject.actualCost = $scope.totalActualHours * $scope.currentProject.laborRate;
                            $scope.currentProject.profitOrLoss = $scope.currentProject.totalCost -  $scope.currentProject.actualCost;
                            if( $scope.currentProject.totalCost != 0 ){
                                $scope.currentProject.profitMargin = $scope.currentProject.profitOrLoss * 100 /  $scope.currentProject.totalCost;
                            }
                            else {
                                $scope.currentProject.profitMargin = 0;
                            }
                            console.log("***" + projectDetail.contractHours + " "+ projectDetail.actualHours + " "+ $scope.totalContractHours + " " +  $scope.totalActualHours + " " + $scope.currentProject.totalCost + " " + $scope.currentProject.actualCost);
                        }
                    });
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