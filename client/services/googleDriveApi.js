var app = angular.module("uploadFile");
app.service('googleDriveApi', function () {

    var self = this;
    /**
     * Initialise a Google Driver file picker
     */
    self.FilePicker = window.FilePicker = function (options) {
        // Config
        this.developerKey = 'AIzaSyB3-PCiPKs-npkiu8rxYJZ4lQbZzHIU30A';
        this.clientId = '55792711836-i1svb4eki35tnh67bkasaomi5unp3u5q.apps.googleusercontent.com';
        this.scope = 'https://www.googleapis.com/auth/drive.readonly';

        // Events
        this.onSelect = options.onSelect;
        this.onCancel = options.onCancel;

        this.pickerApiLoaded = false;
        this.oauthToken;

        // Load the drive API
        gapi.load('auth', {
            'callback': this._authApiLoad.bind(this)
        });
        gapi.load('picker', {
            'callback': this._pickerApiLoad.bind(this)
        });
    }

    self.FilePicker.prototype = {

        _authApiLoad: function () {
            gapi.auth.authorize({
                client_id: this.clientId,
                scope: this.scope,
                immediate: false
            }, function (authResult) {
                if (authResult && !authResult.error) {
                    this.oauthToken = authResult.access_token;
                    this._showPicker();
                }
            }.bind(this));
        },

        _showPicker: function () {
            this._authApiLoad;
            if (this.pickerApiLoaded && this.oauthToken) {
                this.picker = new google.picker.PickerBuilder()
                    .addViewGroup(new google.picker.ViewGroup(google.picker.ViewId.DOCUMENTS)
                        .addView(google.picker.ViewId.DOCUMENTS)
                        .addView(google.picker.ViewId.PRESENTATIONS)
                        .addView(google.picker.ViewId.PDFS)
                        .addView(google.picker.ViewId.SPREADSHEETS))
                    // .setDeveloperKey(this.developerKey)
                    .setOAuthToken(this.oauthToken)
                    .setCallback(this._pickerCallback.bind(this))
                    .build()
                    .setVisible(true);
            }
        },

        _pickerApiLoad: function () {
            this.pickerApiLoaded = true;
            this._showPicker;
        },

        _pickerCallback: function (data) {
            if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                var file = data[google.picker.Response.DOCUMENTS][0];
                var select = this.onSelect;
                var accessToken = this.oauthToken;
                if (select) {
                    gapi.client.request({
                        path: '/drive/v2/files/' + file.id,
                        callback: function (responsejs, responsetxt) {
                            var downloadUrl;
                            var name;
                            switch (file.serviceId) {
                                case 'doc': {
                                    downloadUrl = 'https://docs.google.com/document/d/' + file.id + '/export?format=doc';
                                    name = file.name + '.doc'
                                    break;
                                }
                                case 'pres': {
                                    downloadUrl = downloadUrl = 'https://docs.google.com/presentation/d/' + file.id + '/export/pptx';
                                    name = file.name + '.pptx'
                                    break;
                                }
                                case 'spread': {
                                    downloadUrl = downloadUrl = 'https://docs.google.com/spreadsheets/d/' + file.id + '/export?format=xlsx';
                                    name = file.name + '.xlsx'
                                    break;
                                }
                                default: {
                                    downloadUrl = responsejs.downloadUrl;
                                    name = file.name;
                                }
                            }
                            select({
                                name: name,
                                size: file.sizeBytes,
                                viewUrl: file.url,
                                downloadUrl: downloadUrl,
                                userAccessToken: accessToken
                            });
                        }
                    });
                }
            } else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
                this.onCancel();
            }
        },
    };
});