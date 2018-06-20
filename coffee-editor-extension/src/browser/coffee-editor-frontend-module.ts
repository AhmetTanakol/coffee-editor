/**
 * Generated using theia-extension-generator
 */

import { ContainerModule } from "inversify";
import { GenericEditorOpenHandler } from './generic-editor-open-handler';
import { OpenHandler } from "@theia/core/lib/browser";

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    // add your contribution bindings here

  bind(OpenHandler).to(GenericEditorOpenHandler);
});
