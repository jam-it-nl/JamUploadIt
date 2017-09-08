// define([], function () {
define(["./jquery-1.11.2"], function (jquery) {
    //hack, setting $ on window so i can use it inside my class
    window.$ = window.$ || jquery.noConflict(true);

    function FileUpload(contextObject, inputElement, uploadDetailsNode, settings) {
        this.jQuery = window.$;
        this.contextObject = contextObject;
        this.inputElement = inputElement;
        this.details = window.$(uploadDetailsNode);
        this.maxFileSize = settings.maxFileSize;
        this.supportedExtensions = settings.supportedExtensions;
        this.completedGuidRequests = 0;
    };

    FileUpload.prototype.setEventBinding = function setEventBinding(getGuid, successFunction, errorFunction) {
        successFunction = successFunction || this.defaultSuccess;
        errorFunction = errorFunction || this.defaultError;

        let self = this;
        this.inputElement.onchange = function() {
            let files = self.inputElement.files;
            for(let i = 0 ; i < files.length; i++) {
                getGuid(()=> {}, ()=> {});

                // let file = files[i];
                // file.id = self.guid();
                // self.appendLoader(file);
                // getGuid((guid) => {
                //     let last = false;
                //     if(i == files.length -1) {
                //         last = true
                //     }
                //     self.validateAndUploadFiles(guid, files[i], last, successFunction, errorFunction);
                //     self.completedGuidRequest();
                // }, () => {self.completedGuidRequest(); errorFunction(undefined, file)});
            }

        }
    };

    FileUpload.prototype.validateAndUploadFiles = function validateAndUploadFiles(fileDocumentGuid, file, lastFile, successFunction, errorFunction) {
        let isValidFile = this.validate(file, lastFile);
        if(isValidFile.isValid) {
            file.guid = fileDocumentGuid;
            window.mx.data.saveDocument(file.guid, file.name, {}, file, function (e) {
                successFunction(e, file);
            }, function (e) {
                errorFunction(e, file);
            });
        } else {
            this.appendInvalidFileMessage(isValidFile.message);
            errorFunction(undefined, file);
        }
    };

    FileUpload.prototype.appendLoader = function appendLoader(file) {
        this.details.append(this.jQuery("<li class=\"list-group-item\"><div class=\"loader\" id=\"loader-"+file.id+"\"></div><span class=\"name\">"+file.name+"</span></li>"));
    };

    FileUpload.prototype.appendInvalidFileMessage = function appendInvalidFileMessage(message) {
        this.details.append(this.jQuery("<li class=\"list-group-item no-columns\"><div class=\"alert alert-danger alert-dismissible\" role=\"alert\">"+message+"</div></li>"));
    };

    FileUpload.prototype.validate = function validate(file, clearInput) {
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

    FileUpload.prototype.clearInput = function clearInput() {
        this.inputElement.value = '';
    }

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

    FileUpload.prototype.guid = function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    FileUpload.prototype.completedGuidRequest = function completedGuidRequest() {
        this.completedGuidRequests++;
        if(this.completedGuidRequests == this.inputElement.files.length) {
            this.completedGuidRequests = 0;
            this.inputElement.value = '';
        }
    }

    return {FileUpload: FileUpload};
});

