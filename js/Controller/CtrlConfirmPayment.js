desiderata.controller('confirmPayment',function($scope, $rootScope, $http, $state, $localStorage, serviceHelper){
    $rootScope.objInCart = [];

    $scope.goToLibrary = function(){
        $state.go("dashboard", {"toDesiderata" : ""});
    }
});
