(function() {
  'use strict';
  /**
   *
   */
  angular.module('ng-webcam', []).directive('ngWebcam', ngWebcam);
  ngWebcam.$inject = [];
  /**
   *
   */
  function ngWebcam() {
    var directive = {
      restrict: 'E',
      template: template,
      link: link,
      bindToController: true,
      controller: ngWebcamController,
      controllerAs: 'vm',
      scope: {
        config: '=',
        onComplete: '&',
        onError: '&',
        onLoad: '&',
        onCapturing: '&'
      }
    };
    /**
     *
     */
    function template() {
      return ['<div class="ng-webcam" ng-show="vm.webcamLive">',
        '<div id="ng-webcam-container"></div>'].join('');
    }
    /**
     *
     * @param scope
     * @param element
     * @param attrs
     * @param ctrl
     */
    function link(scope, element, attrs, ctrl) {
      ctrl.init();
      scope.$on('$destroy', function() {
        ctrl.destroy();
      });
    }
    // Controller dependencies
    ngWebcamController.$inject = ['$scope', '$interval'];
    /**
     *
     * @param $scope
     * @param $interval
     */
    function ngWebcamController($scope, $interval) {
      /*jshint validthis: true */
      var vm = this;
      var sound, timer;
      var images = [];

      vm.webcamLoaded = false;
      vm.webcamLive = false;
      vm.progress = '0%';
      vm.init = init;
      vm.destroy = destroy;
      /**
       *
       */
      $scope.$on('ngWebcam_capture', onWebcamCapture);
      /**
       *
       */
      $scope.$on('ngWebcam_on', onWebcamOn);
      /**
       *
       */
      $scope.$on('ngWebcam_off', onWebcamOff);
      /**
       *
       */
      function init() {
        vm.config = vm.config || {};
        if(angular.isUndefined(vm.config.viewerWidth)) vm.config.viewerWidth = 'auto';
        if(angular.isUndefined(vm.config.viewerHeight)) vm.config.viewerHeight = 'auto';
        if(angular.isUndefined(vm.config.outputWidth)) vm.config.outputWidth = 320;
        if(angular.isUndefined(vm.config.outputHeight)) vm.config.outputHeight = 240;
        if(angular.isUndefined(vm.config.delay)) vm.config.delay = 0;
        if(angular.isUndefined(vm.config.shots)) vm.config.shots = 1;
        configure();
        configureListeners();
      }

      /**
       *
       */
      function destroy() {
        Webcam.reset();
        vm.webcamLive = false;
        vm.webcamLoaded = false;
      }
      /**
       *
       */
      function configure() {
        if(angular.isDefined(vm.config.shutterUrl)) {
          sound = new Audio();
          sound.autoplay = false;
          if(navigator.userAgent.match(/Firefox/)) {
            sound.src = vm.config.shutterUrl.split('.')[0] + '.ogg';
          } else {
            sound.src = vm.config.shutterUrl;
          }
        }
        Webcam.set({
          width: vm.config.viewerWidth,
          height: vm.config.viewerHeight,
          dest_width: vm.config.outputWidth,
          dest_height: vm.config.outputHeight
        });
        if(angular.isDefined(vm.config.flashFallbackUrl)) {
          Webcam.setSWFLocation(vm.config.flashFallbackUrl);
        }
        Webcam.attach('#ng-webcam-container');
      }
      /**
       *
       */
      function configureListeners() {
        Webcam.on('load', function() {
          $scope.$apply(function() {
            vm.webcamLoaded = true;
            if(angular.isDefined(vm.onLoad)) {
              vm.onLoad();
            }
          });
        });
        Webcam.on('live', function() {
          $scope.$apply(function() {
            vm.webcamLive = true;
          });
        });
        Webcam.on('error', function(err) {
          if(angular.isDefined(vm.onError)) {
            return vm.onError({err:err});
          }
        });
      }
      /**
       *
       * @param index
       */
      function capture(index) {
        if(sound) {
          sound.play();
        }
        if(index === (vm.config.shots-1)) {
          $interval.cancel(timer);
        }
        Webcam.snap(function(data_uri) {
          images[index] = data_uri;
          if(index < (vm.config.shots-1) && angular.isDefined(vm.onCapturing)) {
            var progress = Math.round(((index+1) * 100) / vm.config.shots);
            vm.onCapturing({
              src: data_uri,
              progress: progress
            });
          }
          if(index === (vm.config.shots-1) && angular.isDefined(vm.onComplete)) {
            return vm.onComplete({
              src: images,
              progress: 100
            });
          }
        });
      }
      /**
       *
       */
      function onWebcamCapture() {
        var count = 0;
        timer = $interval(function() {
          capture(count);
          count++;
        }, vm.config.delay, vm.config.shots);
      }
      /**
       *
       */
      function onWebcamOn() {
        Webcam.attach('#ng-webcam-container');
      }
      /**
       *
       */
      function onWebcamOff() {
        destroy();
      }
    }
    return directive;
  }
})();