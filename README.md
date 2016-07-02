# ng-webcam

ngWebcam is an AngularJS directive for capturing images from your computer's camera, and delivering then to you as data uri.

## Live exemple

To see live exemple, go to the [sample page](http://www.google.com)

## Instalation

#### Using [Bower](http://bower.io)

```bash
bower install ng-webcam
```

## Usage

### Import files scripts

ngWebcam uses WebcamJS to work properly so you need to add the script in your main file, don't forget to load the directive file:

```html
<script src"/path/to/webcam.js"></script>
<script src"/path/to/ng-webcam.js"></script>
```

### Add the module as dependency

Simply add the module as dependency to your main application module likes this:
```javascript
angular.module("app", ["ngWebcam]);
```

### The directive

```html
<ng-webcam
    on-error="callbackError(err)"
    on-complete="callbackComplete(src)"
    on-load="callbackLoad()"
    config="config">
</ng-webcam>
```

### Options

ng-webcam comes with lots of options to simplify tour development:

* `on-error` _function_ Callback function for error
* `on-complete` _function_ Callback function for complete action
* `on-load` _function_ Callback function for load action
* `config` _object_ Config options for init params in WebcamJS e directive

### Working example

A working example is available in the `test` folder. Make sure to install bower and node dependencies:

```bash
npm install && bower install
```

Then start the node server, it will ne accessible on `http://0.0.0.0:3000`

```bash
node server.js
```

## License

[LICENSE](LICENSE)