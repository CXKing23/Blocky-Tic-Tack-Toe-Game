class ToolboxLabel extends Blockly.ToolboxItem {
  constructor(toolboxItemDef, parentToolbox) {
    super(toolboxItemDef, parentToolbox);
  }
  init() {
    // Create the label.
    this.label = document.createElement('label');
    // Set the name.
    this.label.textContent = 'Label';
  }
  /** @override */
  getDiv() {
    return this.label;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  'toolboxlabel',
  ToolboxLabel);
