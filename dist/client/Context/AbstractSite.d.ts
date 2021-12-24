import { Context } from './Context';
/**
 * Basisklasse für eine Seite
 */
export declare class AbstractSite extends Context {
    static EVENT: any;
    _isDestroying: boolean;
    _finishPromiseResolver: any;
    _finishPromise: any;
    _onConstructPromise: any;
    _parameters: any;
    _result: any;
    _title: any;
    _loadingSymbol: any;
    _historyId: any;
    private onFinishListener;
    private onStartSiteListener;
    /**
     * Construktor für eine Seite, sollte überladen werden und view sollte definiert werden. Seitenkonstruktoren bekommen NUR den siteManager übergebn
     * @param siteManager
     * @param view
     */
    constructor(_siteManager: any, view?: any);
    setOnFinishListener(onFinishListener: any): void;
    setOnStartSiteListener(onStartSiteListener: any): void;
    getTitle(): any;
    onConstruct(constructParameters: any): Promise<any[]>;
    onStart(pauseArguments: any): Promise<void>;
    onViewLoaded(): Promise<any[]>;
    onPause(): Promise<void>;
    onDestroy(): Promise<void>;
    /**
     * Setzt den Titel der Website
     *
     * @param titleElement
     * @param title
     */
    setTitle(titleElement: HTMLElement | string, title?: any): void;
    setParameter(name: any, value: any): void;
    setParameters(parameters: any): void;
    getParameters(): any;
    showLoadingSymbol(): Promise<void>;
    removeLoadingSymbol(): Promise<void>;
    onBeforeUnload(_e: any): null | string;
    /**
     * Updatet den Title der Webseite
     * @protected
     */
    _updateTitle(): void;
    updateUrl(_args: any): void;
    /**
     * Startet eine andere Seite mit den angegebenen Parametern
     *
     * @param site
     * @param args
     * @returns {*|Promise<*>}
     */
    startSite(site: typeof AbstractSite, args?: any): void;
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
    finishAndStartSite(site: any, args?: any, result?: any): void;
    /**
     * Beendet die aktuelle Seite. Kann ein Ergebnis setzen
     *
     * @param result
     */
    finish(result?: any): void;
    goBack(): void;
    /**
     * Wird aufgerufen, falls zurück gedrückt wird. Gib false zurück, um das beenden der Seite zu verhindern
     */
    onBackPressed(): void;
    /**
     * TODO Einbauen
     */
    onMenuPressed(): void;
    /**
     * TODO Einbauen
     */
    onSearchPressed(): void;
    /**
     * Gibt das FinishPromise zurück
     * @returns {Promise<any>}
     */
    getFinishPromise(): any;
    /**
     * Setzt das Resultat. Letztes Setzen gilt
     * @param result
     */
    setResult(result: any): void;
    /**
     * Gibt den FinishResolver zurück. Genutzt, um FinishPromise zu resolven order rejecten
     * @returns {*}
     */
    getFinishResolver(): any;
    addEventListener(_siteEvent: any, _listener: any): void;
    isDestroying(): boolean;
}
