
const modifyBlockly = (Blockly, vm) => {

    const jsonForMenuBlock = function (name, menuOptionsFn, colors) {
        return {
            message0: '%1',
            args0: [
                {
                    name,
                    type: 'field_dropdown',
                    options: function () {
                        return menuOptionsFn();
                    }
                }
            ],
            inputsInline: true,
            output: 'String',
            colour: colors.secondary,
            colourSecondary: colors.secondary,
            colourTertiary: colors.tertiary,
            colourQuaternary: colors.quaternary,
            outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND
        };
    };
    Blockly.BlockSvg.prototype.renderCompute_ = function (iconWidth) {
        var inputList = this.inputList;
        var inputRows = [];
        // Block will be drawn from 0 (left edge) to rightEdge, in px.
        inputRows.rightEdge = 0;
        // Drawn from 0 to bottomEdge vertically.
        inputRows.bottomEdge = 0;
        var fieldValueWidth = 0;  // Width of longest external value field.
        var fieldStatementWidth = 0;  // Width of longest statement field.
        var hasValue = false;
        var hasStatement = false;
        var hasDummy = false;
        var lastType = undefined;
        var maxWdith = 0

        // Previously created row, for special-casing row heights on C- and E- shaped blocks.
        var previousRow;
        for (var i = 0, input; input = inputList[i]; i++) {
            if (!input.isVisible()) {
                continue;
            }
            var isSecondInputOnProcedure = this.type == 'procedures_definition' && lastType && lastType == Blockly.NEXT_STATEMENT;

            var row;

            // Don't create a new row for the second dummy input on a procedure block.
            // See github.com/LLK/scratch-blocks/issues/1658
            // In all other cases, statement and value inputs catch all preceding dummy
            // inputs, and cause a line break before following inputs.
            let CanNewRow = (!isSecondInputOnProcedure && (!lastType || lastType == Blockly.NEXT_STATEMENT || input.type == Blockly.NEXT_STATEMENT))
            if (this.forceBreak && !this.collapse) {
                if (previousRow && previousRow.length >= this.inputPerRow) {
                    CanNewRow = true
                }
                if (i == 1) {
                    CanNewRow = true
                }
            }
            if (CanNewRow) {
                lastType = input.type;
                row = this.createRowForInput_(input);
                inputRows.push(row);
            } else {
                row = inputRows[inputRows.length - 1];
            }
            row.push(input);

            // Compute minimum dimensions for this input.
            input.renderHeight = this.computeInputHeight_(input, row, previousRow);
            input.renderWidth = this.computeInputWidth_(input);

            // If the input is a statement input, determine if a notch
            // should be drawn at the inner bottom of the C.
            row.statementNotchAtBottom = true;
            if (input.connection && input.connection.type === Blockly.NEXT_STATEMENT) {
                var linkedBlock = input.connection.targetBlock();
                if (linkedBlock && !linkedBlock.lastConnectionInStack()) {
                    row.statementNotchAtBottom = false;
                }
            }

            // Expand input size.
            if (input.connection) {
                var linkedBlock = input.connection.targetBlock();
                var paddedHeight = 0;
                var paddedWidth = 0;
                if (linkedBlock) {
                    // A block is connected to the input - use its size.
                    var bBox = linkedBlock.getHeightWidth();
                    paddedHeight = bBox.height;
                    paddedWidth = bBox.width;
                } else {
                    // No block connected - use the size of the rendered empty input shape.
                    paddedHeight = Blockly.BlockSvg.INPUT_SHAPE_HEIGHT;
                }
                if (input.connection.type === Blockly.INPUT_VALUE) {
                    paddedHeight += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
                }
                if (input.connection.type === Blockly.NEXT_STATEMENT) {
                    // Subtract height of notch, only if the last block in the stack has a next connection.
                    if (row.statementNotchAtBottom) {
                        paddedHeight -= Blockly.BlockSvg.NOTCH_HEIGHT;
                    }
                }
                input.renderHeight = Math.max(input.renderHeight, paddedHeight);
                input.renderWidth = Math.max(input.renderWidth, paddedWidth);
            }
            row.height = Math.max(row.height, input.renderHeight);
            input.fieldWidth = 0;
            if (inputRows.length == 1) {
                // The first row gets shifted to accommodate any icons.
                input.fieldWidth += this.RTL ? -iconWidth : iconWidth;
            }
            var previousFieldEditable = false;
            for (var j = 0, field; field = input.fieldRow[j]; j++) {
                if (j != 0) {
                    input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
                }
                // Get the dimensions of the field.
                var fieldSize = field.getSize();
                field.renderWidth = fieldSize.width;
                field.renderSep = (previousFieldEditable && field.EDITABLE) ?
                    Blockly.BlockSvg.SEP_SPACE_X : 0;
                // See github.com/LLK/scratch-blocks/issues/1658
                if (!isSecondInputOnProcedure) {
                    input.fieldWidth += field.renderWidth + field.renderSep;
                }
                row.height = Math.max(row.height, fieldSize.height);
                previousFieldEditable = field.EDITABLE;
            }

            if (row.type != Blockly.BlockSvg.INLINE) {
                if (row.type == Blockly.NEXT_STATEMENT) {
                    hasStatement = true;
                    fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
                } else {
                    if (row.type == Blockly.INPUT_VALUE) {
                        hasValue = true;
                    } else if (row.type == Blockly.DUMMY_INPUT) {
                        hasDummy = true;
                    }
                    fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
                }
            }
            maxWdith = Math.max(maxWdith, input.fieldWidth)
            previousRow = row;
        }
        // Compute padding for output blocks.
        // Data is attached to the row.
        this.computeOutputPadding_(inputRows);

        // Compute the statement edge.
        // This is the width of a block where statements are nested.
        inputRows.statementEdge = Blockly.BlockSvg.STATEMENT_INPUT_EDGE_WIDTH +
            fieldStatementWidth;

        // Compute the preferred right edge.
        inputRows.rightEdge = this.computeRightEdge_(inputRows.rightEdge,
            hasStatement);

        // Bottom edge is sum of row heights
        for (var i = 0; i < inputRows.length; i++) {
            inputRows.bottomEdge += inputRows[i].height;
        }

        inputRows.hasValue = hasValue;
        inputRows.hasStatement = hasStatement;
        inputRows.hasDummy = hasDummy;

        return inputRows;
    };

    Blockly.BlockSvg.prototype.renderDraw_ = function (iconWidth, inputRows) {
        this.startHat_ = false;
        // Should the top left corners be rounded or square?
        // Currently, it is squared only if it's a hat.
        this.squareTopLeftCorner_ = false;
        if (!this.outputConnection && !this.previousConnection) {
            // No output or previous connection.
            this.squareTopLeftCorner_ = true;
            this.startHat_ = true;
            inputRows.rightEdge = Math.max(inputRows.rightEdge, 100);
        }

        // Amount of space to skip drawing the top and bottom,
        // to make room for the left and right to draw shapes (curves or angles).
        this.edgeShapeWidth_ = 0;
        this.edgeShapeHeight_ = 0;
        this.edgeShape_ = null;
        if (this.outputConnection) {
            // Width of the curve/pointy-curve
            var shape = this.getOutputShape();
            if (shape === Blockly.OUTPUT_SHAPE_HEXAGONAL || shape === Blockly.OUTPUT_SHAPE_ROUND) {
                this.edgeShapeWidth_ = inputRows.bottomEdge / 2;
                this.squareTopLeftCorner_ = true;
                this.edgeShape_ = shape;
            }
            if (this.forceBreak) {
                this.edgeShapeWidth_ = 0
                this.edgeShapeHeight_ = inputRows.bottomEdge
            }
        }

        // Assemble the block's path.
        var steps = [];

        this.renderDrawTop_(steps, inputRows.rightEdge);
        var cursorY = this.renderDrawRight_(steps, inputRows, iconWidth);
        this.renderDrawBottom_(steps, cursorY);
        this.renderDrawLeft_(steps);

        var pathString = steps.join(' ');
        this.svgPath_.setAttribute('d', pathString);

        if (this.RTL) {
            // Mirror the block's path.
            // This is awesome.
            this.svgPath_.setAttribute('transform', 'scale(-1 1)');
        }
    };
    Blockly.BlockSvg.prototype.renderDrawTop_ = function (steps, rightEdge) {
        if (this.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE) {
            steps.push('m 0, 0');
            steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_DEFINE_HAT);
        } else {
            // Position the cursor at the top-left starting point.
            if (this.squareTopLeftCorner_) {
                steps.push('m 0,0');
                if (this.startHat_) {
                    steps.push(Blockly.BlockSvg.START_HAT_PATH);
                }
                // Skip space for the output shape
                if (this.edgeShapeWidth_) {
                    steps.push('m ' + this.edgeShapeWidth_ + ',0');
                }
            } else {
                steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
                // Top-left rounded corner.
                steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
            }

            // Top edge.
            if (this.previousConnection) {
                // Space before the notch
                steps.push('H', Blockly.BlockSvg.NOTCH_START_PADDING);
                steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
                // Create previous block connection.
                var connectionX = (this.RTL ?
                    -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
                this.previousConnection.setOffsetInBlock(connectionX, 0);
            }
        }
        this.width = rightEdge;
    };

    Blockly.BlockSvg.prototype.renderDrawRight_ = function (steps,
        inputRows, iconWidth) {
        var cursorX = 0;
        var cursorY = 0;
        var connectionX, connectionY;
        for (var y = 0, row; row = inputRows[y]; y++) {
            cursorX = row.paddingStart;
            if (y == 0) {
                cursorX += this.RTL ? -iconWidth : iconWidth;
            }

            if (row.type == Blockly.BlockSvg.INLINE) {
                // Inline inputs.
                for (var x = 0, input; input = row[x]; x++) {
                    // Align fields vertically within the row.
                    // Moves the field to half of the row's height.
                    // In renderFields_, the field is further centered
                    // by its own rendered height.
                    var fieldY = cursorY + row.height / 2;

                    var fieldX = Blockly.BlockSvg.getAlignedCursor_(cursorX, input,
                        inputRows.rightEdge);

                    cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
                    if (input.type == Blockly.INPUT_VALUE) {
                        // Create inline input connection.
                        // In blocks with a notch, inputs should be bumped to a min X,
                        // to avoid overlapping with the notch.
                        if (this.previousConnection) {
                            cursorX = Math.max(cursorX, Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X);
                        }
                        connectionX = this.RTL ? -cursorX : cursorX;
                        // Attempt to center the connection vertically.
                        var connectionYOffset = row.height / 2;
                        connectionY = cursorY + connectionYOffset;
                        input.connection.setOffsetInBlock(connectionX, connectionY);
                        this.renderInputShape_(input, cursorX, cursorY + connectionYOffset);
                        cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
                    }
                }
                // Remove final separator and replace it with right-padding.
                cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
                cursorX += row.paddingEnd;
                // Update right edge for all inputs, such that all rows
                // stretch to be at least the size of all previous rows.
                inputRows.rightEdge = Math.max(cursorX, inputRows.rightEdge);
                // Move to the right edge
                cursorX = Math.max(cursorX, inputRows.rightEdge);
                this.width = Math.max(this.width, cursorX);
                if (!this.edgeShape_) {
                    // Include corner radius in drawing the horizontal line.
                    steps.push('H', cursorX - Blockly.BlockSvg.CORNER_RADIUS - this.edgeShapeWidth_);
                    steps.push(Blockly.BlockSvg.TOP_RIGHT_CORNER);
                } else {
                    // Don't include corner radius - no corner (edge shape drawn).
                    steps.push('H', cursorX - this.edgeShapeWidth_);
                }
                // Subtract CORNER_RADIUS * 2 to account for the top right corner
                // and also the bottom right corner. Only move vertically the non-corner length.
                if (!this.edgeShape_) {
                    steps.push('v', row.height - Blockly.BlockSvg.CORNER_RADIUS * 2);
                }
            } else if (row.type == Blockly.NEXT_STATEMENT) {
                // Nested statement.
                var input = row[0];
                var fieldX = cursorX;
                // Align fields vertically within the row.
                // In renderFields_, the field is further centered by its own height.
                var fieldY = cursorY;
                fieldY += Blockly.BlockSvg.MIN_STATEMENT_INPUT_HEIGHT;
                this.renderFields_(input.fieldRow, fieldX, fieldY);
                // Move to the start of the notch.
                cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;

                if (this.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE) {
                    this.renderDefineBlock_(steps, inputRows, input, row, cursorY);
                } else {
                    Blockly.BlockSvg.drawStatementInputFromTopRight_(steps, cursorX,
                        inputRows.rightEdge, row);
                }

                // Create statement connection.
                connectionX = this.RTL ? -cursorX : cursorX;
                input.connection.setOffsetInBlock(connectionX, cursorY);
                if (input.connection.isConnected()) {
                    this.width = Math.max(this.width, inputRows.statementEdge +
                        input.connection.targetBlock().getHeightWidth().width);
                }
                if (this.type != Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE &&
                    (y == inputRows.length - 1 ||
                        inputRows[y + 1].type == Blockly.NEXT_STATEMENT)) {
                    // If the final input is a statement stack, add a small row underneath.
                    // Consecutive statement stacks are also separated by a small divider.
                    steps.push(Blockly.BlockSvg.TOP_RIGHT_CORNER);
                    steps.push('v', Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y - 2 * Blockly.BlockSvg.CORNER_RADIUS);
                    cursorY += Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y;
                }
            }
            cursorY += row.height;
        }

        this.drawEdgeShapeRight_(steps);
        if (!inputRows.length) {
            cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
            steps.push('V', cursorY);
        }
        return cursorY;
    };
    Blockly.BlockSvg.prototype.renderDrawLeft_ = function (steps) {
        if (this.outputConnection) {
            // Scratch-style reporters have output connection y at half block height.
            this.outputConnection.setOffsetInBlock(0, this.height / 2);
        }
        if (this.edgeShape_) {
            // Draw the left-side edge shape.
            if (this.forceBreak) {
                steps.push('l ' + '0' + ' ' + '0' +
                    ' l ' + '0' + ' ' + -this.edgeShapeHeight_);
            } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_ROUND) {
                // Draw a rounded arc.
                steps.push('a ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ + ' 0 0 1 0 -' + this.edgeShapeWidth_ * 2);
            } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
                // Draw a half-hexagon.
                steps.push('l ' + -this.edgeShapeWidth_ + ' ' + -this.edgeShapeWidth_ +
                    ' l ' + this.edgeShapeWidth_ + ' ' + -this.edgeShapeWidth_);
            }
        }
        steps.push('z');
    };
    Blockly.BlockSvg.prototype.drawEdgeShapeRight_ = function (steps) {
        if (this.edgeShape_) {
            // Draw the right-side edge shape.
            if (this.forceBreak) {
                steps.push('l ' + '0' + ' ' + '0' +
                    ' l ' + '0' + ' ' + this.edgeShapeHeight_);
            } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_ROUND) {
                // Draw a rounded arc.
                steps.push('a ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ +
                    ' 0 0 1 0 ' + this.edgeShapeWidth_ * 2);
            } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
                // Draw an half-hexagon.
                steps.push('l ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ +
                    ' l ' + -this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_);
            }
        }
    };
    Blockly.extensible = {};
    Blockly.extensible.attachTextShadow_ = function (input, text) {
        var blockType = 'text';
        Blockly.Events.disable();
        try {
            var newBlock = this.workspace.newBlock(blockType);
            newBlock.setFieldValue(text, 'TEXT');
            newBlock.setShadow(true);
            if (!this.isInsertionMarker()) {
                newBlock.initSvg();
                newBlock.render(false);
            }
        } finally {
            Blockly.Events.enable();
        }
        if (Blockly.Events.isEnabled()) {
            Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
        }
        newBlock.outputConnection.connect(input.connection);
    }
    Blockly.extensible.updateShape = function () {
        var wasRendered = this.rendered;
        this.rendered = false;

        Blockly.Events.setGroup(true);
        var oldExtraState = Blockly.Xml.domToText(this.mutationToDom(this));

        this.updateInput && this.updateInput()

        var newExtraState = Blockly.Xml.domToText(this.mutationToDom(this));

        if (oldExtraState !== newExtraState) {
            console.log(oldExtraState, newExtraState)
            Blockly.Events.fire(
                new Blockly.Events.BlockChange(
                    this, 'mutation', null,
                    oldExtraState, newExtraState, // 状态
                ),
            );
        }

        Blockly.Events.setGroup(false);

        this.rendered = wasRendered;
        if (wasRendered && !this.isInsertionMarker()) {
            this.initSvg();
            this.render();
        }
    }

    class FieldButton extends Blockly.FieldImage {
        constructor(src, onclick) {
            super(src, 25, 25, undefined, false)
            this.initialized = false
            if (onclick) {
                this.onclick = onclick
            }
        }
        init() {
            // Field has already been initialized once.
            super.init()
            if (!this.initialized) {
                // 第一次初始化
                Blockly.bindEventWithChecks_(
                    this.getSvgRoot(), 'mousedown', this, (e) => {
                        e.stopPropagation()
                        // 阻止事件冒泡，要不然你点按钮就会执行积木（点击积木）
                    });
                Blockly.bindEventWithChecks_(
                    this.getSvgRoot(), 'mouseup', this, this.handleClick.bind(this));
                // 绑定上这个按钮点击事件
            }
            this.initialized = true
        }
        handleClick(e) {
            if (!this.sourceBlock_ || !this.sourceBlock_.workspace) {
                return false;
            }
            if (this.sourceBlock_.workspace.isDragging()) {
                return false;
            }
            if (this.sourceBlock_.isInFlyout) {
                return false;
            }
            this.onclick(e)
        }
    }
    // + 按钮
    class PlusButton extends FieldButton {
        constructor(onclick) {
            super(plusImage, onclick)
        }

    }
    // - 按钮
    class MinusButton extends FieldButton {
        constructor(onclick) {
            super(minusImage, onclick)
        }
    }

    class CollapseButton extends FieldButton {
        constructor() {
            super(collapseImage)
            this.updateIcon()
        }
        updateIcon() {
            if (this.sourceBlock_?.collapse) {
                this.setValue(collapseOpen);
            } else {
                this.setValue(collapseImage);
            }
        }
        onclick() {
            const block = this.sourceBlock_
            block.collapse = !block.collapse
            this.updateIcon()
            if (!block.isInsertionMarker()) {
                block.initSvg();
                block.render();
            }
        }
    }
    const collapseOpen = 'data:image/svg+xml;charset=utf-8;base64,CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iOC45NDg3NCIgaGVpZ2h0PSI5LjkxODYyIiB2aWV3Qm94PSIwLDAsOC45NDg3NCw5LjkxODYyIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjM1LjUyNTYzLC0xNzUuMDQwNjkpIj48ZyBmaWxsPSIjZmZmZmZmIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjQyLjI1NzUzLDE3NS4wNDA2OWgyLjIxNjg0djkuOTA5NzNoLTIuMjE2ODR6Ii8+PHBhdGggZD0iTTIzOC43ODE2MSwxNzUuMDQ5NThoMi4yMTY4NHY5LjkwOTczaC0yLjIxNjg0eiIvPjxwYXRoIGQ9Ik0yMzUuNTI1NjMsMTc1LjA0OTU4aDIuMjE2ODRsMCw5LjkwOTczaC0yLjIxNjg0eiIvPjwvZz48L2c+PC9zdmc+'
    const collapseImage = 'data:image/svg+xml;charset=utf-8;base64,CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iOS45MTg2MSIgaGVpZ2h0PSI4Ljk0ODc1IiB2aWV3Qm94PSIwLDAsOS45MTg2MSw4Ljk0ODc1Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjM1LjA0MDY5LC0xNzUuNTI1NjMpIj48ZyBmaWxsPSIjZmZmZmZmIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjM1LjA0MDY5LDE3Ny43NDI0N3YtMi4yMTY4NGg5LjkwOTczdjIuMjE2ODR6Ii8+PHBhdGggZD0iTTIzNS4wNDk1OCwxODEuMjE4Mzl2LTIuMjE2ODRoOS45MDk3M3YyLjIxNjg0eiIvPjxwYXRoIGQ9Ik0yMzUuMDQ5NTgsMTg0LjQ3NDM3di0yLjIxNjg0aDkuOTA5NzN2Mi4yMTY4NHoiLz48L2c+PC9nPjwvc3ZnPg=='
    // 图片
    const minusImage =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
        'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
        'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
        'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

    const plusImage =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
        '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
        'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
        'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
        'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
        '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';


    Blockly.extensible.MinusButton = MinusButton
    Blockly.extensible.PlusButton = PlusButton
    Blockly.extensible.CollapseButton = CollapseButton
    Blockly.extensible.FieldButton = FieldButton

    Blockly.Blocks['control_get_previous_clone'] = {
        init: function () {
            this.jsonInit({
                "message0": "上一个克隆体",
                "category": Blockly.Categories.control,
                "extensions": ["colours_control", "output_string"]
            });
        }
    }

    Blockly.Blocks['control_call'] = {
        init: function () {
            this.jsonInit({
                "message0": "运行 %1 参数 (",
                "args0": [
                    {
                        "type": "input_value",
                        "name": "FUNCTION",
                    },
                ],
                "category": Blockly.Categories.control,
                "extensions": ["colours_control", "shape_statement"]
            });
            this.size = 0
            this.appendDummyInput("PLUSMINUS")
                .appendField(')')
                .appendField(new Blockly.extensible.PlusButton(() => {
                    this.newSize = this.size + 1;
                    this.updateShape()
                }))
                .appendField(new Blockly.extensible.MinusButton(() => {
                    this.newSize = Math.max(0, this.size - 1);
                    this.updateInput();
                }))
        },
        attachTextShadow_: Blockly.extensible.attachTextShadow_,
        updateShape: Blockly.extensible.updateShape,
        updateInput: function () {
            const key = 'ADD'
            this.size = this.newSize
            for (var i = 0; i < this.size; i++) {
                if (!this.getInput(key + i)) {
                    const input = this.appendValueInput(key + i)
                    this.attachTextShadow_(input, '')
                    if (i > 0) {
                        input.appendField(',')
                    }
                }
            }
            while (this.getInput(key + i)) {
                this.removeInput(key + i);
                i++
            }
            this.moveInputBefore('PLUSMINUS', null)
        },
        mutationToDom: function () {
            const container = document.createElement('mutation');
            container.setAttribute('size', `${this.size}`);

            return container;
        },
        domToMutation: function (xmlElement) {
            this.newSize = parseInt(xmlElement.getAttribute('size'), 0);
            this.updateShape()
        },
    }

    Blockly.Blocks["structures_self"] = {
        init: function () {
            this.jsonInit({
                "message0": "自身",
                "category": Blockly.Categories.motion,
                "extensions": ["colours_motion", "output_string"]
            });
        }
    }
    Blockly.Blocks['structures_create_json'] = {
        init: function () {
            this.jsonInit({
                "category": Blockly.Categories.motion,
                "extensions": ["colours_motion"]
            });
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setOutput(true, 'String');

            this.size = 0
            this.inputPerRow = 2
            this.forceBreak = true
            this.collapse = false

            this.appendDummyInput()
                .appendField('MAP{')
                .appendField(new Blockly.extensible.CollapseButton())
            this.appendDummyInput("PLUSMINUS")
                .appendField('}')
                .appendField(new Blockly.extensible.PlusButton(() => {
                    this.newSize = this.size + 2;
                    this.updateShape()
                }))
                .appendField(new Blockly.extensible.MinusButton(() => {
                    this.newSize = Math.max(0, this.size - 2);
                    this.updateInput();
                }))
        },
        attachTextShadow_: Blockly.extensible.attachTextShadow_,
        updateShape: Blockly.extensible.updateShape,
        updateInput: function () {
            const key = 'ADD'
            this.size = this.newSize
            for (var i = 0; i < this.size; i++) {
                if (!this.getInput(key + i)) {
                    const input = this.appendValueInput(key + i)
                    this.attachTextShadow_(input, '')
                    if (i > 0) {
                        if (i % 2 != 0) {
                            input.appendField('=')
                        }
                    }
                }
            }
            while (this.getInput(key + i)) {
                this.removeInput(key + i);
                i++
            }
            this.moveInputBefore('PLUSMINUS', null)
        },
        mutationToDom: function () {
            const container = document.createElement('mutation');
            container.setAttribute('size', `${this.size}`);
            container.setAttribute('collapse', `${Number(this.collapse)}`);

            return container;
        },
        domToMutation: function (xmlElement) {
            this.newSize = parseInt(xmlElement.getAttribute('size'), 0);
            this.collapse = Boolean(parseInt(xmlElement.getAttribute('collapse'), 0))
            this.updateShape()
        },
    };

    Blockly.Blocks['structures_create_list'] = {
        init: function () {
            this.jsonInit({
                "category": Blockly.Categories.motion,
                "extensions": ["colours_motion", "output_string"]
            });
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setOutput(true, 'String');


            this.size = 0
            this.inputPerRow = 1
            this.forceBreak = true
            this.collapse = false

            this.appendDummyInput()
                .appendField('LIST[')
                .appendField(new Blockly.extensible.CollapseButton())

            this.appendDummyInput("PLUSMINUS")
                .appendField(']')
                .appendField(new Blockly.extensible.PlusButton(() => {
                    this.newSize = this.size + 1;
                    this.updateShape()
                }))
                .appendField(new Blockly.extensible.MinusButton(() => {
                    this.newSize = Math.max(0, this.size - 1);
                    this.updateInput();
                }))
        },
        attachTextShadow_: Blockly.extensible.attachTextShadow_,
        updateShape: Blockly.extensible.updateShape,
        updateInput: function () {
            const key = 'ADD'
            this.size = this.newSize
            for (var i = 0; i < this.size; i++) {
                if (!this.getInput(key + i)) {
                    const input = this.appendValueInput(key + i)
                    this.attachTextShadow_(input, '')
                }
            }
            while (this.getInput(key + i)) {
                this.removeInput(key + i);
                i++
            }
            this.moveInputBefore('PLUSMINUS', null)
        },
        mutationToDom: function () {
            const container = document.createElement('mutation');
            container.setAttribute('size', `${this.size}`);
            container.setAttribute('collapse', `${Number(this.collapse)}`);

            return container;
        },
        domToMutation: function (xmlElement) {
            this.newSize = parseInt(xmlElement.getAttribute('size'), 0);
            this.collapse = Boolean(parseInt(xmlElement.getAttribute('collapse'), 0))
            this.updateShape()
        },
    };

    Blockly.Blocks['structures_get_attribute'] = {
        init: function () {
            this.jsonInit({
                "message0": "获取 %1",
                "args0": [
                    {
                        "type": "input_value",
                        "name": "OBJECT"
                    },
                ],
                "category": Blockly.Categories.motion,
                "extensions": ["colours_motion"]
            });
            this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
            this.setOutput(true, 'String');

            this.size = 1
            this.appendDummyInput("PLUSMINUS")
                .appendField(new Blockly.extensible.PlusButton(() => {
                    this.newSize = this.size + 1;
                    this.updateShape()
                }))
                .appendField(new Blockly.extensible.MinusButton(() => {
                    this.newSize = Math.max(1, this.size - 1);
                    this.updateInput();
                }))
        },
        attachTextShadow_: Blockly.extensible.attachTextShadow_,
        updateShape: Blockly.extensible.updateShape,
        updateInput: function () {
            const key = 'ADD'
            this.size = this.newSize
            for (var i = 0; i < this.size; i++) {
                if (!this.getInput(key + i)) {
                    const input = this.appendValueInput(key + i)
                    if (i == 0) {
                        input.appendField('的')
                    }
                    this.attachTextShadow_(input, '')
                    if (i > 0) {
                        input.appendField('的')
                    }
                }
            }
            while (this.getInput(key + i)) {
                this.removeInput(key + i);
                i++
            }
            this.moveInputBefore('PLUSMINUS', null)
        },
        mutationToDom: function () {
            const container = document.createElement('mutation');
            container.setAttribute('size', `${this.size}`);
            return container;
        },
        domToMutation: function (xmlElement) {
            this.newSize = parseInt(xmlElement.getAttribute('size'), 0);
            this.updateShape()
        },
    };

    Blockly.WorkspaceSvg.prototype.reportDom = function (id, callback, callbackUnmount) {
        var block = this.getBlockById(id);
        if (!block) {
            throw 'Tried to report value on block that does not exist.';
        }
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();

        var contentDiv = Blockly.DropDownDiv.getContentDiv();

        contentDiv.setAttribute('class', 'valueReportBox');
        callback(contentDiv)
        Blockly.DropDownDiv.callbackUnmount = callbackUnmount
        Blockly.DropDownDiv.setColour(
            Blockly.Colours.valueReportBackground,
            Blockly.Colours.valueReportBorder
        );
        Blockly.DropDownDiv.showPositionedByBlock(this, block);
    };
    Blockly.DropDownDiv.clearContent = function () {
        Blockly.DropDownDiv.callbackUnmount && Blockly.DropDownDiv.callbackUnmount(Blockly.DropDownDiv.getContentDiv())
        Blockly.DropDownDiv.callbackUnmount = undefined
        Blockly.DropDownDiv.content_.innerHTML = '';
        Blockly.DropDownDiv.content_.style.width = '';
    };

    return Blockly
}

export default modifyBlockly