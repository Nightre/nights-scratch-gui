import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';

import SpriteInfoComponent from '../components/sprite-info/sprite-info.jsx';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

class SpriteInfo extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            'handleClickVisible',
            'handleClickNotVisible',
            'handleChangeSpriteDirection',
            'handleChangeSpriteRotationStyle',
            'handleChangeSpriteName',
            'handleChangeSpriteSize',
            'handleChangeSpriteVisibility',
            'handleChangeSpriteX',
            'handleChangeSpriteY'
        ]);
    }
    handleClickVisible(e) {
        e.preventDefault();
        this.handleChangeSpriteVisibility(true);
    }
    handleClickNotVisible(e) {
        e.preventDefault();
        this.handleChangeSpriteVisibility(false);
    }

    handleChangeSpriteDirection(direction) {
        this.props.vm.postSpriteInfo({ direction });
    }
    handleChangeSpriteRotationStyle(rotationStyle) {
        this.props.vm.postSpriteInfo({ rotationStyle });
    }
    handleChangeSpriteName(name) {
        this.props.vm.renameSprite(this.props.editingTarget, name);
    }
    handleChangeSpriteSize(size) {
        this.props.vm.postSpriteInfo({ size });
    }
    handleChangeSpriteVisibility(visible) {
        this.props.vm.postSpriteInfo({ visible });
    }
    handleChangeSpriteX(x) {
        this.props.vm.postSpriteInfo({ x });
    }
    handleChangeSpriteY(y) {
        this.props.vm.postSpriteInfo({ y });
    }

    render() {
        const { sprites, editingTarget: editingTargetId, stageSize, vm } = this.props
        let selectedSprite = sprites[editingTargetId];
        let spriteInfoDisabled = false;
        if (typeof selectedSprite === 'undefined') {
            selectedSprite = {};
            spriteInfoDisabled = true;
        }

        return (
            <SpriteInfoComponent
                {...this.props}
                sprites={sprites}
                isStage={Object.keys(selectedSprite).length == 0}
                direction={selectedSprite.direction}
                disabled={spriteInfoDisabled}
                name={selectedSprite.name}
                rotationStyle={selectedSprite.rotationStyle}
                size={selectedSprite.size}
                stageSize={stageSize}
                visible={selectedSprite.visible}
                x={selectedSprite.x}
                y={selectedSprite.y}

                onClickNotVisible={this.handleClickNotVisible}
                onClickVisible={this.handleClickVisible}

                onChangeDirection={this.handleChangeSpriteDirection}
                onChangeName={this.handleChangeSpriteName}
                onChangeRotationStyle={this.handleChangeSpriteSize}
                onChangeSize={this.handleChangeSpriteSize}
                onChangeVisibility={this.handleChangeSpriteVisibility}
                onChangeX={this.handleChangeSpriteX}
                onChangeY={this.handleChangeSpriteY}

            />
        );
    }
}


const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    spriteLibraryVisible: state.scratchGui.modals.spriteLibrary,
    sprites: state.scratchGui.targets.sprites,
    editingTarget: state.scratchGui.targets.editingTarget,
    stageSize: state.scratchGui.stageSize.stageSize,
});

export default injectIntl(connect(
    mapStateToProps,
)(SpriteInfo));
