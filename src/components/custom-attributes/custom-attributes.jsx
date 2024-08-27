import React from "react"
import { connect } from "react-redux"

const AddCustomAttributes = ({ onClick }) => {
    return <button onClick={onClick}>添加自定义属性</button>
}
export const ComponetAttributes = ({ target, onChange, onReset, onDelete, override = [] }) => {
    const attributeData = Object.entries(target.exportAttribute)
    
    return attributeData.map((data, index) =>
        <div key={index}>
            <label>{data[0]}</label>
            <input type="text" value={override[data[0]] ?? data[1]} onChange={(event) => onChange(data[0], event)} />
            {onReset && override[data[0]] && <button onClick={() => onReset(data[0])}>同步于默认</button>}
            {onDelete && <button onClick={() => onDelete(data[0])}>-</button>}
        </div>
    )
}
const CustomAttributes = ({ editingTarget, vm }) => {
    const target = vm.runtime.getTargetById(editingTarget)
    if (!target) return <></>


    const handleAdd = () => {
        let name = prompt("新建属性名");

        if (!name) return;

        if (target.getAtribute(name)) return

        target.setAtribute(name, "");
    }
    const handleChange = (key, event) => {
        const newValue = event.target.value;
        target.setAtribute(key, newValue);
    }
    const handleDelete = (key) => {
        target.removeAtribute(key)
    }

    return <>
        <AddCustomAttributes onClick={handleAdd} />
        <ComponetAttributes target={target} onChange={handleChange} onDelete={handleDelete} />
    </>
}

const mapStateToProps = (state) => ({
    spritesState: state.scratchGui.targets.sprites,
    editingTarget: state.scratchGui.targets.editingTarget,
    vm: state.scratchGui.vm
});

export default connect(mapStateToProps)(CustomAttributes);