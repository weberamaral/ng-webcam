(function() {
  'use strict';
  angular.module('ng-webcam', []).directive('ngWebcam', ngWebcam);
  ngWebcam.$inject = ['$log'];
  /**
   *  @ngdoc Directive
   *  @name ng-webcam
   *  @description
   *
   *  Directive for capturing images from your computer's camera, and delivery then to you as data uri
   *
   *  @usage
   *  ```html
   *  <ng-webcam config="vm.config"
   *             on-error="vm.onError(err)"
   *             on-load="vm.onLoad()"
   *             on-live="vm.onLive()"
   *             on-capturing="vm.onCapturing(src, progress)"
   *             on-complete="vm.onComplete(src, progress)"></ng-webcam>
   *  ```
   */
  function ngWebcam($log) {
    var directive = {
      restrict: 'E',
      template: template,
      link: link,
      bindToController: true,
      controller: ngWebcamController,
      controllerAs: 'cam',
      scope: {
        config: '=',
        onComplete: '&',
        onError: '&',
        onLoad: '&',
        onCapturing: '&',
        onLive: '&'
      }
    };

    function template() {
      return ['<div class="ng-webcam">',
        '<div id="ng-webcam-container"></div>'].join('');
    }

    function link(scope, element, attrs, ctrl) {
      ctrl.init();
      scope.$on('$destroy', function() {
        ctrl.destroy();
      });
    }

    ngWebcamController.$inject = ['$scope', '$interval', '$log', '$window'];

    function ngWebcamController($scope, $interval, $log, $window) {
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
        if(angular.isUndefined(vm.config.viewerWidth)) vm.config.viewerWidth = 'auto';
        if(angular.isUndefined(vm.config.viewerHeight)) vm.config.viewerHeight = 'auto';
        if(angular.isUndefined(vm.config.outputWidth)) vm.config.outputWidth = 320;
        if(angular.isUndefined(vm.config.outputHeight)) vm.config.outputHeight = 240;
        if(angular.isUndefined(vm.config.delay)) vm.config.delay = 0;
        if(angular.isUndefined(vm.config.shots)) vm.config.shots = 1;
        configureListeners();
        configure();
      }

      function destroy() {
        Webcam.reset();
        vm.webcamLive = false;
        vm.webcamLoaded = false;
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
          jpeg_quality: 100
        });
        if(angular.isDefined(vm.config.flashFallbackUrl)) {
          Webcam.setSWFLocation(vm.config.flashFallbackUrl);
        }
        if(angular.isDefined(vm.config.flashNotDetectedText)) {
          Webcam.set('flashNotDetectedText', vm.config.flashNotDetectedText);
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
            return vm.onError({err:err});
          }
        });
      }

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

      function onWebcamCapture(event) {
        $log.debug('ngWebcamController.onWebcamCapture(event) : ', event);
        var count = 0;
        timer = $interval(function() {
          capture(count);
          count++;
        }, (vm.config.delay * 1000), vm.config.shots);
      }

      function onWebcamOn(event) {
        $log.debug('ngWebcamController.onWebcamOn(event) : ', event);
        Webcam.attach('#ng-webcam-container');
      }

      function onWebcamOff(event) {
        $log.debug('ngWebcamController.onWebcamOff(event) : ', event);
        destroy();
      }

      function hasUserMedia() {
        return ($window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia ||
        $window.navigator.mozGetUserMedia || $window.navigator.msGetUserMedia);
      }

      function browsers() {
        /*jshint maxcomplexity: 40 */
        var ua= $window.navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
          tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
          return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
          tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
          if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
      }
    }
    return directive;
  }
})();