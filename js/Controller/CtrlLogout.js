desiderata.controller('logout',function($scope, $rootScope, $http, $state, $localStorage, serviceHelper){
    $scope.$storage = $localStorage;
    serviceHelper.logout().then(function(response){
      if(response.error){
        console.log('errore nel logout');
      }
      else{
        delete $scope.$storage.login;
        delete $scope.$storage.localLibrary;
        $state.go("login");
      }
    });
});
