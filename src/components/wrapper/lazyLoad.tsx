import { Suspense } from "react";
import Spinner from "../ui/Spinner";

import type { LazyExoticComponent, ComponentType } from "react";

export function lazyComponent<T extends object>(
    LazyComponent: LazyExoticComponent<ComponentType<T>>
) {
    return (props: T) => (
        <Suspense fallback={<Spinner />}>
            <LazyComponent {...props} />
        </Suspense>
    );
}
