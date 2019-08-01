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
        this.showLoader = settings.showLoader;
        this.guids = [];
    };

    FileUpload.prototype.setEventBinding = function setEventBinding(getGuids, additionalSuccessFunction, additionalErrorFunction) {
        let self = this;

        let successFunction = function (event, file) {
            additionalSuccessFunction(file.id);
            self.defaultSuccess(event, file);
        };
        let errorFunction = function(event, file) {
            additionalErrorFunction(file.id);
            self.defaultError(event, file);
        };
        this.inputElement.onchange = function() {
            let files = self.inputElement.files;
            getGuids( function (objects) {
                for(let i = 0 ;  i< objects.length; i++) {
                    self.guids.push(objects[i].getGuid());
                }
                self.validateAndUploadFiles(files,successFunction, errorFunction);
            });
        };
    };

    FileUpload.prototype.validateAndUploadFiles = function validateAndUploadFiles(files, successFunction, errorFunction) {
        
        this.details.empty();
        
        let i = 0;
        while(this.guids.length > 0) {
            let id = this.guids.shift();
            if(i < files.length) {
                let file  = files[i];
                let isValidFile = this.validate(file);
                if(isValidFile.isValid) {
                    file.id = id;
                    this.appendLoader(file);
                    let self = this;
                    window.mx.data.saveDocument(file.id, file.name, {}, file, function (e) {
                        successFunction(e, file);
                    }, function (e) {
                        errorFunction(e, file);
                        self.removeObject(file.id);
                    });
                } else {
                    this.appendInvalidFileMessage(isValidFile.message);
                    this.removeObject(id);
                }
            } else {
                this.removeObject(id);
            }
            i++;
        }
        this.dispatchResizeEvent();
        this.inputElement.value = '';
        this.guids.length = 0;
    };

    FileUpload.prototype.dispatchResizeEvent= function dispatchResizeEvent() {
        if(document.createEvent instanceof Function) {
            var evt = document.createEvent("CustomEvent");
            evt.initEvent('resize', true, false);
            window.dispatchEvent(evt);
        } else {
            window.dispatchEvent(new Event('resize'));
        }
    }

    FileUpload.prototype.removeObject = function removeObject(guid) {
        mx.data.remove({
            guid: guid,
            callback: function() {
                console.log("Object removed");
            },
            error: function(e) {
                console.log("Error occurred attempting to remove object " + e);
            }
        });
    };

    FileUpload.prototype.appendLoader = function appendLoader(file) {
        if (this.showLoader){

            let details = this.details;
            setTimeout(function(){ 
                if (file.isHandled != true){
                   details.append(this.jQuery("<li id=\"details-"+file.id+"\" class=\"list-group-item\"><div class=\"loader\" id=\"loader-"+file.id+"\"></div><span class=\"name\">"+file.name+"</span></li>"));
                }
            }, 200);
        }
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
        file.isHandled = true;
        let statusElement = document.getElementById("details-" + file.id);

        if (statusElement){ 
            statusElement.remove();
        }
        
    };

    FileUpload.prototype.defaultError = function defaultError(e, file) {
        file.isHandled = true;
        let statusElement = document.getElementById("loader-" + file.id);
        statusElement.classList.remove("loader");
        statusElement.classList.add("glyphicon");
        statusElement.classList.add("glyphicon-remove");
    };
    return {FileUpload: FileUpload};
});

