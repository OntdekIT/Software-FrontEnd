import PropTypes from "prop-types";
import {formatBucket} from "./coverage-format.js";

// One cell per time bucket: filled when the station delivered particulate
// matter data in that bucket, red when it did not. Shows at a glance whether
// a station misses data now and then or was down for a longer stretch.
export default function CoverageStrip({buckets, timeline, granularity}) {
    return (
        <div className="flex h-5 w-full min-w-48 overflow-hidden rounded-sm border border-gray-200" role="img"
             aria-label={`${timeline.filter(c => c > 0).length} van ${timeline.length} perioden met fijnstofdata`}>
            {timeline.map((count, i) => (
                <div
                    key={buckets[i]}
                    className={`h-full flex-1 ${count > 0 ? "bg-success" : "bg-danger/70"}`}
                    title={`${formatBucket(buckets[i], granularity)}: ${count} fijnstofmeting(en)`}
                />
            ))}
        </div>
    );
}

CoverageStrip.propTypes = {
    buckets: PropTypes.arrayOf(PropTypes.string).isRequired,
    timeline: PropTypes.arrayOf(PropTypes.number).isRequired,
    granularity: PropTypes.oneOf(["hour", "day"]).isRequired,
};
