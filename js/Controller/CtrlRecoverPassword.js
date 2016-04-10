desiderata.controller('recoverPassword',function($scope, $rootScope, $http, $state, serviceHelper, isLogged, $timeout, serviceHelper){
    $scope.response = false;
    if(isLogged === true){
      $state.go("dashboard", {"toDesiderata" : ""});
    }
    $scope.recoverSubmit = function(){
         console.log( $scope.form.email);
      if(!$scope.form.email || $scope.form.email == ''){
        $scope.recoverError = true;
        return;
      }
      $scope.recoverError = false;
      $scope.recoverSuccess = false;
      serviceHelper.recoverPassword({email: $scope.form.email}).then(function(response){
        $scope.response = true;
        $scope.recoverSuccess = true;
        $timeout(function(){
          $state.go("login");
        }, 3000);
      }, function(error){
        console.log('errore nella recover password');
        $scope.response = true;
        $scope.recoverError = true;
      });
    }

});
