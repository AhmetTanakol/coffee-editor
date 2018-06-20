import { Widget } from "@phosphor/widgets";
import { Message } from '@theia/core/lib/browser';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, Store } from 'redux';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { imageProvider, labelProvider, modelMapping } from './config';
import { coffeeSchema, detailSchemata } from './models/ui-metaschema';
import { materialFields, materialRenderers } from '@jsonforms/material-renderers';
import {
  Actions,
  jsonformsReducer,
  RankedTester
} from '@jsonforms/core';
import {
  editorReducer,
  findAllContainerProperties,
  setContainerProperties
} from '@jsonforms/editor';
import { uiEditorReducer } from './reducers';
import NonEmptyLayoutRenderer, { nonEmptyLayoutTester } from './editor/util/NonEmptyLayout';
import ExpectedValueField, {
  ExpectedValueFieldTester
} from './editor/util/ExpectedValueField';
import * as JsonRefs from 'json-refs';

let num = 0;
export class GenericEditorWidget extends Widget {

  constructor(data: object) {
    super();
    num++;
    const app = document.createElement('div');
    app.id = 'app';
    this.id = `react-app-${num}`;
    this.node.appendChild(app);
    this.addClass('coffee-Widget');

    const uischema = {
      'type': 'MasterDetailLayout',
      'scope': '#'
    };

    const renderers: { tester: RankedTester, renderer: any}[] = materialRenderers;
    const fields: { tester: RankedTester, field: any}[] = materialFields;

    const jsonforms: any = {
      jsonforms: {
        renderers,
        fields,
        editor: {
          imageMapping: imageProvider,
          labelMapping: labelProvider,
          modelMapping,
          uiSchemata: detailSchemata
        },
        uiEditor: {
          modelSchema: {}
        }
      }
    };

    const store: Store<any> = createStore(
      combineReducers({
          jsonforms: jsonformsReducer(
            {
              editor: editorReducer,
              uiEditor: uiEditorReducer
            }
          )
        }
      ),
      {
        ...jsonforms
      }
    );

    JsonRefs.resolveRefs(coffeeSchema)
      .then(
        resolvedSchema => {
          store.dispatch(Actions.init(data, resolvedSchema.resolved, uischema));

          store.dispatch(Actions.registerRenderer(nonEmptyLayoutTester, NonEmptyLayoutRenderer));

          store.dispatch(Actions.registerField(ExpectedValueFieldTester, ExpectedValueField));

          store.dispatch(setContainerProperties(findAllContainerProperties(resolvedSchema.resolved,
            resolvedSchema.resolved)));

          ReactDOM.render(
            <Provider store={store}>
              <App />
            </Provider>,
            document.getElementById('app'));
          registerServiceWorker();
        },
        err => {
          console.log(err.stack);
        });

  }

  onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    this.node.focus();
    this.update();
  }

  onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
  }
}
