import { FrontendApplication, OpenHandler, OpenerOptions } from '@theia/core/lib/browser';
import { MaybePromise, SelectionService, ResourceProvider } from '@theia/core/lib/common';
import URI from '@theia/core/lib/common/uri';
import { GenericEditorWidget } from './generic-editor-widget';
import { inject, injectable } from "inversify";
import { coffeeSchema } from './models/ui-metaschema';
import * as AJV from 'ajv';

const ajv = new AJV({allErrors: true, verbose: true});

@injectable()
export class GenericEditorOpenHandler implements OpenHandler {
  readonly id = "editor-opener";
  constructor( @inject(FrontendApplication) private app: FrontendApplication,
               @inject(SelectionService) readonly selectionService: SelectionService,
               @inject(ResourceProvider) private readonly resourceProvider: ResourceProvider) {
  }

  // Defines the editor's name in the open with menu
  get label() {
    return 'Open With UI Schema Editor';
  }

  canHandle(uri: URI, options?: OpenerOptions): MaybePromise<number> {
    if (uri.path.ext === '.json') {
      return 1000;
    }
    return 0;
  }

  /**
   * Open a widget for the given URI and options.
   * Resolve to an opened widget or undefined, e.g. if a page is opened.
   * Never reject if `canHandle` return a positive number; otherwise should reject.
   */
  open(uri: URI, options?: OpenerOptions): MaybePromise<object | undefined> {
    return this.resourceProvider(uri).then(resource => {
      return resource.readContents().then(content => {
        let parsedContent = {};
        try {
          parsedContent = JSON.parse(content);
        } catch {
          console.warn('Invalid content');
        }
        const valid = ajv.validate(coffeeSchema, parsedContent);
        if (!valid) {
          parsedContent = {};
        }
        const genericEditor = new GenericEditorWidget(parsedContent);
        genericEditor.title.caption = uri.path.base;
        genericEditor.title.label = uri.path.base;
        genericEditor.title.closable = true;
        this.app.shell.addWidget(genericEditor, {area: 'main'});
        this.app.shell.activateWidget(genericEditor.id);
        return genericEditor;
      });
    });

  }
}
