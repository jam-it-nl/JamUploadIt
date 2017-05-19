// define([], function () {
define(["JamUploadIt/lib/jquery-1.11.2"], function (jquery) {
    //hack, setting $ on window so i can use it inside my class
    window.$ = window.$ || jquery.noConflict(true);

    class FileUpload {
        constructor(inputElement, uploadDetailsNode, settings) {
            this.inputElement = inputElement;
            this.details = $(uploadDetailsNode);
            this.maxFileSize = settings.maxFileSize;
            this.supportedExtensions = settings.supportedExtensions;
        }

        setEventBinding(getUploadIdFunction, successFunction = this.defaultSuccess, errorFunction = this.defaultError, completeFunction = this.defaultComplete) {
            this.inputElement.onchange = () => {
                for(let i = 0 ; i < this.inputElement.files.length; i++) {
                    let file  = this.inputElement.files[i];

                    let isValidFile = this.validate(file);

                    if(isValidFile.isValid) {
                        getUploadIdFunction(file, (uploadId) => {
                            file.id = uploadId;
                            this.appendLoader(file);
                            window.mx.data.saveDocument(file.id, file.name, {}, file, (e) => {
                                this.defaultSuccess(e, file);
                            }, (e) => {
                                this.defaultError(e, file);
                            });
                        });
                    } else {
                        this.appendInvalidFileMessage(isValidFile.message);
                    }
                }
                this.inputElement.value = '';
            }
        };

        appendLoader(file) {
            this.details.append($(`
                <li class=\"list-group-item\">
                    <div class=\"loader\" id=\"loader-${file.id}\"></div>
                    <span class=\"name\">${file.name}</span>
                </li>`));
        };

        appendInvalidFileMessage(message) {
            this.details.append($(`
                <li class=\"list-group-item no-columns\">
                    <div class="alert alert-danger alert-dismissible" role="alert">
                        ${message}
                    </div>
                </li>`));
        }

        validate(file) {
            let validSizeMessage = this.validateMaxFileSize(file);
            if(validSizeMessage.isValid) {
                return this.validateExtension(file);
            }
            return validSizeMessage;
        };

        validateExtension(file) {
            let validMessage = {isValid : true};
            let inValidMessage = { isValid : false, message: `U kunt hier alleen bestanden van de volgende types uploaden:${this.supportedExtensions.join(', ')}`};

            if(!this.supportedExtensions instanceof  Array) {
                return validMessage;
            }

            if(file.name.lastIndexOf('.') == -1) {
                return inValidMessage;
            }

            let extension = file.name.split('.').pop();
            for(let i = 0; i < this.supportedExtensions.length; i++) {
                if(extension === this.supportedExtensions[i]) {
                    return validMessage;
                }
            }
            return inValidMessage;
        };

        validateMaxFileSize(file) {
            if(this.maxFileSize == null) {
                return {isValid : true}
            }
            return { isValid : file.size < this.maxFileSize, message: `De grootte van het geselecteerde bestand ${file.name} (${this.bytesToSize(file.size)}) is groter dan de maximum grootte (${this.bytesToSize((this.maxFileSize*1024))})`};
        };

        bytesToSize(bytes) {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
            if (bytes === 0) return 'n/a'
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
            if (i === 0) return `${bytes} ${sizes[i]}`
            return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
        };

        defaultSuccess(e, file) {
            let statusElement = document.getElementById("loader-" + file.id);
            statusElement.classList = ["glyphicon glyphicon-ok"];
        };

        defaultError(e, file) {
            let statusElement = document.getElementById("loader-" + file.id);
            statusElement.classList = ["glyphicon glyphicon glyphicon-remove"];
        };

        defaultComplete() {

        };
    }
    return {FileUpload};
});

