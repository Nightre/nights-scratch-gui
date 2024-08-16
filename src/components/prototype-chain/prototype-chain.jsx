import React from "react";
import { connect } from "react-redux";

const PrototypeChain = ({ editingTargetId, spritesState }) => {

    const ComponentInfo = ({ targetId, first }) => {
        const sprite = spritesState[targetId];
        if (!sprite) {
            return <></>
        }
        return (
            <div style={{ display: 'flex' }}>
                {!first && (
                    <div style={{ borderLeft: '1px solid black', marginRight: '10px' }}></div>
                )}
                <div>
                    <p style={{ margin: '0' }}>{sprite.name}</p>
                    <div style={{ marginLeft: '20px' }}>
                        {sprite.components.map(id => (
                            <ComponentInfo key={id} targetId={id} first={false} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <ComponentInfo targetId={editingTargetId} first={true} />
        </div>
    );
}

const mapStateToProps = (state) => ({
    spritesState: state.scratchGui.targets.sprites,
    editingTargetId: state.scratchGui.targets.editingTarget,
    vm: state.scratchGui.vm
});

export default connect(mapStateToProps)(PrototypeChain);