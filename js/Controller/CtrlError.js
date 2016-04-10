desiderata.controller('error',function($scope, $state){

  $scope.tryAgain = function(){
                if(typeof $state.previous !== "undefined" && $state.previous != "registration"){
                    $state.go($state.previous, {'idBook' : $state.previousIdBook, 'idPar' : $state.previousIdPar});
                }
                else{
                    $state.go("dashboard", {"toDesiderata" : ""});
                }
              }
});
