desiderata.controller('help',function($scope, $rootScope, $http, $state, $localStorage, serviceHelper){
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;
    $scope.help = {
        firstName : $scope.user.firstName,
        lastName : $scope.user.lastName,
        email : $scope.user.email,
        titleBook : "",
        descriptionHelp : ""
    };

    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;

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

    $scope.helpSubmit = function (){

//        var message = JSON.stringify({
//            "firstName": $scope.help.firstName,
//            "lastName": $scope.help.lastName,
//            "email": $scope.help.email,
//            "bookTitle": $scope.help.titleBook,
//            "description": $scope.help.descriptionHelp
//        });

        var message = {
            "firstName": $scope.help.firstName,
            "lastName": $scope.help.lastName,
            "email": $scope.help.email,
            "bookTitle": $scope.help.titleBook,
            "description": $scope.help.descriptionHelp
        };


        if(!$scope.help.email){
            flagError();
            $scope.errorMsg = " Non hai compilato il campo email"
        }
        else if(!$scope.help.descriptionHelp){
            flagError();
            $scope.errorMsg = " Non hai compilato il campo descrizione"
        }
        else if(!$scope.help.titleBook){
            flagError();
            $scope.errorMsg = " Non hai compilato il campo titolo del libro"
        }
        else{
            sendMail();
        }

        function sendMail(){
          serviceHelper.helpRequest(message).then(function(response){
            if(response.error){
              console.log('errore nella helpRequest');
              flagError();
              $scope.errorMsg = " Errore nell'invio email";
            }
            else{
              if(response.status == 200){
                  flagSucess();
                  $scope.okMsg = "Messaggio inviato correttamente"
              }
              else{
                  flagError();
                  $scope.errorMsg = " Errore nell'invio email";
              }
            }
          });
        }

    }



});
