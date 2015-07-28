/**
 * Created by sam on 11/12/2014.
 */
/* ----------------------    Client Controller --------------------------------------------------------------- */

function clientListCtrl($scope, $http, $templateCache) {
    console.log("inside clientlistctrl");
    var method = 'POST';
    var inserturl = 'http://localhost:1212/insertClient';
    $scope.codeStatus = '';
    $scope.newProject = true;
    function resetCurrentClientData(){
        $scope.currentClient = {id:0, clientName:''};
    }
    resetCurrentClientData();
    resetDeleteId();
    $scope.save = function () {
        var formData = {
            'id': this.currentClient.id,
            'clientName': this.currentClient.clientName
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
        resetCurrentClientData();
        return false;
    };

    $scope.formModal = function(id, currentData){
        if(id && id != 0 && typeof currentData != 'undefined'){
            $scope.newClient = false;
            $scope.currentClient = currentData;
        }else{
            $scope.newClient = true;
            resetCurrentClientData();
        }
        $('#myModal').modal();
    };

    $scope.deleteModal = function(id){
        $scope.currentDeleteId = id;
        $('#deleteModal').modal();
    };

    $scope.getRecord = function(clientId){
        if(clientId != 0){
            var url = 'http://localhost:1212/getClient/'+clientId;
            $http.get(url).success(function (data) {
            });

        }
    };


    $scope.deleteRecord = function(){
        if($scope.currentDeleteId != 0){
            var url = 'http://localhost:1212/deleteClient/'+$scope.currentDeleteId;
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
        console.log("inside getAllClients");
        var url = 'http://localhost:1212/getAllClients';
        $http.get(url).success(function (data) {
            console.log('**' + JSON.stringify(data));
            $scope.clients = data;
            console.log($scope.clients);
            angular.forEach($scope.clients,function(client){
                var urlCount = 'http://localhost:1212/getProjectCountByClientId/'+client.id;
                $http.get(urlCount).success(function (data) {

                    client.count = data.count;
                    console.log("data = " + JSON.stringify(data) + " " + "client= " + JSON.stringify(client));

                })
            });
        });
    };
    console.log("before list");
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
