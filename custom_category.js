Blockly.defineBlocksWithJsonArray([
    {
      "type": "place_x_at",
      "message0": "place X at row %1 col %2",
      "args0": [
        {
          "type": "input_value",
          "name": "ROW",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "COL",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Places an 'X' on the board at the specified row and column.",
      "helpUrl": ""
    },

    {
      "type": "is_square_empty",
      "message0": "is square at row %1 col %2 empty?",
      "args0": [
        {
          "type": "input_value",
          "name": "ROW",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "COL",
          "check": "Number"
        }
      ],
      "output": "Boolean",
      "colour": 230,
      "tooltip": "Returns true if the square at the specified row and column is empty.",
      "helpUrl": ""
    },
    {
      "type": "place_x_random",
      "message0": "place X randomly",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Places an X in a random available spot.",
      "helpUrl": ""
    },
    {
      "type": "set_difficulty",
      "message0": "set computer difficulty %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DIFFICULTY",
          "options": [
            ["1 (Easy - Random)", "1"],
            ["2", "2"],
            ["3 (Medium)", "3"],
            ["4", "4"],
            ["5 (Hard - Optimal)", "5"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Sets how smart the computer opponent is.",
      "helpUrl": ""
    },
    {
      "type": "has_player_moved",
      "message0": "has player moved?",
      "output": "Boolean",
      "colour": 230,
      "tooltip": "Returns true if the player has successfully made a move this turn.",
      "helpUrl": ""
    }
  ]);

  javascript.javascriptGenerator.forBlock['place_x_at'] = function(block) {
    var row = javascript.javascriptGenerator.valueToCode(block, 'ROW', javascript.javascriptGenerator.ORDER_ATOMIC);
    var col = javascript.javascriptGenerator.valueToCode(block, 'COL', javascript.javascriptGenerator.ORDER_ATOMIC);
    var code = 'placeX(' + row + ', ' + col + ');\n';
    return code;
  };

  javascript.javascriptGenerator.forBlock['is_square_empty'] = function(block) {
    var row = javascript.javascriptGenerator.valueToCode(block, 'ROW', javascript.javascriptGenerator.ORDER_ATOMIC);
    var col = javascript.javascriptGenerator.valueToCode(block, 'COL', javascript.javascriptGenerator.ORDER_ATOMIC);
    var code = 'isSquareEmpty(' + row + ', ' + col + ')';
    return [code, javascript.javascriptGenerator.ORDER_FUNCTION_CALL];
  };
  
  javascript.javascriptGenerator.forBlock['place_x_random'] = function(block) {
    return 'placeRandomX();\n';
  };

  javascript.javascriptGenerator.forBlock['set_difficulty'] = function(block) {
    var difficulty = block.getFieldValue('DIFFICULTY');
    return 'setDifficulty(' + difficulty + ');\n';
  };

  javascript.javascriptGenerator.forBlock['has_player_moved'] = function(block) {
    return ['hasPlayerMoved()', javascript.javascriptGenerator.ORDER_FUNCTION_CALL];
  };


class CustomCategory extends Blockly.ToolboxCategory {
  
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  addColourBorder_(colour){
    this.rowDiv_.style.backgroundColor = colour;
  }
  setSelected(isSelected){

    var labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = 'white';
      labelDom.style.color = this.colour_;
    } else {
      this.rowDiv_.style.backgroundColor = this.colour_;
      labelDom.style.color = 'white';
    }
    Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED, isSelected);
  }

  createIconDom_() {
    const img = document.createElement('img');
    img.src = './logo_only.svg';
    img.alt = 'Lamp';
    img.width='15';
    img.height='15';
    return img;
  }
}
Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  CustomCategory, true);