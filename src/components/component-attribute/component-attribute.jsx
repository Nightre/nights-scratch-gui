import React from "react"
import { connect } from "react-redux";
import styles from "./component-attribute.css"

import deleteSvg from "./delete.svg"
import hideSvg from "./hide.svg"
import showSvg from "./show.svg"


// 这里应该通过vm操控target来实现松耦合，但是现在时间不够先这样搞
// 为什么在rendered-target上？因为我要实现单个克隆体删除和挂载（打算移到target上）
const ComponentAttribute = ({ editingTargetId, vm, spritesState }) => { // 需要 spritesState 才能让react在updateTargets里面重新渲染
    const runtime = vm.runtime
    const target = runtime.getTargetById(editingTargetId)

    const handleDelete = (index) => {
        target.removeComponet(index)
    }
    const handleShow = (index) => {
        target.toggleShowComponents(index)
    }
    if (!target) return <></>

    return <div className={styles.col}>

        {
            target.components.map((data, index) =>
                <div key={index} className={styles.card}>
                    <p className={styles.title}>
                        {data.sprite.name}
                        <button onClick={() => handleShow(index)} className={styles.close}>
                            {target.showComponents[index] ?
                                <img src={showSvg} />
                                :
                                <img src={hideSvg} />
                            }</button>
                        <button onClick={() => handleDelete(index)} className={styles.close}>
                            <img src={deleteSvg} />
                        </button>
                    </p>
                </div>
            )
        }
    </div>
}

const mapStateToProps = (state) => ({
    spritesState: state.scratchGui.targets.sprites,
    editingTargetId: state.scratchGui.targets.editingTarget,
    vm: state.scratchGui.vm
});

export default connect(mapStateToProps)(ComponentAttribute);