(function() { 'use strict';
  angular.module('webcam').controller('webcamController', webcamController);
  webcamController.$inject = ['$scope', '$log'];
  function webcamController($scope, $log) {
    /* jshint validthis: true */
    var vm = this;
    vm.config = {
      delay: 2,
      shots: 3,
      flashFallbackUrl: 'bower_components/webcamjs/webcam.swf',
      flashNotDetectedText: 'Seu browser não atende os requisitos mínimos para utilização da camera. ' +
      'Instale o ADOBE Flash player ou utilize os browsers (Google Chrome, Firefox ou Edge)'
    };

    vm.showButtons = false;
    vm.captureButtonEnable = false;

    vm.onComplete = function(src, progress) {
      var result = {
        src: src,
        progress: progress
      };
      $log.log('onComplete : ', result);
    };
    vm.onError = function(err) {
      $log.error('webcamController.onError : ', err);
      vm.showButtons = false;
    };
    vm.onLoad = function() {
      $log.info('webcamController.onLoad');
      vm.showButtons = true;
    };
    vm.onLive = function() {
      $log.info('webcamController.onLive');
      vm.captureButtonEnable = true;
    };
    vm.onCapturing = function(src, progress) {
      var result = {
        src: src,
        progress: progress
      }
      $log.info('webcamController.onCapturing : ', result);
    };
    vm.capture = function() {
      $scope.$broadcast('ngWebcam_capture');
    };
    vm.on = function() {
      $scope.$broadcast('ngWebcam_on');
    };
    vm.off = function() {
      $scope.$broadcast('ngWebcam_off');
      vm.captureButtonEnable = false;
    };
  }
})();