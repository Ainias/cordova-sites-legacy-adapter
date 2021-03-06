/* eslint-disable */
import { NotOnlineError } from './DataManager/NotOnlineError';
import { Helper } from 'js-helper/dist/shared';

/**
 * Ein Manager, welches das Laden von Resourcen übernimmt.
 */
export class DataManager {
    static _additionalHeaders: any;
    static _basePath: string;
    static _assetBasePath: string;

    static onlineCallback: any = null;

    /**
     * Diese Funktion sollte anstelle von dem nativen "fetch" verwendet werden!
     * Das native Fetch kann keine file://, welches von Cordova unter Android (und whs iOS) verwendet wird
     * Daher wird heir auf XMLHttpRequest zurückgegriffen
     *
     * @param url
     * @param useArrayBuffer
     * @returns {Promise<*>}
     */
    static async fetch(url: any, useArrayBuffer?: any) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();

            useArrayBuffer = Helper.nonNull(useArrayBuffer, false);

            if (useArrayBuffer) {
                xhr.responseType = 'arraybuffer';
            }

            xhr.onload = () => {
                resolve(
                    new Response(useArrayBuffer ? xhr.response : xhr.responseText, {
                        status: xhr.status === 0 ? 200 : xhr.status,
                    })
                );
            };
            xhr.onerror = (e) => {
                console.error(e);
                reject(new NotOnlineError('not-online', url));
            };

            xhr.open('GET', url);

            // set headers
            Object.keys(DataManager._additionalHeaders).forEach((header) => {
                xhr.setRequestHeader(header, DataManager._additionalHeaders[header]);
            });

            xhr.send(null);
        })
            .then((res) => {
                if (DataManager.onlineCallback) {
                    DataManager.onlineCallback(true);
                }
                return res;
            })
            .catch((e) => {
                if (DataManager.onlineCallback) {
                    DataManager.onlineCallback(false);
                }
                throw e;
            });
    }

    static async fetchBlob(url: any) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
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
            Object.keys(DataManager._additionalHeaders).forEach((header) => {
                xhr.setRequestHeader(header, DataManager._additionalHeaders[header]);
            });

            xhr.send(null);
        })
            .then((res) => {
                if (DataManager.onlineCallback) {
                    DataManager.onlineCallback(true);
                }
                return res;
            })
            .catch((e) => {
                if (DataManager.onlineCallback) {
                    DataManager.onlineCallback(false);
                }
                throw e;
            });
    }

    /**
     * Vereinfachung von Laden von Resourcen.
     * Lädt per GET die angegebene URL und gibt diese als JSON oder Text zurück
     *
     * @param url
     * @param format
     * @param useBasePath
     * @returns {Promise<*  | void>}
     */
    static async load(url: any, format?: any, useBasePath?: any) {
        format = Helper.nonNull(format, true);

        if (format === true) {
            format = 'json';
        } else if (format === false) {
            format = 'text';
        } else if (format !== 'json' && format !== 'text') {
            format = 'raw';
        }

        useBasePath = Helper.nonNull(useBasePath, true);
        if (useBasePath === true) {
            useBasePath = DataManager._basePath;
        } else if (typeof useBasePath !== 'string') {
            useBasePath = '';
        }

        url = DataManager.basePath(url, useBasePath);
        return (
            DataManager.fetch(url, format === 'raw')
                .catch((e) => {
                    if (DataManager.onlineCallback) {
                        DataManager.onlineCallback(false);
                    }
                    throw new NotOnlineError(e, url);
                })
                // @ts-ignore
                .then((res: Response) => {
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
                })
        );
    }

    /**
     * Vereinfachung von Laden von Resourcen.
     * Lädt per GET das angegebene Asset und gibt diese als JSON oder Text zurück
     *
     * @param url
     * @param format
     * @returns {Promise<*  | void>}
     */
    static async loadAsset(url: any, format?: any) {
        let assetPath = DataManager._assetBasePath;
        if (!url.startsWith('/') && assetPath.length > 0 && !assetPath.endsWith('/')) {
            assetPath += '/';
        }
        return this.load(url, Helper.nonNull(format, 'text'), assetPath);
    }

    /**
     * Wandelt ein Key-Value-Objekt in einen QueryString um
     *
     * @param values
     * @return {string}
     */
    static buildQuery(values: any) {
        const queryStrings = [];
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in values) {
            queryStrings.push(`${encodeURIComponent(k)}=${encodeURIComponent(values[k])}`);
        }
        return `?${queryStrings.join('&')}`;
    }

    /**
     * Wandelt ein Key-Value-Objekt in einen QueryString um
     *
     * @param values
     * @return {string}
     */
    static buildQueryWithoutNullValues(values: any) {
        const queryValues = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const k in values) {
            if (Helper.isNotNull(values[k])) {
                queryValues[k] = values[k];
            }
        }
        return this.buildQuery(queryValues);
    }

    static async send(url: any, params: any) {
        url = DataManager.basePath(url);

        let headers = {};
        if (!(params instanceof FormData) && typeof params === 'object') {
            params = JSON.stringify(params);
            headers = {
                'Content-Type': 'application/json',
            };
        }

        Object.keys(DataManager._additionalHeaders).forEach((header) => {
            headers[header] = DataManager._additionalHeaders[header];
        });

        return fetch(url, {
            credentials: 'same-origin',
            method: 'POST',
            headers,
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
            });
    }

    static basePath(url: any, basePath?: any) {
        basePath = Helper.nonNull(basePath, DataManager._basePath);
        return basePath + (url || '');
    }

    static setHeader(header: any, value: any) {
        DataManager._additionalHeaders[header] = value;
    }
}

DataManager._additionalHeaders = {};
DataManager._basePath = '';
DataManager._assetBasePath = '';
