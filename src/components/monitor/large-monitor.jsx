import React from 'react';
import PropTypes from 'prop-types';
import styles from './monitor.css';
import ValueRender from '../value-render/value-render.jsx';

const LargeMonitor = ({categoryColor, value}) => (
    <div className={styles.largeMonitor}>
        <div
            className={styles.largeValue}
            style={{
                background: categoryColor.background,
                color: categoryColor.text
            }}
        >
            <ValueRender value={value}/>
        </div>
    </div>
);

LargeMonitor.propTypes = {
    categoryColor: PropTypes.shape({
        background: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
};

export default LargeMonitor;
