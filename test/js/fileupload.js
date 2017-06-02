require("amd-loader");
require("jsdom");
const expect = require('chai').expect;
const fileupload = require('../../src/JamUploadIt/lib/fileupload');

describe('FileUpload', function () {
    it('formatSize 2KB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 1});
        expect("1.0 KB").to.be.equal(fileUpload.formatSize(1024));
    });

    it('formatSize 1MB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 1000});
        let actual = fileUpload.formatSize(1080000);
        expect("1.0 MB").to.be.equal(actual);
    });

    it('formatSize 2MB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2000});
        let actual = fileUpload.formatSize(2048000);
        expect("2.0 MB").to.be.equal(actual);
    });

    it('formatSize 2GB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2000000});
        let actual = fileUpload.formatSize(2048000000);
        expect("2.0 GB").to.be.equal(actual);
    });

    it('formatSize 2TB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2000000000});
        let actual = fileUpload.formatSize(2048000000000);
        expect("2.0 TB").to.be.equal(actual);
    });

    it('validate filsize KB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2});
        let file = {
            name : "",
            size : 2048
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(true).to.be.equal(result.isValid);
        expect(null).to.be.equal(result.message);
    });

    it('validate filsize to big KB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2});
        let file = {
            name : "",
            size : 2049
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(false).to.be.equal(result.isValid);
        expect("De grootte van het geselecteerde bestand  2.0 KB is groter dan de maximum grootte 2.0 KB").to.be.equal(result.message);
    });

    it('validate filsize MB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2000});
        let file = {
            name : "",
            size : 2048000
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(true).to.be.equal(result.isValid);
        expect(null).to.be.equal(result.message);
    });

    it('validate filsize to big MB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 2000});
        let file = {
            name : "",
            size : 2048001
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(false).to.be.equal(result.isValid);
        expect("De grootte van het geselecteerde bestand  2.0 MB is groter dan de maximum grootte 2.0 MB").to.be.equal(result.message);
    });

    it('validate filsize GB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 5000000});
        let file = {
            name : "",
            size : 5120000000
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(true).to.be.equal(result.isValid);
        expect(null).to.be.equal(result.message);
    });

    it('validate filsize to big GB', function () {
        let fileUpload = new fileupload.FileUpload(null, null, {maxFileSize: 5000000});
        let file = {
            name : "",
            size : 5120000001
        };
        let result = fileUpload.validateMaxFileSize(file);
        expect(false).to.be.equal(result.isValid);
        expect("De grootte van het geselecteerde bestand  5.0 GB is groter dan de maximum grootte 5.0 GB").to.be.equal(result.message);
    });
});
