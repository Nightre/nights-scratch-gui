import React, { useState } from "react";
import { connect } from "react-redux";
import styles from "./add-component-btn.css";
import { updateTargets } from "../../reducers/targets";

const SelectComponent = ({ spritesState, onChange, editingTarget: editingTargetId }) => {
    // 处理选择的变化并将选中的数据传递回父组件
    const handleChange = (event) => {
        const selectedId = event.target.value;
        const selectedData = spritesState[selectedId];
        onChange(selectedData); // 将选中的数据传递回父组件
    };
    const handleCancle = () => {
        onChange();
    }

    return (
        <div>
            <select onChange={handleChange}>
                <option value="">请选择添加的组件</option>
                {Object.values(spritesState).map((data, index) => (
                    data.id !== editingTargetId &&
                    <option value={data.id} key={index}>
                        {data.name}
                    </option>
                ))}
            </select>
            <button onClick={handleCancle}>取消</button>
        </div>
    );
};
// Define the AddComponentBtn component
const AddComponentBtn = ({ spritesState, editingTarget, vm, onTargetListChange }) => {
    const [open, setOpen] = useState(false);

    const handleClickAdd = () => {
        setOpen(true);
    };

    const handleSelect = (data) => {
        setOpen(false);
        const target = vm.runtime.getTargetById(data.id)
        if (!target) return
        if (!vm.runtime.getTargetById(editingTarget).addComponet(target)) {
            alert("无法建立循环依赖")
        }
    };

    if (open) {
        return <SelectComponent spritesState={spritesState} editingTarget={editingTarget} onChange={handleSelect} />;
    }

    return (
        <button className={styles.btn} onClick={handleClickAdd}>
            添加组件
        </button>
    );
};

// Map state to props for AddComponentBtn
const mapStateToProps = (state) => ({
    spritesState: state.scratchGui.targets.sprites,
    editingTarget: state.scratchGui.targets.editingTarget,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({

});

// Connect AddComponentBtn to the Redux store
export default connect(mapStateToProps, mapDispatchToProps)(AddComponentBtn);