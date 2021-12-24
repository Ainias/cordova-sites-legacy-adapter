/* eslint-disable */
import { ViewHelper } from 'js-helper/dist/client';
import { Helper, JsonHelper } from 'js-helper/dist/shared';
import { DataManager } from './DataManager';
/**
 * Singleton-Klasse genutzt zum laden von Views
 */
var ViewInflater = /** @class */ (function () {
    function ViewInflater() {
        this.loadingPromises = {};
    }
    /**
     *  Statische Funktion, um die Singleton-Instanz zu holen
     *
     * @returns {ViewInflater}
     */
    ViewInflater.getInstance = function () {
        return ViewInflater.instance;
    };
    /**
     * Lädt asynchron eine View anhand einer URL und lädt ebenso alle child-views
     *
     * Extra nicht async, damit Promise sofort in LoadingPromise hinzugefügt werden kann
     *
     * @param viewUrl
     * @param parentUrls
     * @returns {*}
     */
    ViewInflater.prototype.load = function (viewUrl, parentUrls) {
        var _this = this;
        // Kopiere Elemente, damit originale parentURLS nicht verändert werden
        parentUrls = JsonHelper.deepCopy(Helper.nonNull(parentUrls, []));
        // Detektiert eine Schleife in den Views
        if (parentUrls.indexOf(viewUrl) !== -1) {
            // Return Promise.reject => da View vorher schon einmal geladen, wird das Resultat ebenfalls in loadingPromises gespeichert für diese View
            return Promise.reject("views are in a circuit! cannot resolve view for url ".concat(parentUrls[0], "! url ").concat(viewUrl, " is in stack before!"));
        }
        parentUrls.push(viewUrl);
        // Shortcut, falls die View schon geladen wurde. Muss nach Schleifenüberprüfung aufgerufen werden
        if (Helper.isNotNull(this.loadingPromises[viewUrl])) {
            return this.loadingPromises[viewUrl].then(function (view) { return view.cloneNode(true); });
        }
        var t;
        var resultPromise = Promise.resolve(t);
        if (viewUrl instanceof Element) {
            resultPromise = Promise.resolve(viewUrl);
        }
        else {
            resultPromise = DataManager.loadAsset(viewUrl).then(function (htmlText) {
                var doc = new DOMParser().parseFromString(htmlText, 'text/html');
                // Parsing hat nicht geklappt, also per innerHTML
                if (Helper.isNull(doc)) {
                    doc = document.implementation.createHTMLDocument('');
                    doc.body.innerHTML = htmlText;
                }
                // Wrappe Elemente mit einem Span
                var spanElem = document.createElement('span');
                spanElem.classList.add('injected-span');
                return ViewInflater.moveChildren(doc.body, spanElem);
            });
        }
        this.loadingPromises[viewUrl] = resultPromise
            .then(function (parentElement) {
            var promises = [];
            var childViews = parentElement.querySelectorAll('[data-view]');
            // lade Kinder-Views
            childViews.forEach(function (childView) {
                promises.push(ViewInflater.getInstance()
                    .load(childView.dataset.view, parentUrls)
                    .then(function (element) {
                    childView.replaceWith(element);
                    ViewInflater.replaceWithChildren(element);
                }));
            });
            return Promise.all(promises).then(function () {
                return parentElement;
            });
        })
            .catch(function (e) {
            console.error(e);
            _this.loadingPromises[viewUrl] = null;
            throw e;
        });
        return this.loadingPromises[viewUrl].then(function (view) { return view.cloneNode(true); });
    };
    /**
     * Statische Funktion, um Elemente aus einem String zu kreieren
     *
     * @param string
     * @returns {NodeListOf<ChildNode>}
     */
    ViewInflater.inflateElementsFromString = function (string) {
        var template = document.createElement('template');
        template.innerHTML = string;
        return template.content.childNodes;
    };
    /**
     * Kreiert ein Ladesymbol. Evtl entfernen
     *
     * @returns {HTMLDivElement}
     */
    ViewInflater.createLoadingSymbol = function (loaderClass) {
        var svgNS = 'http://www.w3.org/2000/svg';
        var loader = document.createElement('div');
        loader.classList.add('loader');
        // LoaderClass darf nicht leer sein, da sonst HTML einen Felher schmeißt
        if (loaderClass) {
            loader.classList.add(loaderClass);
        }
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 32 32');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        var circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('class', 'spinner');
        circle.setAttribute('cx', '16');
        circle.setAttribute('cy', '16');
        circle.setAttribute('r', '14');
        circle.setAttribute('fill', 'none');
        svg.appendChild(circle);
        loader.appendChild(svg);
        // let loader = document.createElement("div");
        // loader.appendChild(document.createTextNode("LOADING..."));
        return loader;
    };
    /**
     * Moves the child-Nodes from one element to another
     * @param from
     * @param to
     * @returns {*}
     */
    ViewInflater.moveChildren = function (from, to) {
        return ViewHelper.moveChildren(from, to);
    };
    /**
     * Ersetzt ein Element durch seine Kinder (entfernt das Element ohne die Kinder zu entfernen)
     * @param element
     */
    ViewInflater.replaceWithChildren = function (element) {
        var children = [];
        // Zwischenspeichern der Children, da removeChild die forEach-Schleife durcheinander bringt
        element.childNodes.forEach(function (child) {
            children.push(child);
        });
        var parent = element.parentElement;
        children.forEach(function (child) {
            element.removeChild(child);
            parent.insertBefore(child, element);
        });
        element.remove();
    };
    ViewInflater.instance = new ViewInflater();
    return ViewInflater;
}());
export { ViewInflater };
//# sourceMappingURL=ViewInflater.js.map