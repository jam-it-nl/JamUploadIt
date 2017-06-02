// define([], function () {
define(["./jquery-1.11.2"], function (jquery) {
    //hack, setting $ on window so i can use it inside my class
    window.$ = window.$ || jquery.noConflict(true);

    function FileUpload(inputElement, uploadDetailsNode, settings) {
        this.jQuery = window.$;
        this.inputElement = inputElement;
        this.details = window.$(uploadDetailsNode);
        this.maxFileSize = settings.maxFileSize;
        this.supportedExtensions = settings.supportedExtensions;
        this.guids = [];
    };

    FileUpload.prototype.setEventBinding = function setEventBinding(getGuids, successFunction, errorFunction) {
        successFunction = successFunction || this.defaultSuccess;
        errorFunction = errorFunction || this.defaultError;

        let self = this;
        this.inputElement.onchange = function() {
            let files = self.inputElement.files;
            getGuids( function (objects) {
                for(let i = 0 ;  i< objects.length; i++) {
                    self.guids.push(objects[i].getGuid());
                }
                self.validateAndUploadFiles(files,successFunction, errorFunction);
            });
        }
    };

    FileUpload.prototype.validateAndUploadFiles = function validateAndUploadFiles(files, successFunction, errorFunction) {
        for(let i = 0 ; i < files.length; i++) {
            let file  = files[i];
            let isValidFile = this.validate(file);
            if(isValidFile.isValid) {

                file.id = this.guids.shift();
                if(file.id == undefined) {
                    break;
                }
                this.appendLoader(file);
                window.mx.data.saveDocument(file.id, file.name, {}, file, function (e) {
                    successFunction(e, file);
                }, function (e) {
                    errorFunction(e, file);
                });

            } else {
                this.appendInvalidFileMessage(isValidFile.message);
            }
        }
        this.inputElement.value = '';
        this.guids.length = 0;
    };

    FileUpload.prototype.appendLoader = function appendLoader(file) {
        this.details.append(this.jQuery("<li class=\"list-group-item\"><div class=\"loader\" id=\"loader-"+file.id+"\"></div><span class=\"name\">"+file.name+"</span></li>"));
    };

    FileUpload.prototype.appendInvalidFileMessage = function appendInvalidFileMessage(message) {
        this.details.append(this.jQuery("<li class=\"list-group-item no-columns\"><div class=\"alert alert-danger alert-dismissible\" role=\"alert\">"+message+"</div></li>"));
    };

    FileUpload.prototype.validate = function validate(file) {
        let validSizeMessage = this.validateMaxFileSize(file);
        if(validSizeMessage.isValid) {
            return this.validateExtension(file);
        }
        return validSizeMessage;
    };

    FileUpload.prototype.validateExtension = function validateExtension(file) {
        let validMessage = {isValid : true};
        let inValidMessage = { isValid : false, message: "U kunt hier alleen bestanden van de volgende types uploaden:"+this.supportedExtensions.join(', ')};

        if(!this.supportedExtensions instanceof  Array) {
            return validMessage;
        }

        if(file.name.lastIndexOf('.') == -1) {
            return inValidMessage;
        }

        let extension = file.name.split('.').pop();
        for(let i = 0; i < this.supportedExtensions.length; i++) {
            if(extension.toUpperCase() === this.supportedExtensions[i].toUpperCase()) {
                return validMessage;
            }
        }
        return inValidMessage;
    };

    FileUpload.prototype.validateMaxFileSize = function validateMaxFileSize(file) {
        if(this.maxFileSize == null) {
            return {isValid : true}
        }

        let fileIsValid = file.size <= (this.maxFileSize*1024);
        let validationMessage = !fileIsValid ? "De grootte van het geselecteerde bestand "+file.name+" "+ (this.formatSize(file.size))+" is groter dan de maximum grootte "+(this.formatSize((this.maxFileSize*1024))): null;

        return {
            isValid: fileIsValid,
            message: validationMessage
        };
    };

    FileUpload.prototype.formatSize = function formatSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        if (bytes === 0) return 'n/a'
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
        if (i === 0) {
            return bytes+" "+ sizes[i];
        }
        return (bytes / (1024 * Math.pow(1000, (i-1)))).toFixed(1)+" "+ sizes[i];
    };

    FileUpload.prototype.defaultSuccess = function defaultSuccess(e, file) {
        let statusElement = document.getElementById("loader-" + file.id);
        statusElement.classList.remove("loader");
        statusElement.classList.add("glyphicon");
        statusElement.classList.add("glyphicon-ok");
    };

    FileUpload.prototype.defaultError = function defaultError(e, file) {
        let statusElement = document.getElementById("loader-" + file.id);
        statusElement.classList.remove("loader");
        statusElement.classList.add("glyphicon");
        statusElement.classList.add("glyphicon-remove");
    };
    return {FileUpload: FileUpload};
});

