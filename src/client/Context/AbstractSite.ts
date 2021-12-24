/* eslint-disable @typescript-eslint/no-unused-vars */
import { ViewInflater } from '../ViewInflater';
import { Helper } from 'js-helper/dist/shared';
import { Context } from './Context';

/**
 * Basisklasse für eine Seite
 */
export class AbstractSite extends Context {
    static EVENT: any;

    _isDestroying = false;
    _finishPromiseResolver: any;
    _finishPromise: any;

    _onConstructPromise: any;
    _parameters: any;
    _result: any;
    _title: any;
    _loadingSymbol: any;
    _historyId: any;

    private onFinishListener: any;
    private onStartSiteListener: any;

    /**
     * Construktor für eine Seite, sollte überladen werden und view sollte definiert werden. Seitenkonstruktoren bekommen NUR den siteManager übergebn
     * @param siteManager
     * @param view
     */
    constructor(_siteManager: any, view?: any) {
        super(view);

        this._isDestroying = false;

        // Promise und Resolver, welches erfüllt wird, wenn Seite beendet wird
        this._finishPromiseResolver = {
            resolve: null,
            reject: null,
        };
        this._finishPromise = new Promise((resolve, reject) => {
            this._finishPromiseResolver = { resolve, reject };
        });

        // Promise, welches erfüllt wird, wenn onConstruct-Promsise erfüllt wurde. Wird für onDestroy gebraucht
        this._onConstructPromise = null;
        this._parameters = {};
        this._result = null;

        this._title = {
            element: null,
            text: null,
        };

        this._loadingSymbol = null;

        // Wird zum speichern der zugehörigen HistoryID genutzt
        this._historyId = null;
    }

    setOnFinishListener(onFinishListener: any) {
        this.onFinishListener = onFinishListener;
    }

    setOnStartSiteListener(onStartSiteListener: any) {
        this.onStartSiteListener = onStartSiteListener;
    }

    getTitle() {
        return this._title;
    }

    async onConstruct(constructParameters: any) {
        const res = super.onConstruct(constructParameters);
        this.setParameters(Helper.nonNull(constructParameters, {}));
        // EventManager.trigger(AbstractSite.EVENT.ON_CONSTRUCT, {
        //     site: this,
        //     params: constructParameters,
        // });
        return res;
    }

    async onStart(pauseArguments: any) {
        await super.onStart(pauseArguments);
        this._updateTitle();
        this.updateUrl(this._parameters);
        // EventManager.trigger(AbstractSite.EVENT.ON_START, {
        //     site: this,
        //     params: pauseArguments,
        // });
    }

    async onViewLoaded() {
        const res = super.onViewLoaded();
        // EventManager.trigger(AbstractSite.EVENT.ON_VIEW_LOADED, {
        //     site: this,
        // });
        return res;
    }

    async onPause() {
        const res = super.onPause();
        // EventManager.trigger(AbstractSite.EVENT.ON_PAUSE, {
        //     site: this,
        // });
        return res;
    }

    async onDestroy() {
        const res = super.onDestroy();
        // EventManager.trigger(AbstractSite.EVENT.ON_DESTROY, {
        //     site: this,
        // });
        return res;
    }

    /**
     * Setzt den Titel der Website
     *
     * @param titleElement
     * @param title
     */
    setTitle(titleElement: HTMLElement | string, title?: any) {
        if (typeof titleElement === 'string') {
            const args = title;
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
    }

    setParameter(name: any, value: any) {
        this._parameters[name] = value;
        this.updateUrl(this._parameters);
    }

    setParameters(parameters: any) {
        this._parameters = parameters;
        this.updateUrl(this._parameters);
    }

    getParameters() {
        return this._parameters;
    }

    async showLoadingSymbol() {
        if (Helper.isNull(this._loadingSymbol)) {
            this._loadingSymbol = ViewInflater.createLoadingSymbol('overlay');
            const view = await this.getViewPromise();
            if (Helper.isNotNull(this._loadingSymbol)) {
                view.appendChild(this._loadingSymbol);
            }
        }
    }

    async removeLoadingSymbol() {
        if (Helper.isNotNull(this._loadingSymbol)) {
            this._loadingSymbol.remove();
            this._loadingSymbol = null;
        }
    }

    // eslint-disable-next-line class-methods-use-this
    onBeforeUnload(_e: any): null | string {
        return null;
    }

    /**
     * Updatet den Title der Webseite
     * @protected
     */
    _updateTitle() {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.updateTitle(this._title.text);
        }
    }

    updateUrl(_args: any) {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.updateUrl(this, args);
        }
    }

    /**
     * Startet eine andere Seite mit den angegebenen Parametern
     *
     * @param site
     * @param args
     * @returns {*|Promise<*>}
     */
    startSite(site: typeof AbstractSite, args?: any) {
        if (this.onStartSiteListener) {
            this.onStartSiteListener(site, args);
        }
    }

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
    finishAndStartSite(site: any, args?: any, result?: any) {
        const res = this.startSite(site, args);
        this.finish(result);
        return res;
    }

    /**
     * Beendet die aktuelle Seite. Kann ein Ergebnis setzen
     *
     * @param result
     */
    finish(result?: any) {
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
    }

    goBack() {
        if (this._state === Context.STATE_RUNNING) {
            // this._siteManager.goBack();
        }
    }

    /**
     * Wird aufgerufen, falls zurück gedrückt wird. Gib false zurück, um das beenden der Seite zu verhindern
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    onBackPressed() {}

    /**
     * TODO Einbauen
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    onMenuPressed() {}

    /**
     * TODO Einbauen
     */
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    onSearchPressed() {}

    /**
     * Gibt das FinishPromise zurück
     * @returns {Promise<any>}
     */
    getFinishPromise() {
        return this._finishPromise;
    }

    /**
     * Setzt das Resultat. Letztes Setzen gilt
     * @param result
     */
    setResult(result: any) {
        this._result = result;
    }

    /**
     * Gibt den FinishResolver zurück. Genutzt, um FinishPromise zu resolven order rejecten
     * @returns {*}
     */
    getFinishResolver() {
        return this._finishPromiseResolver;
    }

    // eslint-disable-next-line class-methods-use-this
    addEventListener(_siteEvent: any, _listener: any) {
        // return EventManager.getInstance().addListener(siteEvent, (data) => {
        //     if (data.site && data.site instanceof this.constructor) {
        //         listener(data);
        //     }
        // });
    }

    isDestroying(): boolean {
        return this._isDestroying;
    }
}

AbstractSite.EVENT = {
    ON_CONSTRUCT: 'abstract-site-on-construct',
    ON_VIEW_LOADED: 'abstract-site-on-view-loaded',
    ON_START: 'abstract-site-on-start',
    ON_PAUSE: 'abstract-site-on-pause',
    ON_DESTROY: 'abstract-site-on-destroy',
};
