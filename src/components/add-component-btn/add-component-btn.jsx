import React, { useState } from "react";
import { connect } from "react-redux";
import styles from "./add-component-btn.css";

const SelectComponent = ({ spritesState, onChange, editingTarget: editingTargetId }) => {
    // 创建 state 来管理 <select> 的当前值
    const [selectedValue, setSelectedValue] = useState('');

    const handleChange = (event) => {
        const selectedId = event.target.value;
        const selectedData = spritesState[selectedId];
        onChange(selectedData);

        setSelectedValue('');
    };
    console.log(spritesState)
    return (
        <div>
            <select disabled={Object.values(spritesState).length <= 1} className={styles.select} value={selectedValue} onChange={handleChange}>
                <option value="" disabled hidden>
                    添加组件
                </option>
                {Object.values(spritesState).map((data, index) => (
                    data.id !== editingTargetId && (
                        <option value={data.id} key={index}>
                            {data.name}
                        </option>
                    )
                ))}
            </select>
        </div>
    );
};

const AddComponentBtn = ({ spritesState, editingTarget, vm }) => {
    const handleSelect = (data) => {
        const target = vm.runtime.getTargetById(data.id)
        if (!target) return
        if (!vm.runtime.getTargetById(editingTarget).addComponet(target)) {
            alert("无法建立循环依赖")
        } else {
            vm.emitWorkspaceUpdate()
        }
    };

    return <SelectComponent spritesState={spritesState} editingTarget={editingTarget} onChange={handleSelect} />;
};

const mapStateToProps = (state) => ({
    spritesState: state.scratchGui.targets.sprites,
    editingTarget: state.scratchGui.targets.editingTarget,
    vm: state.scratchGui.vm
});


export default connect(mapStateToProps)(AddComponentBtn);