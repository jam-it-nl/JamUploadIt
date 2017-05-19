// define([], function () {
define(["JamUploadIt/lib/jquery-1.11.2","JamUploadIt/lib/jquery.fileupload"], function (jquery) {
    //hack, setting $ on window so i can use it inside my class
    window.$ = window.$ || jquery.noConflict(true);

    class FileUpload {

        /**
         *
         * @param inputElement
         * @param uploadDetailsNode
         * @param settings
         */
        constructor(inputElement, uploadDetailsNode, settings) {
            this.inputElement = $(inputElement);
            this.details = $(uploadDetailsNode);
            this.maxFileSize = settings.maxFileSize;
            this.supportedExtensions = settings.supportedExtensions;
            this.urls = {};
        }

        setEventBinding(getUploadUrlFunction, successFunction = this.defaultSuccess, errorFunction = this.defaultError, completeFunction = this.defaultComplete) {
            this.inputElement.fileupload({
                url: ()=> {console.log('url');return 'changedInBeforeSend'},
                add: function(e, data) {
                    getUploadUrlFunction((guid) => {
                        data.files[0].id = guid;
                        data.submit();
                    });
                },
                beforeSend : this.beforeUpload.bind(this),
                done: successFunction,
                error: errorFunction,
                always:completeFunction
            });
        };

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

        beforeUpload(xhr, elem) {
            for(let file of elem.files) {
                if(this.validate(file)) {
                    window.mx.data.saveDocument(file.id, file.name, {}, file, function() {
                        this.details.append($(`
                        <li class=\"list-group-item\">
                            <div class=\"loader\" id=\"loader-${file.id}\"></div>
                            <span class=\"name\">${file.name}</span>
                        </li>`));
                    }, function(e) {
                        console.error(e);
                    });

                //     elem.url = `/file?guid=${file.id}&maxFileSize=20&csrfToken=${window.mx.session.getCSRFToken()}`;
                //     // elem.url = `/file?guid=${file.id}&maxFileSize=20`;
                //     this.details.append($(`
                //         <li class=\"list-group-item\">
                //             <div class=\"loader\" id=\"loader-${file.id}\"></div>
                //             <span class=\"name\">${file.name}</span>
                //         </li>`));
                // } else {
                //     this.details.append($(`
                //         <li class=\"list-group-item no-columns\">
                //             <div class="alert alert-danger alert-dismissible" role="alert">
                //                 ${file.name} is not a valid file to upload.
                //             </div>
                //         </li>`));
                    xhr.abort();
                }
            }
        }

        defaultSuccess(e, elem) {
            for (let file of elem.files) {
                let statusElement = document.getElementById("loader-" + file.id);
                statusElement.classList = ["glyphicon glyphicon-ok"];
            }
        };

        defaultError(e, elem) {
            console.log('error');
            // for (let file of elem.files) {
            //     let statusElement = document.getElementById("loader-" + file.id);
            //     statusElement.classList = ["glyphicon glyphicon glyphicon-remove"];
            // }
        };

        defaultComplete() {

        };
    }
    return {FileUpload};
});

