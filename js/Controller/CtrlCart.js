desiderata.controller('cart',function($scope, $rootScope, $http, $state, $localStorage, serviceHelper, $stateParams){
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;

    $scope.noError = false;
    $scope.errorInPayment = false;
    if(typeof $rootScope.objInCart === "undefined"){
        $rootScope.objInCart = [];
    }

    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;

    if($stateParams.error == "true"){
        $scope.errorInPayment = true;
    }

    serviceHelper.getFatturationData().then(function(response){
        if(response.error){
            console.log("Errore nella getFatturationData");
        }
        else{
            console.log(response);
            if(response.data.length != 0){
                $scope.billingInfo = {
                    firstName: (response.data.firstName != null) ? response.data.firstName : '',
                    lastName: (response.data.lastName != null) ? response.data.lastName : '',
                    email: (response.data.email != null) ? response.data.email : '',
                    address: (response.data.address != null) ? response.data.address : '',
                    taxCode: (response.data.fiscalCode != null) ? response.data.fiscalCode : '',
                    city: (response.data.city != null) ? response.data.city : '',
                    province: (response.data.province != null) ? response.data.province : '',
                    cap: (response.data.cap != null) ? response.data.cap : '',
                    country: (response.data.country != null) ? response.data.country : ''
                }
            }
            else{
                $scope.billingInfo = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    email: $scope.user.email,
                    address: '',
                    taxCode: '',
                    city: $scope.user.city,
                    province: '',
                    cap: '',
                    country: ''
                }
            }
        }
    });

    $scope.calculateCart = function(){
        $scope.elementsInCart = $rootScope.objInCart.length;
        $scope.totalToPay = 0;
        for(var i=0; i < $rootScope.objInCart.length; i++){
            var amount = ($rootScope.objInCart[i].price.split(" €")[0]).replace(",", ".");
            $scope.totalToPay = (parseFloat($scope.totalToPay) + parseFloat(amount)).toFixed(2);
        }
    }

    $scope.calculateCart();

    $scope.deleteFromCart = function(index){
        $rootScope.objInCart.splice(index, 1);
        $scope.calculateCart();
    }
    $scope.goToCollection = function(){
        $state.go("collection");
    }

    function flagError(){
        $scope.errorFlag = true;
        $scope.okFlag = false;
    }

    function flagSucess(){
        $scope.okFlag = true;
        $scope.errorFlag = false;
    }

    $scope.fatturationSubmit = function(){
        for(billingInfoKey in $scope.billingInfo){
          if(!$scope.billingInfo[billingInfoKey] || $scope.billingInfo[billingInfoKey] == ''){
            flagError();
            $scope.errorMsg = ' I campi obbligatori non possono essere vuoti';
            return;
          }
        }
        flagSucess();
        $scope.okMsg = 'Ok';
        console.log("submit");
        var objToBuy = [];
        for(var i=0; i < $rootScope.objInCart.length; i++){
            objToBuy.push($rootScope.objInCart[i].id);
        }
        serviceHelper.saveFatturationData({
            "user":{
                "firstName": $scope.billingInfo.firstName,
                "lastName": $scope.billingInfo.lastName,
                "address": $scope.billingInfo.address,
                "email": $scope.billingInfo.email,
                "fiscalCode": $scope.billingInfo.taxCode,
                "city": $scope.billingInfo.city,
                "province": $scope.billingInfo.province,
                "cap": $scope.billingInfo.cap,
                "country": $scope.billingInfo.country
            },
            "cart": objToBuy,
            "urlSuccess" : DESIDERATA_CONFIG.viewer + "/confirmPayment",
            "urlError" : DESIDERATA_CONFIG.viewer + "/cart/true"
        }).then(function(response){
            if(response.error){
                console.log("Errore nella saveFatturationData");
            }
            else{
                console.log(response);
                window.location.href = response.data.url;
            }
        });
    };

});
