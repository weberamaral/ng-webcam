'use strict';

var CameraConfig = function(config) {
  config = config || {};
  var self = this;
  self.viewerWidth = config.viewerWidth || 'auto';
  self.viewerHeight = config.viewerHeight || 'auto';
  self.outputWidth = config.outputWidth || 320;
  self.outputHeight = config.outputHeight || 240;
  self.flashFallbackUrl = config.flashFallbackUrl;
  self.delay = config.delay || 0;
  self.shots = config.shots || 1;
  self.shutterUrl = config.shutterUrl;
};

angular.module('webcam-models', []).value('CameraConfig', CameraConfig);