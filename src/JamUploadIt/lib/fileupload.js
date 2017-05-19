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
                    if(this.validate(file)) {
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
                        this.appendInvalidFileMessage(file.name);
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

        appendInvalidFileMessage(filename) {
            this.details.append($(`
                <li class=\"list-group-item no-columns\">
                    <div class="alert alert-danger alert-dismissible" role="alert">
                        ${filename} is not a valid file to upload.
                    </div>
                </li>`));
        }

        validate(file) {
            return this.validateMaxFileSize(file) && this.validateExtension(file);
        };

        validateExtension(file) {
            if(!this.supportedExtensions instanceof  Array) {
                return true;
            }

            if(file.name.lastIndexOf('.') == -1) {
                return false;
            }

            let extension = file.name.split('.').pop();
            for(let i = 0; i < this.supportedExtensions.length; i++) {
                if(extension === this.supportedExtensions[i]) {
                    return true;
                }
            }
            return false;
        };

        validateMaxFileSize(file) {
            if(this.maxFileSize == null) {
                return true
            }
            return file.size < this.maxFileSize;
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

