// define([], function () {
define(["JamUploadIt/lib/jquery-1.11.2","JamUploadIt/lib/jquery.fileupload"], function (jquery) {
    //hack, setting $ on window so i can use it inside my class
    window.$ = window.$ || jquery.noConflict(true);

    class FileUpload {
        constructor(inputElement, uploadDetailsNode) {
            this.setEventBinding($(inputElement));
            this.details = $(uploadDetailsNode);
        }

        setEventBinding(inputElement, beforeUploadFunction = this.beforeUpload.bind(this), successFunction = this.defaultSuccess, errorFunction = this.defaultError, completeFunction = this.defaultComplete) {
            let JamUploadItComponent = inputElement;
            let url = this.getMendixUrl();

            JamUploadItComponent.fileupload({
                url: url,
                beforeSend : beforeUploadFunction,
                done: successFunction,
                error: errorFunction,
                always:completeFunction
            });
        };

        validate(file) {
            return true;
        };

        validateExtension(file) {
            return false;
        };

        validateMaxFileSize(file) {

        };

        uploadFile(file, beforeUploadFunction, successFunction, errorFunction, completeFunction, headers) {

        };

        getMendixUrl() {
            return "http://jquery-file-upload.appspot.com/";
        };

        beforeUpload(xhr, elem) {
            for(let file of elem.files) {
                if(this.validate(file)) {
                    this.details.append($("<li class=\"list-group-item\"><div class=\"loader\" id=\"loader-"+file.name+"\"></div><span class=\"name\">"+file.name+"</span></li>"));
                } else {
                    console.log(`validation failed`);
                    xhr.abort();
                }
            }
        }

        defaultSuccess(e, elem) {
            for (let file of elem.files) {
                let statusElement = document.getElementById("loader-" + file.name);
                statusElement.classList = ["glyphicon glyphicon-ok"];
            }
        };

        defaultError(e, elem) {
            for (let file of elem.files) {
                let statusElement = document.getElementById("loader-" + file.name);
                statusElement.classList = ["glyphicon glyphicon glyphicon-remove"];
            }
        };

        defaultComplete() {

        };
    }
    return {FileUpload};
});

