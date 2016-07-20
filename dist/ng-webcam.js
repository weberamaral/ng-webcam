(function() {
  'use strict';
  angular.module('ng-webcam', []).directive('ngWebcam', ngWebcam);
  ngWebcam.$inject = [];
  /**
   *  @ngdoc Directive
   *  @name ng-webcam
   *  @description
   *
   *  Directive for capturing images from your computer's camera, and delivery then to you as data uri
   *
   *  @usage
   *  ```html
   *  <ng-webcam
   *    config="vm.config"
   *    on-error="vm.onError(err)"
   *    on-load="vm.onLoad()"
   *    on-live="vm.onLive()"
   *    on-capture-progress="vm.onCaptureProgress(src, progress)"
   *    on-capture-complete="vm.onCaptureComplete(src)">
   *  </ng-webcam>
   *  ```
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
        onCaptureComplete: '&',
        onError: '&',
        onLoad: '&',
        onCaptureProgress: '&',
        onLive: '&'
      }
    };

    function template(element, attrs) {
      return ['<div class="ng-webcam no-overlay" ng-class="{\'no-overlay\' : vm.counter === 0 || vm.config.countdown === 0}">',
        '<span ng-show="vm.webcamLive === true && vm.config.countdown > 0 && vm.counter > 0" id="ng-webcam-counter">{{vm.counter}}</span>',
        '<img ng-show="vm.webcamLive === true" id="ng-webcam-overlay" src="{{vm.config.overlay}}" />',
        '<div id="ng-webcam-container"></div>',
        '</div>'].join('');
    }

    function link(scope, element, attrs, ctrl) {
      ctrl.init();
      scope.$on('$destroy', function() {
        ctrl.destroy();
      });
    }

    ngWebcamController.$inject = ['$scope', '$interval'];

    function ngWebcamController($scope, $interval) {
      /*jshint validthis: true */
      var vm = this;
      var sound, snapshotTimer, countdownTimer;
      var images = [];
      vm.webcamLoaded = false;
      vm.webcamLive = false;
      vm.counter = 3;
      vm.init = init;
      vm.destroy = destroy;
      /**
       *  @ngdoc listener
       *  @name ngWebcam_capture
       *  @description
       *
       *  Listener for capture user action
       *
       *  @usage
       *  `$scope.$broadcast('ngWebcam_capture');`
       */
      $scope.$on('ngWebcam_capture', onWebcamCapture);
      /**
       *  @ngdoc listener
       *  @name ngWebcam_on
       *  @description
       *
       *  Listener for camera on user action
       *
       *  @usage
       *  `$scope.$broadcast('ngWebcam_on');`
       */
      $scope.$on('ngWebcam_on', onWebcamOn);
      /**
       *  @ngdoc listener
       *  @name ngWebcam_off
       *  @description
       *
       *  Listener for camera off user action
       *
       *  @usage
       *  `$scope.$broadcast('ngWebcam_off');`
       */
      $scope.$on('ngWebcam_off', onWebcamOff);

      function init() {
        vm.config = vm.config || {};
        if(window.localStorage) window.localStorage.setItem('visited', '1');
        if(angular.isUndefined(vm.config.viewerWidth)) vm.config.viewerWidth = 'auto';
        if(angular.isUndefined(vm.config.viewerHeight)) vm.config.viewerHeight = 'auto';
        if(angular.isUndefined(vm.config.outputWidth)) vm.config.outputWidth = 320;
        if(angular.isUndefined(vm.config.outputHeight)) vm.config.outputHeight = 240;
        if(angular.isUndefined(vm.config.delay)) vm.config.delay = 0;
        if(angular.isUndefined(vm.config.shots)) vm.config.shots = 1;
        if(angular.isUndefined(vm.config.countdown)) vm.config.countdown = 0;
        configureListeners();
        configure();
      }

      function destroy() {
        if(vm.webcamLive) Webcam.reset();
        vm.webcamLive = false;
        vm.webcamLoaded = false;
        if(angular.isDefined(snapshotTimer)) {
          $interval.cancel(snapshotTimer);
          snapshotTimer = undefined;
        }
        if(angular.isDefined(countdownTimer)) {
          $interval.cancel(countdownTimer);
          countdownTimer = undefined;
        }
        vm.counter = 3;

      }

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
          dest_height: vm.config.outputHeight,
          force_flash: false,
          image_format: 'jpeg',
          jpeg_quality: 100,
          flip_horiz: true
        });
        if(angular.isDefined(vm.config.flashNotDetectedText)) {
          Webcam.set('flashNotDetectedText', vm.config.flashNotDetectedText);
        }
        if(angular.isDefined(vm.config.flashFallbackUrl)) {
          Webcam.setSWFLocation(vm.config.flashFallbackUrl);
        }
        Webcam.attach('#ng-webcam-container');
      }

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
            if(angular.isDefined(vm.onLive)) {
              vm.onLive();
            }
          });
        });
        Webcam.on('error', function(err) {
          if(angular.isDefined(vm.onError)) {
            vm.onError({err:err});
          }
        });
      }

      function capture(index) {
        if(sound) {
          sound.play();
        }
        if(index === (vm.config.shots-1)) {
          $interval.cancel(snapshotTimer);
        }
        Webcam.snap(function(data_uri) {
          images[index] = data_uri;
          if(index < (vm.config.shots-1) && angular.isDefined(vm.onCaptureProgress)) {
            var progress = Math.round(((index+1) * 100) / vm.config.shots);
            vm.onCaptureProgress({src: data_uri,progress: progress});
          }
          if(index === (vm.config.shots-1) && angular.isDefined(vm.onCaptureComplete)) {
            return vm.onCaptureComplete({src: images});
          }
        });
      }

      function onWebcamCapture() {
        if(angular.isUndefined(vm.config.countdown)) {
          var count = 0;
          snapshotTimer = $interval(function() {
            capture(count);
            count++;
          }, (vm.config.delay * 1000), vm.config.shots);
        } else {
          if(countdownTimer !== undefined) return;
          vm.counter = 3;
          countdownTimer = $interval(function() {
            vm.counter = vm.counter - 1;
            if(vm.counter === 0) {
              if(countdownTimer) {
                $interval.cancel(countdownTimer);
              }
              var count = 0;
              snapshotTimer = $interval(function() {
                capture(count);
                count++;
              }, (vm.config.delay * 1000), vm.config.shots);
            }
          }, 1000, 3);
        }
      }

      function onWebcamOn() {
        Webcam.attach('#ng-webcam-container');
      }

      function onWebcamOff() {
        destroy();
      }
    }
    return directive;
  }
})();