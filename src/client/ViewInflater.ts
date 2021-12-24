/* eslint-disable */
import { ViewHelper } from 'js-helper/dist/client';
import { Helper, JsonHelper } from 'js-helper/dist/shared';
import { DataManager } from './DataManager';

/**
 * Singleton-Klasse genutzt zum laden von Views
 */
export class ViewInflater {
    private static instance: ViewInflater = new ViewInflater();

    private loadingPromises: {};

    /**
     *  Statische Funktion, um die Singleton-Instanz zu holen
     *
     * @returns {ViewInflater}
     */
    static getInstance() {
        return ViewInflater.instance;
    }

    constructor() {
        this.loadingPromises = {};
    }

    /**
     * Lädt asynchron eine View anhand einer URL und lädt ebenso alle child-views
     *
     * Extra nicht async, damit Promise sofort in LoadingPromise hinzugefügt werden kann
     *
     * @param viewUrl
     * @param parentUrls
     * @returns {*}
     */
    load(viewUrl: any, parentUrls?: any) {
        // Kopiere Elemente, damit originale parentURLS nicht verändert werden
        parentUrls = JsonHelper.deepCopy(Helper.nonNull(parentUrls, []));

        // Detektiert eine Schleife in den Views
        if (parentUrls.indexOf(viewUrl) !== -1) {
            // Return Promise.reject => da View vorher schon einmal geladen, wird das Resultat ebenfalls in loadingPromises gespeichert für diese View
            return Promise.reject(
                `views are in a circuit! cannot resolve view for url ${parentUrls[0]}! url ${viewUrl} is in stack before!`
            );
        }
        parentUrls.push(viewUrl);

        // Shortcut, falls die View schon geladen wurde. Muss nach Schleifenüberprüfung aufgerufen werden
        if (Helper.isNotNull(this.loadingPromises[viewUrl])) {
            return this.loadingPromises[viewUrl].then((view: any) => view.cloneNode(true));
        }
        let t;
        let resultPromise: any = Promise.resolve(t);
        if (viewUrl instanceof Element) {
            resultPromise = Promise.resolve(viewUrl);
        } else {
            resultPromise = DataManager.loadAsset(viewUrl).then((htmlText: any) => {
                let doc = new DOMParser().parseFromString(htmlText, 'text/html');

                // Parsing hat nicht geklappt, also per innerHTML
                if (Helper.isNull(doc)) {
                    doc = document.implementation.createHTMLDocument('');
                    doc.body.innerHTML = htmlText;
                }

                // Wrappe Elemente mit einem Span
                const spanElem = document.createElement('span');
                spanElem.classList.add('injected-span');
                return ViewInflater.moveChildren(doc.body, spanElem);
            });
        }

        this.loadingPromises[viewUrl] = resultPromise
            .then((parentElement: any) => {
                const promises: any = [];
                const childViews = parentElement.querySelectorAll('[data-view]');

                // lade Kinder-Views
                childViews.forEach((childView: any) => {
                    promises.push(
                        ViewInflater.getInstance()
                            .load(childView.dataset.view, parentUrls)
                            .then((element: any) => {
                                childView.replaceWith(element);
                                ViewInflater.replaceWithChildren(element);
                            })
                    );
                });
                return Promise.all(promises).then(function () {
                    return parentElement;
                });
            })
            .catch((e: any) => {
                console.error(e);
                this.loadingPromises[viewUrl] = null;
                throw e;
            });
        return this.loadingPromises[viewUrl].then((view: any) => view.cloneNode(true));
    }

    /**
     * Statische Funktion, um Elemente aus einem String zu kreieren
     *
     * @param string
     * @returns {NodeListOf<ChildNode>}
     */
    static inflateElementsFromString(string: string) {
        const template = document.createElement('template');
        template.innerHTML = string;
        return template.content.childNodes;
    }

    /**
     * Kreiert ein Ladesymbol. Evtl entfernen
     *
     * @returns {HTMLDivElement}
     */
    static createLoadingSymbol(loaderClass?: any) {
        const svgNS = 'http://www.w3.org/2000/svg';

        const loader = document.createElement('div');
        loader.classList.add('loader');

        // LoaderClass darf nicht leer sein, da sonst HTML einen Felher schmeißt
        if (loaderClass) {
            loader.classList.add(loaderClass);
        }

        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 32 32');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');

        const circle = document.createElementNS(svgNS, 'circle');
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
    }

    /**
     * Moves the child-Nodes from one element to another
     * @param from
     * @param to
     * @returns {*}
     */
    static moveChildren(from: any, to: any) {
        return ViewHelper.moveChildren(from, to);
    }

    /**
     * Ersetzt ein Element durch seine Kinder (entfernt das Element ohne die Kinder zu entfernen)
     * @param element
     */
    static replaceWithChildren(element: any) {
        const children: any = [];

        // Zwischenspeichern der Children, da removeChild die forEach-Schleife durcheinander bringt
        element.childNodes.forEach((child: any) => {
            children.push(child);
        });

        const parent = element.parentElement;
        children.forEach((child: any) => {
            element.removeChild(child);
            parent.insertBefore(child, element);
        });
        element.remove();
    }
}
