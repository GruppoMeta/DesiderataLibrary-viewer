desiderata.controller('registration',function($scope, $rootScope, $http, $state, serviceHelper){
    $scope.registration = {
        name : "",
        surname : "",
        email : "",
        password : "",
        confirmPassword : "",
        years : "",
        city : "",
        interests : "",
        qualification : "",
        profession : ""
    }
    $scope.okFlag = false;

    $scope.goToLogin = function(){
        $state.go("login");
    }

    function flagError(){
        $scope.errorFlag = true;
        $scope.okFlag = false;
    }

    $scope.registrationSubmit = function(){
        if($scope.registration.name.length == 0 || $scope.registration.surname.length == 0 || $scope.registration.email.length == 0 || $scope.registration.password.length == 0 || $scope.registration.confirmPassword.length == 0){
            flagError();
            $scope.errorMsg = 'Tutti i campi sono obbligatori';
        }
        else{
            if(isNaN($scope.registration.years)){
                flagError();
                $scope.errorMsg = "Inserisci l'età in cifre";
            }
            else{
                if($scope.registration.password != $scope.registration.confirmPassword){
                    flagError();
                    $scope.errorMsg = "I due valori inseriti delle password sono diversi";
                }
                else{
                      var patt = new RegExp("(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,})$");
                      var res = patt.test($scope.registration.password);
                      if(!res){
                        flagError();
                        $scope.errorMsg = "La password deve contenere almeno un numero e deve essere composta da almeno 8 caratteri!";
                      }
                    else{
                      $scope.registrationUser = {
                          "firstName": $scope.registration.name,
                          "lastName": $scope.registration.surname,
                          "email": $scope.registration.email,
                          "username": $scope.registration.username,
                          "password": $scope.registration.password,
                          "age": $scope.registration.years,
                          "city": $scope.registration.city,
                          "interests": $scope.registration.interests,
                          "qualification": $scope.registration.qualification,
                          "profession": $scope.registration.profession
                      }

                      serviceHelper.registerUser($scope.registrationUser).then(function(response){
                          $scope.okFlag = true;
                          $scope.errorFlag = false;
                      },
                      function(error){
                        flagError();
                        if(error == "Email already exists"){
                          $scope.errorMsg = "L'email inserita è già presente, usarne un'altra.";
                        }
                        else if(error == "User already exists"){
                          $scope.errorMsg = "L'username inserito è già in uso, usarne un altro.";
                        }
                        else{
                          $scope.errorMsg = "Si è verificato un errore. Riprova.";
                        }
                      });
                    }
                }
            }
        }
    };
});
