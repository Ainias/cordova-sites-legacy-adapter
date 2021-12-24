import * as React from 'react';
import { AbstractSite } from '../Context/AbstractSite';
import { useEffect, useState } from 'react';
import { useSites, useSiteId, useIsVisible } from 'cordova-sites';

export type LegacyAdapterProps = {
    Site: typeof AbstractSite;
    startParams?: Record<string, any> | Promise<Record<string, any>>;
};

function LegacyAdapter({ Site, startParams }: LegacyAdapterProps) {
    // TODO UpdateTitle
    // TODO Finish-Result
    // TODO GoBack, onBackPressed
    // TODO addEventListener
    // TODO OnBeforeUnload

    // Variables

    // States
    const [pauseArgs, setPauseArgs] = useState<any>(undefined);
    const [isViewLoaded, setIsViewLoaded] = useState(false);
    const [isConstructed, setIsConstructed] = useState(false);
    const [onConstructCalled, setOnConstructCalled] = useState(false);
    const [isViewLoadedDone, setIsViewLoadedDone] = useState(false);
    const [onViewLoadedCalled, setOnViewLoadedCalled] = useState(false);
    const [isDestroying, setIsDestroying] = useState(false);
    const [siteContainer] = useState<{ site: undefined | AbstractSite }>({ site: undefined });
    if (!siteContainer.site) {
        siteContainer.site = new Site(undefined);
    }
    const { site } = siteContainer;

    const isVisible = useIsVisible();
    const id = useSiteId();
    const sites = useSites();

    // Refs

    // Callbacks
    const onFinish = async () => {
        setIsDestroying(true);
        if (onViewLoadedCalled && isVisible) {
            await site.onPause();
        }
        await site.onDestroy();
        if (id) {
            sites?.removeSite(id);
        }
    };
    site.setOnFinishListener(onFinish);

    const onStartSite = async (NewSite: typeof AbstractSite, args?: any) => {
        sites?.startSite(LegacyAdapter, { Site: NewSite, startParams: args });
    };
    site.setOnStartSiteListener(onStartSite);
    // Effects

    // Other

    if (!onConstructCalled) {
        Promise.resolve(startParams).then((params) => {
            if (!onConstructCalled) {
                setOnConstructCalled(true);
                site.onConstruct(params).then(() => {
                    setIsConstructed(true);
                });
            }
        });
    }

    if (!isViewLoaded) {
        site.getViewPromise().then(() => setIsViewLoaded(true));
    }

    if (isConstructed && isViewLoaded && !onViewLoadedCalled && !isDestroying) {
        setOnViewLoadedCalled(true);
        site.callOnViewLoaded().then(() => setIsViewLoadedDone(true));
    }

    useEffect(() => {
        if (isViewLoadedDone) {
            if (isVisible) {
                site.onStart(pauseArgs);
            } else {
                site.onPause().then((res) => setPauseArgs(res));
            }
        }
    }, [isViewLoadedDone, isVisible, pauseArgs, site]);

    // Render Functions
    if (isViewLoadedDone) {
        return site.getView();
    }
    // TODO loading symbol
    return <span>Loading...</span>;
}

const tmp = React.memo(LegacyAdapter) as typeof LegacyAdapter;
export { tmp as LegacyAdapter };
