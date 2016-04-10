desiderata.controller('profile',function($scope, $rootScope, $http, $state, $localStorage, $modal, serviceHelper){
    $scope.okFlag = false;
    $scope.$storage = $localStorage;


    $scope.resetForm = function(){
        $scope.user = {};
        $scope.user.loginId = $scope.$storage.user.loginId;
        $scope.user.email = $scope.$storage.user.email;
        $scope.user.firstName = $scope.$storage.user.firstName;
        $scope.user.lastName = $scope.$storage.user.lastName;
        $scope.user.interests = $scope.$storage.user.interests;
        $scope.user.age = $scope.$storage.user.age;
        $scope.user.profession = $scope.$storage.user.profession;
        $scope.user.city = $scope.$storage.user.city;
        $scope.user.qualification = $scope.$storage.user.qualification;
        $scope.user.password = "";
        $scope.user.confirmPassword = "";
        $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;
    }
    $scope.resetForm();


    function setDefaultValues(){
        angular.element('#profession option[value="' +  $scope.user.profession +'"]').attr('selected', 'selected')
        angular.element('#interests option[value="' +  $scope.user.interests +'"]').attr('selected', 'selected')
        angular.element('#qualification option[value="' +  $scope.user.qualification +'"]').attr('selected', 'selected')
    }
    setTimeout(setDefaultValues, 750);

    function flagError(){
        $scope.errorFlag = true;
        $scope.okFlag = false;
    }

    function flagSucess(){
        $scope.okFlag = true;
        $scope.errorFlag = false;
    }

    $scope.goToLibrary = function(){
        $state.go("dashboard", {"toDesiderata" : ""});
    }

    $scope.openNoConnectionModal = function(){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalNoConnection.html',
          controller: 'myModalNoConnectionCtrl',
           size: 'lg'
        });
    }

    $scope.profileSubmit = function(){
                    if(!( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
                        $scope.openNoConnectionModal();
                        return;
                    }
                    if($scope.user.password != $scope.user.confirmPassword){
                        flagError();
                        $scope.errorMsg = ' Le due password non coincidono'
                      return;
                    }
                    delete $scope.user.confirmPassword;

                    if($scope.user.firstName == '' || $scope.user.lastName == '' || $scope.user.loginId == "" || $scope.user.email == '' ||
                        $scope.user.password == '' || $scope.user.confirmPassword == ''){
                        flagError();
                        $scope.errorMsg = ' I campi obbligatori non possono essere vuoti';
                        $scope.resetForm();
                        return;
                    }
                    serviceHelper.updateUser({
                                              username: $scope.user.loginId,
                                              password: $scope.user.password,
                                              firstName: $scope.user.firstName,
                                              lastName: $scope.user.lastName,
                                              email: $scope.user.email,
                                              age: $scope.user.age,
                                              city: $scope.user.city,
                                              interests: $scope.user.interests,
                                              qualification: $scope.user.qualification,
                                              profession: $scope.user.profession
                                            }).then(function(response){
                      if(response.error){
                        console.log("errore nella updateUser");
                        flagError();
                        $scope.errorMsg = " Errore con l'invio dei dati al server";
                      }
                      else{
                        if(response){
                            flagSucess();
                            $scope.okMsg = 'Modifiche effettuate con successo'
                        }
                        else{
                            flagError();
                            $scope.errorMsg = " Errore con l'invio dei dati al server";
                        }
                      }
                    });

    };
});
