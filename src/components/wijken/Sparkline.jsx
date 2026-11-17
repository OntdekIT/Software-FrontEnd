import PropTypes from 'prop-types';
import { INK } from '../../utils/theme-colors.js';

// Minilijn van een reeks. Gaten (null) onderbreken de lijn in plaats van naar 0 te zakken.
export default function Sparkline({ values, width = 96, height = 28, color = INK }) {
    const nums = values.filter(v => v !== null && v !== undefined);
    if (nums.length < 2) {
        return <span className="text-xs text-muted" aria-label="Geen verloop beschikbaar">Geen verloop</span>;
    }
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || 1;
    const pad = 3;
    const step = (width - pad * 2) / Math.max(values.length - 1, 1);
    const y = v => height - pad - ((v - min) / span) * (height - pad * 2);

    const segments = [];
    let current = [];
    values.forEach((v, i) => {
        if (v === null || v === undefined) {
            if (current.length) segments.push(current);
            current = [];
        } else {
            current.push(`${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`);
        }
    });
    if (current.length) segments.push(current);

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Verloop over 24 uur">
            {segments.map((points, i) => (
                points.length === 1
                    ? <circle key={i} cx={points[0].split(',')[0]} cy={points[0].split(',')[1]} r="1.5" fill={color} />
                    : <polyline key={i} points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.75"
                        strokeLinejoin="round" strokeLinecap="round" />
            ))}
        </svg>
    );
}

Sparkline.propTypes = {
    values: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string,
};
