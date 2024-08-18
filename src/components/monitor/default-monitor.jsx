import React from 'react';
import PropTypes from 'prop-types';
import styles from './monitor.css';
import ValueRender from '../value-render/value-render.jsx';

const DefaultMonitor = ({categoryColor, label, value}) => (
    
    <div className={styles.defaultMonitor}>
        <div className={styles.row}>
            <div className={styles.label}>
                {label}
            </div>
            <div
                className={styles.value}
                style={{
                    background: categoryColor.background,
                    color: categoryColor.text
                }}
            >
                <ValueRender value={value}/>
            </div>
        </div>
    </div>
);

DefaultMonitor.propTypes = {
    categoryColor: PropTypes.shape({
        background: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
    label: PropTypes.string.isRequired,
};

export default DefaultMonitor;
