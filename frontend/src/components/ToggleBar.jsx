import React from 'react';

const metricColors = {
    cpu: 'red',
    mem: 'blue',
    rx: 'green',
    tx: 'orange',
};

const metricLabels = {
    cpu: 'CPU (%)',
    mem: 'Memory (MB)',
    rx: 'Net RX (MB)',
    tx: 'Net TX (MB)',
};

export default function ToggleBar({ toggles, setToggles }) {
    return (
        <div id="toggles" style={{ textAlign: 'center', marginBottom: '1.5em' }}>
            {Object.keys(toggles).map(metric => (
                <label
                    key={metric}
                    className="toggle-label"
                    style={{ '--color': metricColors[metric] }}
                >
                    <input
                        type="checkbox"
                        checked={toggles[metric]}
                        onChange={e => setToggles(t => ({ ...t, [metric]: e.target.checked }))}
                    />
                    {metricLabels[metric].split(' ')[0]}
                </label>
            ))}
        </div>
    );
}
