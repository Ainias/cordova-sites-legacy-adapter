import { ViewInflater } from '../ViewInflater';
import type { AbstractFragment } from './AbstractFragment';
import { PromiseWithHandlers, Helper } from 'js-helper';

/**
 * Basis-Klasse für Seiten und Fragmente
 */
export class Context {
    static readonly STATE_CREATED = 0;
    static readonly STATE_CONSTRUCTED = 1;
    static readonly STATE_VIEW_LOADED = 2;
    static readonly STATE_RUNNING = 3;
    static readonly STATE_PAUSED = 4;
    static readonly STATE_DESTROYING = 5;
    static readonly STATE_DESTROYED = 6;

    protected _pauseParameters: any;
    protected _view: any;
    protected _fragments: any;
    protected _state: any;
    protected _viewLoadedPromise: PromiseWithHandlers<any>;
    protected _viewPromise: Promise<any>;
    protected constructParameters: any;

    private onViewLoadedCalled = false;

    /**
     * Erstellt einen neuen Context. Erwartet den Link zu einem HTML-File, welches vom ViewInflater geladen werden kann.
     * Im Constructor sollten fragmente hinzugefügt werden (nachdem super.constructor(<>) aufgerufen wurde)
     *
     * @param view
     */
    constructor(view: any) {
        this._pauseParameters = [];

        this._view = null;
        this._fragments = [];
        this._state = Context.STATE_CREATED;
        this._viewLoadedPromise = new PromiseWithHandlers<any>();

        this._viewPromise = ViewInflater.getInstance()
            .load(view)
            .then((siteContent: any) => {
                this._view = siteContent;
                return siteContent;
            })
            .catch((e: any) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this._viewLoadedPromise.reject(e);
            });
    }

    isViewLoaded() {
        return this._state >= Context.STATE_VIEW_LOADED;
    }

    getState() {
        return this._state;
    }

    /**
     * Wird von SiteManager aufgerufen, wenn Klasse erstellt wird. Das ViewPromise ist noch nicht zwangsweise geladen!
     * Gibt ein Promise zurück. onViewLoaded wird erst aufgerufen, wenn onConstruct-Promise und view-Promise fullfilled sind.
     *
     * @param constructParameters, Object|Null
     * @returns {Promise<any[]>}
     */
    async onConstruct(constructParameters: any) {
        this._state = Context.STATE_CONSTRUCTED;
        this.constructParameters = constructParameters;

        const onConstructPromises = [];
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in this._fragments) {
            onConstructPromises.push(this._fragments[k].onConstruct.apply(this._fragments[k], [constructParameters]));
            onConstructPromises.push(this._fragments[k]._viewPromise);
        }
        return Promise.all(onConstructPromises);
    }

    async callOnViewLoaded() {
        if (!this.onViewLoadedCalled) {
            this.onViewLoadedCalled = true;
            const res = await this.onViewLoaded();
            this._state = Context.STATE_VIEW_LOADED;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this._viewLoadedPromise.resolve(res);
        }
        return this._viewLoadedPromise;
    }

    /**
     * Methode wird aufgerufen, sobald onConstruct-Promise und view-Promise fullfilled sind.
     * View ist hier noch nicht im Dokument hinzugefügt.
     *
     * Benutze diese Methode, um die View beim starten zu manipulieren.
     */
    async onViewLoaded() {
        const onViewLoadedPromises = [];
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in this._fragments) {
            onViewLoadedPromises.push(
                this._fragments[k]._viewPromise
                    .then(() => this._fragments[k].callOnViewLoaded())
                    .then(() => this._fragments[k]._viewLoadedPromise.resolve())
            );
        }
        return Promise.all(onViewLoadedPromises);
    }

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
    async onStart(_pauseArguments?: any) {
        this._state = Context.STATE_RUNNING;

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in this._fragments) {
            const fragment = this._fragments[k];
            // eslint-disable-next-line no-await-in-loop
            fragment.onStart.apply(this._fragments[k], [await this._fragments[k]._pauseParameters]);
            this._fragments[k]._viewPromise.then((fragmentView: any) => {
                if (fragment.isActive()) {
                    fragmentView.classList.remove('hidden');
                } else {
                    fragmentView.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Seite wird pausiet => onPause wird ausgeführt => View wird aus dem Document entfernt
     * Seite wird beendet => onPause wird ausgeführt (falls State === running) => View wird aus dem Document entfernt
     * => onDestroy wird ausgeführt
     *
     * Rückgabe-Promise wird als Pause-Parameter gespeichert und wird beim Fortsetzen der Seite ausgeführt
     * @returns {Promise<void>}
     */
    async onPause(...args: any[]) {
        this._state = Context.STATE_PAUSED;
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in this._fragments) {
            // eslint-disable-next-line prefer-spread
            const pauseParameters = this._fragments[k].onPause.apply(this._fragments[k], args);
            this._fragments[k].setPauseParameters(pauseParameters);
        }
    }

    /**
     * Seite wird beendet => onPause wird ausgeführt (falls State === running) => View wird aus dem Document entfernt
     * => onDestroy wird ausgeführt
     *
     * Rückgabe-Promise wird ignoriert
     */
    async onDestroy(...args: any[]) {
        this._state = Context.STATE_DESTROYED;
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const k in this._fragments) {
            // eslint-disable-next-line prefer-spread
            this._fragments[k].onDestroy.apply(this._fragments[k], args);
        }
    }

    isShowing() {
        return this._state === Context.STATE_RUNNING;
    }

    /**
     * Fügt ein neues Fragment hinzu.
     *
     * @param viewQuery
     * @param fragment
     */
    addFragment(viewQuery: any, fragment: AbstractFragment<any>) {
        this._fragments.push(fragment);
        fragment.setViewQuery(viewQuery);
        this._viewPromise = Promise.all([this._viewPromise, fragment._viewPromise])
            .then((res) => {
                res[0].querySelector(viewQuery).appendChild(res[1]);
                return res[0];
            })
            .catch((e) => console.error(e));
        if (this._state >= Context.STATE_CONSTRUCTED) {
            fragment.onConstruct(this.constructParameters);
        }
        if (this._state >= Context.STATE_VIEW_LOADED) {
            Promise.all([this._viewLoadedPromise, fragment.getViewPromise()]).then(() => fragment.callOnViewLoaded());
        }
        if (this._state >= Context.STATE_RUNNING) {
            fragment._viewLoadedPromise.then(() => {
                if (this._state >= Context.STATE_RUNNING) {
                    fragment.onStart();
                }
            });
        }
    }

    /**
     * Entfernt ein Fragment.
     *
     * @param fragment
     */
    removeFragment(fragment: AbstractFragment<any>) {
        const index = this._fragments.indexOf(fragment);
        if (index !== -1) {
            this._fragments.splice(index, 1);
        }
        fragment._viewPromise.then((res) => res.remove());
        this._fragments.push(fragment);
        if (this._state < Context.STATE_PAUSED) {
            fragment.onPause();
        }
        if (this._state < Context.STATE_DESTROYING) {
            fragment.onDestroy();
        }
    }

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
    findBy(query: any, all?: any, asPromise?: any) {
        all = Helper.nonNull(all, false);
        asPromise = Helper.nonNull(asPromise, false);

        const getVal = (root: any) => {
            let res = null;
            if (all) {
                res = root.querySelectorAll(query);
                if (root.matches(query)) {
                    res.push(root);
                }
            } else if (root.matches(query)) {
                res = root;
            } else {
                res = root.querySelector(query);
            }
            return res;
        };

        if (asPromise) {
            return this._viewPromise.then((rootView) => {
                return getVal(rootView);
            });
        }
        return getVal(this._view);
    }

    find(selector: string): HTMLElement {
        if (this._view.matches(selector)) {
            return this._view;
        }
        return this._view.querySelector(selector);
    }

    findAll(selector: string): NodeListOf<HTMLElement> {
        const res = this._view.querySelectorAll(selector);
        if (this._view.matches(selector)) {
            res.push(this._view);
        }
        return res;
    }

    /**
     * Setzt die PauseParameters
     * @param pauseParameters
     */
    setPauseParameters(pauseParameters: any) {
        this._pauseParameters = pauseParameters;
    }

    /**
     * Gibt das ViewPromise zurück
     * @returns {*}
     */
    getViewPromise() {
        return this._viewPromise;
    }

    getViewLoadedPromise() {
        return this._viewLoadedPromise;
    }

    getView() {
        return this._view;
    }
}
