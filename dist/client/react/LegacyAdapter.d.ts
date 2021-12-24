import { AbstractSite } from '../Context/AbstractSite';
export declare type LegacyAdapterProps = {
    Site: typeof AbstractSite;
    startParams?: Record<string, any> | Promise<Record<string, any>>;
};
declare function LegacyAdapter({ Site, startParams }: LegacyAdapterProps): any;
declare const tmp: typeof LegacyAdapter;
export { tmp as LegacyAdapter };
