import styles from './side-tab.css';
import React from 'react';

const SideTab = () => {
    return <div className={styles.sideTab}>
        <button>场景</button>
        <button>角色</button>
        <button>组件</button>
        <button>资源</button>        
    </div>
}

export default SideTab