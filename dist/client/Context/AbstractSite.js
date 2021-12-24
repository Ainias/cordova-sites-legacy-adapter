var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ViewInflater } from '../ViewInflater';
import { Helper } from 'js-helper/dist/shared';
import { Context } from './Context';
/**
 * Basisklasse für eine Seite
 */
var AbstractSite = /** @class */ (function (_super) {
    __extends(AbstractSite, _super);
    /**
     * Construktor für eine Seite, sollte überladen werden und view sollte definiert werden. Seitenkonstruktoren bekommen NUR den siteManager übergebn
     * @param siteManager
     * @param view
     */
    function AbstractSite(_siteManager, view) {
        var _this = _super.call(this, view) || this;
        _this._isDestroying = false;
        _this._isDestroying = false;
        // Promise und Resolver, welches erfüllt wird, wenn Seite beendet wird
        _this._finishPromiseResolver = {
            resolve: null,
            reject: null,
        };
        _this._finishPromise = new Promise(function (resolve, reject) {
            _this._finishPromiseResolver = { resolve: resolve, reject: reject };
        });
        // Promise, welches erfüllt wird, wenn onConstruct-Promsise erfüllt wurde. Wird für onDestroy gebraucht
        _this._onConstructPromise = null;
        _this._parameters = {};
        _this._result = null;
        _this._title = {
            element: null,
            text: null,
        };
        _this._loadingSymbol = null;
        // Wird zum speichern der zugehörigen HistoryID genutzt
        _this._historyId = null;
        return _this;
    }
    AbstractSite.prototype.setOnFinishListener = function (onFinishListener) {
        this.onFinishListener = onFinishListener;
    };
    AbstractSite.prototype.setOnStartSiteListener = function (onStartSiteListener) {
        this.onStartSiteListener = onStartSiteListener;
    };
    AbstractSite.prototype.getTitle = function () {
        return this._title;
    };
    AbstractSite.prototype.onConstruct = function (constructParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                res = _super.prototype.onConstruct.call(this, constructParameters);
                this.setParameters(Helper.nonNull(constructParameters, {}));
                // EventManager.trigger(AbstractSite.EVENT.ON_CONSTRUCT, {
                //     site: this,
                //     params: constructParameters,
                // });
                return [2 /*return*/, res];
            });
        });
    };
    AbstractSite.prototype.onStart = function (pauseArguments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.onStart.call(this, pauseArguments)];
                    case 1:
                        _a.sent();
                        this._updateTitle();
                        this.updateUrl(this._parameters);
                        return [2 /*return*/];
                }
            });
        });
    };
    AbstractSite.prototype.onViewLoaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                res = _super.prototype.onViewLoaded.call(this);
                // EventManager.trigger(AbstractSite.EVENT.ON_VIEW_LOADED, {
                //     site: this,
                // });
                return [2 /*return*/, res];
            });
        });
    };
    AbstractSite.prototype.onPause = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                res = _super.prototype.onPause.call(this);
                // EventManager.trigger(AbstractSite.EVENT.ON_PAUSE, {
                //     site: this,
                // });
                return [2 /*return*/, res];
            });
        });
    };
    AbstractSite.prototype.onDestroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                res = _super.prototype.onDestroy.call(this);
                // EventManager.trigger(AbstractSite.EVENT.ON_DESTROY, {
                //     site: this,
                // });
                return [2 /*return*/, res];
            });
        });
    };
    /**
     * Setzt den Titel der Website
     *
     * @param titleElement
     * @param title
     */
    AbstractSite.prototype.setTitle = function (titleElement, title) {
        if (typeof titleElement === 'string') {
            var args = title;
            title = titleElement;
            // TODO Translation
            // titleElement = Translator.makePersistentTranslation(title, args);
            titleElement = document.createElement('span');
            titleElement.innerText = title;
        }
        title = Helper.nonNull(title, titleElement.textContent);
        this._title = {
            element: titleElement,
            text: title,
        };
        this._updateTitle();
    };
    AbstractSite.prototype.setParameter = function (name, value) {
        this._parameters[name] = value;
        this.updateUrl(this._parameters);
    };
    AbstractSite.prototype.setParameters = function (parameters) {
        this._parameters = parameters;
        this.updateUrl(this._parameters);
    };
    AbstractSite.prototype.getParameters = function () {
        return this._parameters;
    };
    AbstractSite.prototype.showLoadingSymbol = function () {
        return __awaiter(this, void 0, void 0, function () {
            var view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Helper.isNull(this._loadingSymbol)) return [3 /*break*/, 2];
                        this._loadingSymbol = ViewInflater.createLoadingSymbol('overlay');
                        return [4 /*yield*/, this.getViewPromise()];
                    case 1:
                        view = _a.sent();
                        if (Helper.isNotNull(this._loadingSymbol)) {
                            view.appendChild(this._loadingSymbol);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AbstractSite.prototype.removeLoadingSymbol = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (Helper.isNotNull(this._loadingSymbol)) {
                    this._loadingSymbol.remove();
                    this._loadingSymbol = null;
                }
                return [2 /*return*/];
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    AbstractSite.prototype.onBeforeUnload = function (_e) {
        return null;
    };
    /**
     * Updatet den Title der Webseite
     * @protected
     */
    AbstractSite.prototype._updateTitle = function () {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.updateTitle(this._title.text);
        }
    };
    AbstractSite.prototype.updateUrl = function (_args) {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.updateUrl(this, args);
        }
    };
    /**
     * Startet eine andere Seite mit den angegebenen Parametern
     *
     * @param site
     * @param args
     * @returns {*|Promise<*>}
     */
    AbstractSite.prototype.startSite = function (site, args) {
        if (this.onStartSiteListener) {
            this.onStartSiteListener(site, args);
        }
    };
    /**
     * Alias für
     *  this.startSite(...);
     *  this.finish(...);
     *
     * @param site
     * @param args
     * @param result
     * @returns {*|Promise<*>}
     */
    AbstractSite.prototype.finishAndStartSite = function (site, args, result) {
        var res = this.startSite(site, args);
        this.finish(result);
        return res;
    };
    /**
     * Beendet die aktuelle Seite. Kann ein Ergebnis setzen
     *
     * @param result
     */
    AbstractSite.prototype.finish = function (result) {
        if (!(this._isDestroying || this._state === Context.STATE_DESTROYED)) {
            this._isDestroying = true;
            if (Helper.isNotNull(result)) {
                this.setResult(result);
            }
            if (this.onFinishListener) {
                this.onFinishListener();
            }
            // return this._siteManager.endSite(this);
        }
    };
    AbstractSite.prototype.goBack = function () {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.goBack();
        }
    };
    /**
     * Wird aufgerufen, falls zurück gedrückt wird. Gib false zurück, um das beenden der Seite zu verhindern
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    AbstractSite.prototype.onBackPressed = function () { };
    /**
     * TODO Einbauen
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    AbstractSite.prototype.onMenuPressed = function () { };
    /**
     * TODO Einbauen
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    AbstractSite.prototype.onSearchPressed = function () { };
    /**
     * Gibt das FinishPromise zurück
     * @returns {Promise<any>}
     */
    AbstractSite.prototype.getFinishPromise = function () {
        return this._finishPromise;
    };
    /**
     * Setzt das Resultat. Letztes Setzen gilt
     * @param result
     */
    AbstractSite.prototype.setResult = function (result) {
        this._result = result;
    };
    /**
     * Gibt den FinishResolver zurück. Genutzt, um FinishPromise zu resolven order rejecten
     * @returns {*}
     */
    AbstractSite.prototype.getFinishResolver = function () {
        return this._finishPromiseResolver;
    };
    // eslint-disable-next-line class-methods-use-this
    AbstractSite.prototype.addEventListener = function (_siteEvent, _listener) {
        // return EventManager.getInstance().addListener(siteEvent, (data) => {
        //     if (data.site && data.site instanceof this.constructor) {
        //         listener(data);
        //     }
        // });
    };
    AbstractSite.prototype.isDestroying = function () {
        return this._isDestroying;
    };
    return AbstractSite;
}(Context));
export { AbstractSite };
AbstractSite.EVENT = {
    ON_CONSTRUCT: 'abstract-site-on-construct',
    ON_VIEW_LOADED: 'abstract-site-on-view-loaded',
    ON_START: 'abstract-site-on-start',
    ON_PAUSE: 'abstract-site-on-pause',
    ON_DESTROY: 'abstract-site-on-destroy',
};
//# sourceMappingURL=AbstractSite.js.map