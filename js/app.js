(
    function () {
        "use strict";

        var app = angular.module("RentCalculator", [])
        .controller("TarrifItemsController", TarrifItemsController);



        function TarrifItemsController($scope) {
            $scope.total = 0;
            $scope.new_value = "";
            $scope.isStatic = false;
            $scope.isTable = false;
            $scope.tarrifs = [];
            $scope.payHistory = [];
            $scope.comment = ""
            $scope.getPromiseTarrifs = function () {
                $scope.promiseTarrifs = firebase.database().ref("tarrifs").once("value", function(xsnapshot) {
                    $scope.payHistory = xsnapshot.val();
                    $scope.$apply(function() {
                        $scope.getLastPaymentTarrifs();
                        $scope.calculateStatic();
                    });
                });
            };
            $scope.getLastPaymentTarrifs = function () {
                $scope.tarrifs = [];
                angular.copy($scope.payHistory[$scope.payHistory.length-1].tarrifs, $scope.tarrifs);
                for(var i = 0; $scope.tarrifs.length > i; i++) {
                    $scope.tarrifs[i].counter = $scope.tarrifs[i].new_counter;
                    $scope.tarrifs[i].new_counter = 0;
                }

            };
            $scope.getTarrifs = function () {
                return $scope.tarrifs;
            };
            $scope.add = function () {
                var id = 0;
                if ($scope.tarrifs.length !== 0) {
                    id = $scope.tarrifs[$scope.tarrifs.length-1].id+1;
                }
                $scope.tarrifs.push({"name": $scope.new_value, "id": id, isStatic: $scope.isStatic, isTable: $scope.isTable, counter: 0});
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
                } else if (tarrif.isTable) {
                    var counterDiff = (tarrif.new_counter - tarrif.counter);
                    var diffVal = 0;
                    for(var i = 0; tarrif.tableRate.length > i; i++) {
                        if (tarrif.tableRate[i].val >= counterDiff) {
                            tarrif.calculatedPrice += (counterDiff - diffVal) * tarrif.tableRate[i].price
                        } else {
                            tarrif.calculatedPrice += tarrif.tableRate[i].val * tarrif.tableRate[i].price
                            diffVal += tarrif.tableRate[i].val;
                        }
                    }
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
            $scope.getPayHistory = function () {
                return $scope.payHistory;
            };
            $scope.pay = function () {
                $scope.payHistory.push({payDate: new Date().toString(), tarrifs: $scope.tarrifs, total: $scope.total, comment: $scope.comment});
                $scope.getLastPaymentTarrifs();
                $scope.saveDb();
            };
            $scope.saveDb = function() {
                firebase.database().ref("tarrifs").set($scope.payHistory);
            };
            $scope.geleteTarrif = function (index) {
                $scope.tarrifs.splice(index, 1);
            };
            $scope.deletePay= function (index) {
                $scope.payHistory.splice(index, 1);
                $scope.saveDb();
            };
            $scope.addTableRate = function (tarrif) {
                if (!tarrif.hasOwnProperty('tableRate')) {
                    tarrif.tableRate = [];
                }
                tarrif.tableRate.push({val: tarrif.table.val, price: tarrif.table.price});
                tarrif.table.val = "";
                tarrif.table.price = "";
            };
        }
    }
) ();

