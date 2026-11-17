import { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/Skeleton.jsx';

// recharts is zwaar (ruim 100 KB gzip). Dit scherm laadt de grafiek pas als hij
// echt getoond wordt, zodat de kaart en de lijsten er niet op hoeven te wachten.
const ZoomableChart = lazy(() => import('./ZoomableChart.jsx'));

export default function LazyZoomableChart(props) {
    return (
        <Suspense fallback={<Skeleton className="h-72 w-full" rounded="rounded-xl" />}>
            <ZoomableChart {...props} />
        </Suspense>
    );
}
