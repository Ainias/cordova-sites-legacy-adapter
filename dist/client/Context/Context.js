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
import { ViewInflater } from '../ViewInflater';
import { PromiseWithHandlers, Helper } from 'js-helper';
/**
 * Basis-Klasse für Seiten und Fragmente
 */
var Context = /** @class */ (function () {
    /**
     * Erstellt einen neuen Context. Erwartet den Link zu einem HTML-File, welches vom ViewInflater geladen werden kann.
     * Im Constructor sollten fragmente hinzugefügt werden (nachdem super.constructor(<>) aufgerufen wurde)
     *
     * @param view
     */
    function Context(view) {
        var _this = this;
        this.onViewLoadedCalled = false;
        this._pauseParameters = [];
        this._view = null;
        this._fragments = [];
        this._state = Context.STATE_CREATED;
        this._viewLoadedPromise = new PromiseWithHandlers();
        this._viewPromise = ViewInflater.getInstance()
            .load(view)
            .then(function (siteContent) {
            _this._view = siteContent;
            return siteContent;
        })
            .catch(function (e) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            _this._viewLoadedPromise.reject(e);
        });
    }
    Context.prototype.isViewLoaded = function () {
        return this._state >= Context.STATE_VIEW_LOADED;
    };
    Context.prototype.getState = function () {
        return this._state;
    };
    /**
     * Wird von SiteManager aufgerufen, wenn Klasse erstellt wird. Das ViewPromise ist noch nicht zwangsweise geladen!
     * Gibt ein Promise zurück. onViewLoaded wird erst aufgerufen, wenn onConstruct-Promise und view-Promise fullfilled sind.
     *
     * @param constructParameters, Object|Null
     * @returns {Promise<any[]>}
     */
    Context.prototype.onConstruct = function (constructParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var onConstructPromises, k;
            return __generator(this, function (_a) {
                this._state = Context.STATE_CONSTRUCTED;
                this.constructParameters = constructParameters;
                onConstructPromises = [];
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (k in this._fragments) {
                    onConstructPromises.push(this._fragments[k].onConstruct.apply(this._fragments[k], [constructParameters]));
                    onConstructPromises.push(this._fragments[k]._viewPromise);
                }
                return [2 /*return*/, Promise.all(onConstructPromises)];
            });
        });
    };
    Context.prototype.callOnViewLoaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.onViewLoadedCalled) return [3 /*break*/, 2];
                        this.onViewLoadedCalled = true;
                        return [4 /*yield*/, this.onViewLoaded()];
                    case 1:
                        res = _a.sent();
                        this._state = Context.STATE_VIEW_LOADED;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        this._viewLoadedPromise.resolve(res);
                        _a.label = 2;
                    case 2: return [2 /*return*/, this._viewLoadedPromise];
                }
            });
        });
    };
    /**
     * Methode wird aufgerufen, sobald onConstruct-Promise und view-Promise fullfilled sind.
     * View ist hier noch nicht im Dokument hinzugefügt.
     *
     * Benutze diese Methode, um die View beim starten zu manipulieren.
     */
    Context.prototype.onViewLoaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var onViewLoadedPromises, _loop_1, this_1, k;
            var _this = this;
            return __generator(this, function (_a) {
                onViewLoadedPromises = [];
                _loop_1 = function (k) {
                    onViewLoadedPromises.push(this_1._fragments[k]._viewPromise
                        .then(function () { return _this._fragments[k].callOnViewLoaded(); })
                        .then(function () { return _this._fragments[k]._viewLoadedPromise.resolve(); }));
                };
                this_1 = this;
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (k in this._fragments) {
                    _loop_1(k);
                }
                return [2 /*return*/, Promise.all(onViewLoadedPromises)];
            });
        });
    };
    /**
     * onViewLoaded-Promise ist erfüllt => View wird dem Document hinzugefügt => onStart wird aufgerufen
     *
     * Seite wird pausiert => onPause wird aufgerufen => View wird aus dem Document entfernt => - etwas passiert -
     * => Seite wird fortgesetzt => View wird dem Document hinzugefügt => onStart wird mit dem Rückgabewert von onPause ausgeführt
     *
     * Zurückgegebenes Promise wird ignoriert!
     * @param pauseArguments, Object|NULL
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Context.prototype.onStart = function (_pauseArguments) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_2, this_2, _a, _b, _i, k;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._state = Context.STATE_RUNNING;
                        _loop_2 = function (k) {
                            var fragment, _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        fragment = this_2._fragments[k];
                                        // eslint-disable-next-line no-await-in-loop
                                        _e = (_d = fragment.onStart).apply;
                                        _f = [this_2._fragments[k]];
                                        return [4 /*yield*/, this_2._fragments[k]._pauseParameters];
                                    case 1:
                                        // eslint-disable-next-line no-await-in-loop
                                        _e.apply(_d, _f.concat([[_g.sent()]]));
                                        this_2._fragments[k]._viewPromise.then(function (fragmentView) {
                                            if (fragment.isActive()) {
                                                fragmentView.classList.remove('hidden');
                                            }
                                            else {
                                                fragmentView.classList.add('hidden');
                                            }
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _a = [];
                        for (_b in this._fragments)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        k = _a[_i];
                        return [5 /*yield**/, _loop_2(k)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Seite wird pausiet => onPause wird ausgeführt => View wird aus dem Document entfernt
     * Seite wird beendet => onPause wird ausgeführt (falls State === running) => View wird aus dem Document entfernt
     * => onDestroy wird ausgeführt
     *
     * Rückgabe-Promise wird als Pause-Parameter gespeichert und wird beim Fortsetzen der Seite ausgeführt
     * @returns {Promise<void>}
     */
    Context.prototype.onPause = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var k, pauseParameters;
            return __generator(this, function (_a) {
                this._state = Context.STATE_PAUSED;
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (k in this._fragments) {
                    pauseParameters = this._fragments[k].onPause.apply(this._fragments[k], args);
                    this._fragments[k].setPauseParameters(pauseParameters);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Seite wird beendet => onPause wird ausgeführt (falls State === running) => View wird aus dem Document entfernt
     * => onDestroy wird ausgeführt
     *
     * Rückgabe-Promise wird ignoriert
     */
    Context.prototype.onDestroy = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var k;
            return __generator(this, function (_a) {
                this._state = Context.STATE_DESTROYED;
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (k in this._fragments) {
                    // eslint-disable-next-line prefer-spread
                    this._fragments[k].onDestroy.apply(this._fragments[k], args);
                }
                return [2 /*return*/];
            });
        });
    };
    Context.prototype.isShowing = function () {
        return this._state === Context.STATE_RUNNING;
    };
    /**
     * Fügt ein neues Fragment hinzu.
     *
     * @param viewQuery
     * @param fragment
     */
    Context.prototype.addFragment = function (viewQuery, fragment) {
        var _this = this;
        this._fragments.push(fragment);
        fragment.setViewQuery(viewQuery);
        this._viewPromise = Promise.all([this._viewPromise, fragment._viewPromise])
            .then(function (res) {
            res[0].querySelector(viewQuery).appendChild(res[1]);
            return res[0];
        })
            .catch(function (e) { return console.error(e); });
        if (this._state >= Context.STATE_CONSTRUCTED) {
            fragment.onConstruct(this.constructParameters);
        }
        if (this._state >= Context.STATE_VIEW_LOADED) {
            Promise.all([this._viewLoadedPromise, fragment.getViewPromise()]).then(function () { return fragment.callOnViewLoaded(); });
        }
        if (this._state >= Context.STATE_RUNNING) {
            fragment._viewLoadedPromise.then(function () {
                if (_this._state >= Context.STATE_RUNNING) {
                    fragment.onStart();
                }
            });
        }
    };
    /**
     * Entfernt ein Fragment.
     *
     * @param fragment
     */
    Context.prototype.removeFragment = function (fragment) {
        var index = this._fragments.indexOf(fragment);
        if (index !== -1) {
            this._fragments.splice(index, 1);
        }
        fragment._viewPromise.then(function (res) { return res.remove(); });
        this._fragments.push(fragment);
        if (this._state < Context.STATE_PAUSED) {
            fragment.onPause();
        }
        if (this._state < Context.STATE_DESTROYING) {
            fragment.onDestroy();
        }
    };
    /**
     * Findet ein Element anhand eines Selectors
     *
     * Wenn all = true, werden alle gefundenen Elemente zurückgegeben
     *
     * Wenn asPromise = true, wird das Ergebnis als Promise zurückgegeben. Hier wird gewartet, bis das _viewPromise fullfilled ist
     * Nutze das, um die View in onConstruct zu manipulieren. Evtl entfernen
     *
     * @param query
     * @param all
     * @param asPromise
     * @returns {*}
     */
    Context.prototype.findBy = function (query, all, asPromise) {
        all = Helper.nonNull(all, false);
        asPromise = Helper.nonNull(asPromise, false);
        var getVal = function (root) {
            var res = null;
            if (all) {
                res = root.querySelectorAll(query);
                if (root.matches(query)) {
                    res.push(root);
                }
            }
            else if (root.matches(query)) {
                res = root;
            }
            else {
                res = root.querySelector(query);
            }
            return res;
        };
        if (asPromise) {
            return this._viewPromise.then(function (rootView) {
                return getVal(rootView);
            });
        }
        return getVal(this._view);
    };
    Context.prototype.find = function (selector) {
        if (this._view.matches(selector)) {
            return this._view;
        }
        return this._view.querySelector(selector);
    };
    Context.prototype.findAll = function (selector) {
        var res = this._view.querySelectorAll(selector);
        if (this._view.matches(selector)) {
            res.push(this._view);
        }
        return res;
    };
    /**
     * Setzt die PauseParameters
     * @param pauseParameters
     */
    Context.prototype.setPauseParameters = function (pauseParameters) {
        this._pauseParameters = pauseParameters;
    };
    /**
     * Gibt das ViewPromise zurück
     * @returns {*}
     */
    Context.prototype.getViewPromise = function () {
        return this._viewPromise;
    };
    Context.prototype.getViewLoadedPromise = function () {
        return this._viewLoadedPromise;
    };
    Context.prototype.getView = function () {
        return this._view;
    };
    Context.STATE_CREATED = 0;
    Context.STATE_CONSTRUCTED = 1;
    Context.STATE_VIEW_LOADED = 2;
    Context.STATE_RUNNING = 3;
    Context.STATE_PAUSED = 4;
    Context.STATE_DESTROYING = 5;
    Context.STATE_DESTROYED = 6;
    return Context;
}());
export { Context };
//# sourceMappingURL=Context.js.map