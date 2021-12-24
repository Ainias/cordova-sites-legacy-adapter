var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* eslint-disable */
import { NotOnlineError } from './DataManager/NotOnlineError';
import { Helper } from 'js-helper/dist/shared';
/**
 * Ein Manager, welches das Laden von Resourcen übernimmt.
 */
var DataManager = /** @class */ (function () {
    function DataManager() {
    }
    /**
     * Diese Funktion sollte anstelle von dem nativen "fetch" verwendet werden!
     * Das native Fetch kann keine file://, welches von Cordova unter Android (und whs iOS) verwendet wird
     * Daher wird heir auf XMLHttpRequest zurückgegriffen
     *
     * @param url
     * @param useArrayBuffer
     * @returns {Promise<*>}
     */
    DataManager.fetch = function (url, useArrayBuffer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        useArrayBuffer = Helper.nonNull(useArrayBuffer, false);
                        if (useArrayBuffer) {
                            xhr.responseType = 'arraybuffer';
                        }
                        xhr.onload = function () {
                            resolve(new Response(useArrayBuffer ? xhr.response : xhr.responseText, {
                                status: xhr.status === 0 ? 200 : xhr.status,
                            }));
                        };
                        xhr.onerror = function (e) {
                            console.error(e);
                            reject(new NotOnlineError('not-online', url));
                        };
                        xhr.open('GET', url);
                        // set headers
                        Object.keys(DataManager._additionalHeaders).forEach(function (header) {
                            xhr.setRequestHeader(header, DataManager._additionalHeaders[header]);
                        });
                        xhr.send(null);
                    })
                        .then(function (res) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(true);
                        }
                        return res;
                    })
                        .catch(function (e) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(false);
                        }
                        throw e;
                    })];
            });
        });
    };
    DataManager.fetchBlob = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            resolve(xhr.response);
                        };
                        xhr.onerror = function (e) {
                            console.error(e);
                            reject(new NotOnlineError('not-online', url));
                        };
                        xhr.open('GET', url);
                        xhr.responseType = 'blob';
                        // set headers
                        Object.keys(DataManager._additionalHeaders).forEach(function (header) {
                            xhr.setRequestHeader(header, DataManager._additionalHeaders[header]);
                        });
                        xhr.send(null);
                    })
                        .then(function (res) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(true);
                        }
                        return res;
                    })
                        .catch(function (e) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(false);
                        }
                        throw e;
                    })];
            });
        });
    };
    /**
     * Vereinfachung von Laden von Resourcen.
     * Lädt per GET die angegebene URL und gibt diese als JSON oder Text zurück
     *
     * @param url
     * @param format
     * @param useBasePath
     * @returns {Promise<*  | void>}
     */
    DataManager.load = function (url, format, useBasePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                format = Helper.nonNull(format, true);
                if (format === true) {
                    format = 'json';
                }
                else if (format === false) {
                    format = 'text';
                }
                else if (format !== 'json' && format !== 'text') {
                    format = 'raw';
                }
                useBasePath = Helper.nonNull(useBasePath, true);
                if (useBasePath === true) {
                    useBasePath = DataManager._basePath;
                }
                else if (typeof useBasePath !== 'string') {
                    useBasePath = '';
                }
                url = DataManager.basePath(url, useBasePath);
                return [2 /*return*/, (DataManager.fetch(url, format === 'raw')
                        .catch(function (e) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(false);
                        }
                        throw new NotOnlineError(e, url);
                    })
                        // @ts-ignore
                        .then(function (res) {
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(true);
                        }
                        if (format === 'json') {
                            return res.json();
                        }
                        if (format === 'text') {
                            return res.text();
                        }
                        return res;
                    }))];
            });
        });
    };
    /**
     * Vereinfachung von Laden von Resourcen.
     * Lädt per GET das angegebene Asset und gibt diese als JSON oder Text zurück
     *
     * @param url
     * @param format
     * @returns {Promise<*  | void>}
     */
    DataManager.loadAsset = function (url, format) {
        return __awaiter(this, void 0, void 0, function () {
            var assetPath;
            return __generator(this, function (_a) {
                assetPath = DataManager._assetBasePath;
                if (!url.startsWith('/') && assetPath.length > 0 && !assetPath.endsWith('/')) {
                    assetPath += '/';
                }
                return [2 /*return*/, this.load(url, Helper.nonNull(format, 'text'), assetPath)];
            });
        });
    };
    /**
     * Wandelt ein Key-Value-Objekt in einen QueryString um
     *
     * @param values
     * @return {string}
     */
    DataManager.buildQuery = function (values) {
        var queryStrings = [];
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (var k in values) {
            queryStrings.push("".concat(encodeURIComponent(k), "=").concat(encodeURIComponent(values[k])));
        }
        return "?".concat(queryStrings.join('&'));
    };
    /**
     * Wandelt ein Key-Value-Objekt in einen QueryString um
     *
     * @param values
     * @return {string}
     */
    DataManager.buildQueryWithoutNullValues = function (values) {
        var queryValues = {};
        // eslint-disable-next-line no-restricted-syntax
        for (var k in values) {
            if (Helper.isNotNull(values[k])) {
                queryValues[k] = values[k];
            }
        }
        return this.buildQuery(queryValues);
    };
    DataManager.send = function (url, params) {
        return __awaiter(this, void 0, void 0, function () {
            var headers;
            return __generator(this, function (_a) {
                url = DataManager.basePath(url);
                headers = {};
                if (!(params instanceof FormData) && typeof params === 'object') {
                    params = JSON.stringify(params);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
                Object.keys(DataManager._additionalHeaders).forEach(function (header) {
                    headers[header] = DataManager._additionalHeaders[header];
                });
                return [2 /*return*/, fetch(url, {
                        credentials: 'same-origin',
                        method: 'POST',
                        headers: headers,
                        body: params,
                    })
                        .then(function (res) {
                        return res.json();
                    })
                        .catch(function (e) {
                        console.error('error', e);
                        if (DataManager.onlineCallback) {
                            DataManager.onlineCallback(false);
                        }
                        return {
                            success: false,
                            errors: ['not-online'],
                        };
                    })];
            });
        });
    };
    DataManager.basePath = function (url, basePath) {
        basePath = Helper.nonNull(basePath, DataManager._basePath);
        return basePath + (url || '');
    };
    DataManager.setHeader = function (header, value) {
        DataManager._additionalHeaders[header] = value;
    };
    DataManager.onlineCallback = null;
    return DataManager;
}());
export { DataManager };
DataManager._additionalHeaders = {};
DataManager._basePath = '';
DataManager._assetBasePath = '';
//# sourceMappingURL=DataManager.js.map