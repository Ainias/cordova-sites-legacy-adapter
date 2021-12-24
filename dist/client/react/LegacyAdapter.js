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
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSites, useSiteId, useIsVisible } from 'cordova-sites';
function LegacyAdapter(_a) {
    // TODO UpdateTitle
    // TODO Finish-Result
    // TODO GoBack, onBackPressed
    // TODO addEventListener
    // TODO OnBeforeUnload
    var _this = this;
    var Site = _a.Site, startParams = _a.startParams;
    // Variables
    // States
    var _b = useState(undefined), pauseArgs = _b[0], setPauseArgs = _b[1];
    var _c = useState(false), isViewLoaded = _c[0], setIsViewLoaded = _c[1];
    var _d = useState(false), isConstructed = _d[0], setIsConstructed = _d[1];
    var _e = useState(false), onConstructCalled = _e[0], setOnConstructCalled = _e[1];
    var _f = useState(false), isViewLoadedDone = _f[0], setIsViewLoadedDone = _f[1];
    var _g = useState(false), onViewLoadedCalled = _g[0], setOnViewLoadedCalled = _g[1];
    var _h = useState(false), isDestroying = _h[0], setIsDestroying = _h[1];
    var siteContainer = useState({ site: undefined })[0];
    if (!siteContainer.site) {
        siteContainer.site = new Site(undefined);
    }
    var site = siteContainer.site;
    var isVisible = useIsVisible();
    var id = useSiteId();
    var sites = useSites();
    // Refs
    // Callbacks
    var onFinish = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDestroying(true);
                    if (!(onViewLoadedCalled && isVisible)) return [3 /*break*/, 2];
                    return [4 /*yield*/, site.onPause()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, site.onDestroy()];
                case 3:
                    _a.sent();
                    if (id) {
                        sites === null || sites === void 0 ? void 0 : sites.removeSite(id);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    site.setOnFinishListener(onFinish);
    var onStartSite = function (NewSite, args) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sites === null || sites === void 0 ? void 0 : sites.startSite(LegacyAdapter, { Site: NewSite, startParams: args });
            return [2 /*return*/];
        });
    }); };
    site.setOnStartSiteListener(onStartSite);
    // Effects
    // Other
    if (!onConstructCalled) {
        Promise.resolve(startParams).then(function (params) {
            if (!onConstructCalled) {
                setOnConstructCalled(true);
                site.onConstruct(params).then(function () {
                    setIsConstructed(true);
                });
            }
        });
    }
    if (!isViewLoaded) {
        site.getViewPromise().then(function () { return setIsViewLoaded(true); });
    }
    if (isConstructed && isViewLoaded && !onViewLoadedCalled && !isDestroying) {
        setOnViewLoadedCalled(true);
        site.callOnViewLoaded().then(function () { return setIsViewLoadedDone(true); });
    }
    useEffect(function () {
        if (isViewLoadedDone) {
            if (isVisible) {
                site.onStart(pauseArgs);
            }
            else {
                site.onPause().then(function (res) { return setPauseArgs(res); });
            }
        }
    }, [isViewLoadedDone, isVisible, pauseArgs, site]);
    // Render Functions
    if (isViewLoadedDone) {
        return site.getView();
    }
    // TODO loading symbol
    return React.createElement("span", null, "Loading...");
}
var tmp = React.memo(LegacyAdapter);
export { tmp as LegacyAdapter };
//# sourceMappingURL=LegacyAdapter.js.map