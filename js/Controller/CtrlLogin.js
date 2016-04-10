desiderata.controller('login',function($scope, $rootScope, $http, $state, serviceHelper, isLogged, $localStorage, usSpinnerService){
    $scope.user;
    $scope.password;
    $scope.$storage = $localStorage;
    if(isLogged === true){
        if(typeof $state.previous !== "undefined" && $state.previous != 'error' && $state.previous != 'login'){
                $state.go($state.previous, {'idBook' : $state.previousIdBook, 'idPar' : $state.previousIdPar});
        }
        else{
            $state.go("dashboard", {"toDesiderata" : ""});
        }
    }
    $scope.loginSubmit = function(){
        if(!$scope.user || !$scope.password || $scope.user == '' || $scope.password == ''){
          $scope.loginError = true;
          return;
        }
        usSpinnerService.spin('spinner');
        serviceHelper.login( {username: $scope.user, password: $scope.password} ).then(function(response){
            usSpinnerService.stop('spinner');
            if(response.error){
                $scope.loginError = true;
            }
            else{
              console.log(response);
                $scope.$storage.user = response.data;
                if(window.cordova){
                  $scope.$storage.login = {
                    username: $scope.user,
                    password: $scope.password
                  }
                  var params;
                  if(window.device.platform == 'iOS'){
                    params = [$scope.user];
                  }
                  else if(window.device.platform == 'Android'){
                    params = [{
                      username: $scope.user
                    }];
                  }
                  if(params){
                      cordova.exec(
                       function(response) {
                         if(window.device.platform == 'iOS'){
                           console.log(response);
                           $scope.$storage.LPID = response.result; // da testare 
                         }
                         else if(window.device.platform == 'Android'){
                            console.log(response);
                            $scope.$storage.LPID = response;
                         }

                       },
                       function(error) {
                         console.log(error);
                       },
                       "ViditrustPlugin",
                       "getHash",
                       params
                     );
                  }
                }

                console.log($state);
                if(typeof $state.previous !== "undefined" && $state.previous != "registration" && $state.previous != "error" && $state.previous != 'login'){
                    $state.go($state.previous, {'idBook' : $state.previousIdBook, 'idPar' : $state.previousIdPar});
                }
                else{
                    $state.go("dashboard", {"toDesiderata" : ""});
                }
            }
       });
    };

    if(window.cordova){
      if($state.previous != "logout" && $scope.$storage.login){
        $scope.user = $scope.$storage.login.username;
        $scope.password = $scope.$storage.login.password;
        $scope.loginSubmit();
      }
    }
});
