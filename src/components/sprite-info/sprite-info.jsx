import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import DirectionPicker from '../../containers/direction-picker.jsx';

import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';

import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants.js';
import { isWideLocale } from '../../lib/locale-utils.js';

import styles from './sprite-info.css';

import xIcon from './icon--x.svg';
import yIcon from './icon--y.svg';
import showIcon from '!../../lib/tw-recolor/build!./icon--show.svg';
import hideIcon from '!../../lib/tw-recolor/build!./icon--hide.svg';
import ToggleButtons from '../toggle-buttons/toggle-buttons.jsx';
import AddComponentBtn from '../add-component-btn/add-component-btn.jsx';
import ComponentAttribute from "../component-attribute/component-attribute.jsx"
import CustomAttributes from '../custom-attributes/custom-attributes.jsx';
import PrototypeChain from './../prototype-chain/prototype-chain.jsx';
const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    spritePlaceholder: {
        id: 'gui.SpriteInfo.spritePlaceholder',
        defaultMessage: 'Name',
        description: 'Placeholder text for sprite name'
    },
    showSpriteAction: {
        id: 'gui.SpriteInfo.showSpriteAction',
        defaultMessage: 'Show sprite',
        description: 'Tooltip for show sprite button'
    },
    hideSpriteAction: {
        id: 'gui.SpriteInfo.hideSpriteAction',
        defaultMessage: 'Hide sprite',
        description: 'Tooltip for hide sprite button'
    }
});

class SpriteInfo extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            this.props.rotationStyle !== nextProps.rotationStyle ||
            this.props.disabled !== nextProps.disabled ||
            this.props.name !== nextProps.name ||
            this.props.stageSize !== nextProps.stageSize ||
            this.props.visible !== nextProps.visible ||
            // Only update these if rounded value has changed
            Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
            Math.round(this.props.size) !== Math.round(nextProps.size) ||
            Math.round(this.props.x) !== Math.round(nextProps.x) ||
            Math.round(this.props.y) !== Math.round(nextProps.y)
        );
    }
    render() {
        const {
            stageSize,
        } = this.props;

        const sprite = (
            <FormattedMessage
                defaultMessage="Sprite"
                description="Sprite info label"
                id="gui.SpriteInfo.sprite"
            />
        );
        const showLabel = (
            <FormattedMessage
                defaultMessage="Show"
                description="Sprite info show label"
                id="gui.SpriteInfo.show"
            />
        );
        const sizeLabel = (
            <FormattedMessage
                defaultMessage="Size"
                description="Sprite info size label"
                id="gui.SpriteInfo.size"
            />
        );

        const labelAbove = isWideLocale(this.props.intl.locale);

        const spriteNameInput = (
            <BufferedInput
                className={classNames(
                    styles.spriteInput,
                    {
                        [styles.columnInput]: labelAbove
                    }
                )}
                disabled={this.props.disabled}
                placeholder={this.props.intl.formatMessage(messages.spritePlaceholder)}
                tabIndex="0"
                type="text"
                value={this.props.disabled ? '' : this.props.name}
                onSubmit={this.props.onChangeName}
            />
        );

        const xPosition = (
            <div className={styles.group}>
                {
                    (stageSize === STAGE_DISPLAY_SIZES.full || stageSize === STAGE_DISPLAY_SIZES.large) ?
                        <div className={styles.iconWrapper}>
                            <img
                                aria-hidden="true"
                                className={classNames(styles.xIcon, styles.icon)}
                                src={xIcon}
                                draggable={false}
                            />
                        </div> :
                        null
                }
                <Label text="x">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="x"
                        tabIndex="0"
                        type="number"
                        value={this.props.disabled ? '' : Math.round(this.props.x)}
                        onSubmit={this.props.onChangeX}
                    />
                </Label>
            </div>
        );

        const yPosition = (
            <div className={styles.group}>
                {
                    (stageSize === STAGE_DISPLAY_SIZES.full || stageSize === STAGE_DISPLAY_SIZES.large) ?
                        <div className={styles.iconWrapper}>
                            <img
                                aria-hidden="true"
                                className={classNames(styles.yIcon, styles.icon)}
                                src={yIcon}
                                draggable={false}
                            />
                        </div> :
                        null
                }
                <Label text="y">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="y"
                        tabIndex="0"
                        type="number"
                        value={this.props.disabled ? '' : Math.round(this.props.y)}
                        onSubmit={this.props.onChangeY}
                    />
                </Label>
            </div>
        );

        if (stageSize === STAGE_DISPLAY_SIZES.small) {
            return (
                <Box className={styles.spriteInfo}>
                    <div className={classNames(styles.row)}>
                        <div className={styles.group}>
                            {spriteNameInput}
                        </div>
                    </div>
                    <div className={classNames(styles.row, styles.rowSecondary)}>
                        {xPosition}
                        {yPosition}
                    </div>
                    <p>请使用大舞台模式查看更多属性</p>
                </Box>
            );
        }

        return (
            <Box className={styles.spriteInfo}>
                <h3 className={classNames(styles.title)}>属性</h3>

                <div className={classNames(styles.row)}>
                    <div className={styles.group}>
                        <Label
                            above={labelAbove}
                            text={sprite}
                        >
                            {spriteNameInput}
                        </Label>
                    </div>
                </div>
                <div className={classNames(styles.row)}>
                    {xPosition}
                    {yPosition}

                    <ToggleButtons
                        className={styles.ml}
                        buttons={[
                            {
                                handleClick: this.props.onClickVisible,
                                icon: showIcon,
                                isSelected: this.props.visible && !this.props.disabled,
                                title: this.props.intl.formatMessage(messages.showSpriteAction)
                            },
                            {
                                handleClick: this.props.onClickNotVisible,
                                icon: hideIcon,
                                isSelected: !this.props.visible && !this.props.disabled,
                                title: this.props.intl.formatMessage(messages.hideSpriteAction)
                            }
                        ]}
                        disabled={this.props.disabled}
                    />
                </div>

                <div className={classNames(styles.row, styles.largerInput)}>
                    <Label
                        secondary
                        above={labelAbove}
                        text={sizeLabel}
                    >
                        <BufferedInput
                            small
                            disabled={this.props.disabled}
                            label={sizeLabel}
                            tabIndex="0"
                            type="number"
                            value={this.props.disabled ? '' : Math.round(this.props.size)}
                            onSubmit={this.props.onChangeSize}
                        />
                    </Label>
                    <div className={styles.ml}>
                        <DirectionPicker
                            direction={Math.round(this.props.direction)}
                            disabled={this.props.disabled}
                            labelAbove={labelAbove}
                            rotationStyle={this.props.rotationStyle}
                            onChangeDirection={this.props.onChangeDirection}
                            onChangeRotationStyle={this.props.onChangeRotationStyle}
                        />
                    </div>

                </div>
                {
                    !this.props.isStage && <>
                        <h3 className={classNames(styles.title)}>组件</h3>
                        <AddComponentBtn/>
                        <ComponentAttribute/>
                        <h3 className={classNames(styles.title)}>组件树</h3>
                        <PrototypeChain/>
                    </>
                }
            </Box>
        );
    }
}

SpriteInfo.propTypes = {
    direction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    isStage: PropTypes.bool,
    disabled: PropTypes.bool,
    intl: intlShape,
    name: PropTypes.string,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeRotationStyle: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    onClickNotVisible: PropTypes.func,
    onClickVisible: PropTypes.func,
    rotationStyle: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    visible: PropTypes.bool,
    x: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    y: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default injectIntl(SpriteInfo);
