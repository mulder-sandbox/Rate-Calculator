(
    function () {
        "use strict";

        var app = angular.module("RentCalculator", [])
        .controller("TarrifItemsController", TarrifItemsController);



        function TarrifItemsController($scope) {
            $scope.total = 0;
            $scope.new_value = "";
            $scope.tarrifs = [];
            $scope.getPromiseTarrifs = function () {
                $scope.promiseTarrifs = firebase.database().ref("tarrifs").once("value", function(xsnapshot) {
                    $scope.tarrifs = xsnapshot.val();
                    $scope.calculateStatic();
                });
            };
            $scope.getTarrifs = function () {
                return $scope.tarrifs;
            };
            $scope.add = function () {
                $scope.tarrifs.push({"name": $scope.new_value, "id": $scope.tarrifs[$scope.tarrifs.length-1].id+1});
                $scope.new_value = "";
                return true;
            };
            $scope.save = function () {
                return true;
            };
            $scope.calculatePrice = function (tarrif) {
                if (tarrif.new_counter >= 0) {
                    tarrif.calculatedPrice = 0;
                }
                if (tarrif.isStatic) {
                    tarrif.calculatedPrice = tarrif.price;
                } else {
                    tarrif.calculatedPrice = (tarrif.new_counter - tarrif.counter) * tarrif.price;
                }
            };
            $scope.getSum = function () {
                $scope.total = 0;
                for(var i = 0; $scope.tarrifs.length > i; i++) {
                    if (!$scope.tarrifs[i].hasOwnProperty('calculatedPrice')) {
                        continue;
                    }
                    $scope.total = $scope.total + parseFloat($scope.tarrifs[i].calculatedPrice);
                }
                return $scope.total;
            };
            $scope.toggleStatic = function (tarrif) {
                if (tarrif.isStatic) {
                    tarrif.calculatedPrice = tarrif.price;
                } else {
                    tarrif.calculatedPrice = 0;
                }
            };
            $scope.calculateStatic = function () {
                for(var i = 0; $scope.tarrifs.length > i; i++) {
                    $scope.toggleStatic($scope.tarrifs[i]);
                }
            };
        }
    }
) ();

