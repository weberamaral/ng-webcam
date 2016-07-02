(function() { 'use strict';
  angular.module('webcam').controller('webcamController', webcamController);
  webcamController.$inject = ['$scope', '$log'];
  function webcamController($scope, $log) {
    /* jshint validthis: true */
    var vm = this;
    vm.config = {

    };
    vm.onComplete = function(src) {
      $log.log('onComplete : ', src);
    };
    vm.onError = function(err) {
      $log.error('onError : ', err);
    };
    vm.onLoad = function() {
      $log.info('onLoad');
    };
    vm.onCapturing = function(src) {
      $log.info('onCapturing : ', src);
    };
    vm.capture = function() {
      $scope.$broadcast('ngWebcam_capture');
    };
    vm.on = function() {
      $scope.$broadcast('ngWebcam_on');
    };
    vm.off = function() {
      $scope.$broadcast('ngWebcam_off');
    };
  }
})();