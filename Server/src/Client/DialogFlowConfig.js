module.exports = class DialogFlowConfig{

    get googleAppCreds() {
        return this._googleAppCreds;
    }

    set googleAppCreds(value) {
        this._googleAppCreds = value;
    }

    get projectId() {
        return this._projectId;
    }

    set projectId(value) {
        this._projectId = value;
    }

    get languageCode() {
        return this._languageCode;
    }

    set languageCode(value) {
        this._languageCode = value;
    }

    get telegramToken() {
        return this._telegramToken;
    }

    set telegramToken(value) {
        this._telegramToken = value;
    }

    get clientWebHook() {
        return this._clientWebHook;
    }

    set clientWebHook(value) {
        this._clientWebHook = value;
    }

    get devConfig() {
        return this._devConfig;
    }

    set devConfig(value) {
        this._devConfig = value;
    }

    get tmpPath() {
        return this._tmpPath;
    }

    set tmpPath(value) {
        this._tmpPath = value;
    }

    constructor(googleAppCreds, projectId, languageCode, telegramToken, clientWebHook, devConfig, tmpPath) {
        this._googleAppCreds = googleAppCreds;
        this._projectId = projectId;
        this._languageCode = languageCode;
        this._telegramToken = telegramToken;
        this._clientWebHook = clientWebHook;
        this._devConfig = devConfig;
        this._tmpPath = tmpPath;
    }
};