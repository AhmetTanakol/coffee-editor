import * as React from 'react';
import { connect } from 'react-redux';
import EditorBar from './editor/app-bar/EditorBar';
import JsonEditorIde from './editor/JsonEditorIde';
import { getData, getSchema, getUiSchema } from '@jsonforms/core';
import { imageProvider, labelProvider, modelMapping } from './config';
import * as _ from 'lodash';
import { JsonSchema4 } from '@jsonforms/core';
import { Property } from '@jsonforms/editor';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#FFFFFF'
    },
    background: {
      'default': '#1e1e1e'
    }
  },
  typography: {
    fontSize: 10
  }
});


interface LabelDefinition {
  /** A constant label value displayed for every object for which this label definition applies. */
  constant?: string;
  /** The property name that is used to get a variable part of an object's label. */
  property?: string;
}

const filterPredicate = (data: Object) => {
  return (property: Property): boolean => {
    if (!_.isEmpty(modelMapping) &&
      !_.isEmpty(modelMapping.mapping)) {
      if (data[modelMapping.attribute]) {
        return property.schema.id === modelMapping.mapping[data[modelMapping.attribute]];
      }
      return true;
    }

    return false;
  };
};
const calculateLabel =
  (schema: JsonSchema4) => (element: Object): string => {

    if (!_.isEmpty(labelProvider) && labelProvider[schema.id] !== undefined) {

      if (typeof labelProvider[schema.id] === 'string') {
        // To be backwards compatible: a simple string is assumed to be a property name
        return element[labelProvider[schema.id]];
      }
      if (typeof labelProvider[schema.id] === 'object') {
        const info = labelProvider[schema.id] as LabelDefinition;
        let label;
        if (info.constant !== undefined) {
          label = info.constant;
        }
        if (!_.isEmpty(info.property) && !_.isEmpty(element[info.property])) {
          label = _.isEmpty(label) ?
            element[info.property] :
            `${label} ${element[info.property]}`;
        }
        if (label !== undefined) {
          return label;
        }
      }
    }

    const namingKeys = Object
      .keys(schema.properties)
      .filter(key => key === 'id' || key === 'name');
    if (namingKeys.length !== 0) {
      return element[namingKeys[0]];
    }

    return JSON.stringify(element);
  };

const imageGetter = (schemaId: string) =>
  !_.isEmpty(imageProvider) ? `icon ${imageProvider[schemaId]}` : '';

interface AppProps {
  uischema: any;
  schema: any;
  rootData: any;
  filterPredicate: any;
  labelProvider: any;
  imageProvider: any;
}

class App extends React.Component<AppProps, {}> {

  render() {
    const { rootData, uischema, schema } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <EditorBar schema={schema} rootData={rootData}/>
          <JsonEditorIde
            uischema={uischema}
            schema={schema}
            filterPredicate={filterPredicate}
            labelProvider={calculateLabel}
            imageProvider={imageGetter}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => {
  return {
    uischema: getUiSchema(state),
    schema: getSchema(state),
    rootData: getData(state)
  };
};

export default connect(mapStateToProps)(App);
